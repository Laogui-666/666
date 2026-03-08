
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { TEMPLATE_REGISTRY, getTemplateCatalog } from "../templates/registry";
import { TranslationType } from "../types";
import mammoth from "mammoth";

const CERTIFICATION_FOOTER_HTML = (date: string) => `
  <div class="certification-footer" style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #000; font-family: Arial, sans-serif; font-size: 11px; line-height: 1.4; color: #333; position: relative; min-height: 150px; text-align: left; width: 100%; box-sizing: border-box;">
    <div style="width: 75%; float: left;">
      <p style="margin: 0 0 6px 0;">I, <strong>Ji Xiangdi</strong>, translator of <strong>E-TRANSTAR(Beijing)Information Technology Co.Ltd.</strong>, confirm this is a true and accurate translation of the original document.</p>
      <p style="margin: 0 0 6px 0;">CATTI Certificate No.: 201906009370001040 &nbsp; Organization: E-TRANSTAR (Beijing) Information Technology Co.Ltd.</p>
      <p style="margin: 0 0 6px 0;">Tel: 010-60537024 &nbsp; Email: fuluoli@57trans.com</p>
      <p style="margin: 0 0 15px 0;">Organization Address: 201-212057, Zone 6, Pinggu Park, Zhongguancun Science and Technology Park, Pinggu District, Beijing</p>
      <div style="display: flex; align-items: center; gap: 10px; margin-top: 10px;">
        <span style="font-weight: bold;">Signature:</span>
        <img src="/api/files/8A9E3867-A964-427E-874D-4606798C7E69" style="height: 40px; margin: 0 10px;" alt="Signature" />
        <span style="margin-left: 10px; font-weight: bold;">Date of Translation: ${date}</span>
      </div>
    </div>
    <div style="position: absolute; right: 0; top: 10px; width: 140px; height: 140px; pointer-events: none; z-index: 10;">
      <img src="/api/files/A6891A80-7F85-48F8-A785-502621175E74" style="width: 100%; height: 100%; object-fit: contain;" alt="Seal" />
    </div>
    <div style="clear: both;"></div>
  </div>
`;

const getApiKey = () => {
  const key = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!key || key === 'undefined' || key === '') {
    console.error("Gemini API Key is missing! Please check your environment variables.");
    return null;
  }
  return key;
};

// Generic retry wrapper with exponential backoff
async function callWithRetry(fn: () => Promise<any>, maxRetries = 4): Promise<any> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Extract status and message from various possible error structures
      let status = error?.status;
      let message = error?.message || "";
      
      // Handle the nested error object structure seen in some SDK versions/responses
      if (error?.error) {
        status = status || error.error.code || error.error.status;
        message = message || error.error.message || "";
      }

      const isRateLimit = 
        status === "RESOURCE_EXHAUSTED" || 
        status === 429 || 
        message.includes("429") || 
        message.toLowerCase().includes("quota") ||
        message.toLowerCase().includes("rate limit");
      
      if (isRateLimit) {
        // Exponential backoff: 2s, 4s, 8s, 16s... plus jitter
        const waitTime = Math.pow(2, i + 1) * 1000 + Math.random() * 1000;
        console.warn(`[Gemini API] Rate limit hit (429/Resource Exhausted). Retrying in ${Math.round(waitTime)}ms... (Attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      // Handle transient 5xx errors
      if (status >= 500 && i < maxRetries - 1) {
        const waitTime = 2000;
        console.warn(`[Gemini API] Server error (${status}). Retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      // For non-transient errors, throw immediately
      throw error;
    }
  }
  throw lastError;
}

// Helper to extract HTML from AI response
const extractHtml = (raw: string): string => {
  const codeBlockMatch = raw.match(/```(?:html)?\s*([\s\S]*?)```/);
  if (codeBlockMatch && codeBlockMatch[1]) return codeBlockMatch[1].trim();
  const tagMatch = raw.match(/<div[\s\S]*<\/div>/);
  if (tagMatch) return tagMatch[0].trim();
  return raw.replace(/```html|```/g, '').trim();
};

/**
 * Process a document for translation and layout restoration.
 */
export const processDocument = async (file: File, targetLang: string = "English", translationType: TranslationType = TranslationType.NORMAL) => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("Missing API Key");
  const ai = new GoogleGenAI({ apiKey });

  let contentPart: any;

  if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    // Handle DOCX: Extract text using mammoth
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      contentPart = { text: `[DOCUMENT CONTENT START]\n${result.value}\n[DOCUMENT CONTENT END]` };
    } catch (error) {
      console.error("Error extracting text from DOCX:", error);
      throw new Error("Failed to process Word document. Please ensure it is a valid .docx file.");
    }
  } else {
    // Handle Image/PDF: Convert to base64
    const base64Data = await fileToBase64(file);
    contentPart = { inlineData: { data: base64Data, mimeType: file.type || 'image/jpeg' } };
  }

  const catalog = getTemplateCatalog();

  const prompt = `
    ### SYSTEM ROLE: HIGH-SPEED STRUCTURAL TRANSLATION ENGINE ###
    Your mission is to perform high-fidelity document translation by matching input content to standardized structural frameworks.
    Target Language: ${targetLang}
    Translation Mode: ${translationType === TranslationType.CERTIFIED ? 'CERTIFIED (Professional Translation with Certification)' : 'NORMAL'}

    ### CRITICAL PRIORITY: ACCURACY & ADAPTABILITY ###
    1. Standard Documents: If the document matches a standard template (e.g., modern ID card, modern Business License), strictly follow the template.
    2. Old/Non-Standard Documents: If the document is an OLD VERSION (e.g., old Marriage Certificate, old Retirement Certificate) or has a layout that differs from the standard template, you MUST ADAPT.
       - DO NOT force it into a mismatched template.
       - Create a custom HTML layout that mirrors the ACTUAL source document.
       - Ensure EVERY piece of text, seal, and date on the source document is translated and included.
       - Accuracy of content is the highest priority.

    1. Identify Anchor Text and Layout.
    2. Match with Template Catalog: ${JSON.stringify(catalog)}
    3. DOCUMENT-SPECIFIC RULES:
       - If it's a "Household Register" (户口本), strictly use the HOUSEHOLD_REGISTER template.
       - If it's a "Business License" (营业执照), strictly use the BUSINESS_LICENSE template.
         - Label Adaptation: 
           - If "法定代表人", set {{PERSON_IN_CHARGE_LABEL}} to "Legal Representative".
           - If "负责人" or "执行董事", set {{PERSON_IN_CHARGE_LABEL}} to "Responsible Person" or matching term.
         - Date Format: Always "Month DD, YYYY" (e.g., June 13, 2000).
         - Address: Small unit to large unit, ending with ", China".
         - Business Scope: Use {{GENERAL_ITEMS}} and {{PERMITTED_ITEMS}} if distinguished in original, otherwise merge and use semicolon (;) as separator.
         - Unified Code: Keep as-is, no spaces.
       - If it's a "Motor Vehicle Register" (机动车登记证), strictly use the MOTOR_VEHICLE_REGISTER template.
         - Date Format: Always "Month DD, YYYY" (e.g., June 13, 2020).
         - Plate No.: Pinyin initials + numbers (e.g., CHUAN AXXXXX).
         - VIN/Engine No.: Keep as-is (uppercase + numbers).
         - Dimensions: "Length XXX Width XXX Height XXX mm".
         - Displacement/Power: "XXX ml / XXX kw".
         - Blank fields: Remove the placeholder, do not fill with "N/A".
       - If it's a "Vehicle License" (行驶证), strictly use the VEHICLE_LICENSE template.
         - Pure English: Ensure all output is in English. No Chinese characters (except seals).
         - Plate No.: Province abbreviation in Pinyin uppercase + space (e.g., "川A21D11" -> "CHUAN A21D11").
         - Address: Small to large (e.g., No. XX, XX Road, XX District, XX City).
         - Date Format: Always "Month DD, YYYY" (e.g., May 07, 2018).
         - Blank Fields: If a field is blank in the original, remove the variable placeholder and leave it blank. DO NOT use "N/A" or "None".
       - If it's a "Marriage Certificate" (结婚证):
         - Standard Version: Use the MARRIAGE_CERTIFICATE template.
         - Old/Non-Standard Version: If the layout differs (e.g., single page, different fields), ignore the template structure and generate HTML that mirrors the source document's actual layout, ensuring all fields are translated.
         - Date Format: Always "Month DD, YYYY" (e.g., September 30, 2014).
         - Nationality: "中国" -> "China".
         - Name: Capitalize first letters (e.g., Luo Yuanjun).
         - Remarks: If "无", use "N/A" or "None". If blank, remove placeholder.
         - ID Numbers: Keep as-is, including brackets. If "香港/澳门/台湾" is mentioned, translate and note in brackets (e.g., (Hong Kong)).
       - If it's an "Old House Ownership Certificate" (旧版房产证), strictly use the HOUSE_OWNERSHIP_CERTIFICATE_OLD template.
         - Title: Include city and supervision number (e.g., "Chengdu House Ownership Certificate, Supervision Certificate No. XXXXXX").
         - Address: Small unit to large unit.
         - Date Format: "YYYY-MM-DD" or "Month DD, YYYY" to match original style.
         - Blank fields: Use "Not specified" or "N/A" if explicitly blank/unclear.
       - If it's a "Residence Certificate" (居住证明), strictly use the RESIDENCE_CERTIFICATE template.
         - Name: Pinyin, capitalized (e.g., Zhang San).
         - Date Format: Always "Month DD, YYYY" (e.g., January 01, 2020).
         - Address: Small unit to large unit.
         - Blank fields: Remove placeholder, keep underline.
         - Proper Nouns: "派出所" -> "Police Station", "公安局" -> "Public Security Bureau".
       - If it's an "Identity Card" (身份证), strictly use the ID_CARD template.
         - Date Format: Always "Month DD, YYYY" (e.g., March 31, 1986).
         - Address: Small unit to large unit.
         - Proper Nouns: "分局" -> "Branch", "公安局" -> "Public Security Bureau".
       - For any other general text documents, notices, certificates, contracts, or agreements, use the GENERAL_DOCUMENT template.
         - Style: Formal letter/contract style, premium feel, high readability.
         - Content: STRICTLY 1:1 FULL TRANSLATION.
           - Translate EVERY single sentence, paragraph, and clause.
           - Check for numbered lists (e.g., 1.1, 1.2, 1.3...) and ensure ALL items are present and in order.
           - DO NOT SUMMARIZE. DO NOT OMIT ANY DETAILS, no matter how small.
           - If the document is a contract, ensure every Article and Clause is translated in full.
           - **TABLES (CRITICAL):** If the document contains tables, you MUST reproduce the table structure exactly.
             - Translate EVERY cell content.
             - Do NOT omit rows or columns.
             - Do NOT summarize table content.
             - Ensure one-to-one correspondence between the original table and the translated table.
         - Structure: Ensure the output layout matches the original document's structure exactly (paragraph for paragraph, list for list, table for table).
           - {{DOCUMENT_MAIN_TITLE}}: Main title (uppercase, centered).
           - {{DOCUMENT_SUBTITLE}}: Subtitle (italic, centered) or remove if none.
           - {{CONTENT_BODY}}: The main body text. Use HTML tags for structure:
             - <div class="doc-paragraph">...</div> for standard paragraphs.
             - <div class="doc-section-title">...</div> for section headings (e.g., "Article 1").
             - <ul class="doc-list"><li class="doc-list-item">...</li></ul> for lists.
             - <div class="doc-highlight">...</div> for important notes/emphasis.
             - <table class="doc-table">...</table> for tabular data.
           - {{SIGNATURE_LABEL}}: e.g., "Sincerely," or "Issued by:".
           - {{SIGNATURE_NAME}}: Name of signer or organization.
       - If it's a "Retirement Certificate" (退休证):
         - Standard Version: Use the RETIREMENT_CERTIFICATE template.
         - Old/Non-Standard Version: If the layout differs (e.g., different fields, single page), ignore the template structure and generate HTML that mirrors the source document's actual layout, ensuring all fields are translated.
         - Maintain the two-page structure with page-break if applicable.
         - Extract and translate all fields, including ID numbers, SSN, and issue dates.
         - Dynamically adjust table rows and notes based on the source document.
         - Ensure the content area occupies approximately 3/5 of the page height.
       - If it's a "New Real Estate Certificate" (不动产权证), strictly use the REAL_ESTATE_CERTIFICATE_NEW template.
         - Certificate Title/No.: Left-aligned, not bold.
         - Right Status Details: Strictly follow the 7-row structure (rowspan="7") for: Apportioned Land Use Right Area, House Structure, Exclusive Building Area, Apportioned Building Area, Total Floors, Floor Located, and Completion Time.
         - Remarks/Service No.: Use the separate table structure.
         - Address: Small unit to large unit.

    ### PHASE 2: OUTPUT ###
    Use the FULL HTML structure from the matched template. REPEAT table rows or pages if needed.
    Repository: ${JSON.stringify(TEMPLATE_REGISTRY)}
    
    Return ONLY the final HTML code.
  `;

  return callWithRetry(async () => {
    // Use faster model for normal translation, pro model for certified/complex tasks
    const model = translationType === TranslationType.CERTIFIED ? 'gemini-3.1-pro-preview' : 'gemini-3-flash-preview';
    
    const response = await ai.models.generateContent({
      model: model,
      contents: [{ parts: [contentPart, { text: prompt }] }],
      config: { 
        temperature: 0.1, 
        topP: 0.1
      }
    });
    
    let html = extractHtml(response.text || "");
    
    // Add certification footer if requested
    if (translationType === TranslationType.CERTIFIED) {
      const today = new Date();
      const formattedDate = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const footer = CERTIFICATION_FOOTER_HTML(formattedDate);
      
      // Inject footer before the last closing div of the document container
      if (html.includes('</div>')) {
        const lastIndex = html.lastIndexOf('</div>');
        html = html.substring(0, lastIndex) + footer + html.substring(lastIndex);
      } else {
        html += footer;
      }
    }
    
    return html;
  });
};

/**
 * Parse flight and hotel vouchers to extract structured data.
 */
export const parseItineraryFiles = async (files: { flight?: File, hotel?: File }) => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("Missing API Key");
  const ai = new GoogleGenAI({ apiKey });

  const parts: any[] = [];
  if (files.flight) parts.push({ inlineData: { data: await fileToBase64(files.flight), mimeType: files.flight.type } });
  if (files.hotel) parts.push({ inlineData: { data: await fileToBase64(files.hotel), mimeType: files.hotel.type } });

  const prompt = `
    ### MISSION ###
    Analyze flight and hotel vouchers to extract structured data for a visa itinerary.
    Return Chinese names for UI matching.
    
    ### DATA VALIDATION ###
    - Flights: Extract ALL details including Airline, Number, Times, Cities.
    - Hotels: MUST extract Hotel Name, Address, and Telephone (Tel).

    ### OUTPUT FORMAT ###
    Return JSON only.
  `;

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: [{ parts: [...parts, { text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            visaCountry: { type: Type.STRING },
            entryDate: { type: Type.STRING },
            exitDate: { type: Type.STRING },
            departureProvince: { type: Type.STRING },
            departureCity: { type: Type.STRING },
            returnProvince: { type: Type.STRING },
            returnCity: { type: Type.STRING },
            flights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  airline: { type: Type.STRING },
                  flightNumber: { type: Type.STRING },
                  depTime: { type: Type.STRING },
                  arrTime: { type: Type.STRING },
                  depCity: { type: Type.STRING },
                  arrCity: { type: Type.STRING },
                  date: { type: Type.STRING }
                }
              }
            },
            route: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  country: { type: Type.STRING },
                  cities: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        city: { type: Type.STRING },
                        startDate: { type: Type.STRING },
                        endDate: { type: Type.STRING },
                        nights: { type: Type.NUMBER },
                        hotelName: { type: Type.STRING },
                        hotelAddress: { type: Type.STRING },
                        hotelPhone: { type: Type.STRING }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}");
  }, 2);
};


/**
 * Generate a Visa Application Risk Assessment Report based on uploaded documents and user remarks.
 */
export const generateVisaAssessment = async (
  files: File[],
  advantages: string,
  risks: string,
  targetCountry: string = "申根国家 (Schengen Area)"
): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("Missing API Key");
  const ai = new GoogleGenAI({ apiKey });

  // Process all files
  const fileContents = await Promise.all(files.map(async (file) => {
    if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return `[File: ${file.name}]\n${result.value}\n`;
      } catch (error) {
        console.error(`Error extracting text from ${file.name}:`, error);
        return `[File: ${file.name}] (Extraction Failed)\n`;
      }
    } else {
      // For images/PDFs, we rely on Gemini's multimodal capabilities
      // However, sending multiple large files might hit limits.
      // For now, let's try to send them as parts if supported, or extract text if possible.
      // Since we can't easily extract text from PDF/Image in browser without heavy libs (except PDF.js),
      // we will send them as inline data parts.
      const base64Data = await fileToBase64(file);
      return {
        inlineData: {
          data: base64Data,
          mimeType: file.type || 'application/pdf'
        }
      };
    }
  }));

  // Construct the prompt
  const prompt = `
    You are a Senior Visa Application Risk Assessment Expert.
    
    Your task is to analyze the provided applicant documents and the user-provided remarks (Advantages and Risks) to generate a comprehensive "Visa Application Risk Assessment Report" for **${targetCountry}**.
    
    **User Provided Remarks:**
    - **Advantage Remarks:** ${advantages || "None"}
    - **Risk Remarks:** ${risks || "None"}
    - **Target Country:** ${targetCountry}
    
    **Analysis Requirements:**
    1.  **Objective & Neutral:** The assessment must be objective, neutral, and based on the provided information and general visa application logic.
    2.  **Comprehensive:** Analyze the applicant's profile (financial, employment, travel history, purpose of visit, etc.) based on the documents.
    3.  **Risk Identification:** Identify potential rejection risks.
    4.  **Strength Analysis:** Highlight the applicant's strong points.
    5.  **Scoring:** Give an estimated "Approval Probability Score" (0-100%).
    6.  **Suggestions:** Provide actionable suggestions to improve the application.
    7.  **Exclusions:** **Do NOT include or focus on specific itinerary details, flight tickets, or hotel bookings in the assessment report.** Focus on the applicant's profile and eligibility.
    8.  **Country Mismatch Check:** **CRITICAL:** Check if the destination country in the uploaded documents (e.g., flight tickets, hotel bookings, application forms) matches the user-selected 'Target Country' (${targetCountry}). If there is a mismatch (e.g., documents show 'Japan' but user selected 'France'), you **MUST** explicitly list this as a "High Risk" factor in the "Risk Points" section.

    **Report Structure (Strictly follow this Markdown format):**
    
    **申请人:** [Name]
    **护照号:** [Passport Number]
    **性别:** [Gender]
    **出生日期:** [Date of Birth]
    **申请国家:** ${targetCountry}
    
    > 以下信息仅为本公司基于行业经验及申请人提供的相关背景资料作出的风险评估，不构成任何签证审批承诺或担保。最终签证结果均以领馆的官方审核裁定为准。
    
    ## 一、 核心优势
    1. **[Keyword]:** [Description]
    2. **[Keyword]:** [Description]
    ...
    
    ## 二、 需要注意的风险点
    1. **[Keyword]:** [Description]
    2. **[Keyword]:** [Description]
    ...
    
    ## 三、 出签概率综合评估
    **综合来看，出签概率在 [Score]%。**
    
    1. [Suggestion 1]
    2. [Suggestion 2]
    ...
    
    ---
  `;

  // Prepare contents for Gemini
  // Flatten fileContents (strings and objects)
  const parts: any[] = [];
  
  // Add file contents
  fileContents.forEach(content => {
    if (typeof content === 'string') {
      parts.push({ text: content });
    } else {
      parts.push(content);
    }
  });

  // Add the prompt at the end
  parts.push({ text: prompt });

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts }],
    });
    
    return response.text || "Assessment generation failed.";
  });
};
export const extractFormData = async (file: File, country: string): Promise<any> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("Missing API Key");
  const ai = new GoogleGenAI({ apiKey });

  let contentPart: any;

  if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
     try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      contentPart = { text: `[DOCUMENT CONTENT START]\n${result.value}\n[DOCUMENT CONTENT END]` };
    } catch (error) {
      console.error("Error extracting text from DOCX:", error);
      // Fallback or throw? Let's try to continue or throw specific error
      throw new Error("Failed to process Word document.");
    }
  } else {
    const base64Data = await fileToBase64(file);
    contentPart = { inlineData: { data: base64Data, mimeType: file.type || 'application/pdf' } };
  }
  
  const prompt = `
    You are a specialized data extraction assistant for Visa Applications.
    Target Country Form: ${country} Schengen Visa Application.
    
    Extract the following information from the provided document (Passport, Itinerary, or Booking) and return it as a JSON object.
    If a field is not found, return an empty string or null.
    
    Required Fields:
    - surname (Family Name)
    - firstname (First Name)
    - dateOfBirth (DD-MM-YYYY)
    - placeOfBirth (City/Province)
    - countryOfBirth
    - currentNationality
    - gender (Male/Female)
    - maritalStatus (Single/Married/Divorced/Widow)
    - passportNumber
    - issueDate (DD-MM-YYYY)
    - expiryDate (DD-MM-YYYY)
    - issuedBy (Issuing Authority)
    - homeAddress
    - email
    - mobilePhone
    - occupation
    - employerName
    - employerAddress
    - intendedDateOfArrival (DD-MM-YYYY)
    - intendedDateOfDeparture (DD-MM-YYYY)
    - memberStateOfDestination (Main destination)
    - memberStateOfFirstEntry
    - hotelName (Name of first hotel/host)
    - hotelAddress
    - hotelPhone
    
    Return ONLY the JSON object. No markdown formatting.
  `;

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [contentPart, { text: prompt }] }],
      config: {
        responseMimeType: "application/json"
      }
    });
    
    return JSON.parse(response.text || "{}");
  });
};

/**
 * Generate a professional visa itinerary.
 */
export const generateItinerary = async (config: any, files: { flight?: File, hotel?: File, reference?: File }) => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("Missing API Key");
  const ai = new GoogleGenAI({ apiKey });

  const parts: any[] = [];
  if (files.flight) parts.push({ inlineData: { data: await fileToBase64(files.flight), mimeType: files.flight.type } });
  if (files.hotel) parts.push({ inlineData: { data: await fileToBase64(files.hotel), mimeType: files.hotel.type } });
  if (files.reference) parts.push({ inlineData: { data: await fileToBase64(files.reference), mimeType: files.reference.type } });

  const templateHtml = TEMPLATE_REGISTRY.VISA_ITINERARY.html;

    const prompt = `
    ### MISSION: GENERATE PROFESSIONAL VISA ITINERARY ###
    Generate a professional English itinerary. Output ONLY raw HTML. 
    Strictly follow the structure provided in the template.

    ### CRITICAL CONSTRAINTS FOR ATTRACTIONS ###
    1. ATTENDANCE: 3 to maximum 4 attractions per day. Not too crowded.
    2. QUALITY: Only include world-famous, "must-visit", and highly-rated popular attractions. ABSOLUTELY NO obscure or niche spots.
    3. EXCLUSIONS: Do NOT include Casinos, Red-light districts, Amusement parks, Botanical gardens, Zoos, or Stadiums.
    4. LOGIC: Attraction routes and timings must be reasonable and geographically consistent.
    5. CLOSURE DAYS (VITAL): 
       - You must internally verify if an attraction is open on the specific day of the week generated.
       - If a reference document (e.g., closure days list) is provided in the input parts, strictly follow its rules.
       - Museums and Galleries (e.g. Louvre, Uffizi): Usually CLOSED on Mondays. 
       - Milan's "The Last Supper": CLOSED on Mondays.
       - Vatican Museum/Sistine Chapel: CLOSED on Sundays.
       - Do not schedule attractions on their closure days.
    6. TRANSFERS: On inter-city transfer days, arrange 2-3 attractions if timing allows.
    7. COMPLETENESS: Ensure the itinerary is complete from arrival to departure.
    8. DATE RANGE (STRICT): The itinerary table MUST ONLY include rows from the Entry Date to the Exit Date. Do NOT add extra rows for days after the Exit Date (e.g., if a return flight arrives at the home destination on the following day, do NOT create a new row for that day).
    9. FLIGHTS PLACEMENT: All flight information (including multi-segment return flights) must be listed within the row of the Exit Date.
    10. CITY TRANSFERS: On days moving between cities, schedule 2-3 attractions max, depending on travel time.
    11. OPENING HOURS: Ensure all scheduled attractions are open on the day of visit.
    12. NO NICHE SPOTS: Only schedule the most famous, must-visit landmarks.

    ### FORMATTING RULES (STRICT) ###
    1. TITLE: Replace {{TITLE_HEADER}} with: "[Start Date] - [End Date] Itinerary in [Main Destination] ([Number] Days)".
    2. DATES: "Date" column must show "Date + English Day of the Week" (e.g., 15. Sunday, February 2026).
    3. FLIGHTS: Include all segments for multi-leg journeys. Do NOT use airport codes (e.g., use "Munich" instead of "MUC").
    4. CONCISE CONTENT: Avoid descriptive text like "Travel Day X", "Domestic Flight", or "City exploration". Include only essential info.
    5. CELL MERGING: Use <td rowspan="X"> for "From - To" and "Hotel Information" columns when staying in the same city/hotel.
    6. ALTERNATING COLORS: Use style="background-color: #f9f9f9;" for alternate rows to improve readability.
    7. LISTS: Use numbered lists in "Activity Arrangements" (e.g., 1. Colosseum<br/>2. Roman Forum). Use <br/> for separation.
    8. DATA ACCURACY: Ensure dates, flights, and hotel info match the provided documents exactly.
    9. ARRIVAL/DEPARTURE: 
       - Arrival day: If morning arrival, include afternoon activities.
       - Departure day: If afternoon/evening departure, include morning activities or shopping.
    10. TRANSPORTATION: Ensure transportation modes (Train, Flight, U-Bahn, etc.) are accurate and reasonable.

    ### INPUT DATA ###
    - Visa Country: ${config.visaCountry}
    - Entry/Exit: ${config.entryDate} to ${config.exitDate}
    - Route: ${JSON.stringify(config.route)}
    - Flight Data: ${JSON.stringify(config.flights || [])}
    - Special Req: ${config.specialRequirements || 'None'}

    ### HTML TEMPLATE FRAMEWORK ###
    ${templateHtml}
  `;

  parts.push({ text: prompt });

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: [{ parts }],
      config: { 
        temperature: 0.1, 
        topP: 0.1
      }
    });
    
    return extractHtml(response.text || "");
  });
};

/**
 * Generate a Chinese itinerary based on English itinerary content or file.
 */
export const generateChineseItinerary = async (source: string | File) => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("Missing API Key");
  const ai = new GoogleGenAI({ apiKey });

  let contentPart: any;

  if (source instanceof File) {
    if (source.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || source.name.endsWith('.docx') || source.name.endsWith('.doc')) {
      try {
        const arrayBuffer = await source.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        contentPart = { text: `[ENGLISH ITINERARY CONTENT START]\n${result.value}\n[ENGLISH ITINERARY CONTENT END]` };
      } catch (error) {
        console.error("Error extracting text from DOCX:", error);
        throw new Error("Failed to process Word document.");
      }
    } else {
      const base64Data = await fileToBase64(source);
      contentPart = { inlineData: { data: base64Data, mimeType: source.type || 'application/pdf' } };
    }
  } else {
    // It's a string (HTML content)
    contentPart = { text: `[ENGLISH ITINERARY HTML START]\n${source}\n[ENGLISH ITINERARY HTML END]` };
  }

  const templateHtml = TEMPLATE_REGISTRY.ZH_VISA_ITINERARY.html;

  const prompt = `
    ### MISSION: GENERATE CHINESE ITINERARY ###
    Translate the provided English itinerary into a professional Chinese itinerary.
    Output ONLY raw HTML.
    Strictly follow the structure provided in the template.

    ### INSTRUCTIONS ###
    1.  **Task**: Identify all information in the input English itinerary (text or image) and translate it into authentic Chinese travel terminology.
    2.  **Template**: Fill the translated content into the corresponding {{VARIABLE}} placeholders in the provided HTML structure.
    3.  **Variable Replacement**:
        -   Replace {{CITY_NAME}} etc. with specific content.
        -   **Empty Fields**: If there is no corresponding info in the original itinerary (e.g., no flight number for a day), delete the {{VARIABLE}} but keep the empty HTML tag (like <span></span>) unless it breaks layout.
        -   **Date Format**: Convert to "YYYY.MM.DD" (e.g., 2026.03.28).
        -   **Weekday Format**: Convert to "星期X" (e.g., 星期日).
        -   **Attraction Intro**: For each attraction, add a one-sentence introduction in Chinese (e.g. "卢浮宫：世界四大博物馆之首，收藏着蒙娜丽莎等旷世名作。").
    4.  **Module Logic**:
        -   **City Section (.city-section)**: Generate a section for each new city.
        -   **Day Card (.day-card)**: Generate a card for each day.
        -   **Flight Info (.flight-info)**: Insert ONLY if there is a flight/transfer on that day. Otherwise DO NOT generate this div.
        -   **Hotel Info (.hotel-info)**: Insert ONLY on the first day of staying in a city (or when changing hotels). Otherwise DO NOT generate this div.
        -   **Icons**: Automatically select Font Awesome icons based on city attributes (History: fa-landmark, Beach: fa-umbrella-beach, Shopping: fa-shopping-bag, etc.).
    5.  **Direct Output**: Output ONLY the filled HTML code. No explanations.

    ### HTML TEMPLATE FRAMEWORK ###
    ${templateHtml}
  `;

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [contentPart, { text: prompt }] }],
      config: {
        temperature: 0.1,
        topP: 0.1
      }
    });

    return extractHtml(response.text || "");
  });
};

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

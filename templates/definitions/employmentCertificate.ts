import { TemplateDefinition } from "../../types";

export const EMPLOYMENT_CERTIFICATE: TemplateDefinition = {
  id: "GEN_EMPLOYMENT_CERTIFICATE_V1",
  name: "在职证明 (标准签证版)",
  category: "EMPLOYMENT",
  matchCriteria: {
    keywords: ["Employment Certificate", "Proof of Employment", "Job Certificate"],
    anchorText: ["To Whom It May Concern", "Employment Certificate", "Passport No.", "Monthly Income", "Position"],
    layoutFeatures: ["Formal letterhead", "Centered title", "Signature block"],
    layoutDescription: "用于签证申请的标准在职证明模板。包含姓名、护照号、入职时间、职位、月收入等核心信息。",
    requiredFields: ["NAME", "PASSPORT_NO", "JOIN_DATE", "POSITION", "MONTHLY_INCOME", "COMPANY_NAME", "DESTINATION", "START_DATE", "END_DATE"]
  },
  html: `
    <div class="employment-certificate" style="font-family: 'Times New Roman', Times, serif; color: #000; line-height: 1.6; padding: 50px; background-color: white; max-width: 210mm; margin: 0 auto; box-sizing: border-box; border: 1px solid #eee;">
      <style>
        .header { text-align: center; margin-bottom: 40px; }
        .title { font-size: 22px; font-weight: bold; text-decoration: underline; margin-bottom: 30px; }
        .content { font-size: 12pt; text-align: justify; }
        .signature-section { margin-top: 50px; }
        .company-info { margin-top: 30px; border-top: 1px solid #000; padding-top: 10px; font-size: 10pt; color: #666; }
      </style>
      
      <div class="header">
        <div class="title">EMPLOYMENT CERTIFICATE</div>
      </div>

      <div class="content">
        <p>To Whom It May Concern,</p>
        <p>This is to certify that <strong>{{NAME}}</strong> (Passport No.: <strong>{{PASSPORT_NO}}</strong>) has been working in <strong>{{COMPANY_NAME}}</strong> since <strong>{{JOIN_DATE}}</strong>. Currently, he/she holds the position of <strong>{{POSITION}}</strong> with a monthly income of <strong>{{MONTHLY_INCOME}}</strong>.</p>
        <p>We have approved his/her leave for a trip to <strong>{{DESTINATION}}</strong> from <strong>{{START_DATE}}</strong> to <strong>{{END_DATE}}</strong>. We guarantee that he/she will obey the local laws and regulations during the trip and will return to China as scheduled to resume his/her duties in our company.</p>
        <p>All the expenses including air tickets, health insurance, and accommodation during the trip will be covered by himself/herself.</p>
        <p>Your kind consideration of his/her visa application will be highly appreciated.</p>
      </div>

      <div class="signature-section">
        <p>Sincerely yours,</p>
        <p style="margin-top: 30px;">(Signature & Company Seal)</p>
        <p>Name of Signer: ____________________</p>
        <p>Position: ____________________</p>
        <p>Date: {{CURRENT_DATE}}</p>
      </div>

      <div class="company-info">
        <p>Company Name: {{COMPANY_NAME}}</p>
        <p>Address: {{COMPANY_ADDRESS}}</p>
        <p>Tel: {{COMPANY_TEL}}</p>
      </div>
    </div>
  `
};

import { TemplateDefinition } from "../../types";

export const GENERAL_DOCUMENT: TemplateDefinition = {
    id: "ZH_GENERAL_DOCUMENT_V2",
    name: "通用文档 (高级正式版)",
    category: "TRAVEL",
    matchCriteria: {
      keywords: ["Document", "Notice", "Letter", "Certificate", "General", "Statement", "Proof", "Contract", "Agreement"],
      anchorText: ["Document Title", "Date", "Dear", "Sincerely", "To Whom It May Concern"],
      layoutFeatures: ["Portrait A4", "Centered title", "Formal typography", "Signature area", "Structured content"],
      layoutDescription: "高级正式版通用文档翻译件。适用于函件、证明、声明、合同、协议等正式文书。采用 Times New Roman 字体，排版优雅，重点突出，具有高级感和极佳的可读性。严格遵循 1:1 全文翻译，内容与布局一一对应，不进行摘要或概括。",
      requiredFields: ["DOCUMENT_MAIN_TITLE", "CONTENT_BODY"]
    },
    html: `
      <div class="general-document" style="font-family: 'Times New Roman', Times, serif; color: #000; line-height: 1.5; padding: 40px; background-color: white; max-width: 210mm; margin: 0 auto; box-sizing: border-box;">
        <style>
          .doc-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 15px; }
          .doc-title { font-size: 24px; font-weight: bold; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 1px; }
          .doc-subtitle { font-size: 14px; font-weight: bold; text-transform: uppercase; margin-bottom: 5px; color: #333; }
          
          .doc-recipient { margin-bottom: 20px; font-weight: bold; font-size: 12pt; }
          .doc-salutation { margin-bottom: 15px; font-size: 12pt; }
          
          .doc-body { font-size: 12pt; text-align: justify; color: #000; }
          .doc-paragraph { margin-bottom: 15px; text-indent: 2em; }
          .doc-paragraph.no-indent { text-indent: 0; }
          
          .doc-section-title { font-size: 12pt; font-weight: bold; margin-top: 25px; margin-bottom: 10px; background-color: #dae8fc; padding: 3px 8px; display: inline-block; width: 100%; box-sizing: border-box; border-bottom: 1px solid #b1cce7; }
          
          .doc-list { list-style-type: disc; padding-left: 20px; margin-bottom: 15px; }
          .doc-list-item { margin-bottom: 5px; }
          
          .doc-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 11pt; table-layout: auto; }
          .doc-table th { border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold; background-color: #f2f2f2; vertical-align: middle; }
          .doc-table td { border: 1px solid #000; padding: 8px; vertical-align: top; word-wrap: break-word; }
          
          .doc-signature-block { margin-top: 50px; page-break-inside: avoid; }
          .doc-signature-line { margin-bottom: 8px; font-weight: bold; }
          
          /* Highlight for important info */
          .doc-highlight { font-weight: bold; text-decoration: underline; }
        </style>
        
        <div class="doc-header">
          <div class="doc-title">{{DOCUMENT_MAIN_TITLE}}</div>
          <div class="doc-subtitle">{{DOCUMENT_SUBTITLE}}</div>
        </div>
        
        <div class="doc-body">
          {{CONTENT_BODY}}
        </div>
      </div>
    `
  };

import { TemplateDefinition } from "../../types";

export const MOTOR_VEHICLE_REGISTER: TemplateDefinition = {
    id: "ZH_MOTOR_VEHICLE_REGISTER_V1",
    name: "机动车登记证 (标准翻译版)",
    category: "IDENTITY",
    matchCriteria: {
      keywords: ["Motor Vehicle Register", "机动车登记证", "Registration Summary", "VIN", "Engine No."],
      anchorText: ["Registration Summary", "Motor Vehicle Owner", "Identification Certificate", "Registration Authority", "Registered Motor Vehicle Information", "Vehicle Type", "VIN", "Engine No.", "Outline Dimension"],
      layoutFeatures: ["Portrait A4", "Top barcode/serial", "Registration Summary table", "Registered Motor Vehicle Information table", "Seal area at bottom right"],
      layoutDescription: "高保真机动车登记证翻译件。包含登记摘要和注册机动车信息两个主要表格。采用 Times New Roman 字体，严格还原原件的网格布局和字段编号。",
      requiredFields: ["REGISTER_NO", "OWNER_NAME", "ID_CERTIFICATE_TYPE", "ID_CERTIFICATE_NO", "REGISTRATION_AUTHORITY", "REGISTRATION_DATE", "VIN", "ENGINE_NO", "OUTLINE_DIMENSION", "ISSUE_DATE"]
    },
    html: `
      <div class="motor-vehicle-register" style="font-family: 'Times New Roman', SimSun, serif; width: 100%; max-width: 800px; margin: 0 auto; color: #000; line-height: 1.5;">
        <style>
          .registration-table { border-collapse: collapse; width: 100%; margin-top: 10px; }
          .registration-table td { padding: 4px 6px; vertical-align: middle; border: 1pt solid #000; }
          .bold { font-weight: bold; }
          .header-title { font-size: 14pt; letter-spacing: 1px; font-weight: bold; text-align: center; }
          .field-label { font-size: 9pt; font-weight: bold; }
          .field-value { font-size: 10.5pt; }
          .center { text-align: center; }
          .right { text-align: right; }
        </style>
        <p style="margin: 0;">{{TOP_BARCODE_OR_SERIAL}}</p>
        <p class="right bold" style="font-size: 12pt;">Motor Vehicle Register No.: {{REGISTER_NO}}</p>
        
        <table class="registration-table">
          <tr><td colspan="12" class="center"><span class="header-title">Registration Summary</span></td></tr>
          <tr>
            <td width="3%" rowspan="2" class="center">I</td>
            <td width="30%" colspan="3"><span class="field-label">1. Motor Vehicle Owner / Type and Number of Identification Certificate</span></td>
            <td width="67%" colspan="8">
              <span class="field-value">{{OWNER_NAME}}</span> / <span class="field-value">{{ID_CERTIFICATE_TYPE}}</span> / <span class="field-value">{{ID_CERTIFICATE_NO}}</span>
            </td>
          </tr>
          <tr>
            <td width="15%"><span class="field-label">2. Registration Authority</span></td>
            <td width="25%" colspan="4"><span class="field-value">{{REGISTRATION_AUTHORITY}}</span></td>
            <td width="12%" colspan="2"><span class="field-label">3. Registration Date</span></td>
            <td width="15%"><span class="field-value">{{REGISTRATION_DATE}}</span></td>
            <td width="15%" colspan="2"><span class="field-label">4. Registration No. of Motor Vehicle</span></td>
            <td width="15%"><span class="field-value">{{MOTOR_VEHICLE_REG_NO}}</span></td>
          </tr>
          <tr><td colspan="12" class="center"><span class="header-title">Registered Motor Vehicle Information</span></td></tr>
          <tr>
            <td colspan="3"><span class="field-label">5. Vehicle Type</span></td><td colspan="4"><span class="field-value">{{VEHICLE_TYPE}}</span></td>
            <td colspan="3"><span class="field-label">6. Vehicle Brand</span></td><td colspan="2"><span class="field-value">{{VEHICLE_BRAND}}</span></td>
          </tr>
          <tr>
            <td colspan="3"><span class="field-label">7. Vehicle Models</span></td><td colspan="4"><span class="field-value">{{VEHICLE_MODELS}}</span></td>
            <td colspan="3"><span class="field-label">8. Color</span></td><td colspan="2"><span class="field-value">{{VEHICLE_COLOR}}</span></td>
          </tr>
          <tr>
            <td colspan="3"><span class="field-label">9. VIN</span></td><td colspan="4"><span class="field-value">{{VIN}}</span></td>
            <td colspan="3"><span class="field-label">10. Made-in-China / Imported</span></td><td colspan="2"><span class="field-value">{{MADE_IN_CHINA_OR_IMPORTED}}</span></td>
          </tr>
          <tr>
            <td colspan="3"><span class="field-label">11. Engine No.</span></td><td colspan="4"><span class="field-value">{{ENGINE_NO}}</span></td>
            <td colspan="3"><span class="field-label">12. Engine Model</span></td><td colspan="2"><span class="field-value">{{ENGINE_MODEL}}</span></td>
          </tr>
          <tr>
            <td colspan="3"><span class="field-label">13. Fuel Type</span></td><td colspan="4"><span class="field-value">{{FUEL_TYPE}}</span></td>
            <td colspan="3"><span class="field-label">14. Displacement / Power Output</span></td><td colspan="2"><span class="field-value">{{DISPLACEMENT_POWER}}</span></td>
          </tr>
          <tr>
            <td colspan="3"><span class="field-label">15. Manufacturer</span></td><td colspan="4"><span class="field-value">{{MANUFACTURER}}</span></td>
            <td colspan="3"><span class="field-label">16. Steering Mode</span></td><td colspan="2"><span class="field-value">{{STEERING_MODE}}</span></td>
          </tr>
          <tr>
            <td colspan="3"><span class="field-label">17. Wheel Track</span></td><td colspan="4"><span class="field-value">{{WHEEL_TRACK}}</span></td>
            <td colspan="3"><span class="field-label">18. Number of Tyres</span></td><td colspan="2"><span class="field-value">{{NUMBER_OF_TYRES}}</span></td>
          </tr>
          <tr>
            <td colspan="3"><span class="field-label">19. Tyre Specification</span></td><td colspan="4"><span class="field-value">{{TYRE_SPECIFICATION}}</span></td>
            <td colspan="3"><span class="field-label">20. Number of Leaf Spring</span></td><td colspan="2"><span class="field-value">{{NUMBER_OF_LEAF_SPRING}}</span></td>
          </tr>
          <tr>
            <td colspan="3"><span class="field-label">21. Wheelbase</span></td><td colspan="4"><span class="field-value">{{WHEELBASE}}</span></td>
            <td colspan="3"><span class="field-label">22. Number of Axles</span></td><td colspan="2"><span class="field-value">{{NUMBER_OF_AXLES}}</span></td>
          </tr>
          <tr>
            <td colspan="3"><span class="field-label">23. Outline Dimension</span></td><td colspan="7"><span class="field-value">{{OUTLINE_DIMENSION}}</span></td>
            <td colspan="2" rowspan="6" style="vertical-align: top;">
              <span class="field-label">33. Seal of Issuing Authority:</span><br>
              <span class="field-value">{{ISSUING_AUTHORITY_SEAL}}</span><br><br>
              <span class="field-label">34. Date of Issue: </span><br>
              <span class="field-value">{{ISSUE_DATE}}</span>
            </td>
          </tr>
          <tr><td colspan="3"><span class="field-label">24. Interior Dimension of Container</span></td><td colspan="7"><span class="field-value">{{INTERIOR_DIMENSION}}</span></td></tr>
          <tr>
            <td colspan="3"><span class="field-label">25. Total Mass</span></td><td colspan="2"><span class="field-value">{{TOTAL_MASS}}</span></td>
            <td colspan="2"><span class="field-label">26. Ratified Load Capacity</span></td><td colspan="3"><span class="field-value">{{RATIFIED_LOAD_CAPACITY}}</span></td>
          </tr>
          <tr>
            <td colspan="3"><span class="field-label">27. Ratified Seating Capacity</span></td><td colspan="2"><span class="field-value">{{RATIFIED_SEATING_CAPACITY}}</span></td>
            <td colspan="2"><span class="field-label">28. Traction Mass</span></td><td colspan="3"><span class="field-value">{{TRACTION_MASS}}</span></td>
          </tr>
          <tr>
            <td colspan="3"><span class="field-label">29. Seating Capacity of Cab</span></td><td colspan="2"><span class="field-value">{{SEATING_CAPACITY_OF_CAB}}</span></td>
            <td colspan="2"><span class="field-label">30. Usage</span></td><td colspan="3"><span class="field-value">{{USAGE}}</span></td>
          </tr>
          <tr>
            <td colspan="3"><span class="field-label">31. Source of Vehicle</span></td><td colspan="2"><span class="field-value">{{SOURCE_OF_VEHICLE}}</span></td>
            <td colspan="2"><span class="field-label">32. Manufacture Date</span></td><td colspan="3"><span class="field-value">{{MANUFACTURE_DATE}}</span></td>
          </tr>
        </table>
      </div>
    `
  };

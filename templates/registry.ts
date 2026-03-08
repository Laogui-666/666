
/**
 * 沐海旅行 · 智能文档模板注册中心
 */

import { TemplateDefinition } from "../types";
import { MOTOR_VEHICLE_REGISTER } from "./definitions/motorVehicleRegister";
import { VEHICLE_LICENSE } from "./definitions/vehicleLicense";
import { GENERAL_DOCUMENT } from "./definitions/generalDocument";

export const TEMPLATE_REGISTRY: Record<string, TemplateDefinition> = {
  // 核心：全英文签证行程单模板 (按照用户提供的 HTML 框架进行 1:1 还原)
  VISA_ITINERARY: {
    id: "EN_VISA_ITINERARY_V1",
    name: "专业签证行程单 (高保真标准版)",
    category: "TRAVEL",
    matchCriteria: {
      keywords: ["Itinerary", "Travel Plan", "Sightseeing", "Hotel Information", "Transportation"],
      anchorText: ["Date", "From - To", "Transportation", "Activity Arrangements", "Hotel Information"],
      layoutFeatures: ["5-column landscape table", "Header spanning all columns", "Standardized row height"],
      layoutDescription: "高保真专业版。五列结构：Date, From - To, Transportation, Activity Arrangements, Hotel Information. 具有深色表头 (#36454F) 和紧凑布局 (line-height: 1).",
      requiredFields: ["TITLE_HEADER", "ITINERARY_ROWS_HTML"]
    },
    html: `
      <div class="itinerary-container" style="max-width: 1200px; margin: 0 auto; background-color: white; padding: 20px; font-family: 'Segoe UI', Arial, sans-serif; box-shadow: 0 0 15px rgba(0,0,0,0.1);">
        <table border="1" cellpadding="8" style="width: 100%; border-collapse: collapse; line-height: 1; border: 1px solid #000; font-family: 'Segoe UI Historic', sans-serif;">
          <thead>
            <tr>
              <th colspan="5" style="border: 1px solid #000; padding: 10px; font-size: 16px; background-color: #f0f0f0; line-height: 1; text-align: center;">
                {{TITLE_HEADER}}
              </th>
            </tr>
            <tr style="background-color: #36454F; color: white; line-height: 1;">
              <th style="border: 1px solid #000; padding: 10px; font-size: 12px; line-height: 1; text-align: center; width: 15%;">Date</th>
              <th style="border: 1px solid #000; padding: 10px; font-size: 12px; line-height: 1; text-align: center; width: 18%;">From - To</th>
              <th style="border: 1px solid #000; padding: 10px; font-size: 12px; line-height: 1; text-align: center; width: 20%;">Transportation</th>
              <th style="border: 1px solid #000; padding: 10px; font-size: 12px; line-height: 1; text-align: center; width: 27%;">Activity Arrangements</th>
              <th style="border: 1px solid #000; padding: 10px; font-size: 12px; line-height: 1; text-align: center; width: 20%;">Hotel Information</th>
            </tr>
          </thead>
          <tbody>
            {{ITINERARY_ROWS_HTML}}
          </tbody>
        </table>
      </div>
    `
  },

  ZH_VISA_ITINERARY: {
    id: "ZH_VISA_ITINERARY_V1",
    name: "中文行程单 (高保真标准版)",
    category: "TRAVEL",
    matchCriteria: {
      keywords: ["中文行程单", "Chinese Itinerary"],
      anchorText: [],
      layoutFeatures: [],
      layoutDescription: "高保真中文行程单模板",
      requiredFields: []
    },
    html: `
<!-- 
============================================================================
【系统生成规则 / SYSTEM GENERATION RULES】
请严格执行以下指令生成 HTML 代码：

1.  **任务目标**：
    识别输入的英文行程单（文本或图片）中的所有信息，翻译为地道的中文旅游术语，
    并将翻译内容填入下方 HTML 结构中对应的 {{变量名}} 位置。

2.  **变量替换规则**：
    -   将 {{CITY_NAME}} 等变量替换为具体内容。
    -   **留白处理**：如果原行程中没有对应信息（例如某天没有航班号），请直接删除 {{变量名}}，
        保留空的 HTML 标签（如 <span></span>），不要删除标签本身，除非该标签会导致布局错乱。
    -   **日期格式**：统一转换为 "YYYY.MM.DD" (如 2026.03.28)。
    -   **星期格式**：统一转换为 "星期X"。

3.  **模块逻辑规则**：
    -   **城市区块 (.city-section)**：每个新城市生成一个 section。
    -   **每日卡片 (.day-card)**：每一天生成一个 card。
    -   **航班模块 (.flight-info)**：仅在当天有飞机/移动行程时插入，否则不生成此 div。
    -   **酒店模块 (.hotel-info)**：仅在每个城市的第一天（或更换酒店时）插入，否则不生成此 div。
    -   **图标选择**：根据城市属性自动选择 Font Awesome 图标（历史: fa-landmark, 海边: fa-umbrella-beach, 购物: fa-shopping-bag 等）。

4.  **直接输出**：
    不需要解释过程，直接输出填充完毕的完整 HTML 代码。
============================================================================
-->

<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>行程单模板 | {{TITLE_COUNTRY_DAYS}}</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        /* ==================== 1. 全局配置 ==================== */
        :root {
            --primary-color: #2c3e50;        /* 深蓝：标题/日期 */
            --secondary-color: #3498db;      /* 亮蓝：装饰/图标 */
            --accent-color: #f39c12;         /* 橙色：重点/提示 */
            --text-dark: #2c3e50;            /* 正文深色 */
            --text-light: #7f8c8d;           /* 辅助说明 */
            --border-color: #dcdde1;         /* 边框 */
            --flight-bg: #e8f4fc;            /* 航班背景 */
            --bg-white: #ffffff;
            --gradient-primary: linear-gradient(135deg, #3498db, #2c3e50);
        }
        
        /* ==================== 2. 基础重置 ==================== */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
            color: var(--text-dark);
            line-height: 1.35;
            background-color: #f0f0f0;
            font-size: 10pt;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        
        /* ==================== 3. A4 容器 ==================== */
        .container {
            width: 210mm;
            min-height: 297mm;
            margin: 20px auto;
            padding: 10mm;
            background-color: var(--bg-white);
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            position: relative;
        }
        
        /* ==================== 4. 头部区域 ==================== */
        .header {
            text-align: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid var(--border-color);
            position: relative;
        }
        .header::after {
            content: ""; position: absolute; bottom: -2px; left: 50%;
            transform: translateX(-50%); width: 80px; height: 3px;
            background: var(--gradient-primary);
        }
        .header h1 {
            font-size: 1.6rem; font-weight: 800; color: var(--primary-color);
            margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;
        }
        .header .subtitle {
            font-size: 0.9rem; color: var(--accent-color); font-weight: 600;
            display: inline-block; padding: 0 10px; margin-bottom: 10px;
        }
        .header .subtitle::before, .header .subtitle::after {
            content: "—"; color: var(--secondary-color); margin: 0 6px;
        }
        
        .trip-info { display: flex; justify-content: center; flex-wrap: wrap; gap: 8px; }
        .info-item {
            display: flex; align-items: center; gap: 6px;
            padding: 4px 12px;
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 4px;
            font-size: 0.75rem;
            color: var(--text-dark);
        }
        .info-item i { color: var(--secondary-color); font-size: 0.8rem; }

        /* ==================== 5. 城市区块 ==================== */
        .city-section { margin-bottom: 15px; page-break-inside: avoid; }
        .city-header {
            background: var(--gradient-primary);
            color: white;
            padding: 6px 12px;
            border-radius: 4px;
            margin-bottom: 8px;
            display: flex; align-items: center; gap: 10px;
        }
        .city-icon {
            width: 24px; height: 24px;
            background-color: rgba(255,255,255,0.25);
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 0.85rem;
        }
        .city-name { font-size: 1.1rem; font-weight: 700; flex-grow: 1; }
        .city-dates { font-size: 0.8rem; opacity: 0.95; font-weight: 500; }

        /* ==================== 6. 每日卡片 ==================== */
        .day-card {
            border: 1px solid var(--border-color);
            border-radius: 5px;
            margin-bottom: 10px;
            overflow: hidden;
            background: white;
            page-break-inside: avoid;
        }
        .day-header {
            background-color: #f8f9fa;
            padding: 6px 10px;
            border-bottom: 1px solid #eee;
            display: flex; justify-content: space-between; align-items: center;
        }
        .day-date { font-weight: 700; color: var(--primary-color); font-size: 0.9rem; }
        .day-week { color: var(--accent-color); font-size: 0.85rem; margin-left: 6px; font-weight: 600;}
        .transportation {
            font-size: 0.7rem; color: var(--secondary-color); font-weight: 600;
            background: var(--flight-bg); padding: 2px 8px; border-radius: 3px;
        }

        /* ==================== 7. 航班模块 ==================== */
        .flight-info {
            background-color: var(--flight-bg);
            border-bottom: 1px solid rgba(52, 152, 219, 0.2);
            padding: 8px 10px;
        }
        .flight-item {
            display: flex; gap: 10px; margin-bottom: 5px; font-size: 0.75rem; align-items: flex-start;
        }
        .flight-item:last-child { margin-bottom: 0; }
        .flight-icon { color: var(--secondary-color); margin-top: 2px; font-size: 0.8rem; min-width: 15px;}
        .flight-details { flex-grow: 1; }
        .flight-route { 
            display: flex; gap: 8px; font-weight: 700; color: var(--primary-color); margin-bottom: 2px;
        }
        .flight-number { color: var(--accent-color); font-weight: 600; }
        .flight-time { color: var(--text-dark); margin-bottom: 1px; }
        .flight-sub { color: var(--text-light); font-size: 0.7rem; font-style: italic; }

        /* ==================== 8. 内容 & 列表 ==================== */
        .day-content { padding: 8px 12px; }
        .activities-list { list-style: none; margin-bottom: 5px; }
        .activity-item {
            position: relative; padding-left: 14px; margin-bottom: 5px; line-height: 1.4;
        }
        .activity-item::before {
            content: "•"; position: absolute; left: 0; top: 0;
            color: var(--secondary-color); font-weight: bold; font-size: 1rem; line-height: 1.2;
        }
        .activity-name { font-weight: 700; font-size: 0.85rem; color: var(--text-dark); margin-right: 5px; }
        .activity-desc { font-size: 0.75rem; color: var(--text-light); }

        /* ==================== 9. 酒店模块 ==================== */
        .hotel-info {
            margin-top: 8px;
            padding: 8px 10px;
            background-color: #fdfdfd;
            border-left: 3px solid var(--accent-color);
            border-radius: 0 3px 3px 0;
            font-size: 0.75rem;
            border: 1px solid #f0f0f0; border-left: 3px solid var(--accent-color);
        }
        .hotel-name { font-weight: 700; color: var(--primary-color); margin-bottom: 3px; font-size: 0.8rem; }
        .hotel-details div { margin-bottom: 1px; color: var(--text-light); }
        .hotel-details strong { color: var(--text-dark); font-weight: 600; }

        /* ==================== 10. 打印适配 ==================== */
        @media print {
            body { background: none; margin: 0; }
            .container { width: 100%; margin: 0; padding: 0; box-shadow: none; border: none; }
            .city-header, .transportation, .flight-info, .hotel-info {
                -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
            }
            @page { margin: 5mm 8mm; size: A4 portrait; }
        }
        
        .footer {
            margin-top: 20px; padding-top: 10px;
            border-top: 1px solid var(--border-color);
            text-align: center; font-size: 0.7rem; color: var(--text-light);
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- 标题栏 -->
        <header class="header">
            <h1>{{TITLE_COUNTRY_DAYS}}</h1>
            <div class="subtitle">中文行程单</div>
            <div class="trip-info">
                <div class="info-item"><i class="far fa-calendar-alt"></i><span>{{DATE_RANGE}}</span></div>
                <div class="info-item"><i class="far fa-clock"></i><span>{{NIGHTS_COUNT}}</span></div>
                <div class="info-item"><i class="fas fa-map-marked-alt"></i><span>{{CITY_LIST}}</span></div>
                <div class="info-item"><i class="fas fa-plane"></i><span>{{TRANSPORT_TYPE}}</span></div>
            </div>
        </header>

        <main id="main-content">
            <!-- 
            ================================================================
            [循环生成] 城市区块 -> 每日卡片
            请根据实际行程复制以下 block
            ================================================================
            -->

            <!-- [BLOCK: 城市区块 Start] -->
            <section class="city-section">
                <div class="city-header">
                    <div class="city-icon"><i class="fas {{CITY_ICON_CLASS}}"></i></div>
                    <div class="city-name">{{CITY_NAME_CN}} ({{CITY_NAME_EN}})</div>
                    <div class="city-dates">{{CITY_DATE_RANGE}}</div>
                </div>

                <!-- [BLOCK: 每日卡片 Start] -->
                <div class="day-card">
                    <div class="day-header">
                        <div>
                            <span class="day-date">{{DATE_YYYY_MM_DD}}</span>
                            <span class="day-week">{{WEEKDAY}}</span>
                        </div>
                        <div class="transportation">
                            <i class="fas {{TRANS_ICON}}"></i> {{TRANS_TEXT}}
                        </div>
                    </div>

                    <!-- [条件BLOCK: 航班信息] 仅在有航班时保留，否则删除 -->
                    <div class="flight-info">
                        <!-- 循环 flight-item (如联程航班) -->
                        <div class="flight-item">
                            <div class="flight-icon"><i class="fas fa-plane"></i></div>
                            <div class="flight-details">
                                <div class="flight-route">
                                    <span>{{FLIGHT_ORIGIN}} &rarr; {{FLIGHT_DEST}}</span>
                                    <span class="flight-number">{{FLIGHT_NUM}}</span>
                                </div>
                                <div class="flight-time">{{FLIGHT_TIME}}</div>
                                <div class="flight-sub">{{FLIGHT_AIRLINE_MODEL}}</div>
                            </div>
                        </div>
                    </div>

                    <div class="day-content">
                        <!-- 活动列表 -->
                        <ul class="activities-list">
                            <li class="activity-item">
                                <span class="activity-name">{{ACTIVITY_TITLE}}</span>
                                <span class="activity-desc">{{ACTIVITY_DESC}}</span>
                            </li>
                            <!-- 更多活动... -->
                        </ul>

                        <!-- [条件BLOCK: 酒店信息] 仅在入住第一天保留，否则删除 -->
                        <div class="hotel-info">
                            <div class="hotel-name">{{HOTEL_NAME}}</div>
                            <div class="hotel-details">
                                <div><strong>地址：</strong>{{HOTEL_ADDRESS}}</div>
                                <div><strong>电话：</strong>{{HOTEL_PHONE}}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- [BLOCK: 每日卡片 End] -->

            </section>
            <!-- [BLOCK: 城市区块 End] -->

        </main>

        <footer class="footer">
            © 行程安排仅供参考，请以实际出票及当地情况为准
        </footer>
    </div>
</body>
</html>
    `
  },

  ID_CARD: {
    id: "ZH_ID_CARD_V3",
    name: "中国居民身份证 (高保真表格版)",
    category: "IDENTITY",
    matchCriteria: {
      keywords: ["身份证", "居民身份证", "Identity Card", "Resident Identity Card"],
      anchorText: ["People's Republic of China Resident Identity Card", "Front Side", "Back Side", "Name", "Gender", "Ethnicity", "Date of Birth", "Residential Address", "National ID Number", "Issuing Authority", "Valid Period"],
      layoutFeatures: ["Two sections: Front Side and Back Side", "Table-based layout", "Gray headers"],
      layoutDescription: "高保真表格版身份证翻译件。包含正反两面信息。正面包含姓名、性别、民族、出生日期、住址及公民身份号码；背面包含签发机关及有效期限。采用 Arial 字体，灰色表头。",
      requiredFields: ["NAME", "GENDER", "ETHNICITY", "DOB", "ADDRESS", "ID_NUMBER", "AUTHORITY", "VALIDITY"]
    },
    html: `
      <div class="id-card-translation" style="font-family: Arial, sans-serif; color: #000; line-height: 1.3; padding: 20px;">
        <style>
          .card-section { margin-bottom: 30px; }
          .card-title { font-weight: bold; text-align: center; font-size: 1.2em; margin-bottom: 10px; background-color: #f0f0f0; padding: 5px; border: 1px solid #000; }
          .id-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; border: 1px solid #000; table-layout: fixed; }
          .id-table th, .id-table td { border: 1px solid #000; padding: 8px 10px; vertical-align: top; word-wrap: break-word; }
          .id-table th { background-color: #f2f2f2; font-weight: bold; text-align: left; width: 20%; }
        </style>
        
        <!-- Front Side -->
        <div class="card-section">
          <div class="card-title">People's Republic of China Resident Identity Card (Front Side)</div>
          <table class="id-table">
            <tr>
              <th>Name</th><td>{{NAME}}</td>
              <th>Gender</th><td>{{GENDER}}</td>
            </tr>
            <tr>
              <th>Ethnicity</th><td>{{ETHNICITY}}</td>
              <th>Date of Birth</th><td>{{DOB}}</td>
            </tr>
            <tr>
              <th>Residential Address</th>
              <td colspan="3">{{ADDRESS}}</td>
            </tr>
            <tr>
              <th>National ID Number</th>
              <td colspan="3">{{ID_NUMBER}}</td>
            </tr>
          </table>
        </div>

        <!-- Back Side -->
        <div class="card-section">
          <div class="card-title">People's Republic of China Resident Identity Card (Back Side)</div>
          <table class="id-table">
            <tr>
              <th style="width: 25%;">Issuing Authority</th>
              <td>{{AUTHORITY}}</td>
            </tr>
            <tr>
              <th style="width: 25%;">Valid Period</th>
              <td>{{VALIDITY}}</td>
            </tr>
          </table>
        </div>
      </div>
    `
  },

  HOUSEHOLD_REGISTER: {
    id: "ZH_HOUSEHOLD_REGISTER_V2",
    name: "中国居民户口簿 (3/4版面定制版)",
    category: "TRAVEL",
    matchCriteria: {
      keywords: ["Household Register", "Resident Household Register", "户口簿", "常住人口登记卡"],
      anchorText: ["IMPORTANT NOTICES", "Household Type", "Name of Head of Household", "Resident Population Registration Card", "Relationship to Head"],
      layoutFeatures: ["3/4 page layout", "A4 optimized", "20-column grid system for card"],
      layoutDescription: "高保真 3/4 版面定制版。优化了行高(1.25)和字号(13px)，确保内容严格控制在 A4 纸的上 3/4 区域。包含完整的首页信息、住址变动页及常住人口登记卡。",
      requiredFields: ["HOUSEHOLD_TYPE", "HEAD_OF_HOUSEHOLD_NAME", "HOUSEHOLD_ADDRESS", "CARD_NAME", "CARD_RELATIONSHIP", "CARD_ID_NUMBER"]
    },
    html: `
      <div class="household-register" style="font-family: 'Times New Roman', Times, serif; font-size: 13px; color: #000; line-height: 1.25; padding: 20px 40px;">
        <style>
          .page { width: 100%; max-width: 800px; margin: 0 auto; position: relative; max-height: 210mm; }
          .page-break { page-break-after: always; margin-bottom: 20px; border-bottom: 2px dashed #ccc; padding-bottom: 20px; }
          h2 { text-align: center; letter-spacing: 0.5em; font-size: 20px; margin-bottom: 15px; margin-top: 0; }
          h3 { text-align: center; font-size: 17px; margin-top: 15px; margin-bottom: 8px; letter-spacing: 2px; }
          ol { padding-left: 20px; text-align: justify; margin-bottom: 20px; font-size: 13px; }
          li { margin-bottom: 6px; }
          table { width: 100%; border-collapse: collapse; table-layout: fixed; margin-bottom: 15px; }
          th, td { border: 1px solid #000; padding: 4px 3px; text-align: center; vertical-align: middle; word-wrap: break-word; }
          th { font-weight: normal; }
          .text-left { text-align: left; }
          .seal-red { color: #d32f2f; text-align: center; font-weight: bold; }
          .seal-circle { display: inline-block; border: 3px solid #d32f2f; border-radius: 50%; padding: 12px 5px; width: 130px; height: 130px; box-sizing: border-box; font-size: 11px; line-height: 1.2; }
          .seal-right { width: 150px !important; height: 150px !important; padding: 15px 5px !important; }
          .signature { font-family: 'Brush Script MT', 'Comic Sans MS', cursive; font-size: 16px; }
        </style>

        <!-- Page 1: Household Info -->
        <div class="page page-break">
          <h2>IMPORTANT NOTICES</h2>
          <ol>
            <li>The Resident Household Register has the legal effect of proving the status of citizens and the mutual relationships among family members...</li>
            <li>The head of the household should keep the Resident Household Register properly...</li>
            <li>The registration right of the Resident Household Register belongs to the household registration organ...</li>
            <li>If there is an increase or decrease of personnel in the household...</li>
            <li>If the entire household moves out of the jurisdiction...</li>
          </ol>

          <table>
            <colgroup><col style="width: 15%;"><col style="width: 35%;"><col style="width: 15%;"><col style="width: 35%;"></colgroup>
            <tr>
              <th>Household Type</th><td>{{HOUSEHOLD_TYPE}}</td>
              <th>Name of Head of Household</th><td>{{HEAD_OF_HOUSEHOLD_NAME}}</td>
            </tr>
            <tr>
              <th>Household No.</th><td>{{HOUSEHOLD_NUMBER}}</td>
              <th>Address</th><td class="text-left">{{HOUSEHOLD_ADDRESS}}</td>
            </tr>
          </table>

          <table style="border: none; margin-top: 15px;">
            <tr>
              <td style="border: none; width: 50%;" class="seal-red">
                <div class="seal-circle">
                  <br>{{PROVINCE_SEAL_LINE_1}}<br>Household Register Special Seal<br>
                  <span style="font-size: 14px;">★</span><br>{{PROVINCE_SEAL_DEPARTMENT}}
                </div>
              </td>
              <td style="border: none; width: 50%;" class="seal-red">
                <div class="seal-circle seal-right">
                  {{MUNICIPAL_SEAL_LINE_1}}<br>Household Registration Organ<br>Household Register Special Seal<br>
                  <span style="font-size: 14px;">★</span><br>{{MUNICIPAL_SEAL_CODE}}<br>{{MUNICIPAL_SEAL_BRANCH}}
                </div>
              </td>
            </tr>
            <tr>
              <td style="border: none; text-align: left; padding-top: 15px;">
                Signature of Handler: <span class="signature">{{PAGE_1_HANDLER_SIGNATURE}}</span>
              </td>
              <td style="border: none; text-align: right; padding-top: 15px;">
                Issued on: {{ISSUE_DATE}}<br>{{ISSUING_AUTHORITY}}
              </td>
            </tr>
          </table>
        </div>

        <!-- Page 2: Card -->
        <div class="page">
          <h3>Registration of Address Changes</h3>
          <table>
            <colgroup><col style="width: 50%;"><col style="width: 25%;"><col style="width: 25%;"></colgroup>
            <tr><th>Address after change</th><th>Date of change</th><th>Signature of Handler</th></tr>
            <tr><td style="height: 20px;">{{ADDRESS_CHANGE_1}}</td><td>{{DATE_CHANGE_1}}</td><td>{{SIGNATURE_CHANGE_1}}</td></tr>
            <tr><td style="height: 20px;">{{ADDRESS_CHANGE_2}}</td><td>{{DATE_CHANGE_2}}</td><td>{{SIGNATURE_CHANGE_2}}</td></tr>
          </table>

          <div style="margin-top: 20px; margin-bottom: 5px;">Household No.: {{HOUSEHOLD_NUMBER}}</div>
          <h3 style="margin-top: 0;">Resident Population Registration Card</h3>
          
          <table>
            <colgroup>
              <col style="width: 5%;"><col style="width: 5%;"><col style="width: 5%;"><col style="width: 5%;"><col style="width: 5%;">
              <col style="width: 5%;"><col style="width: 5%;"><col style="width: 5%;"><col style="width: 5%;"><col style="width: 5%;">
              <col style="width: 5%;"><col style="width: 5%;"><col style="width: 5%;"><col style="width: 5%;"><col style="width: 5%;">
              <col style="width: 5%;"><col style="width: 5%;"><col style="width: 5%;"><col style="width: 5%;"><col style="width: 5%;">
            </colgroup>
            <tr><th colspan="3">Name</th><td colspan="5">{{CARD_NAME}}</td><th colspan="7">Relationship to Head</th><td colspan="5">{{CARD_RELATIONSHIP}}</td></tr>
            <tr><th colspan="3">Former Name</th><td colspan="5">{{CARD_FORMER_NAME}}</td><th colspan="7">Sex</th><td colspan="5">{{CARD_SEX}}</td></tr>
            <tr><th colspan="3">Place of Birth</th><td colspan="5">{{CARD_BIRTHPLACE}}</td><th colspan="7">Ethnicity</th><td colspan="5">{{CARD_ETHNICITY}}</td></tr>
            <tr><th colspan="3">Native Place</th><td colspan="5">{{CARD_NATIVE_PLACE}}</td><th colspan="7">Date of Birth</th><td colspan="5">{{CARD_DOB}}</td></tr>
            <tr><th colspan="4">Citizen ID Card No.</th><td colspan="8">{{CARD_ID_NUMBER}}</td><th colspan="2">Height</th><td colspan="2">{{CARD_HEIGHT}}</td><th colspan="2">Blood Type</th><td colspan="2">{{CARD_BLOOD_TYPE}}</td></tr>
            <tr><th colspan="3">Education Level</th><td colspan="4">{{CARD_EDUCATION}}</td><th colspan="3">Marital Status</th><td colspan="4">{{CARD_MARITAL_STATUS}}</td><th colspan="3">Military Status</th><td colspan="3">{{CARD_MILITARY}}</td></tr>
            <tr><th colspan="3">Place of Service</th><td colspan="11">{{CARD_WORKPLACE}}</td><th colspan="3">Occupation</th><td colspan="3">{{CARD_OCCUPATION}}</td></tr>
            <tr><th colspan="6">When and from where migrated to this city</th><td colspan="14" class="text-left">{{CARD_MIGRATE_CITY_INFO}}</td></tr>
            <tr><th colspan="6">When and from where migrated to this address</th><td colspan="14" class="text-left">{{CARD_MIGRATE_ADDRESS_INFO}}</td></tr>
          </table>

          <table style="border: none; margin-top: 10px;">
            <tr>
              <td style="border: none; text-align: left;">Signature of Handler: <span class="signature">{{PAGE_2_HANDLER_SIGNATURE}}</span></td>
              <td style="border: none; text-align: right;">Date of Registration: {{CARD_REGISTRATION_DATE}}</td>
            </tr>
          </table>
        </div>
      </div>
    `
  },

  BUSINESS_LICENSE: {
    id: "ZH_BUSINESS_LICENSE_V2",
    name: "营业执照 (公司/个体高保真横版)",
    category: "FINANCE",
    matchCriteria: {
      keywords: ["Business License", "营业执照", "Unified Social Credit Code", "Unified Code", "Limited Liability Company", "Individual Industrial and Commercial Household"],
      anchorText: ["Unified Social Credit Code", "Business License", "Duplicate", "Name:", "Type:", "Establishment:", "Business Address:", "Business Scope:", "Registration Authority"],
      layoutFeatures: ["Landscape A4", "Header with Unified Code and Title", "Two-column info section", "Business scope below", "Authority and Footer"],
      layoutDescription: "高保真横版营业执照。支持公司及个体工商户。采用 Times New Roman 字体，左侧显示统一社会信用代码，中间为营业执照标题。信息分为两列，动态识别法定代表人/负责人标签。",
      requiredFields: ["UNIFIED_SOCIAL_CREDIT_CODE", "COMPANY_NAME", "COMPANY_TYPE", "PERSON_IN_CHARGE_LABEL", "PERSON_IN_CHARGE_NAME", "ESTABLISHMENT_DATE", "BUSINESS_ADDRESS", "GENERAL_ITEMS", "PERMITTED_ITEMS", "REGISTRATION_AUTHORITY_DATE"]
    },
    html: `
      <div class="business-license" style="font-family: 'Times New Roman', 'SimSun', serif; width: 29.7cm; height: 21cm; background: white; padding: 1.2cm 2.5cm 1.5cm; box-sizing: border-box; display: flex; flex-direction: column; color: #000;">
        <style>
          .header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
          .unified-code-section { flex: 0 0 auto; text-align: left; }
          .unified-code-label { font-size: 14px; margin-bottom: 5px; }
          .unified-code { font-weight: bold; font-size: 16px; letter-spacing: 1px; }
          .license-title { flex: 0 0 auto; text-align: center; font-size: 28px; font-weight: bold; text-decoration: underline; line-height: 1.2; }
          .info-section { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
          .info-row { margin-bottom: 12px; display: flex; min-height: 20px; line-height: 1.3; }
          .label { font-weight: bold; min-width: 150px; white-space: nowrap; }
          .content { flex: 1; border-bottom: 1px dotted #666; padding-left: 5px; line-height: 1.3; text-align: left; }
          .scope-row { display: block; margin-bottom: 10px; line-height: 1.3; }
          .scope-label { font-weight: bold; margin-bottom: 4px; line-height: 1.3; }
          .scope-content { border-bottom: none; padding-left: 0; font-size: 13px; line-height: 1.3; text-align: justify; }
          .authority-section { text-align: right; margin-top: 10px; padding-top: 10px; border-top: 1px solid #000; line-height: 1.3; }
          .authority-name { font-weight: bold; margin-bottom: 5px; }
          .footer-section { font-size: 13px; margin-top: 15px; padding-top: 0.3cm; text-align: center; }
          .bottom-space { height: 2cm; }
        </style>
        <div class="header-row">
          <div class="unified-code-section">
            <div class="unified-code-label">Unified Social Credit Code</div>
            <div class="unified-code">{{UNIFIED_SOCIAL_CREDIT_CODE}}</div>
          </div>
          <div class="license-title">Business License<br>(Duplicate)</div>
          <div style="flex: 0 0 auto; width: 180px;"></div>
        </div>
        <div class="info-section">
          <div class="info-column">
            <div class="info-row"><div class="label">Name:</div><div class="content">{{COMPANY_NAME}}</div></div>
            <div class="info-row"><div class="label">Type:</div><div class="content">{{COMPANY_TYPE}}</div></div>
          </div>
          <div class="info-column">
            <div class="info-row"><div class="label">{{PERSON_IN_CHARGE_LABEL}}:</div><div class="content">{{PERSON_IN_CHARGE_NAME}}</div></div>
            <div class="info-row"><div class="label">Date of Establishment:</div><div class="content">{{ESTABLISHMENT_DATE}}</div></div>
            <div class="info-row"><div class="label">Business Address:</div><div class="content">{{BUSINESS_ADDRESS}}</div></div>
          </div>
        </div>
        <div class="scope-row">
          <div class="scope-label">Business Scope:</div>
          <div class="scope-content">
            <div><strong>General Items:</strong> {{GENERAL_ITEMS}}</div>
            <div><strong>Permitted Items:</strong> {{PERMITTED_ITEMS}}</div>
          </div>
        </div>
        <div class="authority-section">
          <div class="authority-name">Registration Authority</div>
          <div class="authority-date">{{REGISTRATION_AUTHORITY_DATE}}</div>
        </div>
        <div class="footer-section">
          <div class="footer-url">National Enterprise Credit Information Publicity System Website: http://www.gsxt.gov.cn</div>
          <div class="footer-reminder">Market entities shall submit and publicize their annual report through the National Enterprise Credit Information Publicity System between January 1 and June 30 each year.</div>
          <div class="footer-monitor" style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #ccc;">Produced under the supervision of the State Administration for Market Regulation.</div>
        </div>
        <div class="bottom-space"></div>
      </div>
    `
  },

  MOTOR_VEHICLE_REGISTER,

  VEHICLE_LICENSE,

  MARRIAGE_CERTIFICATE: {
    id: "ZH_MARRIAGE_CERTIFICATE_V1",
    name: "结婚证 (标准翻译版)",
    category: "RELATIONSHIP",
    matchCriteria: {
      keywords: ["Marriage Certificate", "结婚证", "Groom", "Bride"],
      anchorText: ["MARRIAGE CERTIFICATE", "Certificate Holder", "Registration Date", "Marriage Certificate Number", "Groom's Information", "Bride's Information"],
      layoutFeatures: ["Portrait A4", "Title at top", "Basic info table", "Groom info table", "Bride info table"],
      layoutDescription: "高保真结婚证翻译件。采用 Times New Roman 字体，包含基础登记信息、男方信息及女方信息三个独立表格。左侧标签列带有浅灰色背景。",
      requiredFields: ["CERTIFICATE_HOLDER", "REGISTRATION_DATE", "CERTIFICATE_NUMBER", "GROOM_NAME", "GROOM_ID_NUMBER", "BRIDE_NAME", "BRIDE_ID_NUMBER"]
    },
    html: `
      <div class="marriage-certificate" style="font-family: 'Times New Roman', Times, serif; width: 100%; max-width: 800px; margin: 0 auto; color: #000; line-height: 1.5; padding: 40px;">
        <style>
          .certificate-title { text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 30px; text-decoration: underline; letter-spacing: 1px; }
          .info-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; table-layout: fixed; }
          .info-table td { padding: 10px 15px; vertical-align: middle; border: 1px solid #000; word-wrap: break-word; }
          .info-table td:first-child { font-weight: bold; width: 35%; background-color: #f9f9f9; }
          .section-title { font-size: 18px; font-weight: bold; margin-top: 20px; margin-bottom: 10px; text-decoration: underline; }
          .remarks { font-style: italic; color: #333; }
        </style>
        <div class="certificate-title">MARRIAGE CERTIFICATE</div>
        <table class="info-table">
          <tr><td>Certificate Holder</td><td>{{CERTIFICATE_HOLDER}}</td></tr>
          <tr><td>Registration Date</td><td>{{REGISTRATION_DATE}}</td></tr>
          <tr><td>Marriage Certificate Number</td><td>{{CERTIFICATE_NUMBER}}</td></tr>
          <tr><td>Remarks</td><td class="remarks">{{REMARKS}}</td></tr>
        </table>
        <div class="section-title">Groom's Information</div>
        <table class="info-table">
          <tr><td>Full Name</td><td>{{GROOM_NAME}}</td></tr>
          <tr><td>Gender</td><td>{{GROOM_GENDER}}</td></tr>
          <tr><td>Nationality</td><td>{{GROOM_NATIONALITY}}</td></tr>
          <tr><td>Date of Birth</td><td>{{GROOM_DOB}}</td></tr>
          <tr><td>ID Card Number</td><td>{{GROOM_ID_NUMBER}}</td></tr>
        </table>
        <div class="section-title">Bride's Information</div>
        <table class="info-table">
          <tr><td>Full Name</td><td>{{BRIDE_NAME}}</td></tr>
          <tr><td>Gender</td><td>{{BRIDE_GENDER}}</td></tr>
          <tr><td>Nationality</td><td>{{BRIDE_NATIONALITY}}</td></tr>
          <tr><td>Date of Birth</td><td>{{BRIDE_DOB}}</td></tr>
          <tr><td>ID Card Number</td><td>{{BRIDE_ID_NUMBER}}</td></tr>
        </table>
      </div>
    `
  },

  HOUSE_OWNERSHIP_CERTIFICATE_OLD: {
    id: "ZH_HOUSE_OWNERSHIP_CERTIFICATE_OLD_V1",
    name: "旧版房产证 (标准翻译版)",
    category: "FINANCE",
    matchCriteria: {
      keywords: ["House Ownership Certificate", "房产证", "House Owner", "Co-ownership Status", "House Location"],
      anchorText: ["House Owner", "Co-ownership Status", "House Location", "Registration Date", "House Nature", "House Status", "Land Status", "Total Floor Area"],
      layoutFeatures: ["Portrait A4", "Main info table", "Embedded sub-tables for house and land status", "Remarks section at bottom"],
      layoutDescription: "高保真旧版房产证翻译件。采用 Times New Roman 字体，包含房产所有权人、共有情况、房屋坐落等核心信息。房屋状况和土地状况采用内嵌子表格形式展现。",
      requiredFields: ["CERTIFICATE_TITLE", "HOUSE_OWNER", "HOUSE_LOCATION", "REGISTRATION_DATE", "TOTAL_FLOOR_AREA"]
    },
    html: `
      <div class="house-ownership-certificate-old" style="font-family: 'Times New Roman', Arial, sans-serif; width: 100%; max-width: 800px; margin: 0 auto; color: #000; line-height: 1.5; padding: 40px;">
        <style>
          .certificate-title { font-size: 14pt; font-weight: bold; margin-bottom: 20px; text-align: left; }
          .main-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; table-layout: fixed; }
          .main-table td { border: 1pt solid #000; padding: 8px 10px; vertical-align: middle; word-wrap: break-word; }
          .label-bg { background-color: #f2f2f2; font-weight: bold; width: 30%; }
          .sub-table { width: 100%; border-collapse: collapse; table-layout: fixed; margin: 0; }
          .sub-table td { border: 1pt solid #000; padding: 6px 4px; text-align: center; font-size: 11pt; }
          .sub-header-bg { background-color: #f0f0f0; font-weight: bold; }
          .remarks-title { font-weight: bold; margin-top: 10px; margin-bottom: 5px; font-size: 12pt; }
          .remarks-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
          .remarks-table td { border: 1pt solid #000; padding: 10px; min-height: 60px; }
        </style>
        <div class="certificate-title">{{CERTIFICATE_TITLE}}</div>
        <table class="main-table">
          <tr><td class="label-bg">House Owner</td><td>{{HOUSE_OWNER}}</td></tr>
          <tr><td class="label-bg">Co-ownership Status</td><td>{{CO_OWNERSHIP_STATUS}}</td></tr>
          <tr><td class="label-bg">House Location</td><td>{{HOUSE_LOCATION}}</td></tr>
          <tr><td class="label-bg">Registration Date</td><td>{{REGISTRATION_DATE}}</td></tr>
          <tr><td class="label-bg">House Nature</td><td>{{HOUSE_NATURE}}</td></tr>
          <tr>
            <td class="label-bg">House Status</td>
            <td style="padding: 8px;">
              <table class="sub-table">
                <tr><td class="sub-header-bg">Total floors</td><td class="sub-header-bg">Total Floor Area (㎡)</td><td class="sub-header-bg">Internal Floor Area (㎡)</td><td class="sub-header-bg">Others</td></tr>
                <tr><td>{{TOTAL_FLOORS}}</td><td>{{TOTAL_FLOOR_AREA}}</td><td>{{INTERNAL_FLOOR_AREA}}</td><td>{{HOUSE_OTHERS}}</td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="label-bg">Land Status</td>
            <td style="padding: 8px;">
              <table class="sub-table">
                <tr><td class="sub-header-bg">Land Number</td><td class="sub-header-bg">Acquisition Method</td><td class="sub-header-bg">Land Use Term</td></tr>
                <tr><td>{{LAND_NUMBER}}</td><td>{{ACQUISITION_METHOD}}</td><td>{{LAND_USE_TERM}}</td></tr>
              </table>
            </td>
          </tr>
        </table>
        <div class="remarks-title">Remarks</div>
        <table class="remarks-table"><tr><td>{{REMARKS_CONTENT}}</td></tr></table>
      </div>
    `
  },

  RESIDENCE_CERTIFICATE: {
    id: "ZH_RESIDENCE_CERTIFICATE_V1",
    name: "居住证明 (标准翻译版)",
    category: "IDENTITY",
    matchCriteria: {
      keywords: ["Residence Certificate", "居住证明", "Domicile Location", "Residential Address"],
      anchorText: ["Residence Certificate", "Name:", "Gender:", "Ethnicity:", "Date of Birth:", "Citizen ID Number:", "Domicile Location:", "Residential Address:", "Assigned Police Station:", "Issuing Unit:", "Period of Validity:", "Continuous Residence:"],
      layoutFeatures: ["Portrait A4", "Two-column layout", "Underlined fields", "Police station and Issuing unit sections"],
      layoutDescription: "高保真居住证明翻译件。采用 Times New Roman 字体，两栏布局。左侧包含个人基本信息和户籍地址，右侧包含业务编号、居住地址、派出所信息、签发单位及有效期。",
      requiredFields: ["NAME", "GENDER", "DATE_OF_BIRTH", "CITIZEN_ID_NUMBER", "RESIDENTIAL_ADDRESS", "POLICE_STATION", "ISSUING_UNIT", "VALIDITY_PERIOD"]
    },
    html: `
      <div class="residence-certificate" style="font-family: 'Times New Roman', Arial, sans-serif; width: 100%; max-width: 850px; margin: 0 auto; color: #000; line-height: 1.6; padding: 40px;">
        <style>
          .header { text-align: center; font-size: 26px; font-weight: bold; margin-bottom: 40px; padding-bottom: 10px; border-bottom: 2px solid #000; letter-spacing: 1px; }
          .two-column-container { display: flex; justify-content: space-between; gap: 50px; }
          .column { flex: 1; min-width: 0; }
          .section { margin-bottom: 25px; }
          .info-line { display: flex; align-items: flex-end; margin-bottom: 12px; min-height: 28px; }
          .label { font-weight: bold; white-space: nowrap; margin-right: 8px; }
          .content { flex: 1; border-bottom: 1px solid #000; padding-bottom: 2px; word-wrap: break-word; min-width: 50px; }
          .info-block { margin-bottom: 15px; }
          .info-block .label { display: block; margin-bottom: 5px; }
          .info-block .content-block { display: block; border-bottom: 1px solid #000; min-height: 28px; padding-bottom: 2px; word-wrap: break-word; }
          .inline-group { display: flex; align-items: flex-end; }
          .inline-group .content { flex: 0 1 auto; min-width: 60px; text-align: center; margin: 0 8px; }
        </style>
        <div class="header">Residence Certificate</div>
        <div class="two-column-container">
          <div class="column">
            <div class="section">
              <div class="info-line"><span class="label">Name:</span><span class="content">{{NAME}}</span></div>
              <div class="info-line"><span class="label">Gender:</span><span class="content">{{GENDER}}</span></div>
              <div class="info-line"><span class="label">Ethnicity:</span><span class="content">{{ETHNICITY}}</span></div>
              <div class="info-line"><span class="label">Date of Birth:</span><span class="content">{{DATE_OF_BIRTH}}</span></div>
              <div class="info-line"><span class="label">Citizen ID Number:</span><span class="content">{{CITIZEN_ID_NUMBER}}</span></div>
            </div>
            <div class="section">
              <div class="info-block"><span class="label">Domicile Location:</span><span class="content-block">{{DOMICILE_LOCATION}}</span></div>
            </div>
          </div>
          <div class="column">
            <div class="section"><div class="info-line"><span class="label">Business Number:</span><span class="content">{{BUSINESS_NUMBER}}</span></div></div>
            <div class="section"><div class="info-block"><span class="label">Residential Address:</span><span class="content-block">{{RESIDENTIAL_ADDRESS}}</span></div></div>
            <div class="section"><div class="info-block"><span class="label">Assigned Police Station:</span><span class="content-block">{{POLICE_STATION}}</span></div></div>
            <div class="section"><div class="info-block"><span class="label">Issuing Unit:</span><span class="content-block">{{ISSUING_UNIT}}</span></div></div>
            <div class="section">
              <div class="info-line"><span class="label">Period of Validity:</span><span class="content">{{VALIDITY_PERIOD}}</span></div>
              <div class="info-line inline-group"><span class="label">Continuous Residence:</span><span class="content">{{RESIDENCE_DAYS}}</span><span>days</span></div>
            </div>
          </div>
        </div>
      </div>
    `
  },

  GENERAL_DOCUMENT,

  RETIREMENT_CERTIFICATE: {
    id: "ZH_RETIREMENT_CERTIFICATE_V1",
    name: "退休证 (高保真两页版)",
    category: "EMPLOYMENT",
    matchCriteria: {
      keywords: ["Retirement Certificate", "退休证", "Retire"],
      anchorText: ["Retirement Certificate", "Page 1", "Page 2", "Photo", "ID Number", "SSN", "Issue Date", "Notes"],
      layoutFeatures: ["Two-page layout with page-break", "Photo area on page 1", "Table-based info sections", "Notes at the end"],
      layoutDescription: "高保真两页版退休证翻译件。采用 Arial 字体。第一页包含标题、照片占位符、核心证件编号及基础信息表；第二页包含补充信息表及备注说明。严格保持 3/5 内容占比布局。",
      requiredFields: ["MAIN_TITLE_ENGLISH", "ID_NUMBER_VALUE", "FIELD_1_VALUE"]
    },
    html: `
      <div class="retirement-certificate-container" style="font-family: Arial, sans-serif; color: #000; line-height: 1.5; background-color: #f5f5f5; padding: 20px;">
        <style>
          .page-container { width: 210mm; min-height: 297mm; background-color: white; margin: 0 auto; box-shadow: 0 0 15px rgba(0,0,0,0.1); position: relative; padding: 0; }
          .page-content { padding: 20px 30px; min-height: 178mm; }
          .page-two-content { padding: 20px 30px; min-height: 178mm; }
          .header { text-align: center; margin-bottom: 30px; }
          .main-title { font-size: 36px; font-weight: bold; margin-bottom: 5px; letter-spacing: 3px; }
          .sub-title { font-size: 20px; margin-bottom: 15px; color: #333; }
          .photo-container { display: flex; flex-direction: column; align-items: center; margin-bottom: 40px; }
          .photo-box { width: 3.5cm; height: 4.5cm; border: 3px solid #000; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 15px; }
          .photo-note { text-align: center; font-size: 14px; line-height: 1.5; color: #555; max-width: 80%; }
          .document-info { margin-bottom: 40px; text-align: center; display: flex; flex-direction: column; align-items: center; }
          .document-line { font-size: 16px; margin-bottom: 8px; }
          .info-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .info-table td { border: 2px solid #000; padding: 12px 15px; vertical-align: top; font-size: 16px; }
          .info-table tr td:first-child { font-weight: bold; width: 35%; background-color: #f9f9f9; }
          .page-two-table { margin-top: 30px; }
          .notes { margin-top: 40px; font-size: 14px; line-height: 1.6; }
          .notes p { margin: 8px 0; }
          .bold { font-weight: bold; }
          .page-break { page-break-before: always; }
        </style>

        <!-- PAGE 1 -->
        <div class="page-container">
          <div class="page-content">
            <div class="header">
              <div class="main-title">{{MAIN_TITLE_ENGLISH}}</div>
              <div class="sub-title">Page 1</div>
            </div>
            <div class="photo-container">
              <div class="photo-box">Photo</div>
              <div class="photo-note">{{PHOTO_NOTE_TEXT}}</div>
            </div>
            <div class="document-info">
              <div class="document-line"><span class="bold">{{ID_NUMBER_LABEL}}:</span> {{ID_NUMBER_VALUE}}</div>
              <div class="document-line"><span class="bold">{{SSN_LABEL}}:</span> {{SSN_VALUE}}</div>
              <div class="document-line"><span class="bold">{{ISSUE_DATE_LABEL}}:</span> {{ISSUE_DATE_VALUE}}</div>
            </div>
            <table class="info-table">
              <tr><td>{{FIELD_1_LABEL}}</td><td>{{FIELD_1_VALUE}}</td></tr>
              <tr><td>{{FIELD_2_LABEL}}</td><td>{{FIELD_2_VALUE}}</td></tr>
              <tr><td>{{FIELD_3_LABEL}}</td><td>{{FIELD_3_VALUE}}</td></tr>
            </table>
          </div>
        </div>

        <!-- PAGE 2 -->
        <div class="page-container page-break">
          <div class="page-two-content">
            <div class="header"><div class="sub-title">Page 2</div></div>
            <table class="info-table page-two-table">
              <tr><td>{{FIELD_N1_LABEL}}</td><td>{{FIELD_N1_VALUE}}</td></tr>
              <tr><td>{{FIELD_N2_LABEL}}</td><td>{{FIELD_N2_VALUE}}</td></tr>
              <tr><td>{{FIELD_N3_LABEL}}</td><td>{{FIELD_N3_VALUE}}</td></tr>
            </table>
            <div class="notes">
              <p><strong>Notes:</strong></p>
              <p>1. {{NOTE_1_TEXT}}</p>
              <p>2. {{NOTE_2_TEXT}}</p>
              <p>3. {{NOTE_3_TEXT}}</p>
            </div>
          </div>
        </div>
      </div>
    `
  },

  REAL_ESTATE_CERTIFICATE_NEW: {
    id: "ZH_REAL_ESTATE_CERTIFICATE_NEW_V1",
    name: "新版房产证 (不动产权证高保真版)",
    category: "FINANCE",
    matchCriteria: {
      keywords: ["Real Estate Certificate", "不动产权证", "不动产登记", "Obligee", "Right Type"],
      anchorText: ["不动产权第", "Obligee", "Co-ownership Status", "Location", "Real Estate Registration No.", "Right Type", "Right Nature", "Purpose", "Area", "Term of Use", "Right Status Details"],
      layoutFeatures: ["Portrait A4", "Left-aligned title/no.", "Main table with gray headers", "Rowspan for right status details", "Separate remarks table"],
      layoutDescription: "高保真新版不动产权证翻译件。采用 Arial 字体。证书编号左对齐不加粗。主表格包含所有核心信息，其中“权利状况附记项”采用 rowspan=\"7\" 结构展示 7 个子项。备注和业务号采用独立表格。",
      requiredFields: ["CERTIFICATE_TITLE_AND_NO", "OBLIGEE_NAME", "PROPERTY_LOCATION", "REAL_ESTATE_REGISTRATION_NO", "RIGHT_TYPE"]
    },
    html: `
      <div class="real-estate-certificate-new" style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #fff;">
        <style>
          .certificate-title { font-size: 1.2em; margin-bottom: 20px; color: #000; text-align: left; }
          .main-table { border-collapse: collapse; width: 100%; margin-bottom: 25px; }
          .main-table th, .main-table td { border: 1px solid #000; padding: 10px 12px; text-align: left; vertical-align: middle; font-size: 14px; }
          .main-table th { background-color: #f2f2f2; font-weight: bold; width: 30%; color: #000; }
          .remarks-section { margin-bottom: 8px; }
          .remarks-section strong { display: block; font-size: 16px; color: #000; }
          .remarks-table { border-collapse: collapse; width: 100%; }
          .remarks-table td { border: 1px solid #000; padding: 10px 12px; text-align: left; vertical-align: middle; font-size: 14px; }
        </style>
        
        <div class="certificate-title">{{CERTIFICATE_TITLE_AND_NO}}</div>
        
        <table class="main-table">
          <tr><th>Obligee</th><td>{{OBLIGEE_NAME}}</td></tr>
          <tr><th>Co-ownership Status</th><td>{{CO_OWNERSHIP_STATUS}}</td></tr>
          <tr><th>Location</th><td>{{PROPERTY_LOCATION}}</td></tr>
          <tr><th>Real Estate Registration No.</th><td>{{REAL_ESTATE_REGISTRATION_NO}}</td></tr>
          <tr><th>Right Type</th><td>{{RIGHT_TYPE}}</td></tr>
          <tr><th>Right Nature</th><td>{{RIGHT_NATURE}}</td></tr>
          <tr><th>Purpose</th><td>{{PURPOSE}}</td></tr>
          <tr><th>Area</th><td>{{AREA_INFORMATION}}</td></tr>
          <tr><th>Term of Use</th><td>{{TERM_OF_USE}}</td></tr>
          <tr>
            <th rowspan="7">Right Status Details</th>
            <td>{{APPORTIONED_LAND_USE_RIGHT_AREA}}</td>
          </tr>
          <tr><td>{{HOUSE_STRUCTURE}}</td></tr>
          <tr><td>{{EXCLUSIVE_BUILDING_AREA}}</td></tr>
          <tr><td>{{APPORTIONED_BUILDING_AREA}}</td></tr>
          <tr><td>{{TOTAL_FLOORS_OF_HOUSE}}</td></tr>
          <tr><td>{{FLOOR_LOCATED}}</td></tr>
          <tr><td>{{HOUSE_COMPLETION_TIME}}</td></tr>
        </table>
        
        <div class="remarks-section"><strong>Remarks</strong></div>
        <table class="remarks-table">
          <tr><td>Service No.: {{SERVICE_NO}}</td></tr>
        </table>
      </div>
    `
  }
};

export const getTemplateCatalog = () => {
  return Object.values(TEMPLATE_REGISTRY).map(t => ({
    id: t.id,
    matchKeywords: t.matchCriteria.keywords,
    anchorPoints: t.matchCriteria.anchorText,
    spatialSignature: t.matchCriteria.layoutFeatures,
    layoutBrief: t.matchCriteria.layoutDescription
  }));
};

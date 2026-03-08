import { TemplateDefinition } from "../../types";

export const VEHICLE_LICENSE: TemplateDefinition = {
    id: "ZH_VEHICLE_LICENSE_V1",
    name: "行驶证 (标准翻译版)",
    category: "IDENTITY",
    matchCriteria: {
      keywords: ["Vehicle License", "行驶证", "Plate No", "Vehicle Type", "Owner", "Address", "Use Character", "Model", "VIN", "Engine No"],
      anchorText: ["Vehicle License of the People's Republic of China", "Plate No", "Vehicle Type", "Owner", "Address", "Use Character", "Model", "VIN", "Engine No", "Register Date", "Issue Date"],
      layoutFeatures: ["Landscape layout", "Left and Right pages", "Blue border simulation", "Inspection Record box"],
      layoutDescription: "高保真行驶证翻译件。模拟本子左右两联的顶层表格，深蓝色边框模拟行驶证外壳。包含主页和副页信息。",
      requiredFields: ["PLATE_NO", "VEHICLE_TYPE", "OWNER", "ADDRESS", "USE_CHARACTER", "MODEL", "VIN", "ENGINE_NO", "REGISTER_DATE", "ISSUE_DATE"]
    },
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Vehicle License Translation Template (English Version)</title>
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: 'Times New Roman', Arial, sans-serif;
            margin: 0;
            padding: 40px;
            background-color: #fff;
            color: #000;
        }

        /* 强制锁定总宽度的最外层容器，防 WPS 挤压 */
        .page {
            width: 1000px;
            margin: 0 auto;
        }

        /* 模拟本子左右两联的顶层表格 */
        .layout-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        .layout-table > tbody > tr > td {
            vertical-align: top;
        }

        .card-cell {
            width: 48%;
            border: 2px solid #2b4b7c; /* 深蓝色边框模拟行驶证外壳 */
            border-radius: 6px;
            padding: 20px;
        }

        .gap {
            width: 4%;
        }

        /* 标题样式 */
        .title {
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 25px;
            text-transform: uppercase;
        }

        /* 内部表单架构：严格定宽以防任何文字重叠 */
        .info-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            margin-bottom: 5px;
        }

        .info-table td {
            padding: 6px 2px;
            vertical-align: bottom;
            font-size: 12px;
            word-wrap: break-word;
        }

        .lbl {
            font-weight: bold;
            color: #333;
        }

        .val {
            border-bottom: 1px solid #000;
            text-align: left;
            padding-bottom: 2px;
        }

        /* 检验记录框 */
        .inspection-box {
            border: 1px dashed #000;
            min-height: 100px;
            padding: 10px;
            margin-top: 5px;
            font-size: 12px;
        }

        /* 条形码 */
        .barcode {
            text-align: center;
            font-family: monospace;
            font-size: 14px;
            letter-spacing: 3px;
            margin-top: 20px;
        }
    </style>
</head>
<body>

<div class="page">
    <table class="layout-table">
        <tr>
            <!-- ================= LEFT SIDE (Main Page) ================= -->
            <td class="card-cell">
                <div class="title">Vehicle License of the People's Republic of China</div>
                
                <table class="info-table">
                    <colgroup>
                        <col width="20%">
                        <col width="30%">
                        <col width="22%">
                        <col width="28%">
                    </colgroup>
                    <tr>
                        <td class="lbl">Plate No.</td>
                        <td class="val">{{PLATE_NO}}</td>
                        <td class="lbl" style="padding-left: 10px;">Vehicle Type</td>
                        <td class="val">{{VEHICLE_TYPE}}</td>
                    </tr>
                </table>

                <table class="info-table">
                    <colgroup>
                        <col width="20%">
                        <col width="80%">
                    </colgroup>
                    <tr>
                        <td class="lbl">Owner</td>
                        <td class="val">{{OWNER}}</td>
                    </tr>
                    <tr>
                        <td class="lbl">Address</td>
                        <td class="val">{{ADDRESS}}</td>
                    </tr>
                </table>

                <table class="info-table">
                    <colgroup>
                        <col width="24%">
                        <col width="26%">
                        <col width="15%">
                        <col width="35%">
                    </colgroup>
                    <tr>
                        <td class="lbl">Use Character</td>
                        <td class="val">{{USE_CHARACTER}}</td>
                        <td class="lbl" style="padding-left: 10px;">Model</td>
                        <td class="val">{{MODEL}}</td>
                    </tr>
                </table>

                <table class="info-table">
                    <colgroup>
                        <col width="20%">
                        <col width="80%">
                    </colgroup>
                    <tr>
                        <td class="lbl">VIN</td>
                        <td class="val">{{VIN}}</td>
                    </tr>
                    <tr>
                        <td class="lbl">Engine No.</td>
                        <td class="val">{{ENGINE_NO}}</td>
                    </tr>
                </table>

                <table class="info-table" style="margin-top: 15px;">
                    <colgroup>
                        <col width="45%">
                        <col width="55%">
                    </colgroup>
                    <tr>
                        <td style="vertical-align: bottom; text-align: center;">
                            <div style="color: #d32f2f; font-weight: bold; font-size: 11px; border-bottom: 1px solid #d32f2f; display: inline-block; padding-bottom: 2px;">
                                {{ISSUING_AUTHORITY_SEAL}}
                            </div>
                        </td>
                        <td style="padding: 0;">
                            <table class="info-table" style="margin: 0;">
                                <colgroup>
                                    <col width="35%">
                                    <col width="65%">
                                </colgroup>
                                <tr>
                                    <td class="lbl">Register Date</td>
                                    <td class="val">{{REGISTER_DATE}}</td>
                                </tr>
                                <tr>
                                    <td class="lbl">Issue Date</td>
                                    <td class="val">{{ISSUE_DATE}}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>

            <!-- Gap between pages -->
            <td class="gap"></td>

            <!-- ================= RIGHT SIDE (Sub Page) ================= -->
            <td class="card-cell">
                <table class="info-table">
                    <colgroup>
                        <col width="20%">
                        <col width="30%">
                        <col width="20%">
                        <col width="30%">
                    </colgroup>
                    <tr>
                        <td class="lbl">Plate No.</td>
                        <td class="val">{{SUB_PLATE_NO}}</td>
                        <td class="lbl" style="padding-left: 10px;">File No.</td>
                        <td class="val">{{FILE_NO}}</td>
                    </tr>
                </table>

                <table class="info-table">
                    <colgroup>
                        <col width="34%">
                        <col width="20%">
                        <col width="20%">
                        <col width="26%">
                    </colgroup>
                    <tr>
                        <td class="lbl">Approved Passengers</td>
                        <td class="val">{{APPROVED_PASSENGERS}}</td>
                        <td class="lbl" style="padding-left: 10px;">Gross Mass</td>
                        <td class="val">{{GROSS_MASS}}</td>
                    </tr>
                    <tr>
                        <td class="lbl">Unladen Mass</td>
                        <td class="val">{{UNLADEN_MASS}}</td>
                        <td class="lbl" style="padding-left: 10px;">Approved Load</td>
                        <td class="val">{{APPROVED_LOAD}}</td>
                    </tr>
                </table>

                <table class="info-table">
                    <colgroup>
                        <col width="28%">
                        <col width="30%">
                        <col width="25%">
                        <col width="17%">
                    </colgroup>
                    <tr>
                        <td class="lbl">Overall Dimension</td>
                        <td class="val">{{OVERALL_DIMENSION}}</td>
                        <td class="lbl" style="padding-left: 10px;">Towing Capacity</td>
                        <td class="val">{{TOWING_CAPACITY}}</td>
                    </tr>
                </table>

                <table class="info-table">
                    <colgroup>
                        <col width="15%">
                        <col width="85%">
                    </colgroup>
                    <tr>
                        <td class="lbl">Remarks</td>
                        <td class="val">{{REMARKS}}</td>
                    </tr>
                </table>

                <div style="margin-top: 15px;">
                    <div class="lbl" style="margin-bottom: 5px;">Inspection Record</div>
                    <div class="inspection-box">
                        {{INSPECTION_RECORD}}
                    </div>
                </div>

                <div class="barcode">
                    {{BARCODE_NUMBER}}
                </div>
            </td>
        </tr>
    </table>
</div>

</body>
</html>
    `
  };

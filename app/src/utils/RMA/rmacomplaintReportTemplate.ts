import { format } from "date-fns";

/**
 * Creates an HTML template for RMA complaint reports matching the RMA Form PDF layout.
 * @param {any} data - The complaint/RMA data
 * @returns {string} The HTML template string
 */
export const rmacomplaintReportTemplate = (data: any) => {
  // Format date if it exists
  const formattedDate = data.submittedAt
    ? format(new Date(data.submittedAt), "dd MMM yyyy")
    : format(new Date(), "dd MMM yyyy");

  // Extract details and form data
  const {
    attendingengineer = "",
    complaintNo = "",
    clientName = "",
    faultReported = "",
    typeOfCall = "",
    systemName = "",
    SystemName = "",
    assignDate = "",
    location = "",
    taskType = "",
    status = "",
    S_SERVDT = "",
    S_assignedengg = "",
    COMP_TYPE = "",
    S_REMARK1 = "",
    S_REMARK2 = "",
    modelnumber = "",
    S_UPDT = "",
    COMP_ADD2 = "",
    COMP_ADD3 = "",
    COMP_TEL = "",
    workStatus = "",
    remark = "",
    callAttendedDate = "",
    callAttendedTime = "",
    callCompletedDate = "",
    callCompletedTime,
    partReplaced = "",
    causeProblem = "",
    diagnosis = "",
    materialTakenOut = "",
    customerComment = "",
    customerSignature = "",
    engineerSignature = "",
    engineerComment = "",
    customerName = "",
    customerContact = "",
    assignedengineer = "",
    systemStatus = "",
    engineerUpdateBy = "",
    AMC_Status = "",
    headerImageDataUri = "",
    items = [],
    SrNo = "",
    JobNo = "",
    Model = "",
    Serial_No = "",
    Reason = "",
  } = data;

  // Signatures
  const processedCustomerSignature = customerSignature || "";
  const processedEngineerSignature = engineerSignature || "";

  // Field fallbacks matching RMA Form structure
  const storeReceivedBy = data.receivedBy || S_assignedengg || attendingengineer || assignedengineer || "";
  const storeDate = data.receivedDate || assignDate || formattedDate || "";
  const storeJobNumber = data.jobNumber || complaintNo || "";

  const fullCustomerName = clientName || customerName || "";
  const fullAddress = [location, COMP_ADD2, COMP_ADD3].filter(Boolean).join(", ");
  const contactPerson = customerContact || COMP_TEL || data.contactPerson || "";
  const productName = SystemName || systemName || data.product || COMP_TYPE || "";
  const AMC_status = AMC_Status || data.AMC_Status || "";

  const techEmployeeName = engineerUpdateBy || S_assignedengg || attendingengineer || assignedengineer || "";
  const techDate = callCompletedDate || callAttendedDate || formattedDate || "";

  // Comments string
  const combinedComments = [
    engineerComment || remark || S_REMARK1 || S_REMARK2,
    causeProblem ? `Cause: ${causeProblem}` : "",
    diagnosis ? `Diagnosis: ${diagnosis}` : "",
    partReplaced ? `Part Replaced/Standby: ${partReplaced}` : "",
    materialTakenOut ? `Material Taken Out: ${materialTakenOut}` : "",
    customerComment ? `Customer Comment: ${customerComment}` : ""
  ].filter(Boolean).join("\n");

  // Process RMA items table rows
  const itemsArray = Array.isArray(items) && items.length > 0
    ? items.map((item: any) => ({
      rowNumber: item.Sr || item.rowNumber || item.sr || item.row || "",
      modelNumber: item.modelNo || item.Model || item.modelNumber || item.modelnumber || item.model || "",
      serialNumber: item.serialNo || item.Serial_No || item.serialNumber || item.SerialNo || item.serial_no || item.serial || "",
      reason: item.Reason || item.Reason_for_RMA_Fault || item.reason || item.fault || "",
    }))
    : [
      {
        rowNumber: "1",
        modelNumber: modelnumber || data.modelNumber || "",
        serialNumber: data.serialNo || data.serialNumber || "",
        reason: faultReported || causeProblem || diagnosis || S_REMARK1 || ""
      }
    ];

  // Guarantee 7 rows to match original document layout height
  const totalRowsCount = Math.max(7, itemsArray.length);
  let tableRowsHtml = "";

  for (let i = 0; i < totalRowsCount; i++) {
    const item = itemsArray[i];
    const rowNum = item ? item.rowNumber || i + 1 : "";
    const model = item ? item.modelNumber : "";
    const serial = item ? item.serialNumber : "";
    const reason = item ? item.reason : "";

    tableRowsHtml += `
            <tr class="table-row">
                <td class="col-sno">${rowNum}</td>
                <td class="col-model">${model}</td>
                <td class="col-serial">${serial}</td>
                <td class="col-reason">${reason}</td>
            </tr>
        `;
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>RMA Form - ${storeJobNumber}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

          @page {
            size: A4 portrait;
            margin: 10mm;
          }

          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }

          html, body {
            background-color: #eef2f7;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          body {
            padding: 18px;
            font-size: 12px;
            line-height: 1.6;
          }

          /* A4 Container */
          .container {
            width: 100%;
            max-width: 190mm;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 0;
            box-sizing: border-box;
            page-break-inside: avoid;
            break-inside: avoid;
            border: 2px solid #172545;
            border-radius: 6px;
            overflow: hidden;
            box-shadow: 0 6px 32px rgba(15,23,42,0.13);
          }

          /* ── Inner content wrapper (adds padding inside the border) */
          .inner {
            padding: 24px 26px 26px;
          }

          /* Top Brand Banner & Form Title */
          .form-title {
            font-size: 13px;
            font-weight: 800;
            color: #ffffff;
            margin: 0 0 0 0;
            text-transform: uppercase;
            letter-spacing: 3px;
            background-color: #172545;
            padding: 13px 26px;
            border-bottom: 3px solid #0284c7;
          }

          /* Top Header Box (Engineer & Company Details) */
          .header-box {
            display: table;
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            page-break-inside: avoid;
            border-bottom: 1.5px solid #dde3ed;
          }

          .header-left {
            display: table-cell;
            width: 54%;
            border-right: 1.5px solid #dde3ed;
            padding: 16px 18px;
            vertical-align: top;
            background-color: #f8fafc;
          }

          .header-right {
            display: table-cell;
            width: 46%;
            padding: 16px 18px;
            vertical-align: top;
            background-color: #ffffff;
          }

          .store-heading {
            font-weight: 800;
            color: #172545;
            margin-bottom: 12px;
            font-size: 10.5px;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            border-bottom: 2px solid #0284c7;
            padding-bottom: 5px;
            display: inline-block;
          }

          .store-field {
            margin-bottom: 9px;
            font-size: 11.5px;
            color: #334155;
            line-height: 1.65;
          }

          .store-field strong {
            font-weight: 700;
            color: #172545;
            margin-right: 2px;
          }

          .company-logo {
            max-height: 46px;
            max-width: 175px;
            object-fit: contain;
            display: block;
            margin-bottom: 8px;
          }

          .company-logo-fallback {
            font-size: 20px;
            font-weight: 800;
            color: #0284c7;
            letter-spacing: 2px;
            margin-bottom: 4px;
            font-family: 'Inter', sans-serif;
            text-transform: uppercase;
          }

          .company-name {
            font-size: 11px;
            font-weight: 800;
            color: #172545;
            margin-bottom: 5px;
            letter-spacing: 0.5px;
            text-transform: uppercase;
          }

          .company-address {
            font-size: 9.5px;
            line-height: 1.55;
            color: #64748b;
          }

          /* Customer & Product Field Rows */
          .customer-details {
            margin-bottom: 20px;
            background-color: #f8fafc;
            page-break-inside: avoid;
            border: 1.5px solid #dde3ed;
            border-left: 4px solid #0284c7;
            border-radius: 0 4px 4px 0;
            padding: 14px 16px 10px;
          }

          .customer-details-title {
            font-size: 10px;
            font-weight: 800;
            color: #0284c7;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            margin-bottom: 12px;
          }

          .field-row {
            display: flex;
            align-items: flex-end;
            margin-bottom: 10px;
            font-size: 11.5px;
          }

          .field-label {
            font-weight: 700;
            color: #334155;
            white-space: nowrap;
            padding-right: 8px;
            letter-spacing: 0.2px;
            min-width: fit-content;
          }

          .field-value {
            flex: 1;
            border-bottom: 1.5px solid #94a3b8;
            padding-left: 6px;
            padding-bottom: 2px;
            min-height: 18px;
            word-break: break-word;
            color: #172545;
            font-weight: 600;
          }

          /* Items Table */
          .rma-table {
            width: 100%;
            border-collapse: collapse;
            border: 2px solid #172545;
            margin-bottom: 20px;
            page-break-inside: avoid;
            border-radius: 4px;
            overflow: hidden;
          }

          .rma-table th {
            border-right: 1px solid rgba(255,255,255,0.15);
            border-bottom: none;
            padding: 10px 12px;
            font-size: 10px;
            font-weight: 800;
            text-align: left;
            background-color: #172545;
            color: #e2e8f0;
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          .rma-table th:last-child {
            border-right: none;
          }

          .rma-table td {
            border: 1px solid #e2e8f0;
            padding: 8px 12px;
            font-size: 11.5px;
            vertical-align: middle;
            color: #1e293b;
            line-height: 1.5;
          }

          .rma-table tbody tr:nth-child(even) {
            background-color: #f0f6ff;
          }

          .rma-table tbody tr:nth-child(odd) {
            background-color: #ffffff;
          }

          .table-row {
            height: 33px;
          }

          .col-sno {
            width: 7%;
            text-align: center;
            font-weight: 700;
            color: #64748b;
            background-color: #f8fafc !important;
            border-right: 1.5px solid #dde3ed !important;
          }

          .col-model {
            width: 30%;
            font-weight: 600;
            color: #172545;
          }

          .col-serial {
            width: 27%;
            font-weight: 600;
            color: #172545;
          }

          .col-reason {
            width: 36%;
            color: #475569;
            font-style: italic;
          }

          /* Bottom Section (Store & Comments) */
          .bottom-section {
            display: table;
            width: 100%;
            page-break-inside: avoid;
          }

          .tech-box {
            display: table-cell;
            width: 42%;
            vertical-align: top;
            padding-right: 14px;
          }

          .tech-inner {
            border: 1.5px solid #dde3ed;
            border-top: 3px solid #172545;
            border-radius: 0 0 4px 4px;
            padding: 12px 14px 14px;
            background: #f8fafc;
            height: 100%;
            box-sizing: border-box;
          }

          .comments-box {
            display: table-cell;
            width: 58%;
            border: 1.5px solid #dde3ed;
            border-top: 3px solid #0284c7;
            padding: 14px 16px;
            min-height: 130px;
            height: 130px;
            vertical-align: top;
            background-color: #ffffff;
            box-sizing: border-box;
            border-radius: 0 0 4px 4px;
          }

          .tech-heading {
            font-weight: 800;
            font-size: 10px;
            color: #172545;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            padding-bottom: 0;
          }

          .comments-heading {
            font-weight: 800;
            font-size: 10px;
            color: #0284c7;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1.2px;
          }

          .comments-content {
            font-size: 11px;
            white-space: pre-wrap;
            line-height: 1.65;
            color: #334155;
          }

          .signature-img {
            max-height: 34px;
            max-width: 155px;
            vertical-align: bottom;
            object-fit: contain;
          }

          @media print {
            @page {
              size: A4 portrait;
              margin: 6mm;
            }
            body {
              padding: 0;
              background-color: #ffffff;
            }
            .container {
              width: 100%;
              max-width: none;
              margin: 0;
              box-shadow: none;
              border-radius: 0;
            }
            .inner {
              padding: 18px 20px 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Main Form Title -->
          <div class="form-title">&#x2007; RMA &nbsp;&mdash;&nbsp; FORM</div>

          <div class="inner">

          <!-- Header Box -->
          <div class="header-box">
            <div class="header-left">
              <div class="store-heading" style="margin-bottom:10px;">Engineer Details</div>
              <div class="store-field"><strong>Complaint No:</strong>&nbsp;${storeJobNumber}</div>
              <div class="field-row" style="margin-bottom: 10px;">
                <span class="field-label">Name of Employee:</span>
                <span class="field-value">${techEmployeeName}</span>
              </div>
              <div class="field-row" style="margin-bottom: 10px;">
                <span class="field-label">Date:</span>
                <span class="field-value">${techDate}</span>
              </div>
              <div class="field-row">
                <span class="field-label">Signature:</span>
                <span class="field-value">
                  ${processedEngineerSignature
      ? `<img src="${processedEngineerSignature}" alt="Engineer Signature" class="signature-img" />`
      : ""
    }
                </span>
              </div>
            </div>
            <div class="header-right">
              ${headerImageDataUri
      ? `<img src="${headerImageDataUri}" alt="Magnum Logo" class="company-logo" />`
      : `<div class="company-logo-fallback">Magnum</div>`
    }
              <div class="company-name">Magnum Telesystem (P) Ltd.</div>
              <div class="company-address">
                Unit No 1401-1402-1403 Emmar The Palm Square,<br/>Golf Course Ext Road, Sector 66, Gurugram, Haryana&nbsp;&#8212;&nbsp;122102
              </div>
            </div>
          </div>

          <!-- Customer Details -->
          <div class="customer-details">
            <div class="customer-details-title">Customer Information</div>
            <div class="field-row">
              <span class="field-label">Customer Name:</span>
              <span class="field-value">${fullCustomerName}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Address:</span>
              <span class="field-value">${fullAddress}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Contact Person:</span>
              <span class="field-value">${contactPerson}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Product Type:</span>
              <span class="field-value" style="border-bottom: 1.5px solid #94a3b8;">${productName}</span>
            </div>
            <div class="field-row" style="margin-bottom:0;">
              <span class="field-label">Warranty / AMC Status:</span>
              <span class="field-value" style="border-bottom: 1.5px solid #94a3b8;">${AMC_status}</span>
            </div>
          </div>

          <!-- Items Table -->
          <table class="rma-table">
            <thead>
              <tr>
                <th class="col-sno">S.No.</th>
                <th class="col-model">Model Number</th>
                <th class="col-serial">Serial Number</th>
                <th class="col-reason">Reason for RMA / Fault</th>
              </tr>
            </thead>
            <tbody>
              ${tableRowsHtml}
            </tbody>
          </table>

          <!-- Bottom Section -->
          <div class="bottom-section">
            <div class="tech-box">
              <div class="tech-inner">
                <div class="tech-heading">Store &mdash; To Be Filled</div>
                <div class="store-field"><strong>Received by:</strong>&nbsp;${storeReceivedBy}</div>
                <div class="store-field"><strong>Date:</strong>&nbsp;${storeDate}</div>
              </div>
            </div>

            <div class="comments-box">
              <div class="comments-heading">Remarks &amp; Comments</div>
              <div class="comments-content">${combinedComments}</div>
            </div>
          </div>

          </div><!-- /inner -->
        </div>
      </body>
    </html>
  `;
};

const complaintReportTemplate = {
  rmacomplaintReportTemplate,
};

export default complaintReportTemplate;

import { format } from 'date-fns';

/**
 * Creates a beautifully styled HTML template specifically for complaint reports
 * @param {any} data - The complaint data
 * @returns {string} The HTML template
 */
export const createComplaintReportTemplate = (data: any) => {
  // Format date if it exists
  const formattedDate = data.submittedAt 
    ? format(new Date(data.submittedAt), 'dd MMM yyyy hh:mm a')
    : format(new Date(), 'dd MMM yyyy hh:mm a');

  // Format fault reported date
  const formattedFaultReported = data.S_SERVDT
    ? format(new Date(data.S_SERVDT), 'dd MMM yyyy hh:mm a')
    : 'N/A';

  // Extract client details and form data
  const {
    complaintNo = '',
    clientName = '',
    workStatus = '',
    remark = '',
    assignDate = '',
    systemName = '',
    location = '',
    status = '',
    taskType = '',
    S_SERVDT = '',
    S_assignedengg = '',
    callAttendedDate = '',
    callAttendedTime = '',
    callCompletedDate = '',
    callCompletedTime = '',
    partReplaced = '',
    causeProblem = '',
    diagnosis = '',
    materialTakenOut = '',
    // Customer input fields
    customerComment = '',
    customerSignature = '',
  } = data;

  // Process the signature for embedding in HTML
  const processedSignature = customerSignature || '';
  console.log('Signature data length:', processedSignature.length > 100 ? 
    processedSignature.length + ' chars (valid)' : 
    processedSignature.length + ' chars (may be invalid)');

  // Format the attended and completed dates/times
  const attendedDateTime = callAttendedDate && callAttendedTime 
    ? `${callAttendedDate} ${callAttendedTime}`
    : 'Not specified';

  const completedDateTime = callCompletedDate && callCompletedTime 
    ? `${callCompletedDate} ${callCompletedTime}`
    : 'Not specified';

  // Debug log for assigned engineer
  console.log('Assigned Engineer value:', S_assignedengg);

  function getCurrentISTTime() {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(now.getTime() + istOffset - (now.getTimezoneOffset() * 60000));
    const hours = istTime.getHours();
    const minutes = istTime.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes} ${ampm}`;
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Complaint Report - ${complaintNo}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          
          :root {
            --primary-color: #1a73e8;
            --primary-dark: #0d47a1;
            --secondary-color: #2b88d8;
            --text-primary: #202124;
            --text-secondary: #5f6368;
            --border-color: #dadce0;
            --background-light: #f8f9fa;
            --success-color: #0f9d58;
            --warning-color: #f4b400;
            --error-color: #d93025;
            --info-color: #1a73e8;
            --section-bg: #ffffff;
            --header-gradient: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
          }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            color: var(--text-primary);
            margin: 0;
            padding: 0;
            background-color: var(--background-light);
            line-height: 1.6;
          }
          
          .container {
            max-width: 800px;
            margin: 10px auto;
            background-color: var(--section-bg);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            border-radius: 12px;
            overflow: hidden;
          }
          
          .header {
            background: var(--header-gradient);
            color: white;
            padding: 16px 32px;
            text-align: center;
            position: relative;
            margin: 0;
          }
          
          .company-name {
            font-size: 28px;
            font-weight: 700;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 1.5px;
          }
          
          .document-title {
            font-size: 18px;
            margin-top: 8px;
            font-weight: 400;
            opacity: 0.9;
          }
          
          .complaint-number {
            background-color: var(--section-bg);
            padding: 12px 32px;
            text-align: center;
            font-size: 16px;
            font-weight: 600;
            color: var(--primary-color);
            border-bottom: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
          }
          
          .section {
            padding: 16px 32px;
            border-bottom: 1px solid var(--border-color);
            background-color: var(--section-bg);
          }
          
          .section-title {
            font-size: 16px;
            font-weight: 600;
            color: var(--primary-color);
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: flex;
            align-items: center;
            padding-bottom: 6px;
            border-bottom: 2px solid var(--primary-color);
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 12px;
            padding: 0;
          }
          
          .info-item {
            margin-bottom: 12px;
            display: flex;
            flex-direction: column;
          }
          
          .info-label {
            font-weight: 500;
            color: var(--text-secondary);
            font-size: 13px;
            margin-bottom: 3px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .info-value {
            font-weight: 400;
            font-size: 14px;
            color: var(--text-primary);
            padding: 8px 12px;
            background-color: var(--background-light);
            border-radius: 6px;
            border-left: 3px solid var(--primary-color);
            margin-left: 0;
          }
          
          .remark-section {
            background-color: var(--background-light);
            padding: 12px 24px;
            border-radius: 8px;
            margin: 12px 0 0 0;
            border: 1px solid var(--border-color);
          }
          
          .remark-text {
            font-style: italic;
            color: var(--text-secondary);
            line-height: 1.6;
            padding: 12px;
            background-color: var(--section-bg);
            border-radius: 6px;
            border-left: 3px solid var(--info-color);
          }
          
          .signatures {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            padding: 16px 32px;
            background-color: var(--background-light);
            margin: 0;
          }
          
          .signature-box {
            background-color: var(--section-bg);
            padding: 12px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          
          .signature-label {
            font-size: 14px;
            color: var(--text-secondary);
            margin-bottom: 8px;
            font-weight: 500;
          }
          
          .signature-image {
            max-width: 100%;
            max-height: 120px;
            border-bottom: 1px solid var(--border-color);
            margin: 12px auto;
            display: block;
          }
          
          .status-tag {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .status-completed {
            background-color: #e6f4ea;
            color: var(--success-color);
            border: 1px solid #c6e0c6;
          }
          
          .status-pending {
            background-color: #fff4ce;
            color: var(--warning-color);
            border: 1px solid #ffe7a3;
          }
          
          .footer {
            background-color: var(--background-light);
            padding: 12px 32px;
            text-align: center;
            font-size: 12px;
            color: var(--text-secondary);
            border-top: 1px solid var(--border-color);
            margin: 0;
          }
          
          .customer-comment {
            margin-top: 16px;
            padding: 12px;
            background-color: var(--section-bg);
            border-radius: 8px;
            border-left: 3px solid var(--warning-color);
          }
          
          .comment-heading {
            font-weight: 600;
            color: var(--warning-color);
            margin-bottom: 12px;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          @media print {
            body {
              background-color: white;
              margin: 0;
              padding: 0;
            }
            
            .container {
              box-shadow: none;
              margin: 0;
              max-width: none;
            }
            
            .section {
              break-inside: avoid;
              page-break-inside: avoid;
              padding: 12px 32px;
            }
            
            .header,
            .complaint-number,
            .section,
            .signatures,
            .footer {
              margin: 0;
              padding: 12px 32px;
            }
            
            .info-grid {
              gap: 8px;
            }
            
            .signature-box {
              box-shadow: none;
              border: 1px solid var(--border-color);
              padding: 8px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="company-name">Magnum CRM</h1>
            <div class="document-title">Complaint Report</div>
          </div>
          
          <div class="complaint-number">
            Complaint No: ${complaintNo}
          </div>
          
          <div class="section">
            <div class="section-title">Client Information</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Client Name</div>
                <div class="info-value">${clientName}</div>
              </div>
              <div class="info-item">
                <div class="info-label">System Name</div>
                <div class="info-value">${systemName || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Address</div>
                <div class="info-value">${location || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Task Type</div>
                <div class="info-value">${taskType || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Assigned Date</div>
                <div class="info-value">${assignDate || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Assigned Engineer</div>
                <div class="info-value">${S_assignedengg || 'N/A'}</div>
              </div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Complaint Details</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Fault Reported</div>
                <div class="info-value">${S_SERVDT || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Call Attended On</div>
                <div class="info-value">${attendedDateTime}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Call Completed On</div>
                <div class="info-value">${completedDateTime}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Technical Details</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Part Replaced/Stand by</div>
                <div class="info-value">${partReplaced || 'None'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Cause of Problem</div>
                <div class="info-value">${causeProblem || 'Not specified'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Diagnosis</div>
                <div class="info-value">${diagnosis || 'Not specified'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Material Taken Out</div>
                <div class="info-value">${materialTakenOut || 'None'}</div>
              </div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Status Information</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Current Status</div>
                <div class="info-value">
                  <span class="status-tag ${
                    workStatus?.toLowerCase().includes('complete') ? 'status-completed' : 
                    workStatus?.toLowerCase().includes('stand by') ? 'status-standby' :
                    workStatus?.toLowerCase().includes('observation') ? 'status-observation' : 
                    'status-pending'
                  }">
                    ${workStatus || 'Pending'}
                    ${workStatus?.toLowerCase().includes('complete') ? ' - Over' : ''}
                    ${(!workStatus || workStatus?.toLowerCase().includes('pending')) ? ` - ${data.pendingReason || 'Pending'}` : ''}
                  </span>
                </div>
              </div>
              <div class="info-item">
                <div class="info-label">Submission Date</div>
                <div class="info-value">${formattedDate} (IST: ${getCurrentISTTime()})</div>
              </div>
            </div>
            
            <div class="remark-section">
              <div class="section-title">Engineer's Remarks</div>
              <div class="remark-text">${remark || 'No remarks provided.'}</div>
            </div>

            ${customerComment ? `
            <div class="remark-section" style="margin-top: 20px;">
              <div class="section-title">Customer's Comment</div>
              <div class="customer-comment">
                <div class="comment-heading">Customer Feedback:</div>
                <div>${customerComment}</div>
              </div>
            </div>
            ` : ''}
          </div>
          
          <div class="signatures">
            <div class="signature-box">
              <div class="signature-label">Engineer's Signature</div>
              <div class="signature-placeholder">null</div>
            </div>
            <div class="signature-box">
              <div class="signature-label">Client's Signature</div>
              ${processedSignature ? 
                `<div style="text-align: center;">
                   <img src="${processedSignature}" 
                        alt="Client's signature" 
                        class="signature-image" />
                 </div>` : 
                `<div class="signature-placeholder">Client's signature</div>`
              }
            </div>
          </div>
          
          <div class="footer">
            <p>This document was automatically generated by Magnum CRM on ${formattedDate} (IST: ${getCurrentISTTime()})</p>
            <p>© ${new Date().getFullYear()} Magnum Systems - All Rights Reserved</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

const complaintReportTemplate = {
  createComplaintReportTemplate
};

export default complaintReportTemplate; 
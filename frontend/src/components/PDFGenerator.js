// Utility function for PDF generation
export const downloadReportPDF = (report) => {
  try {
    // Create PDF content
    const pdfContent = `
      <html>
        <head>
          <title>Report: ${report.code}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .label { font-weight: bold; color: #555; }
            .value { margin-bottom: 10px; }
            .footer { margin-top: 50px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>E-Redressal System Report</h1>
            <h2>${report.code}</h2>
          </div>
          
          <div class="section">
            <div class="label">Report Details:</div>
            <div class="value"><strong>Title:</strong> ${report.title}</div>
            <div class="value"><strong>Description:</strong> ${report.description}</div>
            <div class="value"><strong>Department:</strong> ${report.department}</div>
            <div class="value"><strong>Status:</strong> ${report.status}</div>
            <div class="value"><strong>Location:</strong> ${report.location || 'N/A'}</div>
            <div class="value"><strong>Date Created:</strong> ${new Date(report.date_created).toLocaleDateString()}</div>
          </div>

          <div class="section">
            <div class="label">User Information:</div>
            <div class="value"><strong>Name:</strong> ${report.user?.name || 'Unknown'}</div>
            <div class="value"><strong>Email:</strong> ${report.user?.email || 'N/A'}</div>
          </div>

          ${report.image_url ? `
          <div class="section">
            <div class="label">Attached Image:</div>
            <div class="value">
              <img src="${report.image_url}" style="max-width: 300px; border: 1px solid #ddd; padding: 5px;" />
            </div>
          </div>
          ` : ''}

          <div class="footer">
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            <p>E-Redressal System - Admin Dashboard</p>
          </div>
        </body>
      </html>
    `;

    // Open print dialog for PDF
    const printWindow = window.open('', '_blank');
    printWindow.document.write(pdfContent);
    printWindow.document.close();
    
    // Wait for images to load
    printWindow.onload = function() {
      printWindow.print();
    };

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF report');
  }
};
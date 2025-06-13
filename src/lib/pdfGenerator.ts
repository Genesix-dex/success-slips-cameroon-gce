import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// Helper function to validate base64 strings
const isBase64 = (str: string): boolean => {
  try {
    return btoa(atob(str)) === str;
  } catch (err) {
    return false;
  }
};

// Helper function to create a fallback image
const createFallbackImage = (): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, 100, 100);
    ctx.fillStyle = '#999';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Image not available', 50, 55);
  }
  return canvas.toDataURL();
};

declare module 'jspdf' {
  interface jsPDF {
    setGState: (gState: any) => jsPDF;
  }
}

interface DocumentInfo {
  type: string;
  url?: string;
  file?: File;
}

export const generateRegistrationPDF = async (
  registrationData: any,
  paymentData: any,
  documents: DocumentInfo[],
  paymentScreenshotUrl?: string
): Promise<{ pdfUrl: string; pdfBlob: Blob }> => {
  console.log('Starting PDF generation with data:', {
    registrationData: !!registrationData,
    paymentData: !!paymentData,
    documentCount: documents?.length || 0,
    hasScreenshot: !!paymentScreenshotUrl
  });
  // Create a temporary div to hold our content
  const element = document.createElement('div');
  element.style.width = '210mm';
  element.style.minHeight = '297mm';
  element.style.padding = '10px';
  element.style.fontFamily = 'Poppins';
  element.style.color = '#333';
  element.style.backgroundColor = '#fff';
  element.style.boxSizing = 'border-box';

  // Watermark configuration
  const watermark = {
    text: '',
    color: 'rgba(0, 0, 0, 0.05)',
    size: 80,
    rotation: -30
  };

  // Format the content
  element.innerHTML = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
      
      body {
        font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        margin: 0;
        padding: 0;
        color: #1a5d34; /* Darker green for better contrast */
        line-height: 1.6;
        background-color: #f8fafc;
      }
      
      .receipt-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 30px;
        background: #ffffff;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        border-radius: 12px;
      }
      
      .header {
        text-align: center;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 2px solid #e2e8f0;
        position: relative;
      }
      
      .header::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 50%;
        transform: translateX(-50%);
        width: 100px;
        height: 3px;
        background: linear-gradient(90deg, #1a5d34, #2e62a8);
        border-radius: 3px;
      }
      
      .header h1 {
        color: #1a5d34;
        margin: 0 0 8px 0;
        font-size: 28px;
        font-weight: 700;
        letter-spacing: -0.5px;
      }
      
      .header p {
        color: #4a5568;
        margin: 0;
        font-size: 15px;
        font-weight: 500;
        opacity: 0.9;
      }
      
      .section {
        margin-bottom: 28px;
        padding: 20px;
        background: #ffffff;
        border-radius: 10px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      
      .section:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.05);
      }
      
      .section-title {
        color: #2e62a8;
        border-bottom: 2px solid #e2e8f0;
        padding-bottom: 10px;
        margin: 0 0 18px 0;
        font-size: 18px;
        font-weight: 700;
        letter-spacing: -0.3px;
        position: relative;
      }
      
      .section-title::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 60px;
        height: 3px;
        background: #2e62a8;
        border-radius: 3px;
      }
      
      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 16px;
      }
      
      .info-item {
        margin-bottom: 12px;
        padding: 8px 0;
        border-bottom: 1px dashed #e2e8f0;
      }
      
      .info-item:last-child {
        border-bottom: none;
      }
      
      .info-label {
        font-weight: 700;
        color: #4a5568;
        display: block;
        margin-bottom: 4px;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #4a5568;
      }
      
      .info-value {
        color: #1a202c;
        font-weight: 500;
        font-size: 15px;
      }
      
      table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        margin: 20px 0;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
      }
      
      th, td {
        padding: 14px 16px;
        text-align: left;
        border-bottom: 1px solid #e2e8f0;
      }
      
      th {
        background-color: #f8fafc;
        font-weight: 700;
        color: #4a5568;
        text-transform: uppercase;
        font-size: 13px;
        letter-spacing: 0.5px;
      }
      
      tr:last-child td {
        border-bottom: none;
      }
      
      tr:hover td {
        background-color: #f8fafc;
      }
      
      .status {
        text-align: center;
        padding: 18px;
        margin: 30px 0;
        background: linear-gradient(135deg, #f0fff4, #e6fffa);
        border: 1px solid #c6f6d5;
        border-radius: 10px;
        color: #2f855a;
        font-weight: 700;
        font-size: 18px;
        position: relative;
        overflow: hidden;
      }
      
      .status::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 6px;
        height: 100%;
        background: linear-gradient(to bottom, #48bb78, #38a169);
      }
      
      .footer {
        text-align: center;
        margin-top: 40px;
        padding: 20px 0 0;
        border-top: 2px dashed #e2e8f0;
        color: #718096;
        font-size: 14px;
        font-weight: 500;
      }
      
      .footer p {
        margin: 8px 0;
      }
      
      .highlight {
        color: #2e62a8;
        font-weight: 600;
      }
    </style>
    
    <div class="receipt-container">
      <div class="header">
        <h1>SUCCESS GUARANTEED</h1>
        <p>PAYMENT RECEIPT & APPLICATION SUMMARY</p>
      </div>

      <div class="section">
        <h2 class="section-title">Personal Information</h2>
        <div class="info-grid">
          <div class="info-item"><span class="info-label">Full Name:</span> ${registrationData.personalInfo.fullName}</div>
          <div class="info-item"><span class="info-label">CIN:</span> ${registrationData.personalInfo.cin}</div>
          <div class="info-item"><span class="info-label">Center:</span> ${registrationData.personalInfo.centerNumber} - ${registrationData.personalInfo.centerName}</div>
          <div class="info-item"><span class="info-label">Date of Birth:</span> ${registrationData.personalInfo.dateOfBirth}</div>
          <div class="info-item"><span class="info-label">Gender:</span> ${registrationData.personalInfo.gender}</div>
          <div class="info-item"><span class="info-label">Location:</span> ${registrationData.personalInfo.location}</div>
          <div class="info-item"><span class="info-label">Department:</span> ${registrationData.personalInfo.department}</div>
          <div class="info-item"><span class="info-label">Level:</span> ${registrationData.personalInfo.level || 'CGCE Advanced Level'}</div>
        </div>
      </div>

    <div class="section">
      <h2 class="section-title">Selected Subjects & Grades</h2>
      <table>
        <thead>
          <tr>
            <th>Subject</th>
            <th>Grade</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(registrationData.subjectsAndGrades)
            .map(([subject, data]: [string, any]) => `
              <tr>
                <td>${subject}</td>
                <td>${data.grade}</td>
                <td>${data.price.toLocaleString()} FCFA</td>
              </tr>
            `)
            .join('')}
        </tbody>
      </table>
    </div>

    ${registrationData.selectedServices && registrationData.selectedServices.length > 0 ? `
      <div class="section">
        <h2 class="section-title">Selected Services</h2>
        <ul style="margin: 0; padding-left: 20px;">
          ${registrationData.selectedServices.map((service: string) => `<li>${service}</li>`).join('')}
        </ul>
      </div>
    ` : ''}

    <div class="section">
      <h2 class="section-title">Payment Information</h2>
      <div class="info-grid">
        <div class="info-item"><span class="info-label">Payment Method:</span> ${paymentData.paymentMethod}</div>
        <div class="info-item"><span class="info-label">Payer Name:</span> ${paymentData.payerName}</div>
        <div class="info-item"><span class="info-label">Phone Number:</span> ${paymentData.phoneNumber}</div>
        ${paymentData.transactionId ? `
          <div class="info-item"><span class="info-label">Transaction ID:</span> ${paymentData.transactionId}</div>
        ` : ''}
      </div>
    </div>

    <div class="status">
      ${paymentScreenshotUrl ? 'PAYMENT SUCCESSFUL' : 'PAYMENT PENDING'}
    </div>

    <div class="footer">
      <p>WhatsApp: 676078168 | Contact Mr. Akon Benedict</p>
      <p>Generated on ${new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }).replace(',', '')}</p>
    </div>
    </div> <!-- Close receipt-container -->

    ${documents && documents.length > 0 ? `
      <div class="section">
        <h2 class="section-title">Submitted Documents</h2>
        <div style="margin-top: 15px; display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;">
          ${documents
            .filter(doc => doc && (doc.url || doc.file))
            .map(
              (doc: DocumentInfo) => `
                <div style="background: #f8f9fa; padding: 10px; border-radius: 6px; border-left: 3px solid #4299e1;">
                  <div style="font-weight: 600; color: #2d3748; margin-bottom: 4px;">${doc.type?.replace(/_/g, ' ').toUpperCase() || 'Document'}</div>
                  <div style="font-size: 12px; color: #718096;">Submitted</div>
                </div>
              `
            )
            .join('')}
        </div>
      </div>
    ` : ''}

    ${paymentScreenshotUrl ? `
      <div class="section">
        <h2 class="section-title">Payment Proof</h2>
        <div style="margin-top: 15px; text-align: center;">
          <p>Payment confirmation screenshot is attached for your reference.</p>
        </div>
      </div>
    ` : ''}
  `;

  // Append to body temporarily
  document.body.appendChild(element);
  
  try {
    console.log('Converting HTML to image...');
    
    // Use html2canvas to capture the element
    const canvas = await html2canvas(element, {

      useCORS: true, // If you have external images
      logging: true, // Enable logging for debugging
      allowTaint: true, // Allow tainted canvas
      background: '#ffffff', // White background
      
    });
    
    // Load logo for watermark
    const loadImageAsBase64 = async (url: string): Promise<string> => {
      const response = await fetch(url);
      const blob = await response.blob();
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    };

    let logoDataUrl: string | null = null;
    try {
      logoDataUrl = await loadImageAsBase64('/logo.png'); // Adjust path if necessary
    } catch (err) {
      console.warn('Failed to load watermark logo:', err);
    }
    
    console.log('Creating PDF...');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    
    // Calculate dimensions to maintain aspect ratio
    const imgWidth = pdf.internal.pageSize.getWidth() - 20; // 10mm margin on each side
    const pageHeight = pdf.internal.pageSize.getHeight() - 20; // usable height considering top/bottom margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Helper function to draw watermark on the current page
    const addWatermark = () => {
      if (!logoDataUrl) return; // Skip if logo failed to load

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const wmWidth = 40; // watermark width in mm
      const wmHeight = 40; // watermark height in mm
      const stepX = 100; // horizontal spacing between watermarks
      const stepY = 120; // vertical spacing between watermarks

      for (let x = -wmWidth; x < pageWidth + stepX; x += stepX) {
        for (let y = -wmHeight; y < pageHeight + stepY; y += stepY) {
          pdf.addImage(logoDataUrl, 'PNG', x, y, wmWidth, wmHeight, undefined, 'FAST');
        }
      }
    };

    // Add the image (with pagination)
    let heightLeft = imgHeight;
    let position = 10;

    // First page
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight, undefined, 'FAST');
    addWatermark();
    heightLeft -= pageHeight;

    // Additional pages if necessary
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 10;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight, undefined, 'FAST');
      addWatermark();
      heightLeft -= pageHeight;
    }
    
    // Generate blob URL for download
    console.log('Generating PDF blob...');
    const pdfBlob = pdf.output('blob');
    console.log('PDF blob created, size:', pdfBlob.size, 'bytes');
    
    const pdfUrl = URL.createObjectURL(pdfBlob);
    console.log('Blob URL created');
    
      // Clean up
    if (document.body.contains(element)) {
      document.body.removeChild(element);
      console.log('Temporary element removed from DOM');
    }
    
    // Revoke any object URLs we created
    if (Array.isArray(documents)) {
      documents.forEach(doc => {
        if (doc && doc.url && doc.url.startsWith('blob:')) {
          URL.revokeObjectURL(doc.url);
        }
      });
    }
    
    return { pdfUrl, pdfBlob };
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// Helper function to trigger download
export const downloadPDF = (pdfUrl: string, filename: string) => {
  try {
    console.log('Starting PDF download...');
    console.log('URL:', pdfUrl);
    console.log('Filename:', filename);
    
    if (!pdfUrl) {
      throw new Error('No PDF URL provided');
    }
    
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = filename || 'registration-details.pdf';
    link.style.display = 'none';
    
    // Add link to document
    document.body.appendChild(link);
    console.log('Link element created and appended');
    
    // Trigger download
    link.click();
    console.log('Download triggered');
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      console.log('Link element removed');
      
      // Revoke the object URL to free up memory
      URL.revokeObjectURL(pdfUrl);
      console.log('Object URL revoked');
    }, 100);
    
  } catch (error) {
    console.error('Error in downloadPDF:', error);
    throw error;
  }
};
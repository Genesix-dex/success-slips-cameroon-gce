import { generateRegistrationPDF } from '../src/lib/pdfGenerator';

// Mock data for testing
const registrationData = {
  name: 'John Doe',
  registrationNumber: 'REG12345',
  date: new Date().toISOString(),
  subjectsAndGrades: {
    'Mathematics': { grade: 'A', price: 5000 },
    'Physics': { grade: 'B+', price: 5000 },
    'Chemistry': { grade: 'A-', price: 5000 },
  }
};

const paymentData = {
  amount: 15000,
  paymentMethod: 'Mobile Money',
  transactionId: 'TXN12345',
  payerName: 'John Doe',
  phoneNumber: '237612345678'
};

const documents = [
  { type: 'Birth Certificate', url: '/sample-doc.jpg' },
  { type: 'ID Card', url: '/sample-id.jpg' }
];

async function testPdfGeneration() {
  console.log('Starting PDF generation test...');
  
  try {
    const startTime = Date.now();
    
    // Generate the PDF
    const { pdfUrl, pdfBlob } = await generateRegistrationPDF(
      registrationData,
      paymentData,
      documents
    );
    
    const endTime = Date.now();
    const fileSize = (pdfBlob.size / (1024 * 1024)).toFixed(2); // Size in MB
    
    console.log('PDF Generation Complete!');
    console.log(`- Time taken: ${(endTime - startTime) / 1000} seconds`);
    console.log(`- File size: ${fileSize} MB`);
    console.log(`- PDF URL: ${pdfUrl}`);
    
    // Open the PDF in a new tab
    window.open(pdfUrl, '_blank');
    
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
}

// Run the test
testPdfGeneration();

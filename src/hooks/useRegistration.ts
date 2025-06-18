
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { generateRegistrationPDF, downloadPDF } from '@/lib/pdfGenerator';

export interface RegistrationData {
  examLevel: string;
  personalInfo: {
    fullName: string;
    cin: string;
    centerNumber: string;
    centerName: string;
    dateOfBirth: string;
    gender: string;
    location: string;
    department: string;
  };
  subjectsAndGrades: {
    [subject: string]: {
      grade: string;
      price: number;
    };
  };
  documents: {
    timetable: File | null;
    nationalId: File | null;
    birthCertificate: File | null;
  };
  services: {
    gradeModification: boolean;
    followUp: boolean;
    certificateManufacture: boolean;
  };
}

export const useRegistration = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const uploadDocument = async (file: File, registrationId: string, documentType: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${registrationId}/${documentType}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(fileName, file);

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);

    return {
      file_name: file.name,
      file_url: publicUrl,
      file_size: file.size,
      file_type: file.type
    };
  };

  const submitRegistration = async (registrationData: RegistrationData) => {
    setIsLoading(true);
    
    try {
      // Calculate total cost
      const totalCost = Object.values(registrationData.subjectsAndGrades)
        .reduce((total, subject) => total + subject.price, 0);

      // Insert registration record
      const { data: registration, error: registrationError } = await supabase
        .from('registrations')
        .insert({
          full_name: registrationData.personalInfo.fullName,
          cin: registrationData.personalInfo.cin,
          center_number: registrationData.personalInfo.centerNumber,
          center_name: registrationData.personalInfo.centerName,
          date_of_birth: registrationData.personalInfo.dateOfBirth,
          gender: registrationData.personalInfo.gender,
          location: registrationData.personalInfo.location,
          exam_level: registrationData.examLevel,
          department: registrationData.personalInfo.department,
          subjects_and_grades: registrationData.subjectsAndGrades,
          services: registrationData.services,
          total_cost: totalCost
        })
        .select()
        .single();

      if (registrationError) {
        throw registrationError;
      }

      // Upload documents in parallel if they exist
      const documentPromises = [];
      
      if (registrationData.documents.timetable) {
        documentPromises.push(
          uploadDocument(registrationData.documents.timetable, registration.id, 'timetable')
            .then(docData => ({ ...docData, document_type: 'timetable' }))
        );
      }
      
      if (registrationData.documents.nationalId) {
        documentPromises.push(
          uploadDocument(registrationData.documents.nationalId, registration.id, 'national_id')
            .then(docData => ({ ...docData, document_type: 'national_id' }))
        );
      }
      
      if (registrationData.documents.birthCertificate) {
        documentPromises.push(
          uploadDocument(registrationData.documents.birthCertificate, registration.id, 'birth_certificate')
            .then(docData => ({ ...docData, document_type: 'birth_certificate' }))
        );
      }

      if (documentPromises.length > 0) {
        const documentUploads = await Promise.all(documentPromises);

        // Insert document records
        const { error: documentsError } = await supabase
          .from('documents')
          .insert(documentUploads.map(upload => ({
            registration_id: registration.id,
            document_type: upload.document_type,
            file_name: upload.file_name,
            file_url: upload.file_url,
            file_size: upload.file_size,
            file_type: upload.file_type
          })));

        if (documentsError) {
          throw documentsError;
        }
      }

      toast({
        title: "Registration Successful!",
        description: "Your registration has been submitted successfully.",
      });

      return registration;

    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "An error occurred during registration.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const submitPayment = async (registrationId: string, paymentData: {
    payerName: string;
    phoneNumber: string;
    paymentMethod: string;
    amount: number;
    transactionId?: string;
    paymentScreenshot?: File;
  }) => {
    setIsLoading(true);
    
    try {
      let paymentScreenshotUrl = null;

      // Upload payment screenshot if provided
      if (paymentData.paymentScreenshot) {
        const fileExt = paymentData.paymentScreenshot.name.split('.').pop();
        const fileName = `${registrationId}/payment_screenshot.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('documents')
          .upload(fileName, paymentData.paymentScreenshot);

        if (error) {
          throw error;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(fileName);

        paymentScreenshotUrl = publicUrl;
      }

      // Insert payment record
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          registration_id: registrationId,
          payer_name: paymentData.payerName,
          phone_number: paymentData.phoneNumber,
          payment_method: paymentData.paymentMethod,
          amount: paymentData.amount,
          transaction_id: paymentData.transactionId || null,
          payment_screenshot_url: paymentScreenshotUrl
        })
        .select()
        .single();

      if (paymentError) {
        throw paymentError;
      }

      console.log('Fetching registration data for PDF...');
      // Get registration data for PDF
      const { data: registrationData, error: regError } = await supabase
        .from('registrations')
        .select('*')
        .eq('id', registrationId)
        .single();

      if (regError) {
        console.error('Error fetching registration data:', regError);
        throw regError;
      }

      if (registrationData) {
        console.log('Registration data found, fetching documents...');
        // Get uploaded documents
        const { data: documents, error: docsError } = await supabase
          .from('documents')
          .select('document_type, file_url')
          .eq('registration_id', registrationId);

        if (docsError) {
          console.error('Error fetching documents:', docsError);
          throw docsError;
        }
        console.log('Documents found:', documents);

        try {
          console.log('Starting PDF generation...');
          // Generate and download PDF
          const { pdfUrl } = await generateRegistrationPDF(
            registrationData,
            {
              ...paymentData,
              amount: paymentData.amount
            },
            documents?.map(doc => ({
              type: doc.document_type,
              url: doc.file_url
            })) || [],
            paymentScreenshotUrl
          );

          console.log('PDF generated, attempting download...');
          // Download the PDF
          const fileName = `registration-${registrationData.cin || registrationId}.pdf`;
          console.log('Downloading PDF with filename:', fileName);
          downloadPDF(pdfUrl, fileName);
          console.log('PDF download should be complete');
        } catch (error) {
          console.error('Error generating PDF:', error);
          // Don't fail the whole operation if PDF generation fails
          toast({
            title: "Warning",
            description: "Payment was successful but there was an error generating the receipt.",
            variant: "destructive"
          });
        }
      }

      toast({
        title: "Payment Submitted!",
        description: "Your payment has been submitted for verification. A receipt has been downloaded.",
      });

      return payment;

    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "An error occurred while processing payment.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    submitRegistration,
    submitPayment,
    isLoading
  };
};

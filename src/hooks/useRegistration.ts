
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
      fileName: file.name,
      fileUrl: publicUrl,
      fileSize: file.size,
      fileType: file.type
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

      // Upload documents
      const documentUploads = [];
      
      if (registrationData.documents.timetable) {
        const timetableData = await uploadDocument(
          registrationData.documents.timetable, 
          registration.id, 
          'timetable'
        );
        documentUploads.push({
          registration_id: registration.id,
          document_type: 'timetable',
          ...timetableData
        });
      }

      if (registrationData.documents.nationalId) {
        const nationalIdData = await uploadDocument(
          registrationData.documents.nationalId, 
          registration.id, 
          'national_id'
        );
        documentUploads.push({
          registration_id: registration.id,
          document_type: 'national_id',
          ...nationalIdData
        });
      }

      if (registrationData.documents.birthCertificate) {
        const birthCertData = await uploadDocument(
          registrationData.documents.birthCertificate, 
          registration.id, 
          'birth_certificate'
        );
        documentUploads.push({
          registration_id: registration.id,
          document_type: 'birth_certificate',
          ...birthCertData
        });
      }

      // Insert document records
      if (documentUploads.length > 0) {
        const { error: documentsError } = await supabase
          .from('documents')
          .insert(documentUploads);

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
          transaction_id: paymentData.transactionId,
          payment_screenshot_url: paymentScreenshotUrl
        })
        .select()
        .single();

      if (paymentError) {
        throw paymentError;
      }

      toast({
        title: "Payment Submitted!",
        description: "Your payment has been submitted for verification.",
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

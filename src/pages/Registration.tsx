
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Download, CreditCard, ArrowLeft, ArrowRight, Upload, Eye } from 'lucide-react';
import { generateRegistrationPDF, downloadPDF } from '@/lib/pdfGenerator';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useRegistration, RegistrationData } from '@/hooks/useRegistration';
import { couponService } from '@/services/couponService';
import { personalInfoSchema, paymentDataSchema, PersonalInfoFormData, PaymentFormData } from '@/lib/validationSchemas';
import { ZodError } from 'zod';

// Helper function to convert File to data URL
const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};

// Type definitions
interface DocumentInfo {
  type: string;
  file: File;
  url: string;
}

interface PaymentData {
  payerName: string;
  contactPreference: 'email' | 'phone' | 'both';
  email: string;
  phoneNumber: string;
  paymentMethod: string;
  transactionId: string;
  paymentScreenshot: File | null;
  couponCode: string;
}

// Constants for className patterns
const CARD_CLASS = 'max-w-2xl mx-auto backdrop-blur-md bg-card/90';
const CARD_CONTENT_CLASS = 'space-y-4';
const GRID_CLASS = 'grid md:grid-cols-2 gap-4';
const INPUT_CLASS = 'w-full';
const LOGO_CLASS = 'h-10 w-auto';

const Registration = () => {
  const { department } = useParams<{ department: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { submitRegistration, submitPayment, isLoading } = useRegistration();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    examLevel: '',
    personalInfo: {
      fullName: '',
      cin: '',
      centerNumber: '',
      centerName: '',
      dateOfBirth: '',
      gender: '',
      location: '',
      department: department || ''
    },
    subjectsAndGrades: {},
    documents: {
      timetable: null,
      nationalId: null,
      birthCertificate: null
    },
    services: {
      gradeModification: false,
      followUp: false,
      certificateManufacture: false
    }
  });

  const [paymentData, setPaymentData] = useState<PaymentData>({
    payerName: '',
    contactPreference: 'phone',
    email: '',
    phoneNumber: '',
    paymentMethod: '',
    transactionId: '',
    paymentScreenshot: null,
    couponCode: ''
  });

  const [coupon, setCoupon] = useState<{
    code: string;
    discount: number;
    type: 'percentage' | 'fixed';
    isValid: boolean;
  } | null>(null);

  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const validateCoupon = async (code: string) => {
    if (!code.trim()) return;
    
    try {
      setIsValidatingCoupon(true);
      const response = await couponService.validateCoupon(code);
      
      if (response.isValid && response.coupon) {
        setCoupon({
          code: response.coupon.code,
          discount: response.coupon.discount,
          type: response.coupon.type,
          isValid: true
        });
        
        toast({
          title: 'Coupon Applied',
          description: `Your ${response.coupon.discount}${response.coupon.type === 'percentage' ? '%' : 'XAF'} discount has been applied!`,
          variant: 'default'
        });
      } else {
        setCoupon(null);
        toast({
          title: 'Invalid Coupon',
          description: response.message || 'The coupon code you entered is not valid.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      setCoupon(null);
      toast({
        title: 'Error',
        description: 'Failed to validate coupon. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  // Load exam level from localStorage on component mount
  useEffect(() => {
    const savedExamLevel = localStorage.getItem('selectedExamLevel');
    if (savedExamLevel) {
      setRegistrationData(prev => ({
        ...prev,
        examLevel: savedExamLevel
      }));
    } else {
      // If no exam level is selected, redirect to exam level selection
      navigate('/exam-level');
    }
  }, [navigate]);

  const departmentSubjects = {
    science: [
      'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Additional Mathematics',
      'Human Biology', 'Agricultural Science', 'Geology', 'Geography',
      'Technical Drawing', 'Food and Nutrition', 'Electronics', 'Computer Science',
      'Statistics', 'Environmental Science', 'English Language', 'French'
    ],
    arts: [
      'Literature in English', 'French Literature', 'History', 'Geography',
      'Religious Studies', 'Citizenship Education', 'Physical Education (PE)',
      'Logic (Philosophy)', 'Economics', 'Commerce', 'Accounting',
      'Food and Nutrition', 'Business Mathematics', 'Mathematics',
      'French', 'Government', 'Sociology', 'English Language'
    ],
    commercial: [
      'Business Mathematics', 'Accounting', 'Economics', 'Business Management',
      'Commerce', 'Commerce and Finance', 'Marketing', 'Banking & Finance',
      'Entrepreneurship', 'Business Law', 'Typewriting', 'Mathematics',
      'Computer Science', 'English Language', 'Food Science'
    ],
    technical: [
      'Information & Communication Technology', 'Engineering Science', 'Woodwork',
      'Technical Drawing', 'Metalwork', 'Building Construction', 'Electrical Installation',
      'Auto Mechanics', 'Clothing & Textiles', 'Food & Nutrition', 'Electronics', 'Electricity',
      'Plumbing & Pipe Fitting', 'Mathematics', 'French', 'English Language', 'Chemistry',
      'Physics', 'Biology', 'Computer Science', 'Accounting'
    ]
  };

  const gradesPricing = {
    A: 50000,
    B: 40000,
    C: 30000,
    D: 20000,
    E: 15000,
    F: 10000
  };

  const locations = [
    'Yaoundé', 'Douala', 'Garoua', 'Bamenda', 'Bafoussam', 'Limbe',
    'Bertoua', 'Ngaoundéré', 'Ebolowa', 'Kribi', 'Buea', 'Kumba'
  ];

  const calculateTotalCost = () => {
    const subtotal = Object.values(registrationData.subjectsAndGrades).reduce((total, subject) => total + subject.price, 0);
    
    if (!coupon?.isValid) return subtotal;
    
    if (coupon.type === 'percentage') {
      return subtotal * (1 - coupon.discount / 100);
    } else {
      return Math.max(0, subtotal - coupon.discount);
    }
  };
  
  const getDiscountAmount = () => {
    if (!coupon?.isValid) return 0;
    
    const subtotal = Object.values(registrationData.subjectsAndGrades).reduce((total, subject) => total + subject.price, 0);
    
    if (coupon.type === 'percentage') {
      return subtotal * (coupon.discount / 100);
    } else {
      return Math.min(coupon.discount, subtotal);
    }
  };

  const validatePersonalInfo = () => {
    try {
      personalInfoSchema.parse(registrationData.personalInfo);
      setValidationErrors({});
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            errors[err.path[0] as string] = err.message;
          }
        });
        setValidationErrors(errors);
        
        // Show first error in toast
        const firstError = error.errors[0];
        toast({
          title: "Validation Error",
          description: firstError.message,
          variant: "destructive"
        });
      }
      return false;
    }
  };

  const validatePaymentData = () => {
    try {
      paymentDataSchema.parse(paymentData);
      setValidationErrors({});
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            errors[err.path[0] as string] = err.message;
          }
        });
        setValidationErrors(errors);
        
        // Show first error in toast
        const firstError = error.errors[0];
        toast({
          title: "Validation Error",
          description: firstError.message,
          variant: "destructive"
        });
      }
      return false;
    }
  };

  const handlePersonalInfoSubmit = () => {
    if (!validatePersonalInfo()) {
      return;
    }
    setCurrentStep(2);
  };

  const handleSubjectsSubmit = () => {
    if (Object.keys(registrationData.subjectsAndGrades).length === 0) {
      toast({
        title: "No Subjects Selected",
        description: "Please select at least one subject and grade.",
        variant: "destructive"
      });
      return;
    }
    setCurrentStep(3);
  };

  const handleDocumentsSubmit = () => {
    const { documents } = registrationData;
    if (!documents.timetable || !documents.nationalId || !documents.birthCertificate) {
      toast({
        title: "Missing Documents",
        description: "Please upload all required documents.",
        variant: "destructive"
      });
      return;
    }
    setCurrentStep(4);
  };

  const handleRegistrationSubmit = async () => {
    try {
      const registration = await submitRegistration(registrationData);
      setRegistrationId(registration.id);
      setCurrentStep(5);
    } catch (error) {
      console.error('Registration submission failed:', error);
    }
  };

  const handleApplyCoupon = () => {
    if (!paymentData.couponCode.trim()) {
      toast({
        title: 'Coupon Code Required',
        description: 'Please enter a coupon code.',
        variant: 'destructive'
      });
      return;
    }
    validateCoupon(paymentData.couponCode.trim());
  };

  const handlePaymentSubmit = async () => {
    if (!registrationId) {
      toast({
        title: "Error",
        description: "Registration ID not found. Please try again.",
        variant: "destructive"
      });
      return;
    }

    if (!validatePaymentData()) {
      return;
    }

    try {
      const payment = await submitPayment(registrationId, {
        ...paymentData,
        amount: calculateTotalCost()
      });
      
      // Navigate to success page with payment details
      navigate('/payment/success', {
        state: {
          registrationId,
          paymentId: payment.id,
          amount: calculateTotalCost(),
          paymentMethod: paymentData.paymentMethod,
          transactionId: paymentData.transactionId
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment submission failed';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = (field: keyof typeof registrationData.documents, file: File) => {
    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload only JPEG, PNG, or PDF files.",
        variant: "destructive"
      });
      return;
    }

    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please upload files smaller than 5MB.",
        variant: "destructive"
      });
      return;
    }

    setRegistrationData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [field]: file
      }
    }));
  };

  const handleSubjectGradeChange = (subject: string, grade: string) => {
    setRegistrationData(prev => ({
      ...prev,
      subjectsAndGrades: {
        ...prev.subjectsAndGrades,
        [subject]: {
          grade,
          price: gradesPricing[grade as keyof typeof gradesPricing]
        }
      }
    }));
  };

  const removeSubject = (subject: string) => {
    setRegistrationData(prev => {
      const newSubjects = { ...prev.subjectsAndGrades };
      delete newSubjects[subject];
      return {
        ...prev,
        subjectsAndGrades: newSubjects
      };
    });
  };

  // Function to view document in a new tab
  const viewDocument = (file: File) => {
    if (!file) {
      toast({
        title: "Error",
        description: "No file selected",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const url = URL.createObjectURL(file);
      const newWindow = window.open(url, '_blank');
      
      // Handle cases where popup might be blocked
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Fallback to download if popup is blocked
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name || 'document';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // Clean up the object URL
        setTimeout(() => URL.revokeObjectURL(url), 100);
      } else {
        // Clean up the object URL when the window is closed
        newWindow.onbeforeunload = () => URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error viewing document:', error);
      toast({
        title: "Error",
        description: "Could not open the document",
        variant: "destructive"
      });
    }
  };

  const subjects = departmentSubjects[department as keyof typeof departmentSubjects] || [];
  const examLevelDisplay = registrationData.examLevel === 'CGCE_ORDINARY_LEVEL' ? 'CGCE Ordinary Level' : 'CGCE Advanced Level';

  const getFieldError = (fieldName: string) => validationErrors[fieldName];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : navigate('/departments')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                {examLevelDisplay} - {department} Registration
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">Step {currentStep} of 6</p>
            </div>
            <img 
              src="/lovable-uploads/82c1802c-61d7-4b62-bfdc-cbf11c257601.png" 
              alt="Success Guaranteed" 
              className={LOGO_CLASS} 
            />
          </div>
          <Progress value={(currentStep / 6) * 100} className="mt-4" />
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <Card className={CARD_CLASS}>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Exam Level: <span className="font-semibold">{examLevelDisplay}</span>
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name (as on birth certificate) *</Label>
                  <Input
                    id="fullName"
                    value={registrationData.personalInfo.fullName}
                    onChange={(e) => setRegistrationData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, fullName: e.target.value }
                    }))}
                    placeholder="Enter your full name"
                    className={getFieldError('fullName') ? 'border-red-500' : ''}
                  />
                  {getFieldError('fullName') && (
                    <p className="text-sm text-red-500 mt-1">{getFieldError('fullName')}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="cin">Candidate Identification Number (CIN) *</Label>
                  <Input
                    id="cin"
                    value={registrationData.personalInfo.cin}
                    onChange={(e) => setRegistrationData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, cin: e.target.value }
                    }))}
                    placeholder="Enter your 9-digit CIN"
                    maxLength={9}
                    className={getFieldError('cin') ? 'border-red-500' : ''}
                  />
                  {getFieldError('cin') && (
                    <p className="text-sm text-red-500 mt-1">{getFieldError('cin')}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Must be exactly 9 digits</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="centerNumber">Center Number</Label>
                  <Input
                    id="centerNumber"
                    value={registrationData.personalInfo.centerNumber}
                    onChange={(e) => setRegistrationData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, centerNumber: e.target.value }
                    }))}
                    placeholder="Enter center number"
                    className={getFieldError('centerNumber') ? 'border-red-500' : ''}
                  />
                  {getFieldError('centerNumber') && (
                    <p className="text-sm text-red-500 mt-1">{getFieldError('centerNumber')}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Must be at least 5 characters</p>
                </div>
                <div>
                  <Label htmlFor="centerName">Center Name</Label>
                  <Input
                    id="centerName"
                    value={registrationData.personalInfo.centerName}
                    onChange={(e) => setRegistrationData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, centerName: e.target.value }
                    }))}
                    placeholder="Enter center name"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={registrationData.personalInfo.dateOfBirth}
                    onChange={(e) => setRegistrationData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, dateOfBirth: e.target.value }
                    }))}
                    className={getFieldError('dateOfBirth') ? 'border-red-500' : ''}
                  />
                  {getFieldError('dateOfBirth') && (
                    <p className="text-sm text-red-500 mt-1">{getFieldError('dateOfBirth')}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={registrationData.personalInfo.gender} onValueChange={(value) => 
                    setRegistrationData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, gender: value }
                    }))
                  }>
                    <SelectTrigger className={getFieldError('gender') ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                  {getFieldError('gender') && (
                    <p className="text-sm text-red-500 mt-1">{getFieldError('gender')}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location *</Label>
                <Select value={registrationData.personalInfo.location} onValueChange={(value) => 
                  setRegistrationData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, location: value }
                  }))
                }>
                  <SelectTrigger className={getFieldError('location') ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select your location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getFieldError('location') && (
                  <p className="text-sm text-red-500 mt-1">{getFieldError('location')}</p>
                )}
              </div>

              <Button onClick={handlePersonalInfoSubmit} className="w-full" disabled={isLoading}>
                Continue to Subjects
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Subjects & Grades */}
        {currentStep === 2 && (
          <Card className={`max-w-4xl ${CARD_CLASS.split(' ').slice(1).join(' ')}`}>
            <CardHeader>
              <CardTitle>Select Subjects & Grades</CardTitle>
              <p className="text-gray-600 dark:text-gray-300">Choose your subjects and desired grades. Pricing is per subject.</p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-4">Available Subjects</h3>
                  <div className="space-y-2">
                    {subjects.map((subject) => (
                      <div key={subject} className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="text-sm">{subject}</span>
                        <Select onValueChange={(grade) => handleSubjectGradeChange(subject, grade)}>
                          <SelectTrigger className="w-24">
                            <SelectValue placeholder="Grade" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(gradesPricing).map(([grade, price]) => (
                              <SelectItem key={grade} value={grade}>
                                {grade} - {price.toLocaleString()} XAF
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Selected Subjects</h3>
                  <div className="space-y-2">
                    {Object.entries(registrationData.subjectsAndGrades).map(([subject, data]) => (
                      <div key={subject} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{subject}</p>
                          <p className="text-xs text-gray-600">Grade {data.grade} - {data.price.toLocaleString()} XAF</p>
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => removeSubject(subject)}>
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <h4 className="font-semibold">Total Cost</h4>
                    <p className="text-2xl font-bold text-green-600">{calculateTotalCost().toLocaleString()} XAF</p>
                  </div>
                </div>
              </div>

              <Button onClick={handleSubjectsSubmit} className="w-full mt-6" disabled={isLoading}>
                Continue to Documents
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Document Upload & Services */}
        {currentStep === 3 && (
          <Card className={CARD_CLASS}>
            <CardHeader>
              <CardTitle>Documents & Services</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Upload required documents (JPEG, PNG, PDF only - Max 5MB each)
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Required Documents</h3>
                <div className="space-y-4">
                  {[
                    { 
                      key: 'timetable', 
                      label: 'Personal Exam Timetable',
                      example: null
                    },
                    { 
                      key: 'nationalId', 
                      label: 'National ID Card',
                      example: 'example-id-card.jpg'
                    },
                    { 
                      key: 'birthCertificate', 
                      label: 'Birth Certificate',
                      example: 'example-birth-certificate.jpg'
                    }
                  ].map(({ key, label, example }) => (
                    <div key={key}>
                      <div className="flex items-center justify-between">
                        <Label>{label} *</Label>
                        {example && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            type="button"
                            className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            onClick={() => window.open(`/example-documents/${example}`, '_blank')}
                          >
                            View Example
                          </Button>
                        )}
                      </div>
                      <div className="mt-1 flex items-center space-x-2">
                        <Input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(key as keyof typeof registrationData.documents, file);
                          }}
                        />
                        {registrationData.documents[key as keyof typeof registrationData.documents] && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            type="button"
                            onClick={() => {
                              const file = registrationData.documents[key as keyof typeof registrationData.documents];
                              if (file) {
                                const url = URL.createObjectURL(file);
                                window.open(url, '_blank');
                              }
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Services</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="gradeModification"
                      checked={registrationData.services.gradeModification}
                      onCheckedChange={(checked) => 
                        setRegistrationData(prev => ({
                          ...prev,
                          services: { ...prev.services, gradeModification: checked as boolean }
                        }))
                      }
                    />
                    <Label htmlFor="gradeModification">Grade Modification</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="followUp"
                      checked={registrationData.services.followUp}
                      onCheckedChange={(checked) => 
                        setRegistrationData(prev => ({
                          ...prev,
                          services: { ...prev.services, followUp: checked as boolean }
                        }))
                      }
                    />
                    <Label htmlFor="followUp">Follow-Up Service</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="certificateManufacture"
                      checked={registrationData.services.certificateManufacture}
                      onCheckedChange={(checked) => 
                        setRegistrationData(prev => ({
                          ...prev,
                          services: { ...prev.services, certificateManufacture: checked as boolean }
                        }))
                      }
                    />
                    <Label htmlFor="certificateManufacture">Manufacture Certificate/Slip</Label>
                  </div>
                </div>
              </div>

              <Button onClick={handleDocumentsSubmit} className="w-full" disabled={isLoading}>
                Continue to Review
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <Card className={`max-w-4xl ${CARD_CLASS.split(' ').slice(1).join(' ')}`}>
            <CardHeader>
              <CardTitle>Review Your Registration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Personal Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Exam Level:</span> {examLevelDisplay}</p>
                    <p><span className="font-medium">Name:</span> {registrationData.personalInfo.fullName}</p>
                    <p><span className="font-medium">CIN:</span> {registrationData.personalInfo.cin}</p>
                    <p><span className="font-medium">Date of Birth:</span> {registrationData.personalInfo.dateOfBirth}</p>
                    <p><span className="font-medium">Gender:</span> {registrationData.personalInfo.gender}</p>
                    <p><span className="font-medium">Location:</span> {registrationData.personalInfo.location}</p>
                    <p><span className="font-medium">Department:</span> {registrationData.personalInfo.department}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Selected Subjects</h3>
                  <div className="space-y-1 text-sm">
                    {Object.entries(registrationData.subjectsAndGrades).map(([subject, data]) => (
                      <p key={subject}>{subject} - Grade {data.grade} ({data.price.toLocaleString()} XAF)</p>
                    ))}
                  </div>
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded">
                    <p className="font-semibold">Total: {calculateTotalCost().toLocaleString()} XAF</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Edit Information
                </Button>
                <Button onClick={handleRegistrationSubmit} className="flex-1" disabled={isLoading}>
                  Submit Registration
                  <CreditCard className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Payment */}
        {currentStep === 5 && (
          <Card className={CARD_CLASS}>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
              <p className="text-muted-foreground">Complete your payment to process your registration</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-6 bg-gradient-to-r from-green-50 to-red-50 dark:from-green-900/20 dark:to-red-900/20 rounded-lg border">
                <h3 className="text-2xl font-bold text-foreground">Total Amount</h3>
                {coupon?.isValid && (
                  <div className="mb-2">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Applied Coupon: {coupon.code} ({coupon.discount}{coupon.type === 'percentage' ? '%' : 'XAF'} off)
                      <button 
                        onClick={() => {
                          setCoupon(null);
                          setPaymentData(prev => ({ ...prev, couponCode: '' }));
                        }}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </p>
                  </div>
                )}
                <div className="flex items-center justify-center space-x-4">
                  {coupon?.isValid && (
                    <p className="text-xl line-through text-gray-500">
                      {Object.values(registrationData.subjectsAndGrades).reduce((total, subject) => total + subject.price, 0).toLocaleString()} XAF
                    </p>
                  )}
                  <p className={`text-3xl font-bold ${coupon?.isValid ? 'text-green-600' : 'text-green-600'}`}>
                    {calculateTotalCost().toLocaleString()} XAF
                  </p>
                </div>
                {coupon?.isValid && (
                  <p className="mt-1 text-green-600 font-medium">
                    You saved {getDiscountAmount().toLocaleString()} XAF!
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Payment Details</h3>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200">
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">Payment Instructions:</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
                    Name: <span className="font-bold">MILDRED YAAH</span><br />
                    Number: <span className="font-bold">676078168</span><br />
                    <span className="text-red-600 dark:text-red-400">⚠️ Confirm name before paying!</span>
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Coupon Code (Optional)</Label>
                      <div className="flex space-x-2">
                        <Input 
                          placeholder="Enter coupon code" 
                          value={paymentData.couponCode}
                          onChange={(e) => setPaymentData(prev => ({ ...prev, couponCode: e.target.value }))}
                          disabled={!!coupon?.isValid}
                        />
                        <Button 
                          type="button" 
                          variant={coupon?.isValid ? 'outline' : 'default'}
                          onClick={handleApplyCoupon}
                          disabled={!paymentData.couponCode.trim() || !!coupon?.isValid || isValidatingCoupon}
                        >
                          {isValidatingCoupon ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Validating...
                            </>
                          ) : coupon?.isValid ? 'Applied' : 'Apply'}
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-end">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs text-blue-600 dark:text-blue-400"
                        onClick={() => {
                          toast({
                            title: 'How to Get Coupons',
                            description: 'Contact our support team to get exclusive coupon codes for discounts on your registration.',
                            variant: 'default',
                          });
                        }}
                      >
                        View Available Coupons
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Payer Name *</Label>
                      <Input 
                        placeholder="Your full name" 
                        value={paymentData.payerName}
                        onChange={(e) => setPaymentData(prev => ({ ...prev, payerName: e.target.value }))}
                        className={getFieldError('payerName') ? 'border-red-500' : ''}
                      />
                      {getFieldError('payerName') && (
                        <p className="text-sm text-red-500 mt-1">{getFieldError('payerName')}</p>
                      )}
                    </div>

                    <div>
                      <Label>How would you like to be contacted? *</Label>
                      <Select 
                        value={paymentData.contactPreference} 
                        onValueChange={(value: 'email' | 'phone' | 'both') => 
                          setPaymentData(prev => ({ ...prev, contactPreference: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select contact method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="phone">Phone Call</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="both">Both Phone and Email</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {(paymentData.contactPreference === 'email' || paymentData.contactPreference === 'both') && (
                      <div>
                        <Label>Email Address {paymentData.contactPreference === 'both' ? '*' : '(Required)'}</Label>
                        <Input 
                          type="email"
                          placeholder="your.email@example.com"
                          value={paymentData.email}
                          onChange={(e) => setPaymentData(prev => ({ ...prev, email: e.target.value }))}
                          className={getFieldError('email') ? 'border-red-500' : ''}
                        />
                        {getFieldError('email') && (
                          <p className="text-sm text-red-500 mt-1">{getFieldError('email')}</p>
                        )}
                      </div>
                    )}

                    {(paymentData.contactPreference === 'phone' || paymentData.contactPreference === 'both') && (
                      <div>
                        <Label>Phone Number {paymentData.contactPreference === 'both' ? '*' : '(Required)'}</Label>
                        <div className="flex">
                          <div className="flex items-center justify-center px-3 bg-gray-100 dark:bg-gray-800 rounded-l-md border border-r-0 text-sm text-gray-500 dark:text-gray-400">
                            +237
                          </div>
                          <Input 
                            type="tel"
                            className={`rounded-l-none ${getFieldError('phoneNumber') ? 'border-red-500' : ''}`}
                            placeholder="677123456"
                            value={paymentData.phoneNumber}
                            onChange={(e) => setPaymentData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                            maxLength={9}
                          />
                        </div>
                        {getFieldError('phoneNumber') && (
                          <p className="text-sm text-red-500 mt-1">{getFieldError('phoneNumber')}</p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Enter exactly 9 digits starting with 6 or 7 (e.g., 677123456)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Payment Method *</Label>
                  <Select value={paymentData.paymentMethod} onValueChange={(value) => 
                    setPaymentData(prev => ({ ...prev, paymentMethod: value }))
                  }>
                    <SelectTrigger className={getFieldError('paymentMethod') ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MTN_MOBILE_MONEY">MTN Mobile Money</SelectItem>
                      <SelectItem value="ORANGE_MONEY">Orange Money</SelectItem>
                    </SelectContent>
                  </Select>
                  {getFieldError('paymentMethod') && (
                    <p className="text-sm text-red-500 mt-1">{getFieldError('paymentMethod')}</p>
                  )}
                </div>

                <div>
                  <Label>Transaction ID (Optional)</Label>
                  <Input 
                    placeholder="Enter transaction ID after payment" 
                    value={paymentData.transactionId}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, transactionId: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Payment Screenshot (Optional)</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setPaymentData(prev => ({ ...prev, paymentScreenshot: file }));
                    }}
                  />
                </div>

                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Need to pay in installments?
                  </p>
                  <a href="https://wa.me/237676078168" target="_blank" rel="noopener noreferrer">
                    <Button variant="link" className="text-blue-600">
                      Contact Mr. Akon Benedict on WhatsApp
                    </Button>
                  </a>
                </div>

                <Button onClick={handlePaymentSubmit} className="w-full" disabled={isLoading}>
                  Submit Payment for Verification
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 mt-6">
              <Button 
                onClick={async () => {
                  try {
                    setIsGeneratingPdf(true);
                    const paymentScreenshotUrl = paymentData.paymentScreenshot 
                      ? await fileToDataUrl(paymentData.paymentScreenshot)
                      : undefined;
                    
                    try {
                      // Convert documents object to array of DocumentInfo
                      const documentsArray = Object.entries(registrationData.documents || {})
                        .filter(([_, file]) => file !== null && file instanceof File)
                        .map(([type, file]) => ({
                          type,
                          file: file as File,
                          url: URL.createObjectURL(file as File)
                        }));
                      
                      console.log('Generating PDF with documents:', documentsArray);
                      
                      const { pdfUrl } = await generateRegistrationPDF(
                        registrationData,
                        paymentData,
                        documentsArray,
                        paymentScreenshotUrl
                      );
                      
                      // Trigger the download
                      const filename = `registration-receipt-${registrationId}.pdf`;
                      downloadPDF(pdfUrl, filename);
                    } catch (err) {
                      console.error('Error in PDF generation:', err);
                      throw err;
                    }
                  } catch (error) {
                    console.error('Error generating PDF:', error);
                    toast({
                      title: 'Error',
                      description: 'Failed to generate PDF. Please try again.',
                      variant: 'destructive',
                    });
                  } finally {
                    setIsGeneratingPdf(false);
                  }
                }}
                disabled={isGeneratingPdf}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                {isGeneratingPdf ? 'Generating PDF...' : 'Download Registration Receipt'}
              </Button>
              
              <a href="https://wa.me/237676078168" target="_blank" rel="noopener noreferrer" className="w-full">
                <Button variant="outline" className="w-full">
                  Contact Support on WhatsApp
                </Button>
              </a>
              
              <Button variant="ghost" onClick={() => navigate('/')} className="w-full">
                Return to Home
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Registration;

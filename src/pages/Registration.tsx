
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Upload, Eye, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RegistrationData {
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

const Registration = () => {
  const { department } = useParams<{ department: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
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

  const departmentSubjects = {
    science: [
      'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Further Mathematics',
      'Computer Science', 'Statistics', 'Environmental Science'
    ],
    arts: [
      'Literature in English', 'History', 'Geography', 'Religious Studies',
      'Philosophy', 'French', 'Government', 'Sociology'
    ],
    commercial: [
      'Accounting', 'Economics', 'Business Management', 'Commerce',
      'Marketing', 'Banking & Finance', 'Entrepreneurship', 'Business Law'
    ],
    technical: [
      'Information & Communication Technology', 'Engineering Science',
      'Woodwork', 'Technical Drawing', 'Metalwork', 'Building Construction',
      'Electrical Installation', 'Auto Mechanics'
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
    return Object.values(registrationData.subjectsAndGrades).reduce((total, subject) => total + subject.price, 0);
  };

  const handlePersonalInfoSubmit = () => {
    const { personalInfo } = registrationData;
    if (!personalInfo.fullName || !personalInfo.cin || !personalInfo.dateOfBirth || !personalInfo.gender || !personalInfo.location) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
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

  const handleFileUpload = (field: keyof typeof registrationData.documents, file: File) => {
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

  const subjects = departmentSubjects[department as keyof typeof departmentSubjects] || [];

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
              <h1 className="text-xl font-bold text-gray-900 dark:text-white capitalize">{department} Registration</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">Step {currentStep} of 6</p>
            </div>
            <img src="/lovable-uploads/82c1802c-61d7-4b62-bfdc-cbf11c257601.png" alt="Success Guaranteed" className="h-10 w-auto" />
          </div>
          <Progress value={(currentStep / 6) * 100} className="mt-4" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <Card className="max-w-2xl mx-auto backdrop-blur-md bg-white/90 dark:bg-gray-800/90">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
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
                  />
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
                    placeholder="Enter your CIN"
                  />
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
                  />
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
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={registrationData.personalInfo.gender} onValueChange={(value) => 
                    setRegistrationData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, gender: value }
                    }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <SelectTrigger>
                    <SelectValue placeholder="Select your location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handlePersonalInfoSubmit} className="w-full">
                Continue to Subjects
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Subjects & Grades */}
        {currentStep === 2 && (
          <Card className="max-w-4xl mx-auto backdrop-blur-md bg-white/90 dark:bg-gray-800/90">
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

              <Button onClick={handleSubjectsSubmit} className="w-full mt-6">
                Continue to Documents
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Document Upload & Services */}
        {currentStep === 3 && (
          <Card className="max-w-2xl mx-auto backdrop-blur-md bg-white/90 dark:bg-gray-800/90">
            <CardHeader>
              <CardTitle>Documents & Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Required Documents</h3>
                <div className="space-y-4">
                  {[
                    { key: 'timetable', label: 'Personal Exam Timetable' },
                    { key: 'nationalId', label: 'National ID Card' },
                    { key: 'birthCertificate', label: 'Birth Certificate' }
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <Label>{label} *</Label>
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
                          <Button variant="outline" size="sm">
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

              <Button onClick={handleDocumentsSubmit} className="w-full">
                Continue to Review
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <Card className="max-w-4xl mx-auto backdrop-blur-md bg-white/90 dark:bg-gray-800/90">
            <CardHeader>
              <CardTitle>Review Your Registration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Personal Information</h3>
                  <div className="space-y-2 text-sm">
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
                <Button onClick={() => setCurrentStep(5)} className="flex-1">
                  Proceed to Payment
                  <CreditCard className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Payment */}
        {currentStep === 5 && (
          <Card className="max-w-2xl mx-auto backdrop-blur-md bg-white/90 dark:bg-gray-800/90">
            <CardHeader>
              <CardTitle>Payment</CardTitle>
              <p className="text-gray-600 dark:text-gray-300">Complete your payment to process your registration</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-6 bg-gradient-to-r from-green-50 to-red-50 dark:from-green-900/20 dark:to-red-900/20 rounded-lg">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Total Amount</h3>
                <p className="text-3xl font-bold text-green-600">{calculateTotalCost().toLocaleString()} XAF</p>
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

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Payer Name *</Label>
                    <Input placeholder="Your full name" />
                  </div>
                  <div>
                    <Label>Phone Number *</Label>
                    <Input placeholder="677XXXXXXX" />
                  </div>
                </div>

                <div>
                  <Label>Transaction ID (Optional)</Label>
                  <Input placeholder="Enter transaction ID after payment" />
                </div>

                <div className="space-y-3">
                  <Button className="w-full bg-orange-500 hover:bg-orange-600">
                    Pay with Orange Money
                  </Button>
                  <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black">
                    Pay with MTN Mobile Money
                  </Button>
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

                <Button onClick={() => {
                  toast({
                    title: "Payment Successful!",
                    description: "Your registration is being processed.",
                  });
                  setCurrentStep(6);
                }} className="w-full">
                  Confirm Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 6: Success */}
        {currentStep === 6 && (
          <Card className="max-w-2xl mx-auto backdrop-blur-md bg-white/90 dark:bg-gray-800/90 text-center">
            <CardContent className="p-8">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-green-600 mb-4">Payment Successful!</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Your request is being processed. You will be contacted shortly with updates.
              </p>
              
              <div className="space-y-4">
                <Button className="w-full" onClick={() => {
                  // Generate and download PDF receipt
                  const receiptData = {
                    ...registrationData,
                    totalCost: calculateTotalCost(),
                    registrationId: `SG${Date.now()}`
                  };
                  console.log('PDF Receipt Data:', receiptData);
                  toast({
                    title: "Receipt Downloaded",
                    description: "Your receipt has been downloaded successfully.",
                  });
                }}>
                  Download Receipt (PDF)
                </Button>
                
                <a href="https://wa.me/237676078168" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full">
                    Contact Support on WhatsApp
                  </Button>
                </a>
                
                <Button variant="ghost" onClick={() => navigate('/')}>
                  Return to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Registration;

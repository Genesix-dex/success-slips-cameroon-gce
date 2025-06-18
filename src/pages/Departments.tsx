import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, BookOpen, Briefcase, Settings, ArrowLeft, Users } from 'lucide-react';

const Departments = () => {
  // Determine selected exam level to show correct subject lists
  const examLevel = typeof window !== 'undefined' ? localStorage.getItem('selectedExamLevel') : null;

  // Subject lists for CGCE Ordinary Level
  const ordinaryDepartments = [
    {
      name: 'Science',
      icon: Calculator,
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700',
      subjects: [
        'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Additional Mathematics',
        'Human Biology', 'Agricultural Science', 'Geology', 'Geography',
        'Technical Drawing', 'Food and Nutrition', 'Electronics', 'Computer Science',
        'Statistics', 'Environmental Science', 'English Language', 'French'
      ],
      path: '/register/science',
      description: 'Excel in STEM subjects with our expert guidance and comprehensive support.',
      professionals: 15
    },
    {
      name: 'Arts',
      icon: BookOpen,
      color: 'bg-gradient-to-br from-red-500 to-red-600',
      hoverColor: 'hover:from-red-600 hover:to-red-700',
      subjects: [
        'Literature in English', 'French Literature', 'History', 'Geography',
        'Religious Studies', 'Citizenship Education', 'Physical Education (PE)',
        'Logic (Philosophy)', 'Economics', 'Commerce', 'Accounting',
        'Food and Nutrition', 'Business Mathematics', 'Mathematics',
        'French', 'Government', 'Sociology', 'English Language'
      ],
      path: '/register/arts',
      description: 'Master humanities and social sciences with our experienced faculty.',
      professionals: 12
    },
    {
      name: 'Commercial',
      icon: Briefcase,
      color: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
      hoverColor: 'hover:from-yellow-600 hover:to-yellow-700',
      subjects: [
        'Business Mathematics', 'Accounting', 'Economics', 'Business Management',
        'Commerce', 'Commerce and Finance', 'Marketing', 'Banking & Finance',
        'Entrepreneurship', 'Business Law', 'Typewriting', 'Mathematics',
        'Computer Science', 'English Language', 'Food Science'
      ],
      path: '/register/commercial',
      description: 'Build your business acumen with our commercial subjects expertise.',
      professionals: 8
    },
    {
      name: 'Technical',
      icon: Settings,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
      subjects: [
        'Information & Communication Technology', 'Engineering Science', 'Woodwork',
        'Technical Drawing', 'Metalwork', 'Building Construction', 'Electrical Installation',
        'Auto Mechanics', 'Clothing & Textiles', 'Food & Nutrition', 'Electronics', 'Electricity',
        'Plumbing & Pipe Fitting', 'Mathematics', 'French', 'English Language', 'Chemistry',
        'Physics', 'Biology', 'Computer Science', 'Accounting','Food Science'
      ],
      path: '/register/technical',
      description: 'Master technical skills and engineering concepts for practical success.',
      professionals: 10
    }
  ];

  // --- Subject lists for CGCE Advanced Level (updated) ---
  const advancedDepartments = [
    {
      name: 'Science',
      icon: Calculator,
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700',
      subjects: [
        'Physics', 'Chemistry', 'Biology', 'Further Mathematics',
        'Geology', 'Agricultural Science', 'Pure Mathematics with Statistics',
        'Pure Mathematics with Mechanics', 'Geography', 'ICT', 'Computer Science','Food Science'
      ],
      path: '/register/science',
      description: 'Excel in STEM subjects with our expert guidance and comprehensive support.',
      professionals: 15
    },
    {
      name: 'Arts',
      icon: BookOpen,
      color: 'bg-gradient-to-br from-red-500 to-red-600',
      hoverColor: 'hover:from-red-600 hover:to-red-700',
      subjects: [
        'Economics', 'English Language', 'Mathematics with Statistics', 'Sociology',
        'Psychology', 'Law & Government', 'Accounting', 'Commerce', 'Business Studies','Information & Communication Technology','Computer Science','Food Science'
        ,'History','Logic(Philosophy)'
      ],
      path: '/register/arts',
      description: 'Master humanities and social sciences with our experienced faculty.',
      professionals: 12
    },
    {
      name: 'Commercial',
      icon: Briefcase,
      color: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
      hoverColor: 'hover:from-yellow-600 hover:to-yellow-700',
      subjects: [
        'Business Mathematics', 'Home Economics', 'Financial Accounting', 'Cost and Management Accounting',
        'Corporate Accounting', 'Computer Science', 'ICT', 'Religious Studies',
        'Pure Mathematics with Statistics', 'Commerce and Finance', 'Entrepreneurship',
        'Professional Marketing Practice', 'Natural Science', 'Family Life Education and Gerontology',
        'Resource Management on Home Studies and Social Life', 'Catering Management & Dietetics',
        'Information Processing', 'Professional Communication Skills',
        'Organisation of Administrative Works and Technology', 'Philosophy', 'Digital Marketing Practice',
        'Marketing Skills', 'Law', 'Professional English', 'Principles and Practice of Taxation',
        'Information Management and Systems for Business'
      ],
      path: '/register/commercial',
      description: 'Build your business acumen with our commercial subjects expertise.',
      professionals: 8
    },
    {
      name: 'Technical',
      icon: Settings,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
      subjects: [
        'Religious Studies', 'ICT', 'Entrepreneurship', 'Philosophy', 'Professional English', 'Law',
        'Chassis Systems and Transmission', 'Electrical and Electronic Systems', 'Engine Systems',
        'Mechanical Design', 'Automation', 'Engineering Science', 'Mathematics', 'Diesel Engine Technology',
        'Hydraulics and Chassis Systems', 'Textile Technology and Equipment', 'Fashion and Fabric Design',
        'Pattern Making and Garment Construction', 'Work Organisation', 'Architectural Technology and Practice',
        'Building Construction Technology and Practice', 'Drawing and Architectural Modeling',
        'Building Construction Drawing', 'Architectural Project Management', 'Building Construction Project Management',
        'Public Works Projects Management', 'Plumbing Project Management', 'Architectural Applied Mechanics',
        'Building Construction Applied Mechanics', 'Public Works Applied Mechanics',
        'Electrical/Electronics Applied Mechanics', 'Wood Cabinet Applied Mechanics',
        'Building Construction Surveying and Soil Mechanics', 'Power Electronics',
        'Automatic Control of Electrical Machines', 'Design of Electrical Installations', 'Circuit Analysis',
        'Communication Systems', 'Fundamental and Power Electronics', 'Design of Electronic Systems',
        'Microprocessor and Computer Technology', 'Electrical Machines', 'Sustainable Machines',
        'Sustainable Management of Forest Resources', 'Forest Operations', 'Forest Sciences', 'Forest Geomatics',
        'Heating, Ventilation, and Air Conditioning', 'Refrigeration Installation', 'Air Condition Repairs',
        'Food Processing and Preservation', 'Medical Devices', 'Electrical, Electronics, and Refrigeration Systems',
        'Industrial Automation', 'Auto Visual Systems', 'Alarm Systems', 'Network and Telecommunication Systems',
        'Electronic Diagrams', 'Maintenance of Mechanical, Pneumatic, and Hydraulic Systems',
        'Maintenance of Automated Production Systems', 'Maintenance of Electrical, Electronic, and Refrigeration Systems',
        'Mechanical Technology and Fluid Power', 'Production Process'
      ],
      path: '/register/technical',
      description: 'Master technical skills and engineering concepts for practical success.',
      professionals: 10
    }
  ];

  const departments = examLevel === 'CGCE_ORDINARY_LEVEL' ? ordinaryDepartments : advancedDepartments;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background/80 backdrop-blur-md border-b border-border/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Choose Your Department</h1>
                <p className="text-muted-foreground">Select your field of study to continue registration</p>
              </div>
            </div>
            <img src="/lovable-uploads/82c1802c-61d7-4b62-bfdc-cbf11c257601.png" alt="Success Guaranteed" className="h-12 w-auto" />
          </div>
        </div>
      </div>

      {/* Department Cards */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {departments.map((dept, index) => {
            const IconComponent = dept.icon;
            return (
              <Card key={index} className="group hover:scale-105 transition-all duration-300 backdrop-blur-md bg-card/90 border-border/20 hover:shadow-2xl">
                <CardHeader className="text-center pb-4">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl ${dept.color} ${dept.hoverColor} text-white mb-4 group-hover:scale-110 transition-all duration-300 mx-auto`}>
                    <IconComponent className="w-10 h-10" />
                  </div>
                  <CardTitle className="text-2xl text-foreground">{dept.name}</CardTitle>
                  <p className="text-muted-foreground">{dept.description}</p>
                  <div className="flex items-center justify-center space-x-2 mt-2">
                    <Users className="w-4 h-4 text-muted-foreground/70" />
                    <span className="text-sm text-muted-foreground/70">{dept.professionals} Professionals</span>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="mb-6">
                    <h4 className="font-semibold text-foreground mb-3">Available Subjects:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {dept.subjects.map((subject, idx) => (
                        <div key={idx} className="text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                          {subject}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Link to={dept.path} className="block">
                    <Button className={`w-full ${dept.color} ${dept.hoverColor} text-white py-3 text-lg font-semibold`}>
                      Select {dept.name}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Contact Support */}
        <Card className="mt-12 backdrop-blur-md bg-gradient-to-r from-green-500/20 to-red-500/20 border-border/20">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-bold text-foreground mb-2">Need Help Choosing?</h3>
            <p className="text-muted-foreground mb-4">
              Contact Mr. Akon Benedict for personalized guidance
            </p>
            <a href="https://wa.me/237676078168" target="_blank" rel="noopener noreferrer">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                Chat on WhatsApp: 676078168
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Departments;

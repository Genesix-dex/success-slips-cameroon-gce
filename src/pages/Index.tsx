import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Users, Award, Phone, MessageCircle, BookOpen, Calculator, Briefcase, Settings } from 'lucide-react';

const Index = () => {
  const [darkMode, setDarkMode] = useState(false);

  const departments = [
    {
      name: 'Science',
      icon: Calculator,
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Further Math'],
      path: '/science'
    },
    {
      name: 'Arts',
      icon: BookOpen,
      color: 'bg-gradient-to-br from-red-500 to-red-600',
      subjects: ['Literature', 'History', 'Geography', 'Religious Studies'],
      path: '/arts'
    },
    {
      name: 'Commercial',
      icon: Briefcase,
      color: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
      subjects: ['Accounting', 'Economics', 'Business Management', 'Commerce'],
      path: '/commercial'
    },
    {
      name: 'Technical',
      icon: Settings,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      subjects: ['ICT', 'Engineering', 'Woodwork', 'Technical Drawing'],
      path: '/technical'
    }
  ];

  const teamMembers = [
    { name: 'Dr. Sarah Mbaku', role: 'Academic Director', department: 'Science' },
    { name: 'Prof. Jean Nkomo', role: 'Mathematics Expert', department: 'Science' },
    { name: 'Dr. Grace Fon', role: 'Literature Specialist', department: 'Arts' },
    { name: 'Mr. Paul Tabi', role: 'Economics Consultant', department: 'Commercial' },
    { name: 'Eng. Mark Ashu', role: 'Technical Lead', department: 'Technical' },
    { name: 'Dr. Mary Eko', role: 'Chemistry Expert', department: 'Science' },
    { name: 'Prof. David Kom', role: 'History Scholar', department: 'Arts' },
    { name: 'Mrs. Helen Njie', role: 'Accounting Professional', department: 'Commercial' }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Navigation */}
      <nav className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src="/lovable-uploads/82c1802c-61d7-4b62-bfdc-cbf11c257601.png" alt="Success Guaranteed" className="h-12 w-auto" />
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Success Guaranteed</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">Academic Excellence</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2"
            >
              {darkMode ? '☀️' : '🌙'}
            </Button>
            <a href="https://wa.me/237676078168" target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <MessageCircle className="w-4 h-4 mr-2" />
                Need Help?
              </Button>
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 via-red-600/20 to-yellow-600/20"></div>
        <div className="absolute inset-0 backdrop-blur-3xl bg-white/10 dark:bg-gray-900/10"></div>
        
        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md rounded-full px-6 py-2 mb-8 border border-white/30">
            <Award className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Cameroon GCE Exam Support</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Welcome to<br />
            <span className="bg-gradient-to-r from-green-600 via-red-600 to-yellow-600 bg-clip-text text-transparent">
              Success Guaranteed
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Your Pathway to Academic Excellence! We ensure you pass in flying colors with our comprehensive GCE Ordinary & Advanced Level support.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/exam-level">
              <Button size="lg" className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 text-lg">
                <GraduationCap className="w-6 h-6 mr-2" />
                Register Now
              </Button>
            </Link>
            <a href="tel:676078168">
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg backdrop-blur-md bg-white/20 border-white/30">
                <Phone className="w-6 h-6 mr-2" />
                Call: 676078168
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Choose Your Department</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Select from our specialized departments for targeted exam support</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {departments.map((dept, index) => {
              const IconComponent = dept.icon;
              return (
                <Link key={index} to={dept.path}>
                  <Card className="group hover:scale-105 transition-all duration-300 backdrop-blur-md bg-white/80 dark:bg-gray-800/80 border-white/20 hover:shadow-2xl cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${dept.color} text-white mb-4 group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{dept.name}</h3>
                      <div className="space-y-1">
                        {dept.subjects.slice(0, 3).map((subject, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {subject}
                          </Badge>
                        ))}
                        {dept.subjects.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{dept.subjects.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full px-6 py-2 mb-6 border border-white/30">
              <Users className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">40+ Professionals</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Our Expert Team</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Meet some of the professionals behind your success</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <Card key={index} className="backdrop-blur-md bg-white/80 dark:bg-gray-800/80 border-white/20 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{member.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{member.role}</p>
                  <Badge variant="outline" className="text-xs">
                    {member.department}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-12 px-4">
        <div className="container mx-auto text-center">
          <img src="/lovable-uploads/82c1802c-61d7-4b62-bfdc-cbf11c257601.png" alt="Success Guaranteed" className="h-16 w-auto mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Success Guaranteed</h3>
          <p className="text-gray-400 mb-6">Your pathway to academic excellence</p>
          
          <div className="flex justify-center items-center space-x-6 mb-6">
            <a href="https://wa.me/237676078168" className="flex items-center space-x-2 text-green-400 hover:text-green-300">
              <MessageCircle className="w-5 h-5" />
              <span>WhatsApp: 676078168</span>
            </a>
            <a href="tel:676078168" className="flex items-center space-x-2 text-blue-400 hover:text-blue-300">
              <Phone className="w-5 h-5" />
              <span>Call: 676078168</span>
            </a>
          </div>
          
          <p className="text-sm text-gray-500">
            © 2024 Success Guaranteed. All rights reserved. | Cameroon GCE Exam Support
          </p>
        </div>
      </footer>

      {/* Floating Help Button */}
      <a
        href="https://wa.me/237676078168"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50"
      >
        <MessageCircle className="w-6 h-6" />
      </a>
    </div>
  );
};

export default Index;

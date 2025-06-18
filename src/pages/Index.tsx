import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Users, Award, Phone, MessageCircle, BookOpen, Calculator, Briefcase, Settings } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

const Index = () => {

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
    { name: 'Mr. Akon Benedict', role: 'Chemistry Expert', department: 'Science' },
    { name: 'Prof. David Kom', role: 'History Scholar', department: 'Arts' },
    { name: 'Mrs. Helen Njie', role: 'Accounting Professional', department: 'Commercial' }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="backdrop-blur-md bg-background/80 border-b border-border/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src="/lovable-uploads/82c1802c-61d7-4b62-bfdc-cbf11c257601.png" alt="Success Guaranteed" className="h-12 w-auto" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Success Guaranteed</h1>
              <p className="text-sm text-muted-foreground">Academic Excellence</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
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
          <div className="inline-flex items-center space-x-2 bg-background/20 backdrop-blur-md rounded-full px-6 py-2 mb-8 border border-border/30">
            <Award className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-foreground">Cameroon GCE Exam Support</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            Welcome to<br />
            <span className="bg-gradient-to-r from-green-600 via-red-600 to-yellow-600 bg-clip-text text-transparent">
              Success Guaranteed
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Your one-stop platform for GCE past questions, study materials, and exam preparation resources.
            Join thousands of students who have excelled in their exams with our comprehensive study materials.
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
            <h2 className="text-4xl font-bold text-foreground mb-4">Choose Your Department</h2>
            <p className="text-xl text-muted-foreground">Select from our specialized departments for targeted exam support</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {departments.map((dept, index) => {
              const IconComponent = dept.icon;
              return (
                <Link key={index} to={dept.path}>
                  <Card className="group hover:scale-105 transition-all duration-300 backdrop-blur-md bg-card/80 border-border/20 hover:shadow-2xl cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${dept.color} text-white mb-4 group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">{dept.name}</h3>
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
      <section className="py-20 px-4 bg-gradient-to-br from-muted/50 to-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-card/80 backdrop-blur-md rounded-full px-6 py-2 mb-6 border border-border/30">
              <Users className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-foreground">40+ Professionals</span>
            </div>
            <h2 className="text-4xl font-bold text-foreground mb-4">Our Expert Team</h2>
            <p className="text-xl text-muted-foreground">Meet some of the professionals behind your success</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <Card key={index} className="backdrop-blur-md bg-card/80 border-border/20 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{member.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{member.role}</p>
                  <Badge variant="outline" className="text-xs">
                    {member.department}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How to Reach Us Section */}
      <section className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">How to Reach Us</h2>
            <p className="text-xl text-muted-foreground">Visit our office or get in touch with our team</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="bg-card p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold text-foreground mb-4">Our Location</h3>
                <p className="text-muted-foreground mb-4">Mile 17, Buea<br />South West Region, Cameroon</p>
                <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3979.810072472209!2d9.700000000000003!3d4.15!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x10610d9e2f3f4e3f%3A0x4a9f0d3f3f3f3f3f!2sMile%2017%2C%20Buea!5e0!3m2!1sen!2scm!4v1620000000000!5m2!1sen!2scm" 
                    width="100%" 
                    height="300" 
                    style={{ border: 0 }} 
                    allowFullScreen 
                    loading="lazy"
                    className="rounded-lg"
                  ></iframe>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-card p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold text-foreground mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                      <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Phone</h4>
                      <a href="tel:676078168" className="text-muted-foreground hover:text-foreground transition-colors">
                        +237 676 07 81 68
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                      <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">WhatsApp</h4>
                      <a href="https://wa.me/237676078168" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                        Chat with us
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Email</h4>
                      <a href="mailto:info@successguaranteed.cm" className="text-muted-foreground hover:text-foreground transition-colors">
                        info@successguaranteed.cm
                      </a>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <h4 className="font-medium text-foreground mb-2">Office Hours</h4>
                    <p className="text-muted-foreground">
                      Monday - Friday: 8:00 AM - 6:00 PM<br />
                      Saturday: 9:00 AM - 2:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-card p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold text-foreground mb-4">Need Directions?</h3>
                <p className="text-muted-foreground mb-4">
                  Our office is located at Mile 17, Buea, easily accessible by public transport. 
                  Look for our signboard at the main road.
                </p>
                <a 
                  href="https://maps.google.com/maps?q=Mile+17+Buea" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
                >
                  Get Directions
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
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

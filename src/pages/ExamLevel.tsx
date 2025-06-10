
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, GraduationCap, BookOpen } from 'lucide-react';

const ExamLevel = () => {
  const navigate = useNavigate();

  const examLevels = [
    {
      id: 'CGCE_ORDINARY_LEVEL',
      name: 'CGCE Ordinary Level',
      description: 'General Certificate of Education Ordinary Level examination for students completing secondary school.',
      icon: BookOpen,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700'
    },
    {
      id: 'CGCE_ADVANCED_LEVEL',
      name: 'CGCE Advanced Level',
      description: 'General Certificate of Education Advanced Level examination for students seeking university admission.',
      icon: GraduationCap,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700'
    }
  ];

  const handleExamLevelSelect = (examLevel: string) => {
    // Store the selected exam level in localStorage for the registration process
    localStorage.setItem('selectedExamLevel', examLevel);
    navigate('/departments');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/20">
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Select Your Exam Level</h1>
                <p className="text-gray-600 dark:text-gray-300">Choose the examination level you are writing</p>
              </div>
            </div>
            <img src="/lovable-uploads/82c1802c-61d7-4b62-bfdc-cbf11c257601.png" alt="Success Guaranteed" className="h-12 w-auto" />
          </div>
        </div>
      </div>

      {/* Exam Level Selection */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">What Exam Are You Writing?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Select your examination level to continue with registration</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {examLevels.map((level) => {
              const IconComponent = level.icon;
              return (
                <Card key={level.id} className="group hover:scale-105 transition-all duration-300 backdrop-blur-md bg-white/90 dark:bg-gray-800/90 border-white/20 hover:shadow-2xl cursor-pointer">
                  <CardHeader className="text-center pb-4">
                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl ${level.color} ${level.hoverColor} text-white mb-4 group-hover:scale-110 transition-all duration-300 mx-auto`}>
                      <IconComponent className="w-10 h-10" />
                    </div>
                    <CardTitle className="text-2xl text-gray-900 dark:text-white">{level.name}</CardTitle>
                    <p className="text-gray-600 dark:text-gray-300">{level.description}</p>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <Button 
                      onClick={() => handleExamLevelSelect(level.id)}
                      className={`w-full ${level.color} ${level.hoverColor} text-white py-3 text-lg font-semibold`}
                    >
                      Select {level.name}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Contact Support */}
          <Card className="mt-12 backdrop-blur-md bg-gradient-to-r from-green-500/20 to-red-500/20 border-white/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Need Help Choosing?</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
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
    </div>
  );
};

export default ExamLevel;

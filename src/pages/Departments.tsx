
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const DEPARTMENTS = {
  'Computer Science & Engineering': {
    description: 'Advanced computing, software development, and digital systems',
    subjects: [
      { name: 'Algorithms & Data Structures', levels: ['Beginner', 'Intermediate', 'Advanced'] },
      { name: 'Database Systems', levels: ['Intermediate', 'Advanced'] },
      { name: 'Software Engineering', levels: ['Intermediate', 'Advanced'] },
      { name: 'Computer Networks', levels: ['Intermediate', 'Advanced'] },
      { name: 'Artificial Intelligence', levels: ['Advanced'] },
      { name: 'Machine Learning', levels: ['Advanced'] }
    ]
  },
  'Electrical Engineering': {
    description: 'Power systems, electronics, and electrical circuit design',
    subjects: [
      { name: 'Circuit Analysis', levels: ['Beginner', 'Intermediate', 'Advanced'] },
      { name: 'Power Systems', levels: ['Intermediate', 'Advanced'] },
      { name: 'Control Systems', levels: ['Intermediate', 'Advanced'] },
      { name: 'Electronics', levels: ['Beginner', 'Intermediate', 'Advanced'] },
      { name: 'Signal Processing', levels: ['Advanced'] },
      { name: 'Renewable Energy', levels: ['Intermediate', 'Advanced'] }
    ]
  },
  'Mechanical Engineering': {
    description: 'Design, manufacturing, and mechanical systems',
    subjects: [
      { name: 'Thermodynamics', levels: ['Beginner', 'Intermediate', 'Advanced'] },
      { name: 'Fluid Mechanics', levels: ['Intermediate', 'Advanced'] },
      { name: 'Machine Design', levels: ['Intermediate', 'Advanced'] },
      { name: 'Manufacturing Processes', levels: ['Beginner', 'Intermediate'] },
      { name: 'Heat Transfer', levels: ['Intermediate', 'Advanced'] },
      { name: 'CAD/CAM', levels: ['Beginner', 'Intermediate', 'Advanced'] }
    ]
  },
  'Civil Engineering': {
    description: 'Infrastructure, construction, and structural design',
    subjects: [
      { name: 'Structural Analysis', levels: ['Beginner', 'Intermediate', 'Advanced'] },
      { name: 'Concrete Design', levels: ['Intermediate', 'Advanced'] },
      { name: 'Steel Design', levels: ['Intermediate', 'Advanced'] },
      { name: 'Geotechnical Engineering', levels: ['Intermediate', 'Advanced'] },
      { name: 'Transportation Engineering', levels: ['Intermediate', 'Advanced'] },
      { name: 'Environmental Engineering', levels: ['Intermediate', 'Advanced'] }
    ]
  },
  'Medicine': {
    description: 'Medical sciences and healthcare',
    subjects: [
      { name: 'Anatomy', levels: ['Beginner', 'Intermediate', 'Advanced'] },
      { name: 'Physiology', levels: ['Beginner', 'Intermediate', 'Advanced'] },
      { name: 'Pathology', levels: ['Intermediate', 'Advanced'] },
      { name: 'Pharmacology', levels: ['Intermediate', 'Advanced'] },
      { name: 'Internal Medicine', levels: ['Advanced'] },
      { name: 'Surgery', levels: ['Advanced'] }
    ]
  },
  'Business Administration': {
    description: 'Management, finance, and business operations',
    subjects: [
      { name: 'Marketing', levels: ['Beginner', 'Intermediate', 'Advanced'] },
      { name: 'Finance', levels: ['Beginner', 'Intermediate', 'Advanced'] },
      { name: 'Operations Management', levels: ['Intermediate', 'Advanced'] },
      { name: 'Strategic Management', levels: ['Advanced'] },
      { name: 'Human Resources', levels: ['Intermediate', 'Advanced'] },
      { name: 'Entrepreneurship', levels: ['Beginner', 'Intermediate', 'Advanced'] }
    ]
  },
  'Law': {
    description: 'Legal studies and jurisprudence',
    subjects: [
      { name: 'Constitutional Law', levels: ['Beginner', 'Intermediate', 'Advanced'] },
      { name: 'Criminal Law', levels: ['Beginner', 'Intermediate', 'Advanced'] },
      { name: 'Civil Law', levels: ['Intermediate', 'Advanced'] },
      { name: 'Commercial Law', levels: ['Intermediate', 'Advanced'] },
      { name: 'International Law', levels: ['Advanced'] },
      { name: 'Legal Research', levels: ['Beginner', 'Intermediate', 'Advanced'] }
    ]
  },
  'Psychology': {
    description: 'Human behavior and mental processes',
    subjects: [
      { name: 'General Psychology', levels: ['Beginner', 'Intermediate', 'Advanced'] },
      { name: 'Cognitive Psychology', levels: ['Intermediate', 'Advanced'] },
      { name: 'Clinical Psychology', levels: ['Advanced'] },
      { name: 'Social Psychology', levels: ['Intermediate', 'Advanced'] },
      { name: 'Developmental Psychology', levels: ['Intermediate', 'Advanced'] },
      { name: 'Research Methods', levels: ['Beginner', 'Intermediate', 'Advanced'] }
    ]
  }
};

export default function Departments() {
  const navigate = useNavigate();
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

  const handleSelectDepartment = (department: string) => {
    setSelectedDepartment(selectedDepartment === department ? null : department);
  };

  const handleContinue = () => {
    if (selectedDepartment) {
      navigate('/exam-level', { 
        state: { 
          department: selectedDepartment,
          subjects: DEPARTMENTS[selectedDepartment as keyof typeof DEPARTMENTS].subjects
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Department</h1>
          <p className="text-lg text-gray-600">Select the department for your exam registration</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {Object.entries(DEPARTMENTS).map(([department, info]) => (
            <Card 
              key={department}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedDepartment === department 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleSelectDepartment(department)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{department}</CardTitle>
                <CardDescription>{info.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-2">Available Subjects:</p>
                  <div className="space-y-1">
                    {info.subjects.slice(0, 3).map((subject) => (
                      <div key={subject.name} className="flex justify-between">
                        <span>{subject.name}</span>
                        <span className="text-xs text-gray-500">
                          {subject.levels.length} levels
                        </span>
                      </div>
                    ))}
                    {info.subjects.length > 3 && (
                      <p className="text-xs text-gray-500 italic">
                        +{info.subjects.length - 3} more subjects
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedDepartment && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4">
              {selectedDepartment} - Available Subjects
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DEPARTMENTS[selectedDepartment as keyof typeof DEPARTMENTS].subjects.map((subject) => (
                <div key={subject.name} className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900">{subject.name}</h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {subject.levels.map((level) => (
                      <span 
                        key={level}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {level}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="text-center">
          <Button 
            onClick={handleContinue}
            disabled={!selectedDepartment}
            size="lg"
            className="px-8 py-3 text-lg"
          >
            Continue to Exam Level Selection
          </Button>
        </div>
      </div>
    </div>
  );
}

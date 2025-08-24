'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Check, Plus, X, Upload, DollarSign, Clock, Users, Star } from 'lucide-react';

export default function TutorApplicationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    location: '',
    
    // Education & Experience
    education: '',
    degree: '',
    university: '',
    graduationYear: '',
    teachingExperience: '',
    tutoringExperience: '',
    
    // Subjects & Skills
    subjects: [] as string[],
    hourlyRate: '',
    availability: [] as string[],
    
    // Profile
    bio: '',
    teachingStyle: '',
    whyTutor: '',
    
    // Verification
    backgroundCheck: false,
    references: '',
    
    // Agreement
    agreeToTerms: false,
    agreeToBackground: false,
  });

  const [newSubject, setNewSubject] = useState('');

  const subjects = [
    'Mathematics', 'Algebra', 'Geometry', 'Calculus', 'Statistics',
    'Physics', 'Chemistry', 'Biology', 'Science',
    'English', 'Writing', 'Literature', 'Reading',
    'History', 'Social Studies', 'Geography',
    'Spanish', 'French', 'German', 'Italian',
    'Programming', 'Computer Science', 'Web Development',
    'SAT Prep', 'ACT Prep', 'Test Prep',
    'Elementary', 'Middle School', 'High School', 'College'
  ];

  const availabilityOptions = [
    'Monday Morning', 'Monday Afternoon', 'Monday Evening',
    'Tuesday Morning', 'Tuesday Afternoon', 'Tuesday Evening',
    'Wednesday Morning', 'Wednesday Afternoon', 'Wednesday Evening',
    'Thursday Morning', 'Thursday Afternoon', 'Thursday Evening',
    'Friday Morning', 'Friday Afternoon', 'Friday Evening',
    'Saturday Morning', 'Saturday Afternoon', 'Saturday Evening',
    'Sunday Morning', 'Sunday Afternoon', 'Sunday Evening'
  ];

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSubject = (subject: string) => {
    if (!formData.subjects.includes(subject)) {
      handleInputChange('subjects', [...formData.subjects, subject]);
    }
  };

  const removeSubject = (subject: string) => {
    handleInputChange('subjects', formData.subjects.filter(s => s !== subject));
  };

  const addCustomSubject = () => {
    if (newSubject.trim() && !formData.subjects.includes(newSubject.trim())) {
      addSubject(newSubject.trim());
      setNewSubject('');
    }
  };

  const toggleAvailability = (slot: string) => {
    const current = formData.availability;
    const updated = current.includes(slot)
      ? current.filter(s => s !== slot)
      : [...current, slot];
    handleInputChange('availability', updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreeToTerms || !formData.agreeToBackground) {
      toast.error('Please agree to all terms and conditions');
      return;
    }

    if (formData.subjects.length === 0) {
      toast.error('Please select at least one subject to teach');
      return;
    }

    // Simulate application submission
    toast.success('Application submitted successfully! We will review your application and contact you within 2-3 business days.');
    router.push('/');
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Personal Information</h2>
              <p className="text-gray-600 mb-6">Tell us about yourself to get started.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="location">Location (City, State) *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., New York, NY"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Education & Experience</h2>
              <p className="text-gray-600 mb-6">Share your educational background and teaching experience.</p>
            </div>

            <div>
              <Label htmlFor="education">Highest Level of Education *</Label>
              <Select onValueChange={(value) => handleInputChange('education', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your education level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high-school">High School Diploma</SelectItem>
                  <SelectItem value="associates">Associate's Degree</SelectItem>
                  <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                  <SelectItem value="masters">Master's Degree</SelectItem>
                  <SelectItem value="doctorate">Doctorate/PhD</SelectItem>
                  <SelectItem value="professional">Professional Degree</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="degree">Degree/Major</Label>
                <Input
                  id="degree"
                  value={formData.degree}
                  onChange={(e) => handleInputChange('degree', e.target.value)}
                  placeholder="e.g., Mathematics, English Literature"
                />
              </div>
              <div>
                <Label htmlFor="university">University/Institution</Label>
                <Input
                  id="university"
                  value={formData.university}
                  onChange={(e) => handleInputChange('university', e.target.value)}
                  placeholder="e.g., Harvard University"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="graduationYear">Graduation Year</Label>
              <Input
                id="graduationYear"
                type="number"
                min="1950"
                max="2030"
                value={formData.graduationYear}
                onChange={(e) => handleInputChange('graduationYear', e.target.value)}
                placeholder="e.g., 2020"
              />
            </div>

            <div>
              <Label htmlFor="teachingExperience">Teaching Experience</Label>
              <Select onValueChange={(value) => handleInputChange('teachingExperience', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your teaching experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No formal teaching experience</SelectItem>
                  <SelectItem value="less-than-1">Less than 1 year</SelectItem>
                  <SelectItem value="1-2">1-2 years</SelectItem>
                  <SelectItem value="3-5">3-5 years</SelectItem>
                  <SelectItem value="5-10">5-10 years</SelectItem>
                  <SelectItem value="10-plus">10+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tutoringExperience">Tutoring Experience</Label>
              <Select onValueChange={(value) => handleInputChange('tutoringExperience', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your tutoring experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No tutoring experience</SelectItem>
                  <SelectItem value="less-than-1">Less than 1 year</SelectItem>
                  <SelectItem value="1-2">1-2 years</SelectItem>
                  <SelectItem value="3-5">3-5 years</SelectItem>
                  <SelectItem value="5-10">5-10 years</SelectItem>
                  <SelectItem value="10-plus">10+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Subjects & Availability</h2>
              <p className="text-gray-600 mb-6">What subjects can you teach and when are you available?</p>
            </div>

            <div>
              <Label className="text-base font-medium mb-3 block">Subjects You Can Teach *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                {subjects.map((subject) => (
                  <div
                    key={subject}
                    onClick={() => addSubject(subject)}
                    className={`p-2 text-sm border rounded cursor-pointer transition-colors ${
                      formData.subjects.includes(subject)
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {subject}
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mb-4">
                <Input
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Add custom subject"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSubject())}
                />
                <Button type="button" onClick={addCustomSubject} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.subjects.map((subject) => (
                  <Badge key={subject} variant="secondary" className="flex items-center gap-1">
                    {subject}
                    <button
                      type="button"
                      onClick={() => removeSubject(subject)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="hourlyRate">Desired Hourly Rate (USD) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="hourlyRate"
                  type="number"
                  min="15"
                  max="200"
                  value={formData.hourlyRate}
                  onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                  className="pl-10"
                  placeholder="e.g., 45"
                  required
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">Most tutors charge between $20-$80 per hour</p>
            </div>

            <div>
              <Label className="text-base font-medium mb-3 block">Availability</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {availabilityOptions.map((slot) => (
                  <div key={slot} className="flex items-center space-x-2">
                    <Checkbox
                      id={slot}
                      checked={formData.availability.includes(slot)}
                      onCheckedChange={() => toggleAvailability(slot)}
                    />
                    <Label htmlFor={slot} className="text-sm">
                      {slot}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Profile & Verification</h2>
              <p className="text-gray-600 mb-6">Complete your profile and agree to our verification process.</p>
            </div>

            <div>
              <Label htmlFor="bio">About You *</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
                placeholder="Tell students about yourself, your background, and what makes you a great tutor..."
                required
              />
            </div>

            <div>
              <Label htmlFor="teachingStyle">Teaching Style</Label>
              <Textarea
                id="teachingStyle"
                value={formData.teachingStyle}
                onChange={(e) => handleInputChange('teachingStyle', e.target.value)}
                rows={3}
                placeholder="Describe your teaching approach and methods..."
              />
            </div>

            <div>
              <Label htmlFor="whyTutor">Why do you want to tutor?</Label>
              <Textarea
                id="whyTutor"
                value={formData.whyTutor}
                onChange={(e) => handleInputChange('whyTutor', e.target.value)}
                rows={3}
                placeholder="Share your motivation for becoming a tutor..."
              />
            </div>

            <div>
              <Label htmlFor="references">References (Optional)</Label>
              <Textarea
                id="references"
                value={formData.references}
                onChange={(e) => handleInputChange('references', e.target.value)}
                rows={2}
                placeholder="Provide contact information for professional or academic references..."
              />
            </div>

            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="agreeToBackground"
                  checked={formData.agreeToBackground}
                  onCheckedChange={(checked) => handleInputChange('agreeToBackground', checked)}
                  required
                />
                <Label htmlFor="agreeToBackground" className="text-sm">
                  I agree to undergo a background check as part of the verification process. *
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked)}
                  required
                />
                <Label htmlFor="agreeToTerms" className="text-sm">
                  I agree to TutorConnect's{' '}
                  <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>. *
                </Label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Become a TutorConnect Tutor
          </h1>
          <p className="text-xl mb-8 opacity-90">
            Share your knowledge, set your own schedule, and earn up to $80+ per hour
          </p>
          
          <div className="grid md:grid-cols-4 gap-6 mt-12">
            <div className="text-center">
              <div className="bg-white/20 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <DollarSign className="h-8 w-8" />
              </div>
              <h3 className="font-semibold mb-2">Earn More</h3>
              <p className="text-sm opacity-80">Set your own rates and keep 85% of earnings</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white/20 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Clock className="h-8 w-8" />
              </div>
              <h3 className="font-semibold mb-2">Flexible Schedule</h3>
              <p className="text-sm opacity-80">Work when and where you want</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white/20 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="font-semibold mb-2">Help Students</h3>
              <p className="text-sm opacity-80">Make a real impact on learning</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white/20 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Star className="h-8 w-8" />
              </div>
              <h3 className="font-semibold mb-2">Join the Best</h3>
              <p className="text-sm opacity-80">Be part of our top-rated platform</p>
            </div>
          </div>
        </div>
      </section>

      <div className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                    step <= currentStep 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step < currentStep ? <Check className="h-5 w-5" /> : step}
                  </div>
                  {step < 4 && (
                    <div className={`flex-1 h-1 mx-4 ${
                      step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>Personal Info</span>
              <span>Education</span>
              <span>Subjects</span>
              <span>Profile</span>
            </div>
          </div>

          {/* Application Form */}
          <Card>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit}>
                {renderStepContent()}

                <div className="flex justify-between mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                  >
                    Previous
                  </Button>
                  
                  {currentStep < 4 ? (
                    <Button type="button" onClick={nextStep}>
                      Next Step
                    </Button>
                  ) : (
                    <Button 
                      type="submit" 
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={!formData.agreeToTerms || !formData.agreeToBackground}
                    >
                      Submit Application
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="mt-12 grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>What happens next?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                      <Check className="h-3 w-3 text-blue-600" />
                    </div>
                    <span>We review your application within 2-3 business days</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                      <Check className="h-3 w-3 text-blue-600" />
                    </div>
                    <span>Background check and verification process</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                      <Check className="h-3 w-3 text-blue-600" />
                    </div>
                    <span>Profile setup and onboarding</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                      <Check className="h-3 w-3 text-blue-600" />
                    </div>
                    <span>Start receiving student requests!</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 rounded-full p-1 mt-0.5">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                    <span>18+ years old</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 rounded-full p-1 mt-0.5">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                    <span>Subject matter expertise</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 rounded-full p-1 mt-0.5">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                    <span>Pass background check</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 rounded-full p-1 mt-0.5">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                    <span>Reliable internet connection</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
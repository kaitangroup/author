'use client';

import { useEffect, useState } from 'react';
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
import { Check, Plus, X, DollarSign, Clock, Users, Star } from 'lucide-react';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
  degree: string;
  hourlyRate: string;
  subjects: string[];
  education: string;
  experience: string;
  languages: string[];
  avatar: string;
  availability: string[];
  teachingExperience: string;
  agreeToTerms: boolean;
  teachingStyle?: string;
  dateOfBirth?: string;
  university?: string;
  graduationYear?: string;
  tutoringExperience?: string;
  whyTutor?: string;
  references?: string;
  agreeToBackground?: boolean;
}

export default function TutorApplicationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.NEXT_PUBLIC_WP_URL;
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    degree: '',
    hourlyRate: '',
    subjects: [],
    education: '',
    experience: '',
    languages: [],
    avatar: '',
    availability: [],
    teachingExperience: '',
    agreeToTerms: false,
    teachingStyle: '',
    dateOfBirth: '',
    university: '',
    graduationYear: '',
    tutoringExperience: '',
    whyTutor: '',
    references: '',
    agreeToBackground: false,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('wpToken');
        const res = await fetch(`${apiUrl}wp-json/custom/v1/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();
        setProfileData(prev => ({
          ...prev,
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          email: data.email || '',
          phone: data.phone || '',
          bio: data.bio || '',
          degree: data.degree || '',
          location: data.location || '',
          hourlyRate: data.hourly_rate || '',
          subjects: data.subjects || [],
          dateOfBirth: data.date_of_birth || '',
          education: data.education || '',
          teachingExperience: data.teaching_experience || '',
          experience: data.experience || '',
          languages: data.languages || [],
          teachingStyle: data.teaching_style || '',
          availability: data.availability || [],
          avatar: data.avatar_urls?.['96'] || '',
          agreeToBackground: data.agree_to_background || false,
          agreeToTerms: data.agree_to_terms || false,
          university: data.university || '',
          graduationYear: data.graduation_year || '',
          tutoringExperience: data.tutoring_experience || '',
          whyTutor: data.why_tutor || '',
          references: data.references || '',
        }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const [newSubject, setNewSubject] = useState('');

  const subjects = [
    'Romance', 'Science Fiction & Fantasy', 'Mystery, Thriller & Suspense', 'Self-help', 'History',
    'Childrens Books', 'Literature & Fiction', 'Biographies & Memoirs',
    'Arts & Photography', 'Computers & Technology', 'Crafts, Hobbies & Home', 'Education & Teaching',
    'Engineering & Transportation', 'Health, Humor & Entertainment', 'Medical Books',
    'Politics & Social Sciences', 'Religion & Spirituality', 'Science & Math',
    'Sports & Outdoors', 'Test Preparation', 'Travel',
    'Editors Picks', 'Teacher Picks',
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

  const handleInputChange = (field: keyof ProfileData, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' })); // clear error
  };

  const addSubject = (subject: string) => {
    if (subject.trim() && !profileData.subjects.includes(subject.trim())) {
      setProfileData(prev => ({
        ...prev,
        subjects: [...prev.subjects, subject.trim()],
      }));
      setErrors(prev => ({ ...prev, subjects: '' }));
    }
  };

  const addCustomSubject = () => {
    if (newSubject.trim() && !profileData.subjects.includes(newSubject.trim())) {
      setProfileData(prev => ({
        ...prev,
        subjects: [...prev.subjects, newSubject.trim()],
      }));
      setNewSubject('');
      setErrors(prev => ({ ...prev, subjects: '' }));
    }
  };

  const removeSubject = (subject: string) => {
    setProfileData(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s !== subject),
    }));
  };

  const toggleAvailability = (slot: string) => {
    const updated = profileData.availability.includes(slot)
      ? profileData.availability.filter(s => s !== slot)
      : [...profileData.availability, slot];
    handleInputChange('availability', updated);
  };

  const validateStep = (step: number) => {
    const newErrors: { [key: string]: string } = {};

    switch (step) {
      case 1:
        if (!profileData.firstName) newErrors.firstName = "First name is required";
        if (!profileData.lastName) newErrors.lastName = "Last name is required";
        if (!profileData.email) newErrors.email = "Email is required";
        if (!profileData.phone) newErrors.phone = "Phone number is required";
        if (!profileData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
        if (!profileData.location) newErrors.location = "Location is required";
        break;

      case 2:
        if (!profileData.education) newErrors.education = "Education is required";
      // console.log('Validating education:', profileData.education);
      // newErrors.education = "Education is required";
        break;

      case 3:
        if (profileData.subjects.length === 0) newErrors.subjects = "Select at least one subject";
        if (!profileData.hourlyRate) newErrors.hourlyRate = "Hourly rate is required";
        break;

      case 4:
        if (!profileData.bio) newErrors.bio = "Bio is required";
        if (!profileData.agreeToBackground) newErrors.agreeToBackground = "You must agree to background check";
        if (!profileData.agreeToTerms) newErrors.agreeToTerms = "You must agree to Terms of Service";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateStep(4)) return;

    try {
      const token = localStorage.getItem("wpToken");
      const res = await fetch(`${apiUrl}/wp-json/custom/v1/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      const data = await res.json();
      toast.success(data.message || "Profile updated");
      router.push('/');
    } catch (err) {
      toast.error("Failed to update profile");
      console.error(err);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Personal Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>First Name *</Label>
                <Input
                  value={profileData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className={errors.firstName ? "border-red-500" : ""}
                />
                {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
              </div>
              <div>
                <Label>Last Name *</Label>
                <Input
                  value={profileData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className={errors.lastName ? "border-red-500" : ""}
                />
                {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
              </div>
            </div>
  
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>
              <div>
                <Label>Phone *</Label>
                <Input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
              </div>
            </div>
  
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Date of Birth *</Label>
                <Input
                  type="date"
                  value={profileData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  className={errors.dateOfBirth ? "border-red-500" : ""}
                />
                {errors.dateOfBirth && <p className="text-red-500 text-sm">{errors.dateOfBirth}</p>}
              </div>
              <div>
                <Label>Location *</Label>
                <Input
                  value={profileData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  className={errors.location ? "border-red-500" : ""}
                />
                {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
              </div>
            </div>
          </div>
        );
  
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Education & Experience</h2>
  
            <div>
              <Label>Highest Level of Education *</Label>
              <Select
                value={profileData.education}
                onValueChange={(value) => handleInputChange("education", value)}
              >
                <SelectTrigger className={errors.education ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select your education level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high-school">High School Diploma</SelectItem>
                  <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                  <SelectItem value="masters">Master's Degree</SelectItem>
                  <SelectItem value="doctorate">Doctorate/PhD</SelectItem>
                </SelectContent>
              </Select>
              {errors.education && <p className="text-red-500 text-sm">{errors.education}</p>}
            </div>
  
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Degree/Major</Label>
                <Input
                  value={profileData.degree}
                  onChange={(e) => handleInputChange("degree", e.target.value)}
                />
              </div>
              <div>
                <Label>University</Label>
                <Input
                  value={profileData.university}
                  onChange={(e) => handleInputChange("university", e.target.value)}
                />
              </div>
            </div>
  
            <div>
              <Label>Graduation Year</Label>
              <Input
                type="number"
                value={profileData.graduationYear}
                onChange={(e) => handleInputChange("graduationYear", e.target.value)}
              />
            </div>
          </div>
        );
  
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Subjects & Availability</h2>
  
            <div>
              <Label>Subjects You Can Teach *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2">
                {subjects.map((subject) => (
                  <div
                    key={subject}
                    onClick={() => addSubject(subject)}
                    className={`p-2 text-sm border rounded cursor-pointer ${
                      profileData.subjects.includes(subject)
                        ? "bg-blue-100 border-blue-300 text-blue-700"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    {subject}
                  </div>
                ))}
              </div>
              {errors.subjects && <p className="text-red-500 text-sm">{errors.subjects}</p>}
            </div>
  
            <div>
              <Label>Desired Hourly Rate (USD) *</Label>
              <Input
                type="number"
                value={profileData.hourlyRate}
                onChange={(e) => handleInputChange("hourlyRate", e.target.value)}
                className={errors.hourlyRate ? "border-red-500" : ""}
              />
              {errors.hourlyRate && <p className="text-red-500 text-sm">{errors.hourlyRate}</p>}
            </div>
          </div>
        );
  
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Profile & Verification</h2>
  
            <div>
              <Label>About You *</Label>
              <Textarea
                value={profileData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                className={errors.bio ? "border-red-500" : ""}
              />
              {errors.bio && <p className="text-red-500 text-sm">{errors.bio}</p>}
            </div>
  
            <div className="flex items-start space-x-3">
              <Checkbox
                checked={profileData.agreeToBackground}
                onCheckedChange={(checked) => handleInputChange("agreeToBackground", checked)}
                className={errors.agreeToBackground ? "border-red-500" : ""}
              />
              <Label>I agree to background check *</Label>
            </div>
            {errors.agreeToBackground && <p className="text-red-500 text-sm">{errors.agreeToBackground}</p>}
  
            <div className="flex items-start space-x-3">
              <Checkbox
                checked={profileData.agreeToTerms}
                onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked)}
                className={errors.agreeToTerms ? "border-red-500" : ""}
              />
              <Label>I agree to Terms of Service *</Label>
            </div>
            {errors.agreeToTerms && <p className="text-red-500 text-sm">{errors.agreeToTerms}</p>}
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
            Become an AuthorConnect Author
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
              <form >
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
                    type="button"  // changed from submit
                    onClick={handleSubmit}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={!profileData.agreeToTerms || !profileData.agreeToBackground}
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
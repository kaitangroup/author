'use client';

import { useEffect, useRef, useState } from 'react';
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
import { Check, Plus, X, DollarSign, Clock, Users, Star, Camera } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@radix-ui/react-avatar';

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
  instantBook?: boolean;
  AvailableInPerson?: boolean;
}

export default function TutorApplicationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
   const apiUrl2 = (process.env.NEXT_PUBLIC_WP_URL || '').replace(/\/+$/, '');
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.NEXT_PUBLIC_WP_URL;
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // 🔹 avatar upload helpers
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

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
    instantBook: false,
    AvailableInPerson: false,
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
          avatar:
            (data.avatar ) ||
            '',
          agreeToBackground: data.agree_to_background || false,
          agreeToTerms: data.agree_to_terms || false,
          university: data.university || '',
          graduationYear: data.graduation_year || '',
          tutoringExperience: data.tutoring_experience || '',
          whyTutor: data.why_tutor || '',
          references: data.references || '',
          instantBook: data.instant_book || false,
          AvailableInPerson: data.available_in_person || false,
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
        break;

      case 3:
        if (profileData.subjects.length === 0) newErrors.subjects = "Select at least one subject";
        if (!profileData.hourlyRate) newErrors.hourlyRate = "Hourly rate is required";
        break;

      case 4:
        if (!profileData.bio) newErrors.bio = "Bio is required";
        if (!profileData.agreeToBackground) newErrors.agreeToBackground = "You must agree to background check";
        if (!profileData.agreeToTerms) newErrors.agreeToTerms = "You must agree to Terms of Service";
        if (!profileData.instantBook) newErrors.instantBook = "You must agree to Terms of Service";
        if (!profileData.AvailableInPerson) newErrors.AvailableInPerson = "You must agree to Terms of Service";
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

 // ================== AVATAR UPLOAD (Simple Local Avatars) ==================
  const handleAvatarButton = () => fileInputRef.current?.click();

  const onPickAvatar: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // small validations
    const okTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!okTypes.includes(file.type)) {
      toast.error('Please select a JPG/PNG/GIF/WEBP image');
      e.currentTarget.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Max 5MB image allowed');
      e.currentTarget.value = '';
      return;
    }

    const token = localStorage.getItem('wpToken');
    if (!token) {
      toast.error('Not signed in');
      return;
    }
    if (!apiUrl2) {
      toast.error('WP URL not configured');
      return;
    }

    try {
      setUploadingAvatar(true);

      // 1) upload to media
      const fd = new FormData();
      fd.append('file', file, file.name);

      const mediaRes = await fetch(`${apiUrl2}/wp-json/wp/v2/media`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // DO NOT set Content-Type manually for FormData
        } as any,
        body: fd,
      });

      if (!mediaRes.ok) {
        const t = await mediaRes.text().catch(() => '');
        throw new Error(`Media upload failed: ${mediaRes.status} ${t || mediaRes.statusText}`);
      }

      const media = await mediaRes.json();
      const attachmentId = media?.id;
      const sourceUrl: string | undefined = media?.source_url;

      if (!attachmentId) throw new Error('Upload ok but no attachment id returned');

      // 2) set as local avatar via REST
      const setRes = await fetch(`${apiUrl2}/wp-json/wp/v2/users/me`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          simple_local_avatar: { media_id: attachmentId },
        }),
      });

      if (!setRes.ok) {
        const t = await setRes.text().catch(() => '');
        throw new Error(`Set avatar failed: ${setRes.status} ${t || setRes.statusText}`);
      }

      // 3) refetch current user to get fresh avatar_urls
      const meRes = await fetch(`${apiUrl2}/wp-json/wp/v2/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!meRes.ok) {
        // fallback: preview with uploaded image URL
        if (sourceUrl) {
          setProfileData((prev) => (prev ? { ...prev, avatar: sourceUrl } : prev));
        }
        toast.success('Avatar updated');
        return;
      }

      const me = await meRes.json();
      const newAvatar: string =
        me?.avatar_urls?.['96'] || me?.avatar_urls?.['48'] || me?.avatar_urls?.['24'] || sourceUrl || '';

      setProfileData((prev) => (prev ? { ...prev, avatar: newAvatar } : prev));
      toast.success('Avatar updated');
    } catch (err: any) {
      console.error(err);
      const msg =
        /not allowed to create media/i.test(err?.message || '') ?
          'Your account does not have permission to upload media' :
          err?.message || 'Avatar upload failed';
      toast.error(msg);
    } finally {
      setUploadingAvatar(false);
      // clear input so same file can be picked again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ==========================================================================



  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateStep(4)) return;

    try {
      const token = localStorage.getItem("wpToken");
      const res = await fetch(`${apiUrl}wp-json/custom/v1/profile`, {
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
            {/* Profile Photo */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Photo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                 <Avatar className="h-24 w-24 rounded-full overflow-hidden ring-2 ring-white">
                    <AvatarImage
                      src={profileData?.avatar || ''}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                    <AvatarFallback className="h-full w-full flex items-center justify-center rounded-full bg-gray-200 text-lg">
                      {(profileData?.firstName?.[0] || '') + (profileData?.lastName?.[0] || '')}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onPickAvatar}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAvatarButton}
                      disabled={uploadingAvatar}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      {uploadingAvatar ? 'Uploading...' : 'Change Photo'}
                    </Button>
                    <p className="text-sm text-gray-500 mt-2">
                      Upload a professional photo. JPG, PNG, GIF or WEBP. Max size 5MB.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
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
            <div>
              <h2 className="text-2xl font-bold mb-4">Education & Experience</h2>
              <p className="text-gray-600 mb-6">Share your educational background and teaching experience.</p>
            </div>

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
                <Label htmlFor="degree">Degree/Major</Label>
                <Input
                  id="degree"
                  value={profileData?.degree}
                  onChange={(e) => handleInputChange('degree', e.target.value)}
                  placeholder="e.g., Mathematics, English Literature"
                />
              </div>
              <div>
                <Label htmlFor="university">University/Institution</Label>
                <Input
                  id="university"
                  value={profileData.university}
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
                value={profileData.graduationYear}
                onChange={(e) => handleInputChange('graduationYear', e.target.value)}
                placeholder="e.g., 2020"
              />
            </div>

            

            <div>
              <Label htmlFor="teachingExperience">Teaching Experience</Label>
              <Select
                value={profileData.teachingExperience}
                onValueChange={(value) => handleInputChange('teachingExperience', value)}
              >

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
              {/* <Select onValueChange={(value) => handleInputChange('tutoringExperience', value)}> */}
              <Select
                value={profileData.tutoringExperience}
                onValueChange={(value) => handleInputChange('tutoringExperience', value)}
              >

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
                      profileData.subjects.includes(subject)
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
                {profileData?.subjects.map((subject) => (
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
              {errors.subjects && <p className="text-red-500 text-sm">{errors.subjects}</p>}
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
                  value={profileData?.hourlyRate}
                  onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                  className="pl-10"
                  placeholder="e.g., 45"
                  required
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">Most tutors charge between $20-$80 per hour</p>
              {errors.hourlyRate && <p className="text-red-500 text-sm">{errors.hourlyRate}</p>}
            </div>

            <div>
              <Label className="text-base font-medium mb-3 block">Availability</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {availabilityOptions.map((slot) => (
                  <div key={slot} className="flex items-center space-x-2">
                    <Checkbox
                      id={slot}
                      checked={profileData?.availability.includes(slot)}
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
            <div className="flex items-start space-x-3">
                <Checkbox
                  id="instantBook"
                  checked={profileData.instantBook}
                  onCheckedChange={(checked) => handleInputChange('instantBook', checked)}
                />
                <Label htmlFor="instantBook" className="text-sm">
                  I am available for Instant Book
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="AvailableInPerson"
                  checked={profileData.AvailableInPerson}
                  onCheckedChange={(checked) => handleInputChange('AvailableInPerson', checked)}
                />
                <Label htmlFor="AvailableInPerson" className="text-sm">
                  I am Available In Person
                </Label>
              </div>

            <div>
              <Label htmlFor="bio">About You *</Label>
              <Textarea
                id="bio"
                value={profileData?.bio}
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
                value={profileData?.teachingStyle}
                onChange={(e) => handleInputChange('teachingStyle', e.target.value)}
                rows={3}
                placeholder="Describe your teaching approach and methods..."
              />
            </div>

            <div>
              <Label htmlFor="whyTutor">Why do you want to tutor?</Label>
              <Textarea
                id="whyTutor"
                value={profileData.whyTutor}
                onChange={(e) => handleInputChange('whyTutor', e.target.value)}
                rows={3}
                placeholder="Share your motivation for becoming a tutor..."
              />
            </div>

            <div>
              <Label htmlFor="references">References (Optional)</Label>
              <Textarea
                id="references"
                value={profileData.references}
                onChange={(e) => handleInputChange('references', e.target.value)}
                rows={2}
                placeholder="Provide contact information for professional or academic references..."
              />
            </div>

            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="agreeToBackground"
                  checked={profileData.agreeToBackground}
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
                  checked={profileData.agreeToTerms}
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
                    disabled={!profileData.agreeToTerms || !profileData.agreeToBackground  }
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
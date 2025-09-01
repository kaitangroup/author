'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Camera, Plus, X } from 'lucide-react';
interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
  hourlyRate: string;
  subjects: string[];
  education: string;
  experience: string;
  languages: string[];
  avatar: string;
}

export default function ProfileEditPage() {
  const [userType] = useState<'student' | 'tutor'>('tutor'); // This would come from auth context
  

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('wpToken'); // or however you store JWT
        console.log("Fetching profile with token:", token);
        const res = await fetch('http://authorproback.me/wp-json/custom/v1/profile', {
          headers: {
            Authorization: `Bearer ${token}`, // if using JWT authentication
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();

        // Map WP response to your ProfileData shape
        setProfileData({
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          email: data.email || '',
          phone: data.meta?.phone || '+8801711053387',
          bio: data.description || '',
          location: data.meta?.location || 'New York, NY',
          hourlyRate: data.meta?.hourlyRate || '45',
          subjects: data.meta?.subjects || ['Mathematics', 'Algebra', 'Calculus', 'Statistics'],
          education: data.meta?.education || 'PhD Mathematics, Columbia University',
          experience: data.meta?.experience || '8+ years',
          languages: data.meta?.languages || ['English', 'Spanish'],
          avatar: data.avatar_urls?.['96'] || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const [newSubject, setNewSubject] = useState('');
  const [newLanguage, setNewLanguage] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => prev ? { ...prev, [field]: value } : null);
  };

  const addSubject = () => {
    if (profileData && newSubject.trim() && !profileData?.subjects.includes(newSubject.trim())) {
      setProfileData(prev => prev ? {
        ...prev,
        subjects: [...prev.subjects, newSubject.trim()]
      } : null);
      setNewSubject('');
    }
  };

  const removeSubject = (subject: string) => {
    setProfileData(prev => prev ? {
      ...prev,
      subjects: prev.subjects.filter(s => s !== subject)
    } : null);
  };

  const addLanguage = () => {
    if (profileData && newLanguage.trim() && !profileData?.languages.includes(newLanguage.trim())) {
      setProfileData(prev => prev ? {
        ...prev,
        languages: [...prev.languages, newLanguage.trim()]
      } : null);
      setNewLanguage('');
    }
  };

  const removeLanguage = (language: string) => {
    setProfileData(prev => prev ? {
      ...prev,
      languages: prev.languages.filter(l => l !== language)
    } : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("wpToken");
      const res = await fetch('http://authorproback.me/wp-json/custom/v1/profile', {
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
    } catch (err) {
      toast.error("Failed to update profile");
      console.error(err);
    }
  };

  const handleAvatarChange = () => {
    // Simulate avatar upload
    toast.info('Avatar upload would be implemented here');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Edit Profile</h1>
            <p className="text-gray-600">Update your profile information and preferences.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Photo */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Photo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profileData?.avatar || ''} alt="Profile" />
                    <AvatarFallback>{profileData?.firstName[0]}{profileData?.lastName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Button type="button" variant="outline" onClick={handleAvatarChange}>
                      <Camera className="h-4 w-4 mr-2" />
                      Change Photo
                    </Button>
                    <p className="text-sm text-gray-500 mt-2">
                      Upload a professional photo. JPG, PNG or GIF. Max size 5MB.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={profileData?.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={profileData?.lastName}
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
                      value={profileData?.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profileData?.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profileData?.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="City, State"
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData?.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={4}
                    placeholder="Tell students about yourself, your teaching style, and experience..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tutor-specific fields */}
            {userType === 'tutor' && (
              <>
                {/* Teaching Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Teaching Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                        <Input
                          id="hourlyRate"
                          type="number"
                          value={profileData?.hourlyRate}
                          onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                          min="10"
                          max="200"
                        />
                      </div>
                      <div>
                        <Label htmlFor="experience">Years of Experience</Label>
                        <Select 
                          value={profileData?.experience} 
                          onValueChange={(value) => handleInputChange('experience', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-2 years">1-2 years</SelectItem>
                            <SelectItem value="3-5 years">3-5 years</SelectItem>
                            <SelectItem value="5-8 years">5-8 years</SelectItem>
                            <SelectItem value="8+ years">8+ years</SelectItem>
                            <SelectItem value="10+ years">10+ years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="education">Education</Label>
                      <Input
                        id="education"
                        value={profileData?.education}
                        onChange={(e) => handleInputChange('education', e.target.value)}
                        placeholder="Degree, Institution"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Subjects */}
                <Card>
                  <CardHeader>
                    <CardTitle>Subjects I Teach</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                    
                    <div className="flex gap-2">
                      <Input
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        placeholder="Add a subject"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubject())}
                      />
                      <Button type="button" onClick={addSubject} variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Languages */}
                <Card>
                  <CardHeader>
                    <CardTitle>Languages</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {profileData?.languages.map((language) => (
                        <Badge key={language} variant="secondary" className="flex items-center gap-1">
                          {language}
                          <button
                            type="button"
                            onClick={() => removeLanguage(language)}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <Input
                        value={newLanguage}
                        onChange={(e) => setNewLanguage(e.target.value)}
                        placeholder="Add a language"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                      />
                      <Button type="button" onClick={addLanguage} variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Save Button */}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline">
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
'use client';

import { useEffect, useRef, useState } from 'react';
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
  const [userType] = useState<'student' | 'tutor'>('tutor');
  const apiUrl = (process.env.NEXT_PUBLIC_WP_URL || '').replace(/\/+$/, '');

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 avatar upload helpers
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('wpToken');
        const res = await fetch(`${apiUrl}/wp-json/custom/v1/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();

        setProfileData({
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          email: data.email || '',
          phone: data.phone || '',
          bio: data.bio || '',
          location: data.location || '',
          hourlyRate: data.hourlyRate || '',
          subjects: data.subjects || '',
          education: data.education || '',
          experience: data.experience || '',
          languages: data.languages || [''],
          avatar:
            (data.avatar ) ||
            '',
        });
        
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (apiUrl) fetchProfile();
  }, [apiUrl]);

  const [newSubject, setNewSubject] = useState('');
  const [newLanguage, setNewLanguage] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => (prev ? { ...prev, [field]: value } : null));
  };

  const addSubject = () => {
    if (profileData && newSubject.trim() && !profileData.subjects.includes(newSubject.trim())) {
      setProfileData(prev => (prev ? { ...prev, subjects: [...prev.subjects, newSubject.trim()] } : null));
      setNewSubject('');
    }
  };

  const removeSubject = (subject: string) => {
    setProfileData(prev => (prev ? { ...prev, subjects: prev.subjects.filter(s => s !== subject) } : null));
  };

  const addLanguage = () => {
    if (profileData && newLanguage.trim() && !profileData.languages.includes(newLanguage.trim())) {
      setProfileData(prev => (prev ? { ...prev, languages: [...prev.languages, newLanguage.trim()] } : null));
      setNewLanguage('');
    }
  };

  const removeLanguage = (language: string) => {
    setProfileData(prev => (prev ? { ...prev, languages: prev.languages.filter(l => l !== language) } : null));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('wpToken');
      const res = await fetch(`${apiUrl}/wp-json/custom/v1/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      const data = await res.json();
      toast.success(data.message || 'Profile updated');
    } catch (err) {
      toast.error('Failed to update profile');
      console.error(err);
    }
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
    if (!apiUrl) {
      toast.error('WP URL not configured');
      return;
    }

    try {
      setUploadingAvatar(true);

      // 1) upload to media
      const fd = new FormData();
      fd.append('file', file, file.name);

      const mediaRes = await fetch(`${apiUrl}/wp-json/wp/v2/media`, {
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
      const setRes = await fetch(`${apiUrl}/wp-json/wp/v2/users/me`, {
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
      const meRes = await fetch(`${apiUrl}/wp-json/wp/v2/users/me`, {
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
                    <AvatarFallback>
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
                      value={profileData?.firstName || ''}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={profileData?.lastName || ''}
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
                      value={profileData?.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profileData?.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profileData?.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="City, State"
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData?.bio || ''}
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

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline">Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}

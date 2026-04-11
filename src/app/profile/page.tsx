'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, User, LogOut, Settings, Mail, Building } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  name: string;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  role: string | null;
}

// MeView returns UserData directly
type ProfileData = UserData;

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        const response = await fetch('https://crewsynx.switchspace.in/api/v1/auth/me/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          // Token expired, could implement refresh here, but for now just logout
          handleLogout();
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setProfile(data.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await fetch('https://crewsynx.switchspace.in/api/v1/auth/logout/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      } catch (e) {
        console.error("Logout request failed", e);
      }
    }

    // Clear storage regardless of API response
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <p className="text-destructive font-semibold">Error: {error || 'Could not load profile'}</p>
        <Button onClick={handleLogout} variant="outline">Back to Login</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Profile Overview</h1>
          <p className="text-muted-foreground mt-1">Manage your account settings and preferences.</p>
        </div>
        <Button variant="destructive" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5 text-primary" />
              Personal Information
            </CardTitle>
            <CardDescription>Your basic profile data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-lg">
              <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center text-2xl font-bold uppercase">
                {profile.name ? profile.name[0] : profile.email[0]}
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  {profile.name || 'Anonymous User'}
                </h3>
                <p className="text-muted-foreground flex items-center mt-1">
                  <Mail className="h-4 w-4 mr-1" />
                  {profile.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">Edit Profile</Button>
            <Button variant="outline" className="w-full justify-start">Security Settings</Button>
            <Button variant="outline" className="w-full justify-start">Notification Preferences</Button>
          </CardContent>
        </Card>

        {/* Note: organizations might not be returned in /me/ if it's strictly UserSerializer,
            but if we use the same structure as verify, we can add it here if needed.
            Currently /me/ returns just UserSerializer. */}
        <Card className="md:col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="mr-2 h-5 w-5 text-primary" />
              Your Workspaces
            </CardTitle>
            <CardDescription>Organizations you are a part of.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm italic">You currently don't have any active workspaces associated directly with this profile view. Use the dashboard to manage projects.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

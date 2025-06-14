
import AuthLayout from './AuthLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const SignInPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setIsLoading(false);
      toast({
        title: "Sign in failed",
        description: signInError.message,
        variant: "destructive",
      });
      return;
    }

    if (!signInData.user) {
      setIsLoading(false);
      toast({
        title: "Sign in failed",
        description: "Could not get user information. Please try again.",
        variant: "destructive",
      });
      return;
    }

    // User is available, let's get their profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', signInData.user.id)
      .maybeSingle();

    setIsLoading(false);

    if (profileError) {
      toast({
        title: "Sign in failed",
        description: "There was a problem retrieving your profile. Please try logging in again.",
        variant: "destructive",
      });
      await supabase.auth.signOut();
      return;
    }
    
    toast({
        title: "Welcome back!",
        description: "You have been successfully signed in.",
    });

    if (profile && profile.role) {
        if (profile.role === 'Parent') {
            navigate('/dashboard');
        } else {
            navigate('/team-dashboard');
        }
    } else {
        // Role is not set, go to role selection
        navigate('/select-role');
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      description="Enter your email below to log in to your account"
    >
      <Card>
        <form onSubmit={handleSignIn}>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="m@example.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
            <div className="text-center text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </AuthLayout>
  );
};

export default SignInPage;

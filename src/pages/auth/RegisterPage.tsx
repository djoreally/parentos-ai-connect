
import AuthLayout from './AuthLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Sign up form submitted');
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      console.log('Passwords do not match');
      return;
    }

    // Enforce strong password policy
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 8 characters long and contain an uppercase letter, a lowercase letter, and a number.",
        variant: "destructive",
      });
      console.log('Weak password');
      return;
    }

    setIsLoading(true);
    console.log('Set loading true, about to sign up with Supabase');

    try {
      // Sign up user via Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      console.log('Supabase signup result', { data, error });

      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
        console.log('Supabase signup error:', error);
        return;
      }

      // After signup, update the profile role to 'Parent'
      // The profile is created automatically via trigger, so we just update it.
      if (data?.user) {
        console.log('User created, updating profile role to Parent');
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ role: 'Parent' })
          .eq('id', data.user.id);
        console.log('Profile update result', { profileError });

        if (profileError) {
          toast({
            title: "Profile setup failed",
            description: "Account created, but could not finish setup. Please contact support.",
            variant: "destructive",
          });
          console.log('Profile update failed:', profileError);
          return;
        }
      }

      toast({
        title: "Success!",
        description: "Account created. Please check your email to confirm your account.",
      });
      console.log('Signup complete, redirecting to login');
      navigate('/login');
    } catch (err) {
      // Catch unexpected exceptions and log
      toast({
        title: "Unexpected error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      console.error('Unhandled error during signup:', err);
    } finally {
      setIsLoading(false);
      console.log('Set loading false (finally block)');
    }
  };

  return (
    <AuthLayout
      title="Create an account"
      description="Enter your email and password to create your account"
    >
      <Card>
        <form onSubmit={handleSignUp}>
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
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input 
                id="confirm-password" 
                type="password" 
                required 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
            <div className="text-center text-sm">
              Already have an account?{' '}
              <Link to="/login" className="underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </AuthLayout>
  );
};

export default RegisterPage;

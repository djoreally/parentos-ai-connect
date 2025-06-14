
import AuthLayout from './AuthLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp';
import { logAuditEvent } from '@/api/audit';

const SignInPage = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const queryClient = useQueryClient();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setIsLoading(false);
      await logAuditEvent('USER_LOGIN_FAIL', { email, error: error.message });
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    if (!data.session) {
      setIsLoading(false);
      setMfaRequired(true);
      toast({
        title: "Two-Factor Authentication Required",
        description: "Please enter your authenticator code.",
      });
    } else {
      setIsLoading(false);
      await logAuditEvent('USER_LOGIN_SUCCESS', { email });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
          title: "Welcome back!",
          description: "You have been successfully signed in.",
      });
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      type: 'totp',
      token: otp,
    });
    
    setIsLoading(false);
    
    if (error) {
      await logAuditEvent('USER_MFA_VERIFICATION_FAIL', { email, error: error.message });
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    await logAuditEvent('USER_MFA_VERIFICATION_SUCCESS', { email });
    queryClient.invalidateQueries({ queryKey: ['profile'] });
    toast({
      title: "Welcome back!",
      description: "You have been successfully signed in.",
    });
    setOtp('');
    setMfaRequired(false);
  };

  return (
    <AuthLayout
      title={mfaRequired ? "Two-Factor Challenge" : "Welcome back"}
      description={mfaRequired ? `Enter the code from your authenticator app for ${email}` : "Enter your email below to log in to your account"}
    >
      <Card>
        {mfaRequired ? (
          <form onSubmit={handleVerifyOtp}>
            <CardContent className="pt-6">
              <Label htmlFor="otp">One-Time Password</Label>
              <div className="flex justify-center pt-2">
                <InputOTP 
                  id="otp"
                  maxLength={6} 
                  value={otp} 
                  onChange={(value) => setOtp(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading || otp.length < 6}>
                {isLoading ? 'Verifying...' : 'Verify & Sign In'}
              </Button>
            </CardFooter>
          </form>
        ) : (
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
        )}
      </Card>
    </AuthLayout>
  );
};

export default SignInPage;

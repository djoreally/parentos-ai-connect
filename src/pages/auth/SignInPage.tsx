
import AuthLayout from './AuthLayout';
import { Card } from '@/components/ui/card';
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { logAuditEvent } from '@/api/audit';
import SignInForm from './SignInForm';
import MfaForm from './MfaForm';

const SignInPage = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
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
      await logAuditEvent('USER_LOGIN_FAIL', { details: { email, error: error.message }, target_entity: 'user' });
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    if (!data.session) {
      // MFA is required
      const { data: factorsData, error: mfaError } = await supabase.auth.mfa.listFactors();

      if (mfaError) {
        setIsLoading(false);
        toast({
          title: "Could not retrieve MFA factors",
          description: mfaError.message,
          variant: "destructive",
        });
        return;
      }

      const totpFactor = factorsData.totp[0];
      if (!totpFactor) {
        setIsLoading(false);
        await logAuditEvent('USER_LOGIN_FAIL', { details: { email, error: "User has no TOTP factor enrolled but MFA is required." }, target_entity: 'user' });
        toast({
          title: "MFA Required, but no authenticator app is set up.",
          description: "Please contact support if you've lost access.",
          variant: "destructive",
        });
        return;
      }
      
      setFactorId(totpFactor.id);
      setIsLoading(false);
      setMfaRequired(true);
      toast({
        title: "Two-Factor Authentication Required",
        description: "Please enter your authenticator code.",
      });
    } else {
      setIsLoading(false);
      await logAuditEvent('USER_LOGIN_SUCCESS', { details: { email }, target_entity: 'user', target_id: data.session.user.id });
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

    if (!factorId) {
      setIsLoading(false);
      toast({
        title: "An error occurred",
        description: "MFA factor ID is missing. Please try signing in again.",
        variant: "destructive",
      });
      setMfaRequired(false);
      return;
    }

    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code: otp,
    });
    
    setIsLoading(false);
    
    if (error) {
      await logAuditEvent('USER_MFA_VERIFICATION_FAIL', { details: { email, error: error.message }, target_entity: 'user' });
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    await logAuditEvent('USER_MFA_VERIFICATION_SUCCESS', { details: { email }, target_entity: 'user' });
    queryClient.invalidateQueries({ queryKey: ['profile'] });
    toast({
      title: "Welcome back!",
      description: "You have been successfully signed in.",
    });
    setOtp('');
    setMfaRequired(false);
    setFactorId(null);
  };

  return (
    <AuthLayout
      title={mfaRequired ? "Two-Factor Challenge" : "Welcome back"}
      description={mfaRequired ? `Enter the code from your authenticator app for ${email}` : "Enter your email below to log in to your account"}
    >
      <Card>
        {mfaRequired ? (
          <MfaForm 
            handleVerifyOtp={handleVerifyOtp}
            otp={otp}
            setOtp={setOtp}
            isLoading={isLoading}
          />
        ) : (
          <SignInForm 
            handleSignIn={handleSignIn}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            isLoading={isLoading}
          />
        )}
      </Card>
    </AuthLayout>
  );
};

export default SignInPage;

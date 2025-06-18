
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logAuthAttempt, checkForSuspiciousActivity } from '@/api/authSecurity';
import { Link } from 'react-router-dom';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type SignInFormData = z.infer<typeof signInSchema>;

interface SignInFormProps {
  handleSignIn?: (e: React.FormEvent) => Promise<void>;
  email?: string;
  setEmail?: (email: string) => void;
  password?: string;
  setPassword?: (password: string) => void;
  isLoading?: boolean;
}

const SignInForm: React.FC<SignInFormProps> = ({ 
  handleSignIn: externalHandleSignIn,
  email: externalEmail,
  setEmail: externalSetEmail,
  password: externalPassword,
  setPassword: externalSetPassword,
  isLoading: externalIsLoading
}) => {
  const [internalIsLoading, setInternalIsLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const { toast } = useToast();

  // Use external props if provided, otherwise use internal state
  const isLoading = externalIsLoading ?? internalIsLoading;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: externalEmail || '',
      password: externalPassword || ''
    }
  });

  // Watch form values to sync with external state if provided
  const watchedEmail = watch('email');
  const watchedPassword = watch('password');

  React.useEffect(() => {
    if (externalSetEmail && watchedEmail !== externalEmail) {
      externalSetEmail(watchedEmail);
    }
  }, [watchedEmail, externalSetEmail, externalEmail]);

  React.useEffect(() => {
    if (externalSetPassword && watchedPassword !== externalPassword) {
      externalSetPassword(watchedPassword);
    }
  }, [watchedPassword, externalSetPassword, externalPassword]);

  React.useEffect(() => {
    if (externalEmail !== undefined) {
      setValue('email', externalEmail);
    }
  }, [externalEmail, setValue]);

  React.useEffect(() => {
    if (externalPassword !== undefined) {
      setValue('password', externalPassword);
    }
  }, [externalPassword, setValue]);

  const internalOnSubmit = async (data: SignInFormData) => {
    setInternalIsLoading(true);
    setIsBlocked(false);

    try {
      // Check for suspicious activity before attempting login
      const isSuspicious = await checkForSuspiciousActivity(data.email);
      if (isSuspicious) {
        setIsBlocked(true);
        toast({
          variant: 'destructive',
          title: 'Account Temporarily Locked',
          description: 'Too many failed login attempts. Please try again in 15 minutes or reset your password.',
        });
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        // Log failed attempt
        await logAuthAttempt({
          email: data.email,
          attempt_type: 'login_failed'
        });

        toast({
          variant: 'destructive',
          title: 'Sign in failed',
          description: 'Invalid email or password. Please check your credentials and try again.',
        });
      } else {
        // Log successful attempt
        await logAuthAttempt({
          email: data.email,
          attempt_type: 'login_success'
        });

        toast({
          title: 'Welcome back!',
          description: 'You have been signed in successfully.',
        });
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast({
        variant: 'destructive',
        title: 'Something went wrong',
        description: 'Please try again later.',
      });
    } finally {
      setInternalIsLoading(false);
    }
  };

  const onSubmit = externalHandleSignIn ? 
    (e: React.FormEvent) => externalHandleSignIn(e) : 
    handleSubmit(internalOnSubmit);

  return (
    <CardContent>
      {isBlocked && (
        <Alert className="mb-4" variant="destructive">
          <AlertDescription>
            Account temporarily locked due to multiple failed login attempts. 
            <Link to="/forgot-password" className="underline ml-1">
              Reset your password
            </Link> or try again in 15 minutes.
          </AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            {...register('email')}
            disabled={isLoading || isBlocked}
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            {...register('password')}
            disabled={isLoading || isBlocked}
          />
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Link
            to="/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-500 underline"
          >
            Forgot your password?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || isBlocked}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>

      <div className="mt-4 text-center text-sm">
        Don't have an account?{' '}
        <Link to="/register" className="text-blue-600 hover:text-blue-500 underline">
          Sign up
        </Link>
      </div>
    </CardContent>
  );
};

export default SignInForm;

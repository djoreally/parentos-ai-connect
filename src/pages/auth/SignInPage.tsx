
import AuthLayout from './AuthLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

const SignInPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call for authentication
    console.log('Simulating sign-in for:', email);
     toast({
      title: "Welcome back!",
      description: "You have been successfully signed in.",
    });
    // Redirect to dashboard
    navigate('/dashboard');
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
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full">Sign In</Button>
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

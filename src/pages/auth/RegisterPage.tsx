
import AuthLayout from './AuthLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    // Simulate API call for user creation
    console.log('Simulating account creation for:', email);
    toast({
      title: "Success!",
      description: "Your account has been created.",
    });
    // Redirect to role selection
    navigate('/select-role');
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
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input 
                id="confirm-password" 
                type="password" 
                required 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full">Create Account</Button>
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

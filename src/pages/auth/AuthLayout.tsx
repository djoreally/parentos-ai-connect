
import { BrainCircuit } from 'lucide-react';
import React from 'react';

const AuthLayout = ({ children, title, description }: { children: React.ReactNode, title: string, description: string }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center justify-center mb-8">
            <BrainCircuit className="h-12 w-12 text-primary mb-4" />
            <h1 className="text-3xl font-bold text-foreground">ParentOS</h1>
            <p className="text-muted-foreground">One voice. All contexts. All caregivers.</p>
        </div>
        <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;


import { SignUp } from '@clerk/clerk-react';
import AuthLayout from './AuthLayout';

const RegisterPage = () => {
  return (
    <AuthLayout
      title="Create your account"
      description="Sign up to get started"
    >
      <div className="flex justify-center">
        <SignUp 
          fallbackRedirectUrl="/dashboard"
          signInUrl="/sign-in"
        />
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;

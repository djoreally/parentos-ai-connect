
import { SignUp } from '@clerk/clerk-react';
import AuthLayout from './AuthLayout';

const RegisterPage = () => {
  return (
    <AuthLayout
      title="Create your account"
      description="Sign up to get started with Parentrak"
    >
      <div className="flex justify-center">
        <SignUp 
          fallbackRedirectUrl="/select-role"
          signInUrl="/login"
        />
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;

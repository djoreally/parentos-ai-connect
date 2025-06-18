
import { SignIn } from '@clerk/clerk-react';
import AuthLayout from './AuthLayout';

const SignInPage = () => {
  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to your account"
    >
      <div className="flex justify-center">
        <SignIn 
          fallbackRedirectUrl="/select-role"
          signUpUrl="/register"
        />
      </div>
    </AuthLayout>
  );
};

export default SignInPage;

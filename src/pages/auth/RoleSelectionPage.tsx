
import AuthLayout from './AuthLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User, School, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const RoleSelectionPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const roles = [
    { name: 'Parent', icon: <User /> },
    { name: 'Teacher', icon: <School /> },
    { name: 'Doctor', icon: <Stethoscope /> },
  ];

  const handleRoleSelect = (roleName: string) => {
    // Simulate saving the role to the backend
    console.log('Simulating role selection:', roleName);
    toast({
      title: "Role Selected!",
      description: `You are now logged in as a ${roleName}.`,
    });
    // Redirect to dashboard
    navigate('/dashboard');
  };

  return (
    <AuthLayout
      title="One last step!"
      description="Please select your role to continue."
    >
      <Card>
        <CardContent className="pt-6 space-y-4">
          {roles.map((role) => (
            <Button
              key={role.name}
              variant="outline"
              className="w-full justify-start text-lg p-6"
              onClick={() => handleRoleSelect(role.name)}
            >
              {role.icon}
              {role.name}
            </Button>
          ))}
        </CardContent>
      </Card>
    </AuthLayout>
  );
};

export default RoleSelectionPage;

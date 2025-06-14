
import AuthLayout from './AuthLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User, School, Stethoscope } from 'lucide-react';

const RoleSelectionPage = () => {
  const roles = [
    { name: 'Parent', icon: <User /> },
    { name: 'Teacher', icon: <School /> },
    { name: 'Doctor', icon: <Stethoscope /> },
  ];

  return (
    <AuthLayout
      title="One last step!"
      description="Please select your role to continue."
    >
      <Card>
        <CardContent className="pt-6 space-y-4">
          {roles.map((role) => (
            <Button key={role.name} variant="outline" className="w-full justify-start text-lg p-6">
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


import AuthLayout from './AuthLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User, School, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProfile } from '@/api/profiles';
import { Profile } from '@/types';
import AuthLoadingSpinner from '@/components/AuthLoadingSpinner';

const RoleSelectionPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const roles = [
    { name: 'Parent', icon: <User /> },
    { name: 'Teacher', icon: <School /> },
    { name: 'Doctor', icon: <Stethoscope /> },
  ] as const;

  const { mutate, isPending } = useMutation<Profile, Error, { role: 'Parent' | 'Teacher' | 'Doctor' }>({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: "Role Selected!",
        description: `You are now set up as a ${data.role}. Redirecting...`,
      });

      // Small delay to show the success message before redirect
      setTimeout(() => {
        if (data.role === 'Parent') {
          navigate('/dashboard');
        } else {
          navigate('/team-dashboard');
        }
      }, 1000);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to save role: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const handleRoleSelect = (roleName: 'Parent' | 'Teacher' | 'Doctor') => {
    mutate({ role: roleName });
  };

  // Show loading spinner during role update to prevent flashing
  if (isPending) {
    return <AuthLoadingSpinner />;
  }

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
              className="w-full justify-start text-lg p-6 gap-4"
              onClick={() => handleRoleSelect(role.name)}
              disabled={isPending}
            >
              {role.icon}
              <span>{role.name}</span>
            </Button>
          ))}
        </CardContent>
      </Card>
    </AuthLayout>
  );
};

export default RoleSelectionPage;

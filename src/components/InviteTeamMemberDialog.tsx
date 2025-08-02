
import { ComingSoon } from '@/components/ComingSoon';

interface InviteTeamMemberDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedChildId?: string;
}

const InviteTeamMemberDialog = ({ isOpen, onOpenChange, selectedChildId }: InviteTeamMemberDialogProps) => {
  return <ComingSoon feature="Team Member Invitations" />;
};

export default InviteTeamMemberDialog;

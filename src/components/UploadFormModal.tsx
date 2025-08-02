
import { ComingSoon } from '@/components/ComingSoon';

interface UploadFormModalProps {
  onOpenChange: (open: boolean) => void;
  selectedChildId?: string;
}

const UploadFormModal = ({ onOpenChange, selectedChildId }: UploadFormModalProps) => {
  return <ComingSoon feature="Document Upload" />;
};

export default UploadFormModal;

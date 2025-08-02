
import { ComingSoon } from '@/components/ComingSoon';

interface TranslateMessageModalProps {
  message: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const TranslateMessageModal = ({ message, isOpen, onOpenChange }: TranslateMessageModalProps) => {
  return <ComingSoon feature="Message Translation" />;
};

export default TranslateMessageModal;

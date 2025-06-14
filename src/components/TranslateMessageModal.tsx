
import { useState } from 'react';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRightLeft } from 'lucide-react';
import { toast } from 'sonner';

interface TranslateMessageModalProps {
  onOpenChange: (open: boolean) => void;
}

const TranslateMessageModal = ({ onOpenChange }: TranslateMessageModalProps) => {
  const [inputText, setInputText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('spanish');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  const handleClose = () => {
    onOpenChange(false);
  };
  
  const handleTranslate = () => {
    if (!inputText) {
      toast.warning("Please enter some text to translate.");
      return;
    }
    setIsTranslating(true);
    setTranslatedText('');

    // Simulate API call
    setTimeout(() => {
      let result = '';
      if (targetLanguage === 'spanish') {
        result = `(Traducción simulada al español)\n\n${inputText}`;
      } else if (targetLanguage === 'french') {
        result = `(Traduction simulée en français)\n\n${inputText}`;
      } else {
        result = `(Simulated translation to ${targetLanguage})\n\n${inputText}`;
      }
      setTranslatedText(result);
      setIsTranslating(false);
      toast.success("Translation complete!");
    }, 1000);
  };

  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Translate a Message</DialogTitle>
        <DialogDescription>
          Quickly translate messages from teachers or doctors. This is a simulation.
        </DialogDescription>
      </DialogHeader>
      
      <div className="grid gap-4 py-4">
        <Textarea
          placeholder="Paste the message you want to translate here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={6}
          disabled={isTranslating}
        />
        <div className="flex items-center gap-4">
          <Select onValueChange={setTargetLanguage} defaultValue={targetLanguage} disabled={isTranslating}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="spanish">Spanish</SelectItem>
              <SelectItem value="french">French</SelectItem>
              <SelectItem value="mandarin">Mandarin</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleTranslate} disabled={isTranslating || !inputText}>
            {isTranslating ? 'Translating...' : (
              <>
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                Translate
              </>
            )}
          </Button>
        </div>
        {translatedText && (
          <div className="space-y-2 pt-2">
            <h3 className="font-semibold text-muted-foreground">Translated Text:</h3>
            <div className="p-4 border rounded-md bg-muted min-h-[140px] whitespace-pre-wrap text-sm">
              {translatedText}
            </div>
          </div>
        )}
      </div>

      <DialogFooter>
        <Button variant="ghost" onClick={handleClose}>Close</Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default TranslateMessageModal;

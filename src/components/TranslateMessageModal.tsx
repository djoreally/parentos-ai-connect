
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
import { supabase } from '@/integrations/supabase/client';

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
  
  const handleTranslate = async () => {
    if (!inputText) {
      toast.warning("Please enter some text to translate.");
      return;
    }
    setIsTranslating(true);
    setTranslatedText('');

    try {
      const { data, error } = await supabase.functions.invoke('translate-text', {
          body: { text: inputText, targetLanguage },
      });

      if (error) {
          throw new Error(error.message);
      }
      
      setTranslatedText(data.translatedText);
      toast.success("Translation complete!");
    } catch (error: any) {
        console.error("Translation error:", error);
        toast.error(`Translation failed: ${error.message}`);
    } finally {
        setIsTranslating(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Translate a Message</DialogTitle>
        <DialogDescription>
          Translate messages from teachers or doctors using Google Translate.
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

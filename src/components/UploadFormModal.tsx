import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Save, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { submitLog } from '@/api/logs';
import { uploadDocument } from '@/api/storage';

interface UploadFormModalProps {
  onOpenChange: (open: boolean) => void;
  selectedChildId?: string;
}

const UploadFormModal = ({ onOpenChange, selectedChildId }: UploadFormModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (theFile: File) => {
      if (!selectedChildId) {
        throw new Error("No child selected.");
      }
      const { publicUrl } = await uploadDocument(theFile);
      
      return submitLog({ 
        title, 
        description: description, 
        type: 'document', 
        childId: selectedChildId,
        audio_url: publicUrl // We now store the URL in the dedicated field.
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logs', selectedChildId] });
      toast.success("Document uploaded and analyzed!");
      handleClose();
    },
    onError: (error) => {
      console.error("Failed to submit document:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload document. Please try again.");
    }
  });

  const handleClose = () => {
    onOpenChange(false);
    setTitle('');
    setDescription('');
    setFile(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
        setFile(selectedFile);
    }
  };

  const handleTriggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleSave = () => {
    if (!title || !description || !file) {
      toast.warning("Please fill out all fields and select a file.");
      return;
    }
    mutation.mutate(file);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Upload a Document</DialogTitle>
        <DialogDescription>
          Upload a school form, doctor's report, or any other document. It will be stored securely and added to the timeline.
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4 py-4">
        <Input
          placeholder="Title (e.g., 'School Incident Report')"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={mutation.isPending}
        />
        <Textarea
          placeholder="Add a brief description or notes about this document..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          disabled={mutation.isPending}
        />
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,image/*"
          />
          {file ? (
            <div className="flex items-center justify-between p-3 border rounded-md bg-muted">
              <div className="flex items-center gap-2 overflow-hidden">
                <FileText className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium truncate">{file.name}</span>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setFile(null)} disabled={mutation.isPending}>Change</Button>
            </div>
          ) : (
            <Button variant="outline" className="w-full" onClick={handleTriggerFileSelect} disabled={mutation.isPending}>
              <Upload className="mr-2 h-4 w-4" />
              Select File
            </Button>
          )}
        </div>
      </div>

      <DialogFooter>
        <Button variant="ghost" onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSave} disabled={mutation.isPending || !title || !description || !file}>
          {mutation.isPending ? 'Saving...' : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save to Timeline
            </>
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default UploadFormModal;

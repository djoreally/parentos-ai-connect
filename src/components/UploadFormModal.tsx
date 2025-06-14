
import { useState } from 'react';
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

interface UploadFormModalProps {
  onOpenChange: (open: boolean) => void;
  selectedChildId?: string;
}

const UploadFormModal = ({ onOpenChange, selectedChildId }: UploadFormModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileName, setFileName] = useState('');
  
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: submitLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logs', selectedChildId] });
      toast.success("Document uploaded and analyzed!");
      handleClose();
    },
    onError: (error) => {
      console.error("Failed to submit document:", error);
      toast.error("Failed to upload document. Please try again.");
    }
  });

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleFileSelect = () => {
    // Simulate file selection
    setFileName('school_incident_report.pdf');
    toast.info("Simulated file selection: school_incident_report.pdf");
  };

  const handleSave = () => {
    if (!title || !description || !fileName) {
      toast.warning("Please fill out all fields and select a file.");
      return;
    }
    if (!selectedChildId) {
      toast.error("No child selected. Cannot save log.");
      return;
    }
    const fullDescription = `Document: ${fileName}\n\n${description}`;
    mutation.mutate({ title, description: fullDescription, type: 'document', childId: selectedChildId });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Upload a Document</DialogTitle>
        <DialogDescription>
          Upload a school form, doctor's report, or any other document. We'll simulate analyzing it and add it to the timeline.
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
          {fileName ? (
            <div className="flex items-center justify-between p-3 border rounded-md bg-muted">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <span className="text-sm font-medium">{fileName}</span>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setFileName('')} disabled={mutation.isPending}>Change</Button>
            </div>
          ) : (
            <Button variant="outline" className="w-full" onClick={handleFileSelect} disabled={mutation.isPending}>
              <Upload className="mr-2 h-4 w-4" />
              Select File (Simulated)
            </Button>
          )}
        </div>
      </div>

      <DialogFooter>
        <Button variant="ghost" onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSave} disabled={mutation.isPending || !title || !description || !fileName}>
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


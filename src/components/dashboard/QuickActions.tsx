
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Upload, Calendar, Users, MessageCircle } from 'lucide-react';
import { ComingSoon } from '@/components/ComingSoon';

interface QuickActionsProps {
  onNewLog: () => void;
  onUploadDocument: () => void;
  selectedChildId?: string;
}

const QuickActions = ({ onNewLog, onUploadDocument, selectedChildId }: QuickActionsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            className="h-20 flex flex-col gap-2"
            onClick={onNewLog}
            disabled={!selectedChildId}
          >
            <PlusCircle className="h-6 w-6" />
            <span className="text-sm">New Log</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-20 flex flex-col gap-2"
            onClick={onUploadDocument}
            disabled={!selectedChildId}
          >
            <Upload className="h-6 w-6" />
            <span className="text-sm">Upload Document</span>
          </Button>
          
          <div className="col-span-2">
            <ComingSoon feature="Team Chat & Notifications" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;

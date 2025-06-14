
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { UploadCloud, Languages, BrainCircuit, UserPlus, MessageSquare } from 'lucide-react';
import UploadFormModal from '@/components/UploadFormModal';
import TranslateMessageModal from '@/components/TranslateMessageModal';
import TeamChatDialog from '@/components/TeamChatDialog';
import InviteTeamMemberDialog from '@/components/InviteTeamMemberDialog';
import NotificationBell from '@/components/NotificationBell';
import { Profile, Child, AppNotification } from '@/types';

interface QuickActionsProps {
    selectedChild: Child | undefined;
    profile: Profile | null;
    onNotificationClick: (notification: AppNotification) => void;
    isChatModalOpen: boolean;
    onChatModalOpenChange: (isOpen: boolean) => void;
}

const QuickActions = ({ selectedChild, profile, onNotificationClick, isChatModalOpen, onChatModalOpenChange }: QuickActionsProps) => {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isTranslateModalOpen, setIsTranslateModalOpen] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    const selectedChildId = selectedChild?.id;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
                <NotificationBell onNotificationClick={onNotificationClick} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
                    <DialogTrigger asChild>
                        <Button size="lg" variant="outline" disabled={!selectedChildId}><UploadCloud className="mr-2 h-4 w-4" /> Upload Form</Button>
                    </DialogTrigger>
                    <UploadFormModal onOpenChange={setIsUploadModalOpen} selectedChildId={selectedChildId} />
                </Dialog>

                <Dialog open={isTranslateModalOpen} onOpenChange={setIsTranslateModalOpen}>
                    <DialogTrigger asChild>
                        <Button size="lg" variant="outline"><Languages className="mr-2 h-4 w-4" /> Translate Message</Button>
                    </DialogTrigger>
                    <TranslateMessageModal onOpenChange={setIsTranslateModalOpen} />
                </Dialog>

                <Dialog open={isChatModalOpen} onOpenChange={onChatModalOpenChange}>
                    <DialogTrigger asChild>
                        <Button size="lg" variant="outline" disabled={!selectedChildId}>
                            <MessageSquare className="mr-2 h-4 w-4" /> Team Chat
                        </Button>
                    </DialogTrigger>
                    {selectedChild && (
                        <TeamChatDialog
                            childId={selectedChild.id}
                            childName={selectedChild.name}
                            isOpen={isChatModalOpen}
                            onOpenChange={onChatModalOpenChange}
                        />
                    )}
                </Dialog>

                <Button asChild size="lg" variant="outline" disabled={!selectedChildId}>
                    <Link to={selectedChildId ? `/assistant?childId=${selectedChildId}` : '/assistant'}>
                        <BrainCircuit className="mr-2 h-4 w-4" /> AI Assistant
                    </Link>
                </Button>

                {profile?.role === 'Parent' && (
                    <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
                        <DialogTrigger asChild>
                            <Button size="lg" variant="outline" disabled={!selectedChildId}>
                                <UserPlus className="mr-2 h-4 w-4" /> Invite Team
                            </Button>
                        </DialogTrigger>
                        {selectedChildId && <InviteTeamMemberDialog onOpenChange={setIsInviteModalOpen} childId={selectedChildId} />}
                    </Dialog>
                )}
            </div>
        </div>
    );
};

export default QuickActions;

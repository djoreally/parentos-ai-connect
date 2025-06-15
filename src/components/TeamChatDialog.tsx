
import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMessages, sendMessage } from '@/api/messages';
import { Message } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { Send } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import { toast } from '@/hooks/use-toast';

interface TeamChatDialogProps {
  childId: string;
  childName: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function TeamChatDialog({ childId, childName, isOpen, onOpenChange }: TeamChatDialogProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const viewportRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ['messages', childId],
    queryFn: () => getMessages(childId),
    enabled: !!childId && isOpen,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => sendMessage(childId, content),
    onSuccess: () => {
      setNewMessage('');
      // Invalidate and refetch messages
      queryClient.invalidateQueries({ queryKey: ['messages', childId] });
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
    },
    onError: (error) => {
      console.error("Failed to send message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!childId || !isOpen) return;

    console.log('Setting up real-time subscription for child:', childId);

    const channel = supabase
      .channel(`team-chat-${childId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `child_id=eq.${childId}`,
        },
        async (payload) => {
          console.log('New message received:', payload);
          
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('id', payload.new.user_id)
              .single();
            
            const newMessageWithProfile = {
              ...payload.new,
              profiles: profile,
            } as Message;
            
            queryClient.setQueryData(['messages', childId], (oldData: Message[] | undefined) => {
              return oldData ? [...oldData, newMessageWithProfile] : [newMessageWithProfile];
            });
          } catch (error) {
            console.error('Error fetching profile for new message:', error);
            // Still add the message without profile info
            queryClient.setQueryData(['messages', childId], (oldData: Message[] | undefined) => {
              return oldData ? [...oldData, payload.new as Message] : [payload.new as Message];
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [childId, queryClient, isOpen]);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = newMessage.trim();
    
    if (!trimmedMessage) {
      toast({
        title: "Empty message",
        description: "Please enter a message before sending.",
        variant: "destructive",
      });
      return;
    }

    console.log('Sending message:', trimmedMessage);
    sendMessageMutation.mutate(trimmedMessage);
  };
  
  const getInitials = (firstName: string | null, lastName: string | null) => {
    const f = firstName?.[0] || '';
    const l = lastName?.[0] || '';
    return `${f}${l}`.toUpperCase() || 'U';
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl md:max-w-2xl flex flex-col h-[90vh] max-h-[700px]">
        <DialogHeader>
          <DialogTitle>Team Chat for {childName}</DialogTitle>
          <DialogDescription>
            Communicate with the team involved in {childName}'s care.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 pr-4 -mr-4" viewportRef={viewportRef}>
             <div className="space-y-4 pr-4 pb-4">
              {isLoading && (
                <div className="space-y-4">
                  <div className="flex items-start gap-3"><Skeleton className="w-10 h-10 rounded-full" /><Skeleton className="h-16 w-48" /></div>
                  <div className="flex items-start gap-3 flex-row-reverse"><Skeleton className="w-10 h-10 rounded-full" /><Skeleton className="h-24 w-64" /></div>
                  <div className="flex items-start gap-3"><Skeleton className="w-10 h-10 rounded-full" /><Skeleton className="h-12 w-32" /></div>
                </div>
              )}
              {!isLoading && messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No messages yet. Start the conversation!
                </div>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex items-start gap-3",
                    message.user_id === user?.id ? "flex-row-reverse" : ""
                  )}
                >
                  <Avatar className="mt-1">
                    <AvatarFallback>
                      {getInitials(message.profiles?.first_name, message.profiles?.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      "rounded-lg p-3 max-w-xs md:max-w-md",
                      message.user_id === user?.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <p className="text-sm font-bold">
                      {message.profiles?.first_name || 'A team member'}
                    </p>
                    <p className="text-sm break-words" dangerouslySetInnerHTML={{ __html: message.content }} />
                    <p className="text-xs text-right mt-1 opacity-70">
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <form onSubmit={handleSendMessage} className="mt-4 flex gap-2 border-t pt-4">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={sendMessageMutation.isPending}
            />
            <Button type="submit" size="icon" disabled={sendMessageMutation.isPending || !newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

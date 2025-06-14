
import { useState, useRef, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Send, Mic, BrainCircuit, FileDown, Languages, GitCommitHorizontal, AlertCircle } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getLogs } from '@/api/logs';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

type Message = {
  sender: 'user' | 'assistant';
  text: string;
};

const AssistantPage = () => {
  const [searchParams] = useSearchParams();
  const childId = searchParams.get('childId');

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  
  const { data: logs, isLoading: isLoadingLogs } = useQuery({
    queryKey: ['logs', childId],
    queryFn: () => getLogs(childId!),
    enabled: !!childId,
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: childId ? "Hello! I'm your ParentOS assistant. I have this child's logs ready. How can I help you today?" : "Hello! I'm your ParentOS assistant. To get started, please go back to the dashboard and select a child.",
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const assistantMutation = useMutation({
    mutationFn: async (newMessages: Message[]) => {
        const { data, error } = await supabase.functions.invoke('ai-assistant', {
            body: { messages: newMessages, logs: logs || [] }
        });

        if (error) {
            throw new Error(error.message);
        }
        return data.reply;
    },
    onSuccess: (reply: string) => {
        const aiResponse: Message = { sender: 'assistant', text: reply };
        setMessages(prev => [...prev, aiResponse]);
    },
    onError: (error) => {
        console.error("Assistant error:", error);
        const aiResponse: Message = { sender: 'assistant', text: "I'm sorry, I'm having trouble connecting right now. Please try again later." };
        setMessages(prev => [...prev, aiResponse]);
    }
  });

  const handleSendMessage = (e: React.FormEvent, messageText?: string) => {
    e.preventDefault();
    const textToSend = messageText || input;
    if (!textToSend.trim() || assistantMutation.isPending) return;

    const userMessage: Message = { sender: 'user', text: textToSend };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    
    if(!messageText) {
      setInput('');
    }

    assistantMutation.mutate(newMessages);
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    if (!childId) return;
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    handleSendMessage(fakeEvent, suggestion);
  }

  const isAssistantDisabled = !childId || isLoadingLogs || assistantMutation.isPending;

  return (
    <div className="flex flex-col h-screen bg-background animate-fade-in">
      <Header />
      <main className="flex-grow container mx-auto px-4 md:px-8 py-6 flex flex-col">
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Link>
          </Button>
        </div>
        <Card className="flex-grow flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit /> AI Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-y-auto p-6 space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                {msg.sender === 'assistant' && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg" alt="Assistant" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                )}
                <div className={`rounded-lg px-4 py-2 max-w-lg animate-fade-in-up ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
                 {msg.sender === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg" alt="User"/>
                    <AvatarFallback>ME</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
             {assistantMutation.isPending && (
                <div className="flex items-end gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder.svg" alt="Assistant" />
                        <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <Skeleton className="h-10 w-24 rounded-lg" />
                </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>
          <CardFooter className="p-4 border-t flex-col items-start gap-4">
            {!childId && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Please <Link to="/dashboard" className="font-bold underline">select a child on the dashboard</Link> to enable the assistant.
                    </AlertDescription>
                </Alert>
            )}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => handleSuggestionClick("Export latest report as PDF")} disabled={isAssistantDisabled}>
                <FileDown className="mr-2 h-4 w-4" /> Export as PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleSuggestionClick("Translate the last log for the doctor")} disabled={isAssistantDisabled}>
                <Languages className="mr-2 h-4 w-4" /> Translate
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleSuggestionClick("Summarize this week's logs")} disabled={isAssistantDisabled}>
                <GitCommitHorizontal className="mr-2 h-4 w-4" /> Summarize
              </Button>
            </div>
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 w-full">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={childId ? "Ask about your child's trends..." : "Select a child to begin..."}
                className="flex-grow"
                autoComplete="off"
                disabled={isAssistantDisabled}
              />
              <Button type="button" variant="ghost" size="icon" disabled={isAssistantDisabled}>
                <Mic className="mr-2 h-4 w-4" />
              </Button>
              <Button type="submit" size="icon" disabled={isAssistantDisabled || !input.trim()}>
                <Send />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default AssistantPage;

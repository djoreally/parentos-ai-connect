
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Send, Mic, BrainCircuit, FileDown, Languages, GitCommitHorizontal } from 'lucide-react';

type Message = {
  sender: 'user' | 'assistant';
  text: string;
};

const AssistantPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: "Hello! I'm your ParentOS assistant. How can I help you today? You can ask me about your child's recent trends, or for a summary of their logs.",
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent, messageText?: string) => {
    e.preventDefault();
    const textToSend = messageText || input;
    if (!textToSend.trim()) return;

    const userMessage: Message = { sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMessage]);

    // Mock AI response
    setTimeout(() => {
      const aiResponse: Message = {
        sender: 'assistant',
        text: `I've received your request about "${textToSend}". I'm still learning, but soon I'll be able to provide detailed analysis and reports based on your child's data.`,
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);

    if(!messageText) {
      setInput('');
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    handleSendMessage(fakeEvent, suggestion);
  }

  return (
    <div className="flex flex-col h-screen bg-background animate-fade-in">
      <Header />
      <main className="flex-grow container mx-auto px-4 md:px-8 py-6 flex flex-col">
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link to="/dashboard">
              <ArrowLeft /> Back to Dashboard
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
            <div ref={messagesEndRef} />
          </CardContent>
          <CardFooter className="p-4 border-t flex-col items-start gap-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => handleSuggestionClick("Export latest report as PDF")}>
                <FileDown /> Export as PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleSuggestionClick("Translate the last log")}>
                <Languages /> Translate
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleSuggestionClick("Summarize this week's logs")}>
                <GitCommitHorizontal /> Summarize
              </Button>
            </div>
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 w-full">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your child's trends..."
                className="flex-grow"
                autoComplete="off"
              />
              <Button type="button" variant="ghost" size="icon">
                <Mic />
              </Button>
              <Button type="submit" size="icon" disabled={!input.trim()}>
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


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Play, Pause, FileText, Mic } from 'lucide-react';
import { LogEntry } from '@/types';
import { ReactNode, useRef, useState } from 'react';

interface LogCardProps {
  log: LogEntry;
}

const LogCard = ({ log }: LogCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const typeIcons: Record<LogEntry['type'], ReactNode> = {
    behavior: '🎭',
    general: '📝',
    health: '🏥',
    milestone: '🎯',
    academic: '📚',
    social: '👥',
    voice: <Mic className="h-4 w-4" />,
    document: <FileText className="h-4 w-4" />,
    text: '📝'
  };

  const typeColors: Record<LogEntry['type'], string> = {
    behavior: 'bg-purple-100 text-purple-800 border-purple-200',
    general: 'bg-gray-100 text-gray-800 border-gray-200',
    health: 'bg-red-100 text-red-800 border-red-200',
    milestone: 'bg-green-100 text-green-800 border-green-200',
    academic: 'bg-blue-100 text-blue-800 border-blue-200',
    social: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    voice: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    document: 'bg-orange-100 text-orange-800 border-orange-200',
    text: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Badge className={`${typeColors[log.type]} flex items-center gap-1`}>
              {typeIcons[log.type]}
              {log.type}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <User className="h-3 w-3 mr-1" />
              {log.author}
            </Badge>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-1" />
            {formatDate(log.created_at)}
          </div>
        </div>
        <CardTitle className="text-lg">{log.original_entry.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base mb-4 whitespace-pre-wrap">
          {log.original_entry.description}
        </CardDescription>
        
        {log.type === 'voice' && log.audio_url && (
          <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleAudio}
              className="h-8 w-8 p-0"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <span className="text-sm">Voice note</span>
            <audio
              ref={audioRef}
              src={log.audio_url}
              onEnded={handleAudioEnd}
              className="hidden"
            />
          </div>
        )}

        {log.type === 'document' && log.audio_url && (
          <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
            <FileText className="h-4 w-4" />
            <a 
              href={log.audio_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              View Document
            </a>
          </div>
        )}

        {log.tags && log.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {log.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LogCard;

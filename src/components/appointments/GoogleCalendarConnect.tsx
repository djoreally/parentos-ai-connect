
import { useQuery } from '@tanstack/react-query';
import { getGoogleToken } from '@/api/userTokens';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { FcGoogle } from 'react-icons/fc';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const GoogleCalendarConnect = () => {
    const { data: googleToken, isLoading } = useQuery({
        queryKey: ['googleToken'],
        queryFn: getGoogleToken,
    });

    const handleConnect = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                scopes: 'https://www.googleapis.com/auth/calendar.events',
                redirectTo: window.location.href, // Redirect back to this page
            },
        });
        if (error) {
            toast.error('Could not connect to Google Calendar: ' + error.message);
        }
    };

    if (isLoading) {
        return <Button disabled variant="outline"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking...</Button>;
    }

    if (googleToken) {
        return <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 border rounded-md bg-slate-50"><FcGoogle className="h-5 w-5" /> Calendar Connected</div>;
    }

    return (
        <Button onClick={handleConnect} variant="outline">
            <FcGoogle className="mr-2 h-5 w-5" /> Connect Calendar
        </Button>
    );
};

export default GoogleCalendarConnect;

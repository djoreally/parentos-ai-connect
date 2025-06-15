
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const PLUNK_API_KEY = Deno.env.get('PLUNK_API_KEY');
const PLUNK_API_URL = 'https://api.useplunk.com/v1/send';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { invitee_email, invitation_link, child_name, parent_name, role } = await req.json();

    const emailBody = `
      <div style="font-family: sans-serif; line-height: 1.6;">
        <h2>You're Invited!</h2>
        <p>Hello,</p>
        <p><strong>${parent_name}</strong> has invited you to join their team on Parentrak as a <strong>${role.toLowerCase()}</strong> for <strong>${child_name}</strong>'s profile.</p>
        <p>Parentrak is a platform that helps parents and professionals collaborate to support a child's development.</p>
        <p>To accept the invitation and set up your account, please click the link below:</p>
        <p style="margin: 20px 0;">
          <a 
            href="${invitation_link}" 
            style="background-color: #007bff; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;"
          >
            Accept Invitation
          </a>
        </p>
        <p>This invitation link will expire in 7 days.</p>
        <p>If you were not expecting this invitation, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 0.8em; color: #777;">The Parentrak Team</p>
      </div>
    `;

    const response = await fetch(PLUNK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PLUNK_API_KEY}`,
      },
      body: JSON.stringify({
        to: invitee_email,
        subject: `You're invited to collaborate on ${child_name}'s profile`,
        body: emailBody,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Plunk API error response:', errorBody);
      throw new Error(`Failed to send email. Status: ${response.status}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in send-invitation-email function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

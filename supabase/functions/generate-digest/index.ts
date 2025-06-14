
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { childId, startDate, endDate } = await req.json();

        if (!childId || !startDate || !endDate) {
          throw new Error("childId, startDate, and endDate are required.");
        }

        const authHeader = req.headers.get('Authorization')!
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        const { data: child, error: childError } = await supabase
            .from('children')
            .select('name, dob')
            .eq('id', childId)
            .single();

        if (childError) throw childError;
        
        const { data: logs, error: logsError } = await supabase
            .from('logs')
            .select('timestamp, author, original_entry, type')
            .eq('child_id', childId)
            .gte('timestamp', startDate)
            .lte('timestamp', endDate)
            .order('timestamp', { ascending: true });

        if (logsError) throw logsError;

        const htmlContent = `
            <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 800px; margin: 2rem auto; padding: 2rem; border: 1px solid #e2e8f0; border-radius: 8px; }
                        h1, h2, h3 { color: #2d3748; }
                        h1 { font-size: 2em; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; margin-bottom: 1rem; }
                        h2 { font-size: 1.5em; margin-top: 2rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3rem; }
                        p { margin-bottom: 1rem; }
                        .log-entry { background-color: #f7fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 1rem; margin-bottom: 1rem; }
                        .log-title { font-size: 1.2em; font-weight: bold; color: #4a5568; }
                        .log-meta { font-size: 0.9em; color: #718096; margin-bottom: 0.5rem; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Weekly Digest for ${child.name}</h1>
                        <p><strong>Date of Birth:</strong> ${new Date(child.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</p>
                        <p><strong>Report Period:</strong> ${new Date(startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${new Date(endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        
                        <h2>Summary of Logs</h2>
                        
                        ${logs && logs.length > 0 ? logs.map(log => `
                            <div class="log-entry">
                                <p class="log-title">${log.original_entry.title || 'Log Entry'}</p>
                                <p class="log-meta">
                                    <strong>Date:</strong> ${new Date(log.timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })} | 
                                    <strong>Author:</strong> ${log.author} | 
                                    <strong>Type:</strong> ${log.type}
                                </p>
                                <p>${log.original_entry.description || 'No description provided.'}</p>
                            </div>
                        `).join('') : '<p>No log entries found for this period.</p>'}
                    </div>
                </body>
            </html>
        `;

        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
        });
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
        await browser.close();

        return new Response(pdfBuffer, {
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="digest-${child.name.replace(/\s+/g, '_')}.pdf"`,
            },
            status: 200,
        });

    } catch (error) {
        console.error('Error generating PDF digest:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
})


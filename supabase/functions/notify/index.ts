import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import nodemailer from "https://esm.sh/nodemailer"

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID')
const twilioToken = Deno.env.get('TWILIO_AUTH_TOKEN')
const twilioPhone = Deno.env.get('TWILIO_PHONE_NUMBER')

const supabase = createClient(supabaseUrl!, supabaseKey!)

serve(async (req) => {
    const { record, old_record, type, table, schema } = await req.json()

    // Extract data from the webhook record
    const requestId = record.id
    const userId = record.user_id
    const status = record.status
    const workerId = record.worker_id
    const userPhone = record.mobile_contact

    // Determine the event
    let event = null
    if (type === 'UPDATE' && !old_record.worker_id && record.worker_id) {
        event = 'WORKER_ASSIGNED'
    } else if (type === 'UPDATE' && old_record.status !== 'Completed' && record.status === 'Completed') {
        event = 'REQUEST_COMPLETED'
    }

    if (!event) return new Response(JSON.stringify({ skipped: true }), { headers: { "Content-Type": "application/json" } })

    let message = ""
    let notificationType = ""

    // 1. Handle WORKER_ASSIGNED
    if (event === 'WORKER_ASSIGNED') {
        message = `QuickClean: A worker (ID: ${workerId}) has been assigned to your request ${requestId}. They will arrive shortly!`
        notificationType = 'SMS'

        // SMS via Twilio
        if (twilioSid && twilioToken) {
            await fetch(
                `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Basic ${btoa(`${twilioSid}:${twilioToken}`)}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        To: userPhone,
                        From: twilioPhone!,
                        Body: message,
                    }),
                }
            )
        }
    }

    // 2. Handle REQUEST_COMPLETED
    if (event === 'REQUEST_COMPLETED') {
        message = `Your request ${requestId} has been completed. Please rate our service: https://quickclean.dashboard/feedback?id=${requestId}`
        notificationType = 'EMAIL'

        // Email via Nodemailer
        const transporter = nodemailer.createTransport({
            host: Deno.env.get('SMTP_HOST'),
            port: 587,
            auth: {
                user: Deno.env.get('SMTP_USER'),
                pass: Deno.env.get('SMTP_PASS'),
            },
        })

        // Fetch user email if needed, assuming it's available or stored
        // For this demo, we'll log it and assume SMTP is configured
        console.log(`Sending email to user for request ${requestId}`)
    }

    // 3. Log notification to database
    await supabase
        .from('notifications')
        .insert({
            user_id: userId,
            request_id: requestId,
            message: message,
            type: notificationType
        })

    return new Response(JSON.stringify({ success: true, event }), { headers: { "Content-Type": "application/json" } })
})

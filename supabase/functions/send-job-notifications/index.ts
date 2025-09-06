import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface JobNotificationPayload {
  job_id: string;
  job_title: string;
  company_name: string;
  city: string;
  category?: string;
  job_type?: string;
  experience_level?: string;
  description?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { 
      job_id, 
      job_title, 
      company_name, 
      city,
      category = '',
      job_type = '',
      experience_level = '',
      description = ''
    }: JobNotificationPayload = await req.json();

    console.log('Processing notifications for job:', { 
      job_id, 
      job_title, 
      company_name, 
      city,
      category,
      job_type,
      experience_level 
    });

    // Get all job seekers with their notification preferences
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select(`
        user_id, 
        telegram_user_id, 
        location,
        notification_categories,
        notification_locations,
        notification_keywords,
        notification_job_types,
        notification_experience_levels,
        notification_enabled,
        email_notifications,
        telegram_notifications,
        full_name
      `)
      .eq('user_type', 'job_seeker')
      .eq('notification_enabled', true);

    if (profilesError) {
      throw profilesError;
    }

    console.log(`Found ${profiles?.length || 0} job seekers with notifications enabled`);

    const notifications = [];
    const telegramNotifications = [];
    const emailNotifications = [];
    let matchedUsers = 0;

    for (const profile of profiles || []) {
      // Check if job matches user preferences using the database function
      const { data: matchResult, error: matchError } = await supabaseClient
        .rpc('job_matches_user_preferences', {
          job_category: category,
          job_city: city,
          job_title: job_title,
          job_description: description,
          job_type: job_type,
          job_experience_level: experience_level,
          user_categories: profile.notification_categories || [],
          user_locations: profile.notification_locations || [],
          user_keywords: profile.notification_keywords || [],
          user_job_types: profile.notification_job_types || [],
          user_experience_levels: profile.notification_experience_levels || []
        });

      if (matchError) {
        console.error('Error checking preferences for user:', profile.user_id, matchError);
        continue;
      }

      // Only send notification if job matches user preferences
      if (matchResult) {
        matchedUsers++;
        
        // Create in-app notification
        const notification = {
          user_id: profile.user_id,
          job_id: job_id,
          title: 'አዲስ የስራ እድል ታገኘ!',
          message: `${company_name} በ${city} ውስጥ "${job_title}" ስራ አውጥቷል። ይህ ስራ ከእርስዎ ምርጫዎች ጋር ይዛመዳል።`,
          is_read: false,
        };

        notifications.push(notification);

        // Prepare Telegram notification if enabled
        if (profile.telegram_notifications && profile.telegram_user_id) {
          telegramNotifications.push({
            chat_id: profile.telegram_user_id,
            text: `🎯 አዲስ የስራ እድል ታገኘ!\n\n` +
                  `💼 የስራ ርዕስ: ${job_title}\n` +
                  `🏢 ኩባንያ: ${company_name}\n` +
                  `📍 ከተማ: ${city}\n` +
                  `📂 ምድብ: ${category || 'አልተገለጸም'}\n` +
                  `⏰ የስራ አይነት: ${job_type || 'አልተገለጸም'}\n` +
                  `📊 የልምድ ደረጃ: ${experience_level || 'አልተገለጸም'}\n\n` +
                  `ይህ ስራ ከእርስዎ የማሳወቂያ ምርጫዎች ጋር ይዛመዳል።\n\n` +
                  `ለበለጠ መረጃ መተግበሪያውን ይጎብኙ።`,
          });
        }

        // Prepare email notification if enabled
        if (profile.email_notifications) {
          // Get user email from auth.users
          const { data: userData, error: userError } = await supabaseClient
            .auth.admin.getUserById(profile.user_id);

          if (!userError && userData?.user?.email) {
            emailNotifications.push({
              to: userData.user.email,
              subject: `አዲስ የስራ እድል: ${job_title} በ ${company_name}`,
              html: `
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="UTF-8">
                  <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #4CAF50; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
                    .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
                    .job-details { margin: 20px 0; }
                    .job-detail-item { margin: 10px 0; }
                    .label { font-weight: bold; color: #333; }
                    .button { display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                    .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>አዲስ የስራ እድል ታገኘ!</h1>
                    </div>
                    <div class="content">
                      <p>ሰላም ${profile.full_name || 'የተከበርክ/ሽ ተጠቃሚ'},</p>
                      
                      <p>ከእርስዎ የማሳወቂያ ምርጫዎች ጋር የሚዛመድ አዲስ የስራ እድል ታገኘ:</p>
                      
                      <div class="job-details">
                        <div class="job-detail-item">
                          <span class="label">💼 የስራ ርዕስ:</span> ${job_title}
                        </div>
                        <div class="job-detail-item">
                          <span class="label">🏢 ኩባንያ:</span> ${company_name}
                        </div>
                        <div class="job-detail-item">
                          <span class="label">📍 ከተማ:</span> ${city}
                        </div>
                        ${category ? `<div class="job-detail-item">
                          <span class="label">📂 ምድብ:</span> ${category}
                        </div>` : ''}
                        ${job_type ? `<div class="job-detail-item">
                          <span class="label">⏰ የስራ አይነት:</span> ${job_type}
                        </div>` : ''}
                        ${experience_level ? `<div class="job-detail-item">
                          <span class="label">📊 የልምድ ደረጃ:</span> ${experience_level}
                        </div>` : ''}
                      </div>
                      
                      ${description ? `<div style="margin: 20px 0;">
                        <p class="label">መግለጫ:</p>
                        <p>${description.substring(0, 200)}${description.length > 200 ? '...' : ''}</p>
                      </div>` : ''}
                      
                      <a href="${Deno.env.get('PUBLIC_SITE_URL') || 'https://zehulu.jobs'}/#/jobs/${job_id}" class="button">
                        ሙሉ መረጃ ይመልከቱ
                      </a>
                      
                      <div class="footer">
                        <p>ይህ ኢሜይል የተላከልዎት በZehulu Jobs ላይ ባዘጋጁት የማሳወቂያ ምርጫ መሰረት ነው።</p>
                        <p>የማሳወቂያ ምርጫዎችን ለመቀየር መተግበሪያውን ይጎብኙ።</p>
                      </div>
                    </div>
                  </div>
                </body>
                </html>
              `,
              name: profile.full_name || 'Job Seeker'
            });
          }
        }
      }
    }

    console.log(`Matched ${matchedUsers} users based on preferences`);

    // Insert notifications into database
    if (notifications.length > 0) {
      const { error: notificationError } = await supabaseClient
        .from('notifications')
        .insert(notifications);

      if (notificationError) {
        throw notificationError;
      }

      console.log(`Created ${notifications.length} in-app notifications`);
    }

    // Send Telegram notifications
    const telegramBotToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    
    if (telegramBotToken && telegramNotifications.length > 0) {
      console.log(`Sending ${telegramNotifications.length} Telegram notifications`);
      
      const telegramPromises = telegramNotifications.map(async (notification) => {
        try {
          const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...notification,
              parse_mode: 'HTML'
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Failed to send Telegram message to ${notification.chat_id}:`, errorText);
          } else {
            console.log(`Telegram notification sent to ${notification.chat_id}`);
          }
        } catch (error) {
          console.error(`Error sending Telegram notification to ${notification.chat_id}:`, error);
        }
      });

      await Promise.allSettled(telegramPromises);
    }

    // Send email notifications using Resend API
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (resendApiKey && emailNotifications.length > 0) {
      console.log(`Sending ${emailNotifications.length} email notifications`);
      
      const emailPromises = emailNotifications.map(async (emailData) => {
        try {
          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: 'Zehulu Jobs <notifications@zehulu.jobs>',
              to: emailData.to,
              subject: emailData.subject,
              html: emailData.html,
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Failed to send email to ${emailData.to}:`, errorText);
          } else {
            console.log(`Email notification sent to ${emailData.to}`);
          }
        } catch (error) {
          console.error(`Error sending email to ${emailData.to}:`, error);
        }
      });

      await Promise.allSettled(emailPromises);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        total_job_seekers: profiles?.length || 0,
        matched_users: matchedUsers,
        notifications_sent: notifications.length,
        telegram_notifications_sent: telegramNotifications.length,
        email_notifications_sent: emailNotifications.length
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error('Error in send-job-notifications function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
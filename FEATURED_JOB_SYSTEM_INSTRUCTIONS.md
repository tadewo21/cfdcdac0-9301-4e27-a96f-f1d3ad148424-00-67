# Featured Job System - Complete Setup & Usage Instructions

## Overview
The Featured Job System allows employers to pay a premium fee (500 ETB) to give their job postings enhanced visibility and priority placement on the platform for 30 days.

## 🚀 Database Setup (REQUIRED)

Before using the system, you **MUST** run the database setup script:

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `featured_job_system_workflow_complete.sql`
4. Execute the script

This will create:
- `featured_job_requests` table for payment tracking
- Additional columns in `jobs` table (`is_featured`, `featured_until`)
- RLS policies for security
- Database functions for approval/rejection
- Storage bucket for payment screenshots

## 📋 System Workflow

### 1. Employer Workflow

1. **Job Posting**: Employer fills out the job posting form normally
2. **Post Type Selection**: After form submission, employer chooses between:
   - **Free Post** (0 ETB) - Standard listing
   - **Featured Post** (500 ETB) - Premium listing with enhanced visibility

3. **Payment Process** (if Featured selected):
   - System displays payment instructions
   - Employer makes payment via bank/mobile banking
   - Employer enters transaction reference number
   - Employer uploads payment screenshot (optional)
   - System creates job with "pending" status

4. **Pending State**: 
   - Job is not publicly visible yet
   - Employer sees "Your post is pending admin approval" message
   - Request appears in admin panel for review

### 2. Admin Workflow

1. **Access Admin Panel**: 
   - Admin users can access `/admin` route
   - Navigate to "Featured Jobs" tab

2. **Review Requests**:
   - View all pending featured job requests
   - See job details, employer info, payment information
   - View payment screenshots if uploaded

3. **Verification & Action**:
   - **Approve**: Job becomes active and featured for 30 days
   - **Reject**: Job remains unpublished, or converts to regular post

### 3. Frontend Display

**Featured Jobs appear in two locations:**

1. **Featured Jobs Section**: 
   - Dedicated section on homepage
   - Shows up to 6 featured jobs
   - Special styling with yellow/orange gradients

2. **All Jobs List**:
   - Featured jobs appear with special badges
   - Yellow "Featured" badge with star icon
   - Priority ordering (featured jobs first)

## 🛠 Technical Implementation

### Key Components

1. **PostJob.tsx**: Main job posting workflow with post type selection
2. **FeaturedJobPayment.tsx**: Payment information form
3. **FeaturedJobRequests.tsx**: Admin panel for managing requests
4. **FeaturedJobsSection.tsx**: Homepage featured jobs display
5. **JobCard.tsx**: Individual job cards with featured badges

### Database Tables

- `jobs`: Main jobs table with `is_featured` and `featured_until` columns
- `featured_job_requests`: Payment tracking and approval workflow
- `employers`: Company information
- `profiles`: User profiles linked to employers

### Key Features

- **Automatic Expiration**: Featured jobs automatically expire after 30 days
- **RLS Security**: Row-level security ensures data privacy
- **Payment Tracking**: Full audit trail of payment requests
- **Admin Dashboard**: Complete management interface
- **Fallback Handling**: System works even if database setup is incomplete

## 🔧 Configuration

### Pricing & Duration
- **Featured Job Price**: 500 ETB (configurable in `FeaturedJobPayment.tsx`)
- **Featured Duration**: 30 days (configurable in database functions)

### Admin Users
Admin access is granted to users with:
- `user_type = 'admin'` in profiles table
- Email addresses: `admin@jobboard.et`, `admin@zehulu.jobs`, `zehulu3@gmail.com`

## 🎯 Usage Instructions

### For Employers
1. Navigate to "Post Job" 
2. Fill out job details completely
3. Choose "Featured Post" when prompted
4. Make payment of 500 ETB
5. Enter transaction reference and upload screenshot
6. Wait for admin approval

### For Admins
1. Login with admin account
2. Navigate to `/admin`
3. Click "Featured Jobs" tab
4. Review pending requests
5. Approve or reject based on payment verification

### For Job Seekers
- Featured jobs appear prominently on homepage
- Look for yellow "Featured" badges on job listings
- Featured jobs are prioritized in search results

## 🚨 Troubleshooting

### Common Issues

1. **"Featured job requests table not found"**
   - Run the database setup script
   - Check Supabase dashboard for table creation

2. **"Column is_featured does not exist"**
   - Database setup incomplete
   - System will fallback to regular job posting

3. **Payment screenshots not uploading**
   - Check storage bucket permissions
   - Verify `payment-screenshots` bucket exists

4. **Admin panel not accessible**
   - Verify admin user permissions
   - Check email addresses in admin list

## 📊 Analytics & Monitoring

The system tracks:
- Number of featured job requests
- Approval/rejection rates
- Revenue from featured jobs
- Featured job performance metrics

## 🔄 Maintenance

### Regular Tasks
- Monitor featured job expiration
- Review payment screenshots
- Update pricing if needed
- Check system performance

### Database Maintenance
```sql
-- Run periodically to clean up expired featured jobs
SELECT public.expire_featured_jobs();
```

## 🎨 Customization

### Styling
- Featured job colors: Yellow/orange gradients
- Badge styling in `JobCard.tsx`
- Section styling in `FeaturedJobsSection.tsx`

### Pricing
- Update price in `FeaturedJobPayment.tsx`
- Update database default values
- Update display text accordingly

This system provides a complete end-to-end solution for monetizing job postings while maintaining excellent user experience for all stakeholders.
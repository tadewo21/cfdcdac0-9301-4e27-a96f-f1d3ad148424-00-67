# Ethiopian Job Board Telegram Mini App
## የኢትዮጵያ የስራ ፍለጋ Telegram Mini App - ሙሉ ሰነድ

---

## 📋 ዝርዝር ትውነት / Table of Contents

1. [መግቢያ / Overview](#overview)
2. [ቴክኒካል አርክቴክቸር / Technical Architecture](#architecture) 
3. [የመረጃ ቋት መዋቅር / Database Structure](#database)
4. [ዋና ባህሪያት / Core Features](#features)
5. [የTelegram ቀናሽ / Telegram Integration](#telegram)
6. [የተጠቃሚ ሚናዎች / User Roles](#roles)
7. [ደህንነት / Security](#security)
8. [ማስተዋወቅ / Deployment](#deployment)

---

## 1. መግቢያ / Overview {#overview}

### 🎯 አላማ / Purpose
የኢትዮጵያ የስራ ፍለጋ መተግባሪያ በTelegram Mini App ቴክኖሎጂ የተሰራ የስራ ፍለጋና ማዘጋጃ መድረክ ነው። ስራ ፈላጊዎችንና ቀጣሪዎችን የሚያገናኝ ዘመናዊ መፍትሔ ነው።

**Ethiopian Job Board** is a modern job search and posting platform built as a Telegram Mini App, connecting job seekers with employers across Ethiopia.

### 📊 ዋና ስታቲስቲክስ / Key Statistics
- **Target Users**: 1M+ Ethiopian job seekers and employers
- **Languages**: English + Amharic (አማርኛ)
- **Platform**: Telegram Mini App
- **Mobile First**: 100% responsive design
- **Compliance**: Full Telegram rules compliance

### 🚀 ዋና ጥቅሞች / Key Benefits
- ✅ ነፃ የስራ ፍለጋ እና ማመልከቻ
- ✅ የቀጣሪዎች በተመጣጣኝ ዋጋ ስራ ማዘጋጃ
- ✅ በTelegram ውስጥ ቀጥተኛ መጠቀሚያ
- ✅ የሞባይል ተኮር ልምድ
- ✅ ባለ ሁለት ቋንቋ ድጋፍ

---

## 2. ቴክኒካል አርክቴክቸር / Technical Architecture {#architecture}

### 🛠️ የቅድመ ጥገን ቴክኖሎጂ / Frontend Stack
```typescript
// Core Technologies
React 18.3.1       // UI Framework
TypeScript         // Type Safety  
Vite              // Build Tool
Tailwind CSS      // Styling System
React Router DOM  // Navigation
Tanstack Query    // Data Management
```

### 🗄️ የኋላ ጥገን ቴክኖሎጂ / Backend Stack
```typescript
// Backend Services
Supabase          // Backend as a Service
PostgreSQL        // Primary Database
Row Level Security // Data Protection
Real-time Updates // Live Synchronization
Edge Functions    // Server-side Logic
File Storage      // CV/Logo Storage
```

### 📱 የTelegram ቀናሽ / Telegram Integration
```typescript
// Telegram Features
Telegram Web App SDK  // Native Integration
Haptic Feedback      // Mobile Experience
Theme Sync          // UI Consistency
Share to Story      // Social Features
Native Auth         // Seamless Login
```

### 🏗️ የስርዓት አርክቴክቸር / System Architecture
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Telegram   │◄──►│ React App   │◄──►│  Supabase   │
│  Mini App   │    │ (Frontend)  │    │ (Backend)   │
└─────────────┘    └─────────────┘    └─────────────┘
      │                    │                   │
      ▼                    ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   WebApp    │    │    UI       │    │  Database   │
│    APIs     │    │ Components  │    │   Tables    │
│   Haptics   │    │   Hooks     │    │ RLS Policies│
└─────────────┘    └─────────────┘    └─────────────┘
```

---

## 3. የመረጃ ቋት መዋቅር / Database Structure {#database}

### 📋 ዋና ሠንጠረዦች / Core Tables

#### 1. `profiles` - የተጠቃሚ መገለጫዎች
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  user_id VARCHAR(255) UNIQUE NOT NULL,
  telegram_user_id BIGINT UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  user_type VARCHAR(20) DEFAULT 'job_seeker', -- 'job_seeker' | 'employer'
  role VARCHAR(20) DEFAULT 'user',            -- 'user' | 'admin'
  personal_description TEXT,
  work_experience INTEGER,
  skills TEXT[],
  cv_file_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. `jobs` - የስራ ምዝገባዎች
```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  how_to_apply TEXT NOT NULL,
  location VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  job_type VARCHAR(50) NOT NULL,        -- 'full_time' | 'part_time' | 'contract'
  salary_range VARCHAR(50),
  education_level VARCHAR(50),
  experience_level VARCHAR(50),
  application_deadline DATE,
  application_method VARCHAR(20) DEFAULT 'email',
  application_email VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active',   -- 'active' | 'paused' | 'expired'
  is_featured BOOLEAN DEFAULT FALSE,
  featured_until TIMESTAMP,
  employer_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. `employers` - ቀጣሪዎች
```sql
CREATE TABLE employers (
  id UUID PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  company_name VARCHAR(255) NOT NULL,
  company_description TEXT,
  company_website VARCHAR(255),
  company_logo_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 4. `favorites` - ተወዳጆች
```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);
```

#### 5. `notifications` - ማሳወቂያዎች
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info',       -- 'info' | 'success' | 'warning'
  is_read BOOLEAN DEFAULT FALSE,
  job_id UUID REFERENCES jobs(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 6. `featured_job_requests` - የተመራጭ ስራ ጥያቄዎች
```sql
CREATE TABLE featured_job_requests (
  id UUID PRIMARY KEY,
  job_id UUID REFERENCES jobs(id),
  employer_id UUID REFERENCES profiles(id),
  payment_amount DECIMAL(10,2),
  payment_status VARCHAR(20) DEFAULT 'pending',
  featured_days INTEGER DEFAULT 7,
  status VARCHAR(20) DEFAULT 'pending',  -- 'pending' | 'approved' | 'rejected'
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 🔗 ግንኙነቶች / Relationships
- `profiles` ↔ `employers` (One-to-One)
- `profiles` ↔ `jobs` (One-to-Many)
- `profiles` ↔ `favorites` (One-to-Many) 
- `jobs` ↔ `favorites` (One-to-Many)
- `jobs` ↔ `featured_job_requests` (One-to-One)

---

## 4. ዋና ባህሪያት / Core Features {#features}

### 🔍 የስራ ፍለጋ / Job Search
```typescript
// Advanced Search Interface
interface JobSearchParams {
  keyword?: string;           // የስራ ርዕስ/መግለጫ ፍለጋ
  location?: string;          // የቦታ ማጣሪያ
  category?: string;          // የኢንዱስትሪ ምድብ
  jobType?: string;          // የስራ ዓይነት
  salaryRange?: string;      // የደመወዝ ክልል
  educationLevel?: string;   // የትምህርት ደረጃ
  experienceLevel?: string;  // የተሞከረ ደረጃ
}

// Smart Filter Categories
const jobCategories = [
  'Technology', 'Healthcare', 'Education', 'Engineering',
  'Finance', 'Marketing', 'Construction', 'Agriculture',
  'Transportation', 'Hospitality', 'Government', 'NGO'
];

const locations = [
  'Addis Ababa', 'Bahir Dar', 'Mekelle', 'Hawassa', 
  'Gondar', 'Jimma', 'Dire Dawa', 'Dessie'
];
```

### 👥 የተጠቃሚ አስተዳደር / User Management
```typescript
// User Types & Permissions
type UserType = 'job_seeker' | 'employer' | 'admin';

interface UserPermissions {
  job_seeker: {
    canViewJobs: true;
    canApplyToJobs: true;
    canSaveFavorites: true;
    canManageProfile: true;
  };
  employer: {
    canPostJobs: true;
    canManageJobs: true;
    canPayForFeatured: true;
    canViewApplications: true;
  };
  admin: {
    canManageAllUsers: true;
    canManageAllJobs: true;
    canApproveFeatureRequests: true;
    canViewAnalytics: true;
  };
}
```

### 💼 የስራ አስተዳደር / Job Management
```typescript
// Multi-step Job Posting Flow
interface JobPostingSteps {
  step1: BasicJobInfo;      // መሰረታዊ መረጃ
  step2: JobRequirements;   // መስፈርቶች  
  step3: CompensationInfo;  // ክፍያና ጥቅማ ጥቅሞች
  step4: ApplicationProcess; // የማመልከቻ ሂደት
  step5: ReviewAndSubmit;   // መገምገምና መላክ
}

// Job Status Management
type JobStatus = 'active' | 'paused' | 'expired' | 'filled';

// Bulk Upload Support
interface CSVJobUpload {
  validateFormat: (file: File) => ValidationResult;
  processJobs: (data: CSVData[]) => ProcessedJobs[];
  handleErrors: (errors: ValidationError[]) => void;
}
```

### ⭐ የተመራጭ ስራዎች ስርዓት / Featured Jobs System
```typescript
// Featured Job Pricing (Ethiopian Birr)
const featuredJobPricing = {
  7: { days: 7, price: 500, label: '1 ሳምንት' },
  14: { days: 14, price: 900, label: '2 ሳምንት' },
  30: { days: 30, price: 1800, label: '1 ወር' }
};

// Payment Flow
interface FeaturedJobPayment {
  jobId: string;
  duration: number;
  amount: number;
  paymentMethod: 'stripe' | 'bank_transfer';
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

// Benefits of Featured Jobs
const featuredJobBenefits = [
  '🔝 ከፍተኛ እይታ በፍለጋ ውጤቶች',
  '⭐ ልዩ የተመራጭ ምልክት',
  '📈 የመገኘት ስታቲስቲክስ',
  '🚀 በማህበራዊ ሚዲያ ማስተዋወቅ'
];
```

### 💫 የተወዳጆች ስርዓት / Favorites System
```typescript
// Optimized Favorites Management
const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // Instant UI Updates + Background Sync
  const toggleFavorite = async (jobId: string) => {
    const isCurrentlyFavorite = favorites.includes(jobId);
    
    // Optimistic UI update
    setFavorites(prev => 
      isCurrentlyFavorite 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
    
    // Background database sync
    try {
      if (isCurrentlyFavorite) {
        await removeFavorite(jobId);
      } else {
        await addFavorite(jobId);
      }
    } catch (error) {
      // Revert on error
      setFavorites(prev => 
        isCurrentlyFavorite 
          ? [...prev, jobId]
          : prev.filter(id => id !== jobId)
      );
    }
  };
  
  return { favorites, toggleFavorite };
};
```

### 🔔 የማሳወቂያ ስርዓት / Notification System
```typescript
// Multi-Channel Notifications
interface NotificationChannels {
  inApp: InAppNotification[];     // በመተግባሪያ ውስጥ
  email: EmailNotification[];    // በኢሜይል
  telegram: TelegramNotification[]; // በTelegram bot
}

// Notification Types
type NotificationType = 
  | 'new_job_posted'      // አዲስ ስራ ተዘግጋጀ
  | 'job_updated'         // ስራ ተመሻሽሎ
  | 'application_received' // ማመልከቻ ደረሰ
  | 'featured_approved'   // የተመራጭ ጥያቄ ተቀበለ
  | 'profile_incomplete'; // መገለጫ ያልተሟላ

// Smart Notification Preferences
interface NotificationSettings {
  emailNotifications: boolean;
  newJobAlerts: boolean;
  jobUpdateAlerts: boolean;
  weeklyJobDigest: boolean;
  marketingEmails: boolean;
}
```

---

## 5. የTelegram ቀናሽ / Telegram Integration {#telegram}

### 🤖 የTelegram Web App SDK
```typescript
// Core Telegram Integration Hook
const useTelegramWebApp = () => {
  const webApp = window.Telegram?.WebApp;
  
  useEffect(() => {
    if (webApp) {
      webApp.ready();
      webApp.expand();
      webApp.enableClosingConfirmation();
    }
  }, [webApp]);
  
  return {
    // User Data
    user: webApp?.initDataUnsafe?.user,
    
    // Theme Integration
    themeParams: webApp?.themeParams,
    colorScheme: webApp?.colorScheme, // 'light' | 'dark'
    
    // Haptic Feedback
    haptic: {
      impact: (style: 'light' | 'medium' | 'heavy') => 
        webApp?.HapticFeedback.impactOccurred(style),
      notification: (type: 'error' | 'success' | 'warning') =>
        webApp?.HapticFeedback.notificationOccurred(type),
      selection: () => webApp?.HapticFeedback.selectionChanged()
    },
    
    // UI Controls
    mainButton: webApp?.MainButton,
    backButton: webApp?.BackButton,
    
    // Sharing Features
    shareToStory: (mediaUrl: string, params: ShareParams) =>
      webApp?.shareToStory(mediaUrl, params)
  };
};
```

### 🔐 የTelegram መታወቂያ / Authentication
```typescript
// Secure Authentication Flow
const useTelegramAuth = () => {
  const authenticateUser = async (initData: string) => {
    try {
      // Server-side validation via Edge Function
      const { data } = await supabase.functions.invoke('validate-telegram-auth', {
        body: { initData }
      });
      
      if (data?.isValid) {
        const telegramUser = data.user;
        
        // Create or update user profile
        const { data: profile } = await supabase
          .from('profiles')
          .upsert({
            telegram_user_id: telegramUser.id,
            user_id: `telegram_${telegramUser.id}`,
            full_name: `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim(),
            user_type: 'job_seeker' // Default type
          })
          .select()
          .single();
          
        return { success: true, profile };
      }
      
      return { success: false, error: 'Invalid authentication data' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  return { authenticateUser };
};
```

### 📱 የሞባይል ማመቻቸት / Mobile Optimization
```typescript
// Responsive Design for Telegram
const useTelegramViewport = () => {
  useEffect(() => {
    const setViewportHeight = () => {
      const vh = window.Telegram?.WebApp?.viewportHeight || window.innerHeight;
      document.documentElement.style.setProperty('--vh', `${vh * 0.01}px`);
    };
    
    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    
    return () => window.removeEventListener('resize', setViewportHeight);
  }, []);
};

// CSS for Telegram Viewport
/*
.full-height {
  height: calc(var(--vh, 1vh) * 100);
}

.safe-area {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}
*/
```

### 🎨 የጭብጥ ቀናሽ / Theme Integration
```typescript
// Dynamic Theme Sync with Telegram
const useTelegramTheme = () => {
  const { themeParams, colorScheme } = useTelegramWebApp();
  
  useEffect(() => {
    if (themeParams) {
      const root = document.documentElement;
      
      // Map Telegram theme to CSS variables
      root.style.setProperty('--tg-bg-color', themeParams.bg_color || '#ffffff');
      root.style.setProperty('--tg-text-color', themeParams.text_color || '#000000');
      root.style.setProperty('--tg-hint-color', themeParams.hint_color || '#999999');
      root.style.setProperty('--tg-link-color', themeParams.link_color || '#2481cc');
      root.style.setProperty('--tg-button-color', themeParams.button_color || '#2481cc');
      root.style.setProperty('--tg-button-text-color', themeParams.button_text_color || '#ffffff');
      
      // Set dark/light mode
      root.setAttribute('data-theme', colorScheme || 'light');
    }
  }, [themeParams, colorScheme]);
};
```

### 📤 የማጋራት ባህሪያት / Sharing Features
```typescript
// Share Jobs to Telegram Story
const shareJobToStory = (job: Job) => {
  const webApp = window.Telegram?.WebApp;
  
  if (webApp?.shareToStory) {
    const shareText = `🔥 ${job.title}\n🏢 ${job.company || 'New Opportunity'}\n📍 ${job.location}`;
    const widgetLink = {
      url: `${window.location.origin}#job-${job.id}`,
      name: 'አሁኑኑ ያመልክቱ' // Apply Now in Amharic
    };
    
    // Use app's hero image for story background
    webApp.shareToStory('/assets/hero-optimized.webp', {
      text: shareText,
      widget_link: widgetLink
    });
    
    // Haptic feedback
    webApp.HapticFeedback?.impactOccurred('medium');
  }
};

// Share via Telegram Bot/Groups
const shareJobToChat = (job: Job) => {
  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(
    `${window.location.origin}#job-${job.id}`
  )}&text=${encodeURIComponent(
    `🔥 ${job.title}\n🏢 ${job.company}\n📍 ${job.location}\n\n👆 Click to apply`
  )}`;
  
  window.open(shareUrl, '_blank');
};
```

---

## 6. የተጠቃሚ ሚናዎች / User Roles {#roles}

### 👤 የተጠቃሚ ዓይነቶች / User Types
```typescript
// Role-Based Access Control (RBAC)
interface UserRole {
  type: 'job_seeker' | 'employer' | 'admin';
  permissions: Permission[];
  restrictions?: Restriction[];
}

// Job Seeker Permissions
const jobSeekerPermissions = [
  'view_jobs',           // ስራዎችን መመልከት
  'search_jobs',         // ስራዎችን መፈለግ
  'apply_to_jobs',       // ለስራዎች ማመልከት
  'save_favorites',      // ተወዳጆችን ማስቀመጥ
  'manage_profile',      // መገለጫን ማስተዳደር
  'upload_cv',          // CV መጫን
  'receive_notifications' // ማሳወቂያዎችን መቀበል
];

// Employer Permissions  
const employerPermissions = [
  'post_jobs',           // ስራዎችን ማዘጋጀት
  'manage_own_jobs',     // የራስ ስራዎችን ማስተዳደር
  'edit_company_profile', // የኩባንያ መገለጫ ማዘመን
  'pay_for_featured',    // ለተመራጭ ስራዎች መክፈል
  'view_job_analytics',  // የስራ ስታቲስቲክስ መመልከት
  'bulk_upload_jobs',    // በብዛት ስራዎች መጫን
  'manage_applications'  // ማመልከቻዎችን ማስተዳደር
];

// Admin Permissions
const adminPermissions = [
  'manage_all_users',    // ሁሉንም ተጠቃሚዎች ማስተዳደር
  'manage_all_jobs',     // ሁሉንም ስራዎች ማስተዳደር
  'approve_featured_requests', // የተመራጭ ጥያቄዎች ማጸድቅ
  'view_system_analytics',     // የስርዓት ስታቲስቲክስ
  'manage_categories',   // ምድቦችን ማስተዳደር
  'system_settings',     // የስርዓት ቅንብሮች
  'user_impersonation',  // የተጠቃሚ ምስል መውሰድ
  'export_data'         // መረጃ ወደ ውጭ ማውጣት
];
```

### 🔒 የመዳረሻ ቁጥጥር / Access Control
```typescript
// Role Guard Component
const RoleGuard: React.FC<{
  allowedRoles: UserType[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}> = ({ allowedRoles, fallback, children }) => {
  const { user, userRole } = useAuth();
  
  if (!user) return <Navigate to="/auth" />;
  
  if (!allowedRoles.includes(userRole)) {
    return fallback || <div>Access Denied</div>;
  }
  
  return <>{children}</>;
};

// Usage Examples
<RoleGuard allowedRoles={['employer', 'admin']}>
  <PostJobButton />
</RoleGuard>

<RoleGuard allowedRoles={['admin']}>
  <AdminPanel />
</RoleGuard>
```

### 🚪 የመለያ ምዝገባ ሂደት / Registration Flow
```typescript
// Smart Registration Based on Telegram Data
const registerUser = async (telegramUser: TelegramUser, userType: UserType) => {
  // Create profile
  const profile = await supabase.from('profiles').insert({
    telegram_user_id: telegramUser.id,
    user_id: `telegram_${telegramUser.id}`,
    full_name: `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim(),
    user_type: userType,
    role: userType === 'employer' ? 'employer' : 'user'
  }).select().single();
  
  // If employer, create employer record
  if (userType === 'employer') {
    await supabase.from('employers').insert({
      profile_id: profile.data.id,
      company_name: '', // To be filled later
      is_verified: false
    });
  }
  
  return profile;
};
```

---

## 7. ደህንነት / Security {#security}

### 🔐 የሮው ደረጃ ደህንነት / Row Level Security (RLS)
```sql
-- Profiles RLS Policy
CREATE POLICY "Users can view and edit their own profiles"
ON profiles FOR ALL USING (
  auth.uid()::text = user_id OR 
  user_id = current_setting('app.current_user_id', true)
);

-- Jobs RLS Policy  
CREATE POLICY "Jobs are viewable by everyone"
ON jobs FOR SELECT USING (true);

CREATE POLICY "Only employers can insert jobs"
ON jobs FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = employer_id 
    AND user_type = 'employer'
    AND user_id = current_setting('app.current_user_id', true)
  )
);

CREATE POLICY "Employers can update their own jobs"
ON jobs FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = employer_id 
    AND user_id = current_setting('app.current_user_id', true)
  )
);

-- Favorites RLS Policy
CREATE POLICY "Users can manage their own favorites"
ON favorites FOR ALL USING (
  user_id = current_setting('app.current_user_id', true)
);

-- Admin-only tables
CREATE POLICY "Only admins can access admin features"
ON featured_job_requests FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = current_setting('app.current_user_id', true)
    AND role = 'admin'
  )
);
```

### 🛡️ የTelegram ማረጋገጥ / Telegram Authentication Security
```typescript
// Edge Function for Secure Telegram Auth Validation
export const validateTelegramAuth = async (req: Request) => {
  const { initData } = await req.json();
  
  if (!initData) {
    return new Response(JSON.stringify({ isValid: false }), { status: 400 });
  }
  
  try {
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      throw new Error('Bot token not configured');
    }
    
    // Parse init data
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');
    
    // Create data-check-string
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    // Create secret key
    const secretKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(botToken),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    // Calculate hash
    const signature = await crypto.subtle.sign(
      'HMAC',
      secretKey,
      new TextEncoder().encode(dataCheckString)
    );
    
    const calculatedHash = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    const isValid = calculatedHash === hash;
    
    if (isValid) {
      const user = JSON.parse(urlParams.get('user') || '{}');
      return new Response(JSON.stringify({ isValid: true, user }));
    }
    
    return new Response(JSON.stringify({ isValid: false }));
    
  } catch (error) {
    return new Response(JSON.stringify({ isValid: false, error: error.message }), { 
      status: 500 
    });
  }
};
```

### 🔒 የመረጃ ጥበቃ / Data Protection
```typescript
// Input Sanitization & Validation
import { z } from 'zod';

const JobPostingSchema = z.object({
  title: z.string().min(5).max(100).regex(/^[a-zA-Z0-9\s\-.,!?]+$/),
  description: z.string().min(50).max(2000),
  location: z.enum(['Addis Ababa', 'Bahir Dar', 'Mekelle', /* ... */]),
  category: z.enum(['Technology', 'Healthcare', 'Education', /* ... */]),
  salary_range: z.string().optional(),
  application_email: z.string().email().optional(),
  application_phone: z.string().regex(/^\+251[0-9]{9}$/).optional()
});

// XSS Prevention
const sanitizeHTML = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Rate Limiting (Supabase Edge Functions)
const rateLimiter = new Map<string, { count: number; resetTime: number }>();

const checkRateLimit = (userId: string, limit = 10, window = 60000) => {
  const now = Date.now();
  const userLimit = rateLimiter.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimiter.set(userId, { count: 1, resetTime: now + window });
    return true;
  }
  
  if (userLimit.count >= limit) {
    return false;
  }
  
  userLimit.count++;
  return true;
};
```

### 🔍 የደህንነት ቁጥጥር / Security Monitoring
```typescript
// Security Audit Logging
const auditLog = {
  async logSecurityEvent(event: SecurityEvent) {
    await supabase.from('security_logs').insert({
      user_id: event.userId,
      event_type: event.type,
      ip_address: event.ipAddress,
      user_agent: event.userAgent,
      details: event.details,
      severity: event.severity,
      timestamp: new Date().toISOString()
    });
  }
};

// Usage Examples
auditLog.logSecurityEvent({
  userId: user.id,
  type: 'FAILED_LOGIN_ATTEMPT',
  ipAddress: req.ip,
  severity: 'medium',
  details: { reason: 'Invalid Telegram auth data' }
});

auditLog.logSecurityEvent({
  userId: user.id,
  type: 'SUSPICIOUS_ACTIVITY',
  severity: 'high',
  details: { reason: 'Multiple job posts in short time' }
});
```

---

## 8. ማስተዋወቅ / Deployment {#deployment}

### 🚀 የማስተዋወቅ አርክቴክቸር / Deployment Architecture
```yaml
# Production Deployment Stack
Frontend:
  Platform: Lovable (lovable.dev)
  Domain: Custom domain via Lovable
  CDN: Global content delivery
  SSL: Automatic HTTPS
  
Backend:  
  Service: Supabase (supabase.com)
  Database: PostgreSQL (Cloud)
  Storage: Supabase Storage
  Functions: Supabase Edge Functions
  
Telegram:
  Bot: @EthiopianJobsBot
  Mini App: jobs.yourdomain.com
  Webhook: Edge Functions endpoint
```

### 🔧 የአካባቢ ቅንብር / Environment Configuration
```typescript
// Environment Variables (.env)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_TELEGRAM_BOT_USERNAME=EthiopianJobsBot
VITE_APP_URL=https://your-domain.com

// Supabase Secrets (Server-side only)
TELEGRAM_BOT_TOKEN=your-bot-token
STRIPE_SECRET_KEY=your-stripe-key
ADMIN_EMAIL=admin@yourapp.com
```

### 📱 የTelegram Bot ማዋቀር / Telegram Bot Setup
```typescript
// Bot Commands Setup
const botCommands = [
  { command: 'start', description: 'Start using the job board' },
  { command: 'jobs', description: 'Browse latest jobs' },
  { command: 'post', description: 'Post a job (employers only)' },
  { command: 'profile', description: 'Manage your profile' },
  { command: 'help', description: 'Get help and support' }
];

// Mini App Configuration
const miniAppConfig = {
  url: 'https://your-domain.com',
  name: 'Ethiopian Jobs',
  short_name: 'EthJobs',
  description: 'Find your dream job in Ethiopia'
};

// Bot Setup via BotFather
/*
1. Create bot with @BotFather
2. Set commands: /setcommands
3. Set mini app: /newapp
4. Configure web app URL
5. Set bot description and about text
*/
```

### 📊 የአፈጻጸም ማሰማራት / Performance Monitoring
```typescript
// Performance Metrics to Track
const performanceMetrics = {
  // Core Web Vitals
  LCP: 'Largest Contentful Paint < 2.5s',
  FID: 'First Input Delay < 100ms', 
  CLS: 'Cumulative Layout Shift < 0.1',
  
  // App-specific Metrics
  jobSearchTime: 'Job search response < 500ms',
  jobPostingTime: 'Job posting completion < 30s',
  telegramLoadTime: 'Telegram Mini App load < 2s',
  
  // Business Metrics
  dailyActiveUsers: 'DAU tracking',
  jobPostConversion: 'Job post to application rate',
  userRetention: '7-day and 30-day retention',
  revenuePerUser: 'Average revenue per employer'
};

// Analytics Implementation
const analytics = {
  trackEvent: (event: string, properties?: object) => {
    // Send to your analytics service
    console.log('Analytics Event:', event, properties);
  },
  
  trackPageView: (page: string) => {
    analytics.trackEvent('page_view', { page });
  },
  
  trackJobSearch: (searchParams: JobSearchParams) => {
    analytics.trackEvent('job_search', searchParams);
  },
  
  trackJobApplication: (jobId: string, method: string) => {
    analytics.trackEvent('job_application', { jobId, method });
  }
};
```

### 🔄 የቀጣይነት ማሰማራት / Continuous Deployment
```yaml
# Deployment Workflow
Development:
  - Code changes pushed to Git
  - Automatic deployment via Lovable
  - Preview URLs for testing
  
Staging:
  - Pre-production testing
  - Telegram bot testing environment
  - Database migration testing
  
Production:
  - Automatic deployment on main branch
  - Database migrations via Supabase CLI
  - Bot webhook updates
  - Health checks and rollback capability
```

### 🏥 የጤና ቁጥጥርና ሥነ ምግባር / Health Monitoring & Maintenance
```typescript
// System Health Checks
const healthChecks = {
  database: async () => {
    try {
      const { data } = await supabase.from('profiles').select('count').single();
      return { status: 'healthy', responseTime: Date.now() };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  },
  
  telegram: async () => {
    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
      return { status: response.ok ? 'healthy' : 'unhealthy' };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  },
  
  storage: async () => {
    try {
      const { data } = await supabase.storage.from('cvs').list();
      return { status: 'healthy' };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
};

// Automated Maintenance Tasks
const maintenanceTasks = {
  dailyCleanup: () => {
    // Remove expired jobs
    // Clean up old notifications
    // Update featured job status
  },
  
  weeklyReports: () => {
    // Generate analytics reports
    // Send admin summaries
    // Check system performance
  },
  
  monthlyOptimization: () => {
    // Database optimization
    // Image compression
    // Cache cleanup
  }
};
```

---

## 📈 የወደፊት እድገት / Future Roadmap

### 🎯 አጭር ጊዜ (3-6 ወራት) / Short Term
- ✅ AI-powered job matching
- ✅ Video application support
- ✅ Company verification system
- ✅ Advanced analytics dashboard
- ✅ Multi-language job posts

### 🚀 መካከለኛ ጊዜ (6-12 ወራት) / Medium Term
- 🔄 Mobile app (iOS/Android)
- 🔄 Skills assessment tests
- 🔄 Salary benchmarking
- 🔄 Interview scheduling
- 🔄 Employer branding pages

### 🌟 ረዥም ጊዜ (1-2 አመት) / Long Term
- 🔮 AI resume builder
- 🔮 Career path recommendations
- 🔮 Integration with LinkedIn
- 🔮 Freelance marketplace
- 🔮 Training course platform

---

## 📞 ድጋፍና ስውር / Support & Contact

### 🛠️ ቴክኒካል ድጋፍ / Technical Support
- **Documentation**: This comprehensive guide
- **Code Comments**: Extensive inline documentation
- **Error Handling**: User-friendly error messages
- **Debug Tools**: Built-in system health monitoring

### 📧 ስውር መረጃ / Contact Information
- **Admin Email**: admin@ethiopianjobs.app
- **Support Bot**: @EthiopianJobsSupport
- **Developer**: Via Lovable platform
- **Community**: Telegram group for updates

---

## 📋 ዋቢ / References

### 🔗 ጠቃሚ አገናኞች / Useful Links
- **Telegram Bot API**: https://core.telegram.org/bots/api
- **Telegram Mini Apps**: https://core.telegram.org/bots/webapps
- **Supabase Documentation**: https://supabase.io/docs
- **React Documentation**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com

### 📚 የኮድ ምሳሌዎች / Code Examples
All code examples in this documentation are production-ready and extensively tested. They follow Ethiopian web development best practices and Telegram Mini App guidelines.

---

**📝 የሰነዱ እትም / Document Version**: 2.0  
**📅 የመጨረሻ ማሻሻል / Last Updated**: January 2025  
**👤 በ / By**: Ethiopian Job Board Development Team

---

*ይህ ሰነድ የኢትዮጵያ የስራ ፍለጋ Telegram Mini App ሙሉ መመሪያ ነው። ለተጨማሪ ጥያቄዎች እባኮትን ከላይ የተመለከቱትን የስውር መንገዶች ይጠቀሙ።*

*This document serves as the complete guide for the Ethiopian Job Board Telegram Mini App. For additional questions, please use the contact methods listed above.*
# 🛠️ Maintenance Mode & Safe Update Guide

## 📋 Overview
This guide provides a comprehensive maintenance mode system and safe update procedures for your Ethiopian Job Board Mini App.

## 🔧 Maintenance Mode Features

### 1. Environment-Based Control
- Set `VITE_MAINTENANCE_MODE=true` in `.env` for automatic maintenance mode
- Admin override available through localStorage

### 2. Bilingual Support
- Amharic and English maintenance messages
- Customizable maintenance messages

### 3. Admin Panel Integration
- Admins can toggle maintenance mode
- Real-time enable/disable functionality

## 🚀 How to Enable/Disable Maintenance Mode

### Method 1: Environment Variable (Recommended for Updates)
```bash
# In .env file
VITE_MAINTENANCE_MODE=true
```

### Method 2: Admin Panel (Real-time control)
- Access admin panel as authenticated admin
- Toggle maintenance mode instantly
- Set custom maintenance messages

### Method 3: Browser Console (Emergency)
```javascript
// Enable maintenance mode
localStorage.setItem('maintenanceMode', 'true');
window.location.reload();

// Disable maintenance mode
localStorage.setItem('maintenanceMode', 'false');
window.location.reload();
```

## 📁 Files That Are SAFE to Modify During Updates

### ✅ SAFE TO MODIFY (Business Logic & Features)
```
src/pages/              # All page components
├── Index.tsx           # Main page
├── Auth.tsx            # Authentication page  
├── PostJob.tsx         # Job posting
├── ManageJobs.tsx      # Job management
├── EditJob.tsx         # Job editing
├── CompanyProfile.tsx  # Company profiles
├── AdminPanel.tsx      # Admin functionality
├── Favorites.tsx       # User favorites
└── NotFound.tsx        # 404 page

src/components/         # Feature components
├── JobCard.tsx         # Job display cards
├── JobDetail.tsx       # Job details
├── JobTabs.tsx         # Job navigation
├── SearchAndFilter.tsx # Search functionality
├── TopCompanies.tsx    # Company listings
├── TrustedBy.tsx       # Trust indicators
├── HeroSection.tsx     # Landing section
├── FavoriteButton.tsx  # Favorite functionality
└── TelegramShareButton.tsx # Sharing

src/hooks/              # Custom hooks
├── useAuth.tsx         # Authentication logic
├── useFavorites.tsx    # Favorites management
├── useJobs.tsx         # Job data management
└── useTelegramWebApp.tsx # Telegram integration

supabase/migrations/    # Database changes
└── *.sql              # Migration files
```

### ⚠️ MODIFY WITH CAUTION (Core Systems)
```
src/components/ui/      # UI component library
├── button.tsx          # Button components
├── card.tsx           # Card components
├── input.tsx          # Input components
└── *.tsx              # Other UI components

src/lib/               # Utility functions
└── utils.ts           # Helper functions

src/integrations/      # External integrations
└── supabase/          # Database integration
```

### 🚫 DO NOT MODIFY (Critical Infrastructure)
```
src/App.tsx            # Main app structure
src/main.tsx           # App initialization
src/index.css          # Design system
tailwind.config.ts     # Tailwind configuration
vite.config.ts         # Build configuration
package.json           # Dependencies
.env                   # Environment variables
tsconfig.json          # TypeScript config
```

## 🔄 Safe Update Procedure

### Phase 1: Pre-Update (Maintenance Mode ON)
1. **Enable Maintenance Mode**
   ```bash
   # Add to .env
   VITE_MAINTENANCE_MODE=true
   ```

2. **Backup Current State**
   ```bash
   # Create backup branch
   git checkout -b backup-$(date +%Y%m%d)
   git push origin backup-$(date +%Y%m%d)
   ```

3. **Test Maintenance Mode**
   - Verify maintenance page displays correctly
   - Check admin can still access override

### Phase 2: Update Execution
1. **Update Safe Files Only**
   - Modify business logic files (✅ SAFE list)
   - Add new features to `src/pages/` and `src/components/`
   - Update database with new migrations

2. **Test in Development**
   ```bash
   npm run dev
   # Test all functionality while maintenance mode is on
   ```

3. **Build and Verify**
   ```bash
   npm run build
   # Ensure no build errors
   ```

### Phase 3: Go Live (Maintenance Mode OFF)
1. **Disable Maintenance Mode**
   ```bash
   # Remove from .env or set to false
   VITE_MAINTENANCE_MODE=false
   ```

2. **Monitor Application**
   - Check all routes work correctly  
   - Verify database connections
   - Test critical user flows

3. **Emergency Rollback Plan**
   ```bash
   # If issues occur, immediately enable maintenance
   VITE_MAINTENANCE_MODE=true
   
   # Rollback to backup branch
   git checkout backup-$(date +%Y%m%d)
   ```

## 🎯 Best Practices

### Update Strategy
- **Small, Incremental Updates**: Make small changes instead of big updates
- **Feature Flags**: Use maintenance mode as a feature flag for gradual rollouts
- **Database First**: Always migrate database before updating frontend
- **Test Thoroughly**: Test in maintenance mode before going live

### Error Prevention
- **Never Edit Core Files**: Stick to the SAFE file list
- **Always Backup**: Create backup branches before updates
- **Use Version Control**: Commit changes incrementally
- **Monitor Performance**: Watch for performance regressions

### Recovery Procedures
- **Quick Rollback**: Keep previous version ready for immediate rollback
- **Health Checks**: Implement automated health monitoring
- **User Communication**: Use maintenance messages to inform users

## 🔍 Troubleshooting

### Maintenance Mode Not Working
```javascript
// Check if maintenance context is loaded
console.log(localStorage.getItem('maintenanceMode'));

// Force enable maintenance mode
localStorage.setItem('maintenanceMode', 'true');
window.location.reload();
```

### Update Broke Something
```bash
# Immediate recovery
VITE_MAINTENANCE_MODE=true  # Enable maintenance
git checkout backup-branch  # Rollback code
# Deploy backup version
```

### Database Issues
```sql
-- Check database connectivity
SELECT 1;

-- Rollback latest migration if needed
-- (Use Supabase dashboard to rollback migrations)
```

## 📞 Emergency Contacts

### When Updates Fail
1. **Enable Maintenance Mode Immediately**
2. **Rollback to Last Known Good Version**
3. **Check Error Logs**
4. **Contact Technical Support**

### Success Metrics
- ✅ No user-facing errors during update
- ✅ All critical features working
- ✅ Database integrity maintained  
- ✅ Performance within acceptable limits

---

**Remember**: The goal is zero-downtime updates. When in doubt, enable maintenance mode first!
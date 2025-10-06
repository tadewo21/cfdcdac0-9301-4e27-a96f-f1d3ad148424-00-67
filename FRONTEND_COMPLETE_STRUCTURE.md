# Ethiopian Job Board - Complete Frontend Structure

## Design System (index.css)

### Color Palette
```css
/* Light Mode */
--background: 240 10% 98%;
--foreground: 240 10% 8%;
--card: 0 0% 100%;
--primary: 140 65% 35%; /* Ethiopian green */
--primary-glow: 140 65% 45%;
--secondary: 45 25% 92%;
--accent: 45 90% 55%; /* Ethiopian gold */
--featured: 45 85% 50%; /* Golden featured jobs */
--freelance: 210 85% 55%; /* International blue */
--freelance-international: 245 75% 60%; /* Premium purple-blue */

/* Gradients */
--gradient-primary: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-glow)));
--gradient-featured: linear-gradient(135deg, hsl(var(--featured)), hsl(var(--featured-glow)));
--gradient-freelance: linear-gradient(135deg, hsl(var(--freelance)), hsl(var(--freelance-secondary)));
--gradient-hero: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-glow)) 50%, hsl(var(--accent)) 100%);

/* Shadows */
--shadow-primary: 0 10px 30px -10px hsl(var(--primary) / 0.3);
--shadow-featured: 0 6px 20px -6px hsl(var(--featured) / 0.5);
--shadow-freelance: 0 8px 25px -8px hsl(var(--freelance) / 0.4);
--shadow-card: 0 2px 20px -2px hsl(240 10% 8% / 0.08);
```

---

## 1. Home Page (Index.tsx)

### Structure
```html
<Layout>
  <div className="min-h-screen bg-background">
    <!-- Hero Section -->
    <HeroSection />
    
    <!-- Trusted By Section -->
    <TrustedBy />
    
    <!-- Platform Stats -->
    <PlatformStats />
    
    <!-- Job Tabs (Featured/Regular/Freelance) -->
    <JobTabs />
    
    <!-- Featured Jobs Section -->
    <FeaturedJobsSection />
    
    <!-- Freelance Jobs Section -->
    <FreelanceJobsSection />
    
    <!-- Search and Filter -->
    <SearchAndFilter />
    
    <!-- Job Listings Grid -->
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <JobCard />
      <JobCard />
      <JobCard />
    </div>
  </div>
</Layout>
```

### Hero Section Styles
```tsx
<section className="relative overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 py-20">
  <div className="container mx-auto px-4">
    <div className="grid md:grid-cols-2 gap-12 items-center">
      <!-- Text Content -->
      <div className="space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground">
          {t("hero.title")}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t("hero.subtitle")}
        </p>
        <Button className="bg-primary hover:bg-primary/90">
          {t("hero.cta")}
        </Button>
      </div>
      
      <!-- Hero Image -->
      <div className="relative">
        <img src="/hero-optimized.webp" alt="Hero" 
             className="rounded-xl shadow-primary" />
      </div>
    </div>
  </div>
</section>
```

---

## 2. Job Card Component

```tsx
<Card className="hover:shadow-card transition-all duration-300 hover-scale">
  <CardHeader>
    <!-- Company Logo -->
    <div className="flex items-start gap-4">
      <img src={companyLogo} 
           className="w-16 h-16 rounded-lg object-cover" />
      
      <div className="flex-1">
        <!-- Job Title -->
        <h3 className="text-xl font-semibold text-foreground">
          {job.title}
        </h3>
        
        <!-- Company Name -->
        <p className="text-muted-foreground">
          {job.company_name}
        </p>
        
        <!-- Featured Badge -->
        {job.is_featured && (
          <Badge className="bg-gradient-featured text-featured-foreground">
            ⭐ Featured
          </Badge>
        )}
      </div>
      
      <!-- Favorite Button -->
      <FavoriteButton jobId={job.id} />
    </div>
  </CardHeader>
  
  <CardContent>
    <!-- Job Details -->
    <div className="space-y-2 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4" />
        <span>{job.location}</span>
      </div>
      
      <div className="flex items-center gap-2">
        <Briefcase className="h-4 w-4" />
        <span>{job.category}</span>
      </div>
      
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4" />
        <span>{job.employment_type}</span>
      </div>
    </div>
    
    <!-- Salary Range -->
    {job.salary_range && (
      <div className="mt-4 text-lg font-semibold text-primary">
        {job.salary_range}
      </div>
    )}
    
    <!-- View Details Button -->
    <Button className="w-full mt-4" variant="outline">
      View Details
    </Button>
  </CardContent>
</Card>
```

---

## 3. Featured Jobs Section

```tsx
<section className="py-16 bg-gradient-to-br from-featured/5 to-featured-glow/5">
  <div className="container mx-auto px-4">
    <!-- Section Header -->
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <Star className="h-8 w-8 text-featured" />
        <h2 className="text-3xl font-bold text-foreground">
          Featured Jobs
        </h2>
      </div>
      
      <Button variant="outline" className="border-featured text-featured">
        View All →
      </Button>
    </div>
    
    <!-- Featured Jobs Grid -->
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {featuredJobs.map((job) => (
        <Card className="border-2 border-featured/20 shadow-featured hover:shadow-featured/60">
          <!-- Featured job card content -->
        </Card>
      ))}
    </div>
  </div>
</section>
```

---

## 4. Freelance Jobs Section

```tsx
<section className="py-16">
  <div className="container mx-auto px-4">
    <!-- International Freelance -->
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <Globe className="h-8 w-8 text-freelance-international" />
        <h2 className="text-3xl font-bold bg-gradient-freelance-international bg-clip-text text-transparent">
          International Freelance
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {internationalJobs.map((job) => (
          <Card className="bg-gradient-freelance-international-card border-freelance-international/20">
            <!-- Freelance job content -->
          </Card>
        ))}
      </div>
    </div>
    
    <!-- Local Freelance -->
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Briefcase className="h-8 w-8 text-freelance" />
        <h2 className="text-3xl font-bold text-freelance">
          Local Freelance
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Local freelance jobs -->
      </div>
    </div>
  </div>
</section>
```

---

## 5. Profile Page (Profile.tsx)

```tsx
<div className="min-h-screen bg-background p-4">
  <div className="max-w-2xl mx-auto space-y-6">
    <!-- Header -->
    <div className="flex items-center gap-4">
      <Button variant="outline" size="sm">
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <h1 className="text-2xl font-bold">Edit Profile</h1>
    </div>
    
    <!-- Personal Info Card -->
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Full Name</Label>
          <Input placeholder="Enter your name" />
        </div>
        
        <div>
          <Label>Phone Number</Label>
          <Input placeholder="+251" />
        </div>
        
        <div>
          <Label>User Type</Label>
          <Select>
            <SelectItem value="job_seeker">Job Seeker</SelectItem>
            <SelectItem value="employer">Employer</SelectItem>
          </Select>
        </div>
      </CardContent>
    </Card>
    
    <!-- Employer Profile Card (if employer) -->
    <Card>
      <CardHeader>
        <CardTitle>Company Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Company Name</Label>
          <Input placeholder="Company name" />
        </div>
        
        <div>
          <Label>Company Logo</Label>
          <CompanyLogoUpload />
        </div>
      </CardContent>
    </Card>
    
    <!-- Notification Preferences (if job seeker) -->
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Email Notifications</Label>
          <Switch />
        </div>
        
        <div className="flex items-center justify-between">
          <Label>Job Alerts</Label>
          <Switch />
        </div>
      </CardContent>
    </Card>
    
    <!-- Save Button -->
    <Button className="w-full" size="lg">
      Save Profile
    </Button>
  </div>
</div>
```

---

## 6. About Us Page (AboutUs.tsx)

```tsx
<Layout>
  <div className="min-h-screen bg-background">
    <!-- Hero Section -->
    <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            About Us
          </h1>
          <p className="text-lg text-muted-foreground">
            Connecting Ethiopian talent with opportunities
          </p>
        </div>
      </div>
    </section>
    
    <!-- Stats Section -->
    <section className="py-16 bg-card">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground">10,000+</div>
            <div className="text-muted-foreground">Active Job Seekers</div>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground">500+</div>
            <div className="text-muted-foreground">Partner Companies</div>
          </div>
          
          <!-- More stats -->
        </div>
      </div>
    </section>
    
    <!-- Mission Section -->
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Our Mission</h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold mb-4">Vision</h3>
              <p className="text-muted-foreground leading-relaxed">
                To be Ethiopia's leading job platform...
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 p-8 rounded-xl">
              <h4 className="text-xl font-semibold mb-4">What Sets Us Apart</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3"></span>
                  Local expertise
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3"></span>
                  Bilingual platform
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Values Section -->
    <section className="py-16 bg-card">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Transparency</h3>
            <p className="text-muted-foreground">Clear and honest communication</p>
          </div>
          
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Innovation</h3>
            <p className="text-muted-foreground">Cutting-edge solutions</p>
          </div>
          
          <!-- More values -->
        </div>
      </div>
    </section>
  </div>
</Layout>
```

---

## 7. Company Profile Page (CompanyProfile.tsx)

```tsx
<div className="min-h-screen bg-background">
  <div className="max-w-6xl mx-auto p-4 space-y-6">
    <!-- Back Button -->
    <Button variant="ghost">
      <ArrowLeft className="h-4 w-4 mr-2" />
      Back to Home
    </Button>
    
    <!-- Company Header -->
    <Card>
      <CardHeader>
        <div className="flex items-center gap-6">
          <!-- Company Logo -->
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted">
            <img src={companyLogo} className="w-full h-full object-cover" />
          </div>
          
          <div className="flex-1 space-y-2">
            <CardTitle className="text-3xl">{companyName}</CardTitle>
            
            <div className="flex gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {email}
              </div>
              
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                {phone}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="secondary">
                {jobCount} Open Jobs
              </Badge>
              <span className="text-sm text-muted-foreground">
                Member since {date}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
    
    <!-- Jobs Section -->
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">
        Open Positions ({jobCount})
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <JobCard job={job} />
        ))}
      </div>
    </div>
  </div>
</div>
```

---

## 8. Layout Component

```tsx
<div className="min-h-screen flex flex-col bg-background">
  <!-- Header -->
  <Header />
  
  <!-- Main Content -->
  <main className="flex-1">
    {children}
  </main>
  
  <!-- Footer -->
  <Footer />
</div>
```

### Header Component
```tsx
<header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur">
  <div className="container mx-auto px-4">
    <div className="flex h-16 items-center justify-between">
      <!-- Logo -->
      <div className="flex items-center gap-2">
        <Briefcase className="h-8 w-8 text-primary" />
        <span className="text-xl font-bold text-foreground">
          Zehulu Jobs
        </span>
      </div>
      
      <!-- Navigation -->
      <nav className="hidden md:flex items-center gap-6">
        <a href="/" className="text-foreground hover:text-primary">
          Home
        </a>
        <a href="/about" className="text-foreground hover:text-primary">
          About
        </a>
        <a href="/post-job" className="text-foreground hover:text-primary">
          Post Job
        </a>
      </nav>
      
      <!-- Actions -->
      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        <NotificationBell />
        
        {user ? (
          <Button>Dashboard</Button>
        ) : (
          <Button>Sign In</Button>
        )}
      </div>
    </div>
  </div>
</header>
```

### Footer Component
```tsx
<footer className="border-t bg-card mt-16">
  <div className="container mx-auto px-4 py-12">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      <!-- Brand -->
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">Zehulu Jobs</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Ethiopia's leading job platform
        </p>
      </div>
      
      <!-- Quick Links -->
      <div>
        <h3 className="font-semibold mb-4">Quick Links</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><a href="/about">About Us</a></li>
          <li><a href="/contact">Contact</a></li>
          <li><a href="/support">Support</a></li>
        </ul>
      </div>
      
      <!-- For Job Seekers -->
      <div>
        <h3 className="font-semibold mb-4">For Job Seekers</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><a href="/browse-jobs">Browse Jobs</a></li>
          <li><a href="/profile">My Profile</a></li>
          <li><a href="/favorites">Saved Jobs</a></li>
        </ul>
      </div>
      
      <!-- For Employers -->
      <div>
        <h3 className="font-semibold mb-4">For Employers</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><a href="/post-job">Post a Job</a></li>
          <li><a href="/manage-jobs">Manage Jobs</a></li>
          <li><a href="/pricing">Pricing</a></li>
        </ul>
      </div>
    </div>
    
    <!-- Bottom Bar -->
    <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
      <p>© 2025 Zehulu Jobs. All rights reserved.</p>
    </div>
  </div>
</footer>
```

---

## 9. Common UI Components

### Button Variants
```tsx
<!-- Primary -->
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Primary Button
</Button>

<!-- Featured -->
<Button className="bg-gradient-featured text-featured-foreground">
  Featured Action
</Button>

<!-- Freelance -->
<Button className="bg-freelance text-freelance-foreground">
  Freelance Action
</Button>

<!-- Outline -->
<Button variant="outline" className="border-primary text-primary">
  Outline Button
</Button>

<!-- Ghost -->
<Button variant="ghost">
  Ghost Button
</Button>
```

### Card Variants
```tsx
<!-- Standard Card -->
<Card className="shadow-card hover:shadow-lg transition-all">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Card content
  </CardContent>
</Card>

<!-- Featured Card -->
<Card className="border-2 border-featured/20 shadow-featured bg-gradient-to-br from-featured/5 to-featured-glow/5">
  <!-- Featured content -->
</Card>

<!-- Freelance Card -->
<Card className="bg-gradient-freelance-card border-freelance/20">
  <!-- Freelance content -->
</Card>
```

### Badge Variants
```tsx
<!-- Primary Badge -->
<Badge className="bg-primary text-primary-foreground">
  Primary
</Badge>

<!-- Featured Badge -->
<Badge className="bg-gradient-featured text-featured-foreground">
  ⭐ Featured
</Badge>

<!-- Freelance Badge -->
<Badge className="bg-freelance text-freelance-foreground">
  🌍 International
</Badge>

<!-- Secondary Badge -->
<Badge variant="secondary">
  Secondary
</Badge>
```

---

## 10. Responsive Design

### Mobile First Approach
```tsx
<!-- Mobile (default) -->
<div className="p-4">
  <!-- Mobile layout -->
</div>

<!-- Tablet (md:768px) -->
<div className="p-4 md:p-6">
  <!-- Tablet layout -->
</div>

<!-- Desktop (lg:1024px) -->
<div className="p-4 md:p-6 lg:p-8">
  <!-- Desktop layout -->
</div>

<!-- Grid Responsiveness -->
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- 1 column mobile, 2 tablet, 3 desktop -->
</div>
```

### Common Responsive Patterns
```tsx
<!-- Responsive Text -->
<h1 className="text-2xl md:text-4xl lg:text-5xl font-bold">
  Responsive Heading
</h1>

<!-- Responsive Spacing -->
<section className="py-8 md:py-12 lg:py-16">
  <!-- Responsive padding -->
</section>

<!-- Responsive Flex Direction -->
<div className="flex flex-col md:flex-row gap-4">
  <!-- Stack on mobile, row on desktop -->
</div>

<!-- Hide/Show on Breakpoints -->
<div className="hidden md:block">
  <!-- Only show on tablet+ -->
</div>

<div className="block md:hidden">
  <!-- Only show on mobile -->
</div>
```

---

## 11. Animation Classes

### Fade Animations
```css
.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Scale Animations
```css
.hover-scale {
  transition: transform 0.2s;
}

.hover-scale:hover {
  transform: scale(1.05);
}
```

### Slide Animations
```css
.animate-slide-in-right {
  animation: slide-in-right 0.3s ease-out;
}

@keyframes slide-in-right {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
```

---

## Summary

All pages use:
- **HSL color system** from index.css
- **Semantic tokens** (primary, featured, freelance, etc.)
- **Responsive grid** (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- **Consistent spacing** (p-4 md:p-6 lg:p-8)
- **Shadow system** (shadow-card, shadow-featured, shadow-freelance)
- **Gradient backgrounds** for sections
- **Hover effects** (hover-scale, hover:shadow-lg)
- **Animation classes** (animate-fade-in, animate-slide-in)
- **Card-based layouts** with consistent styling
- **Bilingual support** via useLanguage hook

export type Language = "am" | "en";

export interface TranslationKeys {
  // Header
  "app.title": string;
  "nav.favorites": string;
  "nav.postJob": string;
  "nav.manageJobs": string;
  "nav.profile": string;
  "nav.login": string;
  "nav.logout": string;
  
  // Logout Dialog
  "logoutDialog.title": string;
  "logoutDialog.description": string;
  "logoutDialog.cancel": string;
  "logoutDialog.confirm": string;
  
  // Search and filters
  "search.title": string;
  "search.keyword": string;
  "search.selectCity": string;
  "search.selectCategory": string;
  "search.searchBtn": string;
  "search.resetBtn": string;
  "search.allCities": string;
  "search.allCategories": string;
  "advancedFilters": string;
  
  // Jobs
  "jobs.allJobs": string;
  "jobs.featuredJobs": string;
  "jobs.loading": string;
  "jobs.noResults": string;
  "jobs.changeFilters": string;
  "jobs.details": string;
  "jobs.applyDeadline": string;
  "jobs.applyFast": string;
  "jobs.resultsFound": string;
  "jobs.loadMore": string;
  
  // Job details
  "job.description": string;
  "job.requirements": string;
  "job.howToApply": string;
  "job.applyNowBtn": string;
  "job.backToJobs": string;
  "job.applyFast": string;
  "job.postedOn": string;
  "job.applicationDeadline": string;
  "job.aboutCompany": string;
  "job.verifiedCompany": string;
  "job.field": string;
  "job.goToApplication": string;
  "job.back": string;
  
  // Job types
  "jobType.permanent": string;
  "jobType.contract": string;
  "jobType.partTime": string;
  "jobType.internship": string;
  "jobType.freelance": string;
  "jobType.fullTime": string;
  "jobType.remote": string;

  // Education Levels
  "education.grade12": string;
  "education.diploma": string;
  "education.bachelor": string;
  "education.master": string;
  "education.phd": string;
  "education.certificate": string;
  "education.noRequirement": string;

  // Salary Ranges
  "salary.5000_10000": string;
  "salary.10000_15000": string;
  "salary.15000_25000": string;
  "salary.25000_35000": string;
  "salary.35000_50000": string;
  "salary.50000_75000": string;
  "salary.75000_100000": string;
  "salary.100000plus": string;
  "salary.negotiable": string;

  // Cities
  "city.addisAbaba": string;
  "city.addisAbabaBole": string;
  "city.addisAbabaMercato": string;
  "city.addisAbabaPiazza": string;
  "city.bahirDar": string;
  "city.direDawa": string;
  "city.harar": string;
  "city.hawassa": string;
  "city.jimma": string;
  "city.mekelle": string;
  "city.nazret": string;
  
  // Categories
  "category.it": string;
  "category.education": string;
  "category.health": string;
  "category.finance": string;
  "category.business": string;
  "category.marketing": string;
  "category.engineering": string;
  "category.legal": string;
  "category.hr": string;
  "category.construction": string;
  "category.transport": string;
  "category.hotel": string;
  "category.agriculture": string;
  "category.other": string;
  
  // Date formatting
  "date.today": string;
  "date.yesterday": string;
  "date.daysAgo": string;
  
  // Common
  "common.loading": string;
  "common.error": string;
  "common.save": string;
  "common.saved": string;
  "common.share": string;
  "common.back": string;
  
  // Navigation
  "navigation.home": string;
  "navigation.profile": string;
  "navigation.settings": string;
  
  // Sharing
  "share.telegram": string;
  "share.facebook": string;
  "share.twitter": string;
  "share.linkedin": string;
  "share.copy": string;

  // Navigation
  "navigation.favorites": string;
  "navigation.postJob": string;
  "navigation.manageJobs": string;
  "navigation.login": string;

  // Hero Section
  "hero.title": string;
  "hero.subtitle": string;
  "hero.description": string;
  "hero.exploreJobs": string;
  "hero.aboutUs": string;
  "hero.availableJobs": string;
  "hero.companies": string;
  "hero.successRate": string;
  
  // Job posting and management
  "job.postNew": string;
  "job.manage": string;
  "job.edit": string;
  "job.delete": string;
  "job.save": string;
  "job.cancel": string;
  "job.company": string;
  "job.salary": string;
  "job.location": string;
  "job.status": string;
  "job.active": string;
  "job.inactive": string;
  "job.expired": string;
  
  // Post Type Selection
  "postType.title": string;
  "postType.subtitle": string;
  "postType.free.title": string;
  "postType.free.price": string;
  "postType.free.feature1": string;
  "postType.free.feature2": string;
  "postType.free.feature3": string;
  "postType.free.feature4": string;
  "postType.free.button": string;
  "postType.freelance.title": string;
  "postType.freelance.price": string;
  "postType.freelance.feature1": string;
  "postType.freelance.feature2": string;
  "postType.freelance.feature3": string;
  "postType.freelance.feature4": string;
  "postType.freelance.feature5": string;
  "postType.freelance.button": string;
  "postType.featured.title": string;
  "postType.featured.price": string;
  "postType.featured.feature1": string;
  "postType.featured.feature2": string;
  "postType.featured.feature3": string;
  "postType.featured.feature4": string;
  "postType.featured.feature5": string;
  "postType.featured.feature6": string;
  "postType.featured.button": string;

  // Forms and validation
  "form.required": string;
  "form.email": string;
  "form.phone": string;
  "form.website": string;
  "form.submit": string;
  "form.submitting": string;
  "form.success": string;
  "form.error": string;
  
  // Profile and settings
  "profile.edit": string;
  "profile.save": string;
  "profile.name": string;
  "profile.email": string;
  "profile.phone": string;
  "profile.company": string;
  "profile.website": string;
  "profile.bio": string;
  "profile.avatar": string;
  "profile.changePassword": string;
  "profile.updated": string;
  
  // Notifications
  "notifications.title": string;
  "notifications.empty": string;
  "notifications.markRead": string;
  "notifications.markAllRead": string;
  "notifications.delete": string;
  "notifications.newJob": string;
  "notifications.jobUpdate": string;
  "notifications.application": string;
  "notifications.loginRequired": string;
  "notifications.emptyDescription": string;
  
  // Favorites
  "favorites.title": string;
  "favorites.empty": string;
  "favorites.add": string;
  "favorites.remove": string;
  "favorites.added": string;
  "favorites.removed": string;
  "favorites.addToFavorites": string;
  "favorites.removeFromFavorites": string;
  "favorites.favorite": string;
  "favorites.save": string;
  "favorites.refresh": string;
  "favorites.clearAll": string;
  "favorites.loading": string;
  "favorites.noJobs": string;
  "favorites.noJobsDesc": string;
  "favorites.backToJobs": string;
  "favorites.notFound": string;
  "favorites.notFoundDesc": string;
  "favorites.tryAgain": string;
  "favorites.foundJobs": string;

  // Footer
  "footer.aboutUs": string;
  "footer.contact": string;
  "footer.privacy": string;
  "footer.terms": string;
  "footer.support": string;
  "footer.followUs": string;
  "footer.copyright": string;

  // Roles and Permissions
  "role.admin": string;
  "role.employer": string;
  "role.jobSeeker": string;
  "role.permissions": string;
  "role.selectRole": string;
  "role.currentRole": string;
  "role.accessDenied": string;
  "role.insufficientPermissions": string;
  "role.adminOnly": string;
  "role.employerOrAdmin": string;

  // Admin Panel  
  "admin.panel": string;
  "admin.dashboard": string;
  "admin.users": string;
  "admin.jobs": string;
  "admin.analytics": string;
  "admin.settings": string;
  
  // Admin Analytics
  "admin.analyticsAndReports": string;
  "admin.last7Days": string;
  "admin.last30Days": string;
  "admin.last3Months": string;
  "admin.jobsGrowth": string;
  "admin.employersGrowth": string;
  "admin.weeklyJobs": string;
  "admin.monthlyJobs": string;
  "admin.noDataAvailable": string;
  "admin.employers": string;
  "admin.topPerformers": string;
  "admin.jobAnalytics": string;
  "admin.mostViewed": string;
  "admin.mostApplied": string;
  "admin.views": string;
  "admin.applications": string;
  "admin.popularCategories": string;
  "admin.popularLocations": string;
  "admin.searchAnalytics": string;
  "admin.searchVolume": string;
  "admin.topSearchKeywords": string;
  "admin.searchCount": string;
  "admin.noSearchData": string;
  "admin.keyword": string;
  "admin.userGrowthAnalytics": string;
  "admin.userRegistrations": string;
  "admin.totalJobs": string;

  // Auth
  "auth.createAccount": string;
  "auth.checkEmailConfirmation": string;

  // Not Found
  "notFound.message": string;

  // About Us page
  "about.title": string;
  "about.subtitle": string;
  "about.description": string;
  "about.stats.activeJobSeekers": string;
  "about.stats.partnerCompanies": string;
  "about.stats.successRate": string;
  "about.stats.citiesCovered": string;
  "about.mission.title": string;
  "about.mission.subtitle": string;
  "about.mission.description1": string;
  "about.mission.description2": string;
  "about.mission.whatSetsUsApart": string;
  "about.mission.localExpertise": string;
  "about.mission.bilingualPlatform": string;
  "about.mission.mobileFirst": string;
  "about.mission.verifiedCompanies": string;
  "about.values.title": string;
  "about.values.transparency.title": string;
  "about.values.transparency.description": string;
  "about.values.innovation.title": string;
  "about.values.innovation.description": string;
  "about.values.community.title": string;
  "about.values.community.description": string;
  "about.values.excellence.title": string;
  "about.values.excellence.description": string;
  "about.team.title": string;
  "about.team.description": string;
  "about.team.joinMission": string;
  "about.team.joinDescription": string;

  // Contact page
  "contact.title": string;
  "contact.subtitle": string;
  "contact.emailAddress": string;
  "contact.emailDescription": string;
  "contact.phoneNumber": string;
  "contact.phoneDescription": string;
  "contact.officeLocation": string;
  "contact.officeDescription": string;
  "contact.businessHours": string;
  "contact.businessHoursDescription": string;
  "contact.sendMessage": string;
  "contact.sendMessageDescription": string;
  "contact.quickContact": string;
  "contact.quickContactDescription": string;
  "contact.contactForm": string;
  "contact.contactFormDescription": string;
  "contact.fullName": string;
  "contact.emailAddressLabel": string;
  "contact.subject": string;
  "contact.message": string;
  "contact.sendButton": string;
  "contact.sending": string;
  "contact.messageSent": string;
  "contact.messageDescription": string;
  "contact.faq.title": string;
  "contact.faq.responseTime": string;
  "contact.faq.responseTimeAnswer": string;
  "contact.faq.visitOffice": string;
  "contact.faq.visitOfficeAnswer": string;
  "contact.faq.techSupport": string;
  "contact.faq.techSupportAnswer": string;

  // Auth page improvements
  "auth.signInTitle": string;
  "auth.signInDescription": string;
  "auth.signUpTitle": string;
  "auth.signUpDescription": string;
  "auth.email": string;
  "auth.password": string;
  "auth.fullName": string;
  "auth.userType": string;
  "auth.userTypeSeeker": string;
  "auth.userTypeEmployer": string;
  "auth.or": string;
  "auth.signInGoogle": string;
  "auth.signUpGoogle": string;
  "auth.signInTelegram": string;
  "auth.signUpTelegram": string;
  "auth.signInButton": string;
  "auth.signUpButton": string;
  "auth.signing": string;
  "auth.creating": string;
  "auth.accountCreated": string;
  "auth.accountCreatedDesc": string;
  "auth.signedIn": string;
  "auth.signedInDesc": string;
  "auth.connectingGoogle": string;
  "auth.connectingGoogleDesc": string;
  "auth.error": string;
  "auth.googleNotEnabled": string;
  "auth.telegramError": string;
  "auth.telegramCreated": string;
  "auth.telegramSignedIn": string;
  "auth.telegramWelcome": string;
  "auth.pleaseWait": string;
  "auth.telegramDataNotFound": string;
  "auth.selectUserType": string;

  // Common UI
  "ui.filtersActive": string;

  // Profile page
  "profile.personalInfo": string;
  "profile.professionalInfo": string;
  "profile.notificationSettings": string;
  "profile.fullName": string;
  "profile.enterFullName": string;
  "profile.phoneNumber": string;
  "profile.address": string;
  "profile.addressPlaceholder": string;
  "profile.accountType": string;
  "profile.selectAccountType": string;
  "profile.personalDescription": string;
  "profile.aboutYourself": string;
  "profile.workExperience": string;
  "profile.skills": string;
  "profile.skillsPlaceholder": string;
  "profile.cvFile": string;
  "profile.uploading": string;
  "profile.upload": string;
  "profile.cvUploaded": string;
  "profile.emailNotifications": string;
  "profile.telegramId": string;
  "profile.telegramIdHelper": string;
  "profile.saving": string;
  "profile.saveProfile": string;
  "profile.updateError": string;
  "profile.supportedFileTypes": string;
  "profile.maxFileSize": string;
  "profile.cvUploadSuccess": string;
  "profile.cvUploadError": string;
  "profile.jobAlertsSetup": string;
  "profile.quickSetup": string;
  "profile.setupNow": string;
  "profile.enableAlerts": string;
  "profile.notificationMethods": string;
  "profile.jobCategories": string;
  "profile.locations": string;
  "profile.jobTypes": string;
  "profile.saveAlertSettings": string;

  // PostJob page
  "postJob.loginRequired": string;
  "postJob.goToLogin": string;
  "postJob.jobTypeAndSalaryRequired": string;
  "postJob.applicationMethodRequired": string;
  "postJob.employerAccountError": string;
  "postJob.jobPosted": string;
  "postJob.jobPostedSuccess": string;
  "postJob.bulkUpload": string;
  "postJob.companyLogo": string;
  "postJob.optional": string;
  "postJob.invalidImageType": string;
  "postJob.imageTooLarge": string;
  "postJob.logoUploadError": string;
  "postJob.logoHint": string;
  "postJob.uploading": string;
  "postJob.uploadLogo": string;

  // General messages
  "messages.error": string;
  "messages.success": string;
  "messages.loading": string;
  "messages.tryAgain": string;
  "messages.operationFailed": string;

  // Job management
  "jobManagement.deleteError": string;
  "jobManagement.deleteSuccess": string;
  "jobManagement.updateError": string;
  "jobManagement.updateSuccess": string;
  "jobManagement.statusChangeError": string;
  "jobManagement.statusChangeSuccess": string;

  // CSV Upload
  "csvUpload.invalidFile": string;
  "csvUpload.uploadSuccess": string;
  "csvUpload.uploadError": string;

  // Admin settings
  "adminSettings.maintenanceEnabled": string;
  "adminSettings.maintenanceDisabled": string;
  "adminSettings.notificationsSent": string;

  // User management
  "userManagement.roleUpdateError": string;
  "userManagement.roleUpdateSuccess": string;
  "userManagement.userBlocked": string;
  "userManagement.userUnblocked": string;

  // Edit job
  "editJob.unauthorized": string;
  "editJob.fetchError": string;
  "editJob.requiredFields": string;
  "editJob.updateSuccess": string;
  "editJob.updateError": string;

  // Manage jobs
  "manageJobs.featureToggleError": string;
  "manageJobs.featureToggleSuccess": string;
  "manageJobs.statusChangeError": string;
  "manageJobs.statusChangeSuccess": string;
  "manageJobs.shareSuccess": string;
  "manageJobs.shareError": string;

  // Telegram share
  "telegramShare.linkCopied": string;

  // Hook errors
  "hooks.jobsFetchError": string;

  // Freelance Jobs
  "freelance.title": string;
  "freelance.noJobs": string;
  "freelance.postJob": string;
  "freelance.payment": string;
  "freelance.paymentDesc": string;
  "freelance.payNow": string;
  "freelance.processing": string;
  "freelance.paymentSuccess": string;
  "freelance.paymentError": string;
  "freelance.seeAll": string;

  // Featured Jobs
  "featured.title": string;
  "featured.viewAll": string;
  "featured.durationBadge": string;
  "featured.badge": string;
  "featured.payment": string;
  "featured.price": string;
  "featured.duration": string;
  "featured.days": string;
  "featured.benefits": string;
  "featured.paymentInstructions": string;
  "featured.paymentSteps": string;
  "featured.transactionReference": string;
  "featured.transactionPlaceholder": string;
  "featured.paymentScreenshot": string;
  "featured.paymentScreenshotOptional": string;
  "featured.jobSummary": string;
  "featured.submitRequest": string;
  "featured.submitting": string;
  "featured.cancel": string;
  "featured.requestSubmitted": string;
  "featured.requestPending": string;
  "featured.serviceUnavailable": string;
  "featured.enterTransactionRef": string;
  "featured.fileSizeError": string;
  "featured.errorOccurred": string;

  // Manage Jobs page
  "manageJobs.title": string;
  "manageJobs.loginRequired": string;
  "manageJobs.loginRequiredDesc": string;
  "manageJobs.goToLogin": string;
  "manageJobs.uploadCSV": string;
  "manageJobs.addNewJob": string;
  "manageJobs.loading": string;
  "manageJobs.noJobs": string;
  "manageJobs.postFirstJob": string;
  "manageJobs.active": string;
  "manageJobs.hidden": string;
  "manageJobs.postedOn": string;
  "manageJobs.deadline": string;
  "manageJobs.confirmDelete": string;
  "manageJobs.confirmDeleteDesc": string;
  "manageJobs.cancel": string;
  "manageJobs.delete": string;
  "manageJobs.statusToggled": string;
  "manageJobs.jobDeleted": string;
  "manageJobs.jobsUploaded": string;

  // CSV Upload
  "csvUpload.title": string;
  "csvUpload.description": string;
  "csvUpload.downloadTemplate": string;
  "csvUpload.uploading": string;
  "csvUpload.upload": string;
  "csvUpload.minRowsError": string;
  "csvUpload.invalidDateFormat": string;
  "csvUpload.titleRequired": string;
  "csvUpload.descriptionRequired": string;
  "csvUpload.cityRequired": string;
  "csvUpload.categoryRequired": string;
  "csvUpload.deadlineRequired": string;
  "csvUpload.fileReadError": string;
  "csvUpload.defaultCompanyName": string;

  // Admin Dashboard - Additional translations  
  "admin.totalUsers": string;
  "admin.activeJobs": string;
  "admin.pendingJobs": string;
  "admin.totalEmployers": string;
  "admin.todaysJobs": string;
  "admin.thisWeekJobs": string;
  "admin.viewRate": string;
  "admin.recentActivity": string;
  "admin.noData": string;
  "admin.noActivity": string;
  "admin.jobPosted": string;
  "admin.employerJoined": string;
  "admin.jobsLabel": string;

  // Admin Job Management
  "admin.searchJobs": string;
  "admin.status": string;
  "admin.category": string;
  "admin.allCategories": string;
  "admin.jobsCount": string;
  "admin.noJobsFound": string;
  "admin.postedOn": string;
  "admin.deadline": string;
  "admin.confirmDelete": string;
  "admin.deleteJobWarning": string;
  "admin.cancel": string;
  "admin.delete": string;
  "admin.jobApproved": string;
  "admin.jobRejected": string;
  "admin.jobShown": string;
  "admin.jobHidden": string;
  "admin.jobFeatured": string;
  "admin.jobUnfeatured": string;
  "admin.jobDeleted": string;
  "admin.loading": string;
  "admin.error": string;
  "admin.success": string;
  "admin.visible": string;
  "admin.pending": string;
  "admin.hidden": string;
  "admin.rejected": string;

  // Company Profile
  "companyProfile.companyNotFound": string;
  "companyProfile.noCompanyInfo": string;
  "companyProfile.backToHome": string;
  "companyProfile.openJobsCount": string;
  "companyProfile.memberSince": string;
  "companyProfile.openPositions": string;
  "companyProfile.noOpenJobs": string;
  "companyProfile.noOpenJobsDescription": string;

  // Privacy Policy
  "privacy.title": string;
  "privacy.subtitle": string;
  "privacy.lastUpdated": string;
  "privacy.commitment": string;
  "privacy.commitmentSubtitle": string;
  "privacy.description1": string;
  "privacy.description2": string;
  "privacy.informationCollect": string;
  "privacy.personalInfo": string;
  "privacy.professionalInfo": string;
  "privacy.jobPreferences": string;
  "privacy.usageData": string;
  "privacy.deviceInfo": string;
  "privacy.howWeUse": string;
  "privacy.provideServices": string;
  "privacy.matchJobs": string;
  "privacy.communicate": string;
  "privacy.ensureSecurity": string;
  "privacy.analyzeUsage": string;
  "privacy.informationSharing": string;
  "privacy.shareWithEmployers": string;
  "privacy.aggregatedData": string;
  "privacy.noSelling": string;
  "privacy.legalRequirements": string;
  "privacy.serviceProviders": string;
  "privacy.dataSecurity": string;
  "privacy.encryption": string;
  "privacy.securityAudits": string;
  "privacy.accessControls": string;
  "privacy.secureDataCenters": string;
  "privacy.regularBackups": string;
  "privacy.yourRights": string;
  "privacy.yourRightsSubtitle": string;
  "privacy.accessUpdate": string;
  "privacy.accessUpdateDesc": string;
  "privacy.dataPortability": string;
  "privacy.dataPortabilityDesc": string;
  "privacy.deletion": string;
  "privacy.deletionDesc": string;
  "privacy.communicationPrefs": string;
  "privacy.communicationPrefsDesc": string;
  "privacy.contactUs": string;
  "privacy.contactUsSubtitle": string;
  "privacy.contactDescription": string;
  "privacy.policyUpdates": string;
  "privacy.policyUpdatesDesc": string;

  // Terms of Service
  "terms.title": string;
  "terms.subtitle": string;
  "terms.lastUpdated": string;
  "terms.agreement": string;
  "terms.agreementSubtitle": string;
  "terms.description1": string;
  "terms.description2": string;
  "terms.userAccounts": string;
  "terms.accurateInfo": string;
  "terms.confidentiality": string;
  "terms.noSharing": string;
  "terms.notifyUnauthorized": string;
  "terms.minimumAge": string;
  "terms.platformUsage": string;
  "terms.legitimateUse": string;
  "terms.noFalseContent": string;
  "terms.noAutomation": string;
  "terms.respectIP": string;
  "terms.noDisruption": string;
  "terms.contentConduct": string;
  "terms.accurateContent": string;
  "terms.retainOwnership": string;
  "terms.removeContent": string;
  "terms.noOffensive": string;
  "terms.noHarassment": string;
  "terms.limitationLiability": string;
  "terms.asIs": string;
  "terms.notResponsible": string;
  "terms.noGuarantee": string;
  "terms.limitedLiability": string;
  "terms.noEmploymentResponsibility": string;
  "terms.prohibitedActivities": string;
  "terms.prohibitedSubtitle": string;
  "terms.fraudulentActivities": string;
  "terms.fakeListings": string;
  "terms.identityTheft": string;
  "terms.pyramidSchemes": string;
  "terms.misuseOfPlatform": string;
  "terms.spamming": string;
  "terms.automatedScripts": string;
  "terms.hackingAttempts": string;
  "terms.inappropriateContent": string;
  "terms.discriminatoryContent": string;
  "terms.adultContent": string;
  "terms.violentLanguage": string;
  "terms.legalViolations": string;
  "terms.illegalPractices": string;
  "terms.copyrightInfringement": string;
  "terms.lawViolations": string;
  "terms.accountTermination": string;
  "terms.terminationSubtitle": string;
  "terms.terminationDescription": string;
  "terms.termsViolation": string;
  "terms.fraudulentActivity": string;
  "terms.platformAbuse": string;
  "terms.inactivity": string;
  "terms.governingLaw": string;
  "terms.governingLawDesc": string;
  "terms.contactInfo": string;
  "terms.contactInfoSubtitle": string;
  "terms.contactDescription": string;
  "terms.changesTerms": string;
  "terms.changesTermsDesc": string;

  // Support
  "support.title": string;
  "support.subtitle": string;
  "support.searchPlaceholder": string;
  "support.browseCategory": string;
  "support.accountProfile": string;
  "support.accountProfileDesc": string;
  "support.jobApplications": string;
  "support.jobApplicationsDesc": string;
  "support.technicalIssues": string;
  "support.technicalIssuesDesc": string;
  "support.securityPrivacy": string;
  "support.securityPrivacyDesc": string;
  "support.getInTouch": string;
  "support.liveChat": string;
  "support.liveChatDesc": string;
  "support.available247": string;
  "support.startChat": string;
  "support.emailSupport": string;
  "support.emailSupportDesc": string;
  "support.response24h": string;
  "support.sendEmail": string;
  "support.phoneSupport": string;
  "support.phoneSupportDesc": string;
  "support.businessHours": string;
  "support.callNow": string;
  "support.faqTitle": string;
  "support.faqSubtitle": string;
  "support.searchResults": string;
  "support.noResults": string;
  "support.noResultsDesc": string;
  "support.clearSearch": string;
  "support.additionalResources": string;
  "support.userGuide": string;
  "support.userGuideDesc": string;
  "support.viewUserGuide": string;
  "support.communityForum": string;
  "support.communityForumDesc": string;
  "support.joinCommunity": string;
  "support.createAccount": string;
  "support.createAccountAnswer": string;
  "support.applyJob": string;
  "support.applyJobAnswer": string;
  "support.editProfile": string;
  "support.editProfileAnswer": string;
  "support.saveJobs": string;
  "support.saveJobsAnswer": string;
  "support.noNotifications": string;
  "support.noNotificationsAnswer": string;
  "support.resetPassword": string;
  "support.resetPasswordAnswer": string;
  "support.employerAccess": string;
  "support.employerAccessAnswer": string;
  "support.deleteAccount": string;
  "support.deleteAccountAnswer": string;

  // Admin User Management
  "admin.searchEmployers": string;
  "admin.allStatus": string;
  "admin.activeEmployers": string;
  "admin.blockedEmployers": string;
  "admin.totalEmployersLabel": string;
  "admin.activeEmployersLabel": string;
  "admin.blockedEmployersLabel": string;
  "admin.employersCount": string;
  "admin.noEmployersFound": string;
  "admin.totalJobsLabel": string;
  "admin.activeJobsLabel": string;
  "admin.joinedOn": string;
  "admin.active": string;
  "admin.blocked": string;
  "admin.unblockUser": string;
  "admin.blockUser": string;
  "admin.unblockMessage": string;
  "admin.blockMessage": string;
  "admin.leave": string;
  "admin.unblock": string;
  "admin.block": string;

  // Admin Settings
  "admin.jobCategoriesManagement": string;
  "admin.addNewCategory": string;
  "admin.add": string;
  "admin.activeLabel": string;
  "admin.deleteCategoryWarning": string;
  "admin.notificationTemplates": string;
  "admin.title": string;
  "admin.message": string;
  "admin.pricingSettings": string;
  "admin.paidPlatform": string;
  "admin.paidPlatformDesc": string;
  "admin.jobPostPrice": string;
  "admin.featuredJobPrice": string;
  "admin.systemManagement": string;
  "admin.saveSettings": string;

  // Admin settings
  "adminSettings.categoryAdded": string;
  "adminSettings.categoryDeleted": string;
  "adminSettings.settingsSaved": string;


  // Job form placeholders
  "postJob.titlePlaceholder": string;
  "postJob.descriptionPlaceholder": string;
  "postJob.requirementsPlaceholder": string;
  "postJob.applicationEmail": string;
  "postJob.deadline": string;
  
  // MultiStep Form
  "postJob.stepJobInfo": string;
  "postJob.stepJobDetails": string;
  "postJob.stepCompanyInfo": string;
  "postJob.stepApplicationMethod": string;
  "postJob.jobTitle": string;
  "postJob.jobDescription": string;
  "postJob.jobRequirements": string;
  "postJob.city": string;
  "postJob.selectCity": string;
  "postJob.category": string;
  "postJob.selectCategory": string;
  "postJob.jobType": string;
  "postJob.selectJobType": string;
  "postJob.educationLevel": string;
  "postJob.selectEducationLevel": string;
  "postJob.salaryRange": string;
  "postJob.salaryPlaceholder": string;
  "postJob.companyName": string;
  "postJob.phoneNumber": string;
  "postJob.phonePlaceholder": string;
  "postJob.benefits": string;
  "postJob.benefitsPlaceholder": string;
  "postJob.companyCulture": string;
  "postJob.companyCulturePlaceholder": string;
  "postJob.applicationMethod": string;
  "postJob.applicationMethodPlaceholder": string;
  "postJob.deadlineField": string;
  "postJob.previous": string;
  "postJob.next": string;
  "postJob.submitJob": string;
  "postJob.submitting": string;

  // Job fields
  "job.title": string;
  "category.title": string;

  "support.faq.title": string;
  "support.faq.subtitle": string;
  "support.faq.searchResults": string;
  "support.faq.noResults": string;
  "support.faq.noResultsDesc": string;
  "support.faq.clearSearch": string;
  "support.faq.q1": string;
  "support.faq.a1": string;
  "support.faq.q2": string;
  "support.faq.a2": string;
  "support.faq.q3": string;
  "support.faq.a3": string;
  "support.faq.q4": string;
  "support.faq.a4": string;
  "support.faq.q5": string;
  "support.faq.a5": string;
  "support.faq.q6": string;
  "support.faq.a6": string;
  "support.faq.q7": string;
  "support.faq.a7": string;
  "support.faq.q8": string;
  "support.faq.a8": string;
  "support.resources.title": string;
  "support.resources.guide": string;
  "support.resources.guideDesc": string;
  "support.resources.guideAction": string;
  "support.resources.community": string;
  "support.resources.communityDesc": string;
  "support.resources.communityAction": string;

  // Job Detail
  "jobDetail.applyNow": string;
  "jobDetail.goToApplication": string;

  // Trusted By Section
  "trustedBy.title": string;
  "trustedBy.subtitle": string;

  // Maintenance and System
  "maintenance.mode": string;
  "maintenance.appUnderMaintenance": string;
  "maintenance.appUnderMaintenanceAmharic": string;
  "maintenance.disableMaintenanceMode": string;
  "maintenance.refreshApp": string;
  "maintenance.adminPanel": string;
  "maintenance.canDisableMaintenance": string;
  "maintenance.weWillBeBack": string;
  "maintenance.thankYouForPatience": string;
  "maintenance.tryAgain": string;
  "maintenance.emergencyMode": string;
  "maintenance.emergencyModeDesc": string;
  "maintenance.maintenanceMessage": string;
  "maintenance.updateMessage": string;
  "maintenance.sendNotifications": string;
  "maintenance.scheduledMaintenance": string;
  "maintenance.scheduleMaintenance": string;
  "maintenance.maintenanceScheduledFor": string;
  "maintenance.maintenanceActivity": string;
  "maintenance.noActivityLogged": string;
  "maintenance.maintenanceControls": string;
  "maintenance.enableMaintenance": string;
  "maintenance.systemHealthMonitor": string;
  "maintenance.databaseConnection": string;
  "maintenance.apiResponse": string;
  "maintenance.lastChecked": string;
  "maintenance.refreshHealthCheck": string;
  "maintenance.runningHealthCheck": string;
  "maintenance.systemHealth": string;
  "maintenance.recentHealthChecks": string;
  "maintenance.noHealthHistory": string;
  "maintenance.checking": string;
  "maintenance.refresh": string;
  "maintenance.database": string;
  "maintenance.storage": string;
  "maintenance.memory": string;
  "maintenance.api": string;
  "maintenance.healthy": string;
  "maintenance.warning": string;
  "maintenance.error": string;
  "maintenance.status": string;
  "maintenance.response": string;
  "maintenance.used": string;

  // Freelance Job Payment
  "freelanceJobPayment": string;
  "freelanceJobPaymentDescription": string;
  "freelanceJobPrice": string;
  "duration": string;
  "days": string;
  "birr": string;
  "freelanceBenefitsVisibility": string;
  "freelanceBenefitsSpecialView": string;
  "freelanceBenefitsAccessibility": string;
  "paymentInstructions": string;
  "paymentStep1": string;
  "paymentStep2": string;
  "paymentStep3": string;
  "paymentStep4": string;
  "transactionReference": string;
  "transactionReferenceNumber": string;
  "transactionReferencePlaceholder": string;
  "paymentScreenshot": string;
  "paymentScreenshotOptional": string;
  "jobSummary": string;
  "cancel": string;
  "submitRequest": string;
  "submitting": string;
  "fileSizeError": string;
  "transactionReferenceRequired": string;
  "freelanceJobPosted": string;
  "freelanceJobPostedDescription": string;
  "paymentRequestSubmitted": string;
  "paymentRequestSubmittedDescription": string;
  "paymentError": string;

  // Database Setup
  "database.setupRequired": string;
  "database.missingTables": string;
  "database.missingColumns": string;
  "database.setupInstructions": string;
  "database.runSqlCommands": string;
  "database.copy": string;
  "database.openSupabaseDashboard": string;
  "database.afterRunningCommands": string;
}

export type TranslationKey = keyof TranslationKeys;
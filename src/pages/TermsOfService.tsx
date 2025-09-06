import { useLanguage } from "@/contexts/LanguageContext";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Shield, AlertTriangle, Scale, Phone } from "lucide-react";

export default function TermsOfService() {
  const { t } = useLanguage();

  const sections = [
    {
      icon: Users,
      title: "User Accounts and Responsibilities",
      content: [
        "You must provide accurate and complete information when creating an account",
        "You are responsible for maintaining the confidentiality of your account credentials",
        "You must not share your account with others or create multiple accounts",
        "You agree to notify us immediately of any unauthorized use of your account",
        "You must be at least 18 years old to use our services"
      ]
    },
    {
      icon: FileText,
      title: "Platform Usage",
      content: [
        "You may use our platform solely for legitimate job search and recruitment purposes",
        "You must not post false, misleading, or discriminatory job listings or profiles",
        "You must not use automated tools to scrape or extract data from our platform",
        "You must respect the intellectual property rights of others",
        "You must not engage in any activity that could harm or disrupt our services"
      ]
    },
    {
      icon: Shield,
      title: "Content and Conduct",
      content: [
        "All content you post must be accurate, legal, and appropriate",
        "You retain ownership of your content but grant us license to use it on our platform",
        "We reserve the right to remove content that violates our guidelines",
        "You must not post content that is offensive, harmful, or violates others' rights",
        "Harassment, discrimination, or abusive behavior is strictly prohibited"
      ]
    },
    {
      icon: Scale,
      title: "Limitation of Liability",
      content: [
        "Our platform is provided 'as is' without warranties of any kind",
        "We are not responsible for the actions of users or third parties on our platform",
        "We do not guarantee the accuracy of job listings or user profiles",
        "Our liability is limited to the maximum extent permitted by law",
        "We are not responsible for employment decisions made by users of our platform"
      ]
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mx-auto mb-6">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                {t("terms.title")}
              </h1>
              <p className="text-lg text-muted-foreground">
                {t("terms.subtitle")}
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                {t("terms.lastUpdated")}
              </p>
            </div>
          </div>
        </section>

        {/* Introduction */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="mb-12">
                <CardHeader>
                  <CardTitle className="text-2xl">Agreement to Terms</CardTitle>
                  <CardDescription>
                    By accessing and using our platform, you accept and agree to be bound by these terms
                  </CardDescription>
                </CardHeader>
                <CardContent className="prose prose-slate dark:prose-invert max-w-none">
                  <p>
                    These Terms of Service ("Terms") govern your use of the Job Search Ethiopia 
                    platform and services operated by Job Search Ethiopia ("we," "our," or "us"). 
                    These Terms apply to all visitors, users, and others who access or use our services.
                  </p>
                  <p>
                    By accessing or using our Service, you agree to be bound by these Terms. 
                    If you disagree with any part of these terms, then you may not access the Service.
                  </p>
                </CardContent>
              </Card>

              {/* Main Sections */}
              <div className="grid gap-8">
                {sections.map(({ icon: Icon, title, content }) => (
                  <Card key={title}>
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <CardTitle className="text-xl">{title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {content.map((item, index) => (
                          <li key={index} className="flex items-start space-x-3">
                            <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                            <span className="text-muted-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Prohibited Activities */}
              <Card className="mt-8">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-6 h-6 text-destructive" />
                    <CardTitle className="text-xl text-destructive">Prohibited Activities</CardTitle>
                  </div>
                  <CardDescription>
                    The following activities are strictly prohibited on our platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">Fraudulent Activities</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Posting fake job listings or profiles</li>
                        <li>• Identity theft or impersonation</li>
                        <li>• Pyramid schemes or fraudulent recruitment</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">Misuse of Platform</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Spamming or sending unsolicited messages</li>
                        <li>• Using automated scripts or bots</li>
                        <li>• Attempting to hack or disrupt services</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">Inappropriate Content</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Discriminatory or offensive content</li>
                        <li>• Adult or explicit material</li>
                        <li>• Violent or threatening language</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">Legal Violations</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Illegal employment practices</li>
                        <li>• Copyright or trademark infringement</li>
                        <li>• Violation of local employment laws</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Termination */}
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="text-xl">Account Termination</CardTitle>
                  <CardDescription>
                    Circumstances under which accounts may be terminated
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      We reserve the right to terminate or suspend your account immediately, 
                      without prior notice or liability, for any reason, including:
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start space-x-3">
                        <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-muted-foreground">Violation of these Terms of Service</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-muted-foreground">Fraudulent or illegal activity</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-muted-foreground">Abuse of platform features or other users</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-muted-foreground">Extended periods of inactivity</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Governing Law */}
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="text-xl">Governing Law</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    These Terms shall be interpreted and governed by the laws of Ethiopia. 
                    Any disputes arising from these Terms or your use of our services shall 
                    be resolved in the courts of Addis Ababa, Ethiopia.
                  </p>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card className="mt-8">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-6 h-6 text-primary" />
                    <CardTitle className="text-xl">Contact Information</CardTitle>
                  </div>
                  <CardDescription>
                    If you have any questions about these Terms of Service
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      For questions about these Terms or to report violations, please contact us:
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm"><strong>Email:</strong> legal@jobsearch.et</p>
                      <p className="text-sm"><strong>Phone:</strong> +251 11 123 4567</p>
                      <p className="text-sm"><strong>Address:</strong> Addis Ababa, Ethiopia</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Changes to Terms */}
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="text-xl">Changes to Terms</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We reserve the right to modify or replace these Terms at any time at our 
                    sole discretion. If a revision is material, we will try to provide at least 
                    30 days notice prior to any new terms taking effect. What constitutes a 
                    material change will be determined at our sole discretion.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
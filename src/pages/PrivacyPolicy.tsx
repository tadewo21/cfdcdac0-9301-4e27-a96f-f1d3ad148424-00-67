import { useLanguage } from "@/contexts/LanguageContext";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, Lock, Database, Users, Phone } from "lucide-react";

export default function PrivacyPolicy() {
  const { t } = useLanguage();

  const sections = [
    {
      icon: Database,
      title: "Information We Collect",
      content: [
        "Personal information you provide when creating an account (name, email, phone number)",
        "Professional information including resume details, work experience, and skills",
        "Job search preferences and application history",
        "Usage data and analytics to improve our platform",
        "Device and browser information for security and optimization"
      ]
    },
    {
      icon: Eye,
      title: "How We Use Your Information",
      content: [
        "To provide and improve our job search services",
        "To match you with relevant job opportunities",
        "To communicate with you about jobs, updates, and platform features",
        "To ensure platform security and prevent fraud",
        "To analyze usage patterns and improve user experience"
      ]
    },
    {
      icon: Users,
      title: "Information Sharing",
      content: [
        "We share your profile information with employers when you apply for jobs",
        "Aggregated, anonymized data may be shared for research and industry insights",
        "We do not sell your personal information to third parties",
        "We may share information when required by law or to protect our rights",
        "Service providers who help us operate the platform may access necessary data"
      ]
    },
    {
      icon: Lock,
      title: "Data Security",
      content: [
        "We use industry-standard encryption to protect your data",
        "Regular security audits and updates to protect against threats",
        "Access controls limit who can view your personal information",
        "Secure data centers with physical and digital protection measures",
        "Regular backups to prevent data loss"
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
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                {t("privacy.title")}
              </h1>
              <p className="text-lg text-muted-foreground">
                {t("privacy.subtitle")}
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                {t("privacy.lastUpdated")}
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
                  <CardTitle className="text-2xl">Our Commitment to Your Privacy</CardTitle>
                  <CardDescription>
                    At Job Search Ethiopia, we are committed to protecting your privacy and personal data
                  </CardDescription>
                </CardHeader>
                <CardContent className="prose prose-slate dark:prose-invert max-w-none">
                  <p>
                    This Privacy Policy explains how Job Search Ethiopia ("we," "our," or "us") 
                    collects, uses, shares, and protects information about you when you use our 
                    job search platform and related services (collectively, the "Service").
                  </p>
                  <p>
                    By using our Service, you agree to the collection and use of information 
                    in accordance with this policy. We will not use or share your information 
                    with anyone except as described in this Privacy Policy.
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

              {/* Your Rights */}
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="text-xl">Your Rights and Choices</CardTitle>
                  <CardDescription>
                    You have several rights regarding your personal information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">Access and Update</h4>
                      <p className="text-muted-foreground text-sm">
                        You can access and update your profile information at any time 
                        through your account settings.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">Data Portability</h4>
                      <p className="text-muted-foreground text-sm">
                        You can request a copy of your personal data in a commonly 
                        used format.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">Deletion</h4>
                      <p className="text-muted-foreground text-sm">
                        You can request deletion of your account and associated data 
                        at any time.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">Communication Preferences</h4>
                      <p className="text-muted-foreground text-sm">
                        You can control what types of communications you receive from us.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card className="mt-8">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-6 h-6 text-primary" />
                    <CardTitle className="text-xl">Contact Us About Privacy</CardTitle>
                  </div>
                  <CardDescription>
                    If you have any questions about this Privacy Policy or our data practices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      If you have any questions about this Privacy Policy, please contact us:
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm"><strong>Email:</strong> privacy@jobsearch.et</p>
                      <p className="text-sm"><strong>Phone:</strong> +251 11 123 4567</p>
                      <p className="text-sm"><strong>Address:</strong> Addis Ababa, Ethiopia</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Updates */}
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="text-xl">Policy Updates</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We may update this Privacy Policy from time to time. We will notify you 
                    of any changes by posting the new Privacy Policy on this page and updating 
                    the "Last updated" date. We encourage you to review this Privacy Policy 
                    periodically for any changes.
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
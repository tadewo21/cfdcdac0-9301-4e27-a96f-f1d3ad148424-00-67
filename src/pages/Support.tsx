import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  HelpCircle, 
  Search, 
  Book, 
  MessageCircle, 
  Mail, 
  Phone, 
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Briefcase,
  Settings,
  Shield
} from "lucide-react";

export default function Support() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const supportCategories = [
    {
      icon: Users,
      title: "Account & Profile",
      description: "Help with account creation, profile management, and settings",
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
    },
    {
      icon: Briefcase,
      title: "Job Applications",
      description: "Assistance with applying for jobs and tracking applications",
      color: "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
    },
    {
      icon: Settings,
      title: "Technical Issues",
      description: "Help with platform functionality and troubleshooting",
      color: "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
    },
    {
      icon: Shield,
      title: "Security & Privacy",
      description: "Questions about data protection and account security",
      color: "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
    }
  ];

  const contactMethods = [
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Get instant help from our support team",
      availability: "Available 24/7",
      action: "Start Chat",
      primary: true
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us a detailed message about your issue",
      availability: "Response within 24 hours",
      action: "Send Email"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our support representatives",
      availability: "Mon-Fri, 8 AM - 6 PM",
      action: "Call Now"
    }
  ];

  const faqs = [
    {
      question: "How do I create an account?",
      answer: "To create an account, click the 'Login/Register' button in the top navigation, then select 'Create Account'. Fill in your details including name, email, and password. You'll receive a verification email to activate your account."
    },
    {
      question: "How do I apply for a job?",
      answer: "Find a job you're interested in and click 'Apply Now'. You'll need to have a complete profile with your resume information. Some jobs may redirect you to the employer's website, while others allow direct application through our platform."
    },
    {
      question: "Can I edit my profile after creating it?",
      answer: "Yes! You can edit your profile at any time by going to your Profile page. You can update your personal information, work experience, skills, and upload a new resume or profile picture."
    },
    {
      question: "How do I save jobs to apply later?",
      answer: "Click the heart icon on any job listing to save it to your favorites. You can view all your saved jobs by going to the Favorites page in your account."
    },
    {
      question: "Why am I not receiving job notifications?",
      answer: "Check your notification settings in your profile to ensure job alerts are enabled. Also verify that our emails aren't going to your spam folder. You can adjust notification preferences for different types of jobs and frequencies."
    },
    {
      question: "How do I reset my password?",
      answer: "On the login page, click 'Forgot Password' and enter your email address. You'll receive a reset link via email. Click the link and follow the instructions to create a new password."
    },
    {
      question: "Can employers see my profile without my permission?",
      answer: "Employers can only see your profile information that you've made public. You can control your privacy settings in your account. When you apply for a job, the employer will have access to your application details."
    },
    {
      question: "How do I delete my account?",
      answer: "To delete your account, go to Settings in your profile and look for the 'Delete Account' option. Please note that this action is permanent and cannot be undone. Consider deactivating your account temporarily if you're unsure."
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mx-auto mb-6">
                <HelpCircle className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                {t("support.title")}
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                {t("support.subtitle")}
              </p>
              
              {/* Search Bar */}
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("support.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 bg-background"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Support Categories */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">
              Browse by Category
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {supportCategories.map(({ icon: Icon, title, description, color }) => (
                <Card key={title} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">
              Get in Touch
            </h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {contactMethods.map(({ icon: Icon, title, description, availability, action, primary }) => (
                <Card key={title} className={primary ? "ring-2 ring-primary" : ""}>
                  <CardHeader>
                    <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4 mx-auto">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-center">{title}</CardTitle>
                    <CardDescription className="text-center">{description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-4">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{availability}</span>
                    </div>
                    <Button variant={primary ? "default" : "outline"} className="w-full">
                      {action}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Frequently Asked Questions
                </h2>
                <p className="text-muted-foreground">
                  Quick answers to common questions about using our job search platform
                </p>
              </div>

              {searchQuery && (
                <div className="mb-6">
                  <Badge variant="secondary" className="mb-2">
                    {filteredFaqs.length} results for "{searchQuery}"
                  </Badge>
                </div>
              )}

              <Accordion type="single" collapsible className="space-y-4">
                {filteredFaqs.map((faq, index) => (
                  <AccordionItem key={index} value={`faq-${index}`} className="border rounded-lg px-6">
                    <AccordionTrigger className="text-left hover:no-underline">
                      <div className="flex items-center space-x-3">
                        <HelpCircle className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="font-medium">{faq.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 pb-6">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {filteredFaqs.length === 0 && searchQuery && (
                <Card className="text-center py-8">
                  <CardContent>
                    <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No results found
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      We couldn't find any answers matching your search. 
                      Try different keywords or contact our support team.
                    </p>
                    <Button onClick={() => setSearchQuery("")}>
                      Clear Search
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>

        {/* Additional Resources */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-foreground mb-12">
                Additional Resources
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <Book className="w-6 h-6 text-primary" />
                      <CardTitle>User Guide</CardTitle>
                    </div>
                    <CardDescription>
                      Comprehensive documentation on how to use all platform features
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      View User Guide
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <MessageCircle className="w-6 h-6 text-primary" />
                      <CardTitle>Community Forum</CardTitle>
                    </div>
                    <CardDescription>
                      Connect with other job seekers and share experiences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      Join Community
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
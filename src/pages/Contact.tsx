import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/contexts/SettingsContext";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { t } = useLanguage();
  const { settings } = useSettings();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactInfo = [
    {
      icon: Mail,
      title: t("contact.emailAddress"),
      details: [settings.contactEmail || "support@jobsearch.et"],
      description: t("contact.emailDescription")
    },
    {
      icon: Phone,
      title: t("contact.phoneNumber"),
      details: [settings.contactPhone || "+251 11 123 4567"],
      description: t("contact.phoneDescription")
    },
    {
      icon: MapPin,
      title: t("contact.officeLocation"),
      details: [settings.address || "Addis Ababa, Ethiopia"],
      description: t("contact.officeDescription")
    },
    {
      icon: Clock,
      title: t("contact.businessHours"),
      details: ["Monday - Friday: 8:00 AM - 6:00 PM", "Saturday: 9:00 AM - 2:00 PM"],
      description: t("contact.businessHoursDescription")
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: t("contact.messageSent"),
      description: t("contact.messageDescription"),
    });

    setFormData({ name: "", email: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                {t("contact.title")}
              </h1>
              <p className="text-lg text-muted-foreground">
                {t("contact.subtitle")}
              </p>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {contactInfo.map(({ icon: Icon, title, details, description }) => (
                <Card key={title} className="text-center">
                  <CardHeader>
                    <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mx-auto mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {details.map((detail, index) => (
                      <p key={index} className="text-sm text-foreground font-medium">
                        {detail}
                      </p>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Contact Form */}
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">{t("contact.sendMessage")}</h2>
                <p className="text-muted-foreground mb-8">
                  {t("contact.sendMessageDescription")}
                </p>
                
                <Card>
                  <CardHeader>
                    <CardTitle>{t("contact.quickContact")}</CardTitle>
                    <CardDescription>
                      {t("contact.quickContactDescription")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-primary" />
                        <span className="text-sm">{settings.contactEmail}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-primary" />
                        <span className="text-sm">{settings.contactPhone}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>{t("contact.contactForm")}</CardTitle>
                  <CardDescription>
                    {t("contact.contactFormDescription")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="text-sm font-medium text-foreground mb-2 block">
                          {t("contact.fullName")} *
                        </label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="text-sm font-medium text-foreground mb-2 block">
                          {t("contact.emailAddressLabel")} *
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="subject" className="text-sm font-medium text-foreground mb-2 block">
                        {t("contact.subject")} *
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        placeholder="What is this about?"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="text-sm font-medium text-foreground mb-2 block">
                        {t("contact.message")} *
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        placeholder="Tell us how we can help you..."
                        rows={6}
                      />
                    </div>
                    
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? (
                        t("contact.sending")
                      ) : (
                        <>
                          {t("contact.sendButton")}
                          <Send className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-foreground mb-12">
                {t("contact.faq.title")}
              </h2>
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {t("contact.faq.responseTime")}
                  </h3>
                  <p className="text-muted-foreground">
                    {t("contact.faq.responseTimeAnswer")}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {t("contact.faq.visitOffice")}
                  </h3>
                  <p className="text-muted-foreground">
                    {t("contact.faq.visitOfficeAnswer")}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {t("contact.faq.techSupport")}
                  </h3>
                  <p className="text-muted-foreground">
                    {t("contact.faq.techSupportAnswer")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
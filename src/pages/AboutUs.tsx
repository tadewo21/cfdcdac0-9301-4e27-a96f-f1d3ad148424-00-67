import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/contexts/SettingsContext";
import { Layout } from "@/components/Layout";
import { Users, Target, Award, TrendingUp } from "lucide-react";

export default function AboutUs() {
  const { t } = useLanguage();
  const { settings } = useSettings();

  const stats = [
    { icon: Users, number: "10,000+", label: t("about.stats.activeJobSeekers") },
    { icon: TrendingUp, number: "500+", label: t("about.stats.partnerCompanies") },
    { icon: Award, number: "95%", label: t("about.stats.successRate") },
    { icon: Target, number: "50+", label: t("about.stats.citiesCovered") }
  ];

  const values = [
    {
      title: t("about.values.transparency.title"),
      description: t("about.values.transparency.description")
    },
    {
      title: t("about.values.innovation.title"),
      description: t("about.values.innovation.description")
    },
    {
      title: t("about.values.community.title"),
      description: t("about.values.community.description")
    },
    {
      title: t("about.values.excellence.title"),
      description: t("about.values.excellence.description")
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                {t("about.title")}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t("about.description")}
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map(({ icon: Icon, number, label }) => (
                <div key={label} className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 mx-auto">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-2">{number}</div>
                  <div className="text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-foreground mb-12">{t("about.mission.title")}</h2>
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-2xl font-semibold text-foreground mb-4">
                    {t("about.mission.subtitle")}
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {t("about.mission.description1")}
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    {t("about.mission.description2")}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-primary/5 to-secondary/5 p-8 rounded-xl">
                  <h4 className="text-xl font-semibold text-foreground mb-4">{t("about.mission.whatSetsUsApart")}</h4>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {t("about.mission.localExpertise")}
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {t("about.mission.bilingualPlatform")}
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {t("about.mission.mobileFirst")}
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {t("about.mission.verifiedCompanies")}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">{t("about.values.title")}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value) => (
                <div key={value.title} className="text-center">
                  <h3 className="text-xl font-semibold text-foreground mb-4">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-foreground mb-6">{t("about.team.title")}</h2>
              <p className="text-lg text-muted-foreground mb-12">
                {t("about.team.description")}
              </p>
              <div className="bg-gradient-to-br from-primary/5 to-secondary/5 p-8 rounded-xl">
                <h3 className="text-xl font-semibold text-foreground mb-4">{t("about.team.joinMission")}</h3>
                <p className="text-muted-foreground">
                  {t("about.team.joinDescription")}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
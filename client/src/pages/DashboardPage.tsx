import Layout from "@/components/layout/Layout";
import HealthSummary from "@/components/dashboard/HealthSummary";
import DoctorsList from "@/components/dashboard/DoctorsList";
import HealthInsights from "@/components/dashboard/HealthInsights";
import GovernmentSchemes from "@/components/dashboard/GovernmentSchemes";
import CommunityForum from "@/components/dashboard/CommunityForum";
import { useLanguage } from "@/context/LanguageContext";

export default function DashboardPage() {
  const { t } = useLanguage();
  
  return (
    <Layout title={t("dashboard")}>
      {/* Health Summary Section */}
      <section className="mb-8">
        <h3 className="text-lg font-medium text-slate-900 mb-4">Health Summary</h3>
        <HealthSummary />
      </section>

      {/* Find Doctors Section */}
      <section className="mb-8">
        <DoctorsList />
      </section>

      {/* Health Insights Section */}
      <section className="mb-8">
        <h3 className="text-lg font-medium text-slate-900 mb-4">Health Insights</h3>
        <HealthInsights />
      </section>

      {/* Healthcare Programs Section */}
      <section className="mb-8">
        <GovernmentSchemes />
      </section>

      {/* Community Health Forum Preview */}
      <CommunityForum />
    </Layout>
  );
}

import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ShieldCheck, FileText, Lock, ArrowLeft } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Button } from '../components/ui/Button';

export const LegalPlaceholder: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  let title = 'Terms of Service';
  let tag = 'Legal';
  let icon = FileText;
  let summary = 'Review the general operational terms and guidelines for AllCardStation.';

  if (path === '/privacy') {
    title = 'Privacy Policy';
    tag = 'Data Protection';
    icon = ShieldCheck;
    summary = 'Learn how AllCardStation protects user data, email credentials, and transaction integrity.';
  } else if (path === '/security') {
    title = 'Security Overview';
    tag = 'Trust & Encryption';
    icon = Lock;
    summary = 'Discover our multi-layered defense architecture, TLS 1.3 protocol standards, and anti-tamper safeguards.';
  }

  const IconComp = icon;

  return (
    <PageContainer
      breadcrumbs={[
        { label: title }
      ]}
    >
      <div className="max-w-3xl mx-auto my-6">
        <SectionHeading
          tag={tag}
          title={title}
          subtitle={summary}
          align="left"
          className="mb-8"
        />

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs space-y-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-800/80 text-indigo-900 dark:text-indigo-200">
            <IconComp className="w-6 h-6 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold">Compliance Notice: </span>
              AllCardStation operates in strict accordance with digital asset standards, international consumer protection regulations, and authorized merchant protocols.
            </div>
          </div>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">1. Digital Card Delivery & Authenticity</h3>
            <p>
              All digital gift card codes presented on AllCardStation are generated electronically upon order authorization. Users agree to provide an accurate delivery email address for recipient claim fulfillment.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">2. Non-Refundable Electronic Assets</h3>
            <p>
              Due to immediate electronic code issuance, digital gift cards cannot be canceled, exchanged, or refunded once delivered. Please ensure proper denomination selection prior to completing checkout.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">3. Data Security & Encryption</h3>
            <p>
              We implement industry-standard 256-bit SSL/TLS encryption across all communications. User account details and claim codes are never exposed to unauthorized third parties.
            </p>
          </section>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <Link to="/">
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back to Home
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="ghost" size="sm">
                Have Legal Questions?
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

import React, { useState } from 'react';
import { 
  Mail, 
  MessageSquare, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  Send, 
  HelpCircle
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ContactFormData } from '../types/giftCard';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    fullName: '',
    email: '',
    subject: '',
    orderNumber: '',
    message: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [ticketNumber, setTicketNumber] = useState<string>('');

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ContactFormData, string>> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Please enter your full name.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Please provide a subject line.';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Please enter your message.';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Frontend demo submission response
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTicketNumber(`TK-${Math.floor(100000 + Math.random() * 900000)}`);
      setFormData({
        fullName: '',
        email: '',
        subject: '',
        orderNumber: '',
        message: '',
      });
    }, 600);
  };

  return (
    <PageContainer
      breadcrumbs={[
        { label: 'Contact Support' }
      ]}
    >
      <div className="max-w-5xl mx-auto">
        <SectionHeading
          tag="Get In Touch"
          title="We're Here to Help"
          subtitle="Have questions regarding an order, card redemption, or corporate gift inquiries? Send our support team a message."
          align="center"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Contact Form */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
            {isSuccess ? (
              <div className="py-10 text-center space-y-4 animate-in fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Inquiry Submitted Successfully</h3>
                
                {ticketNumber && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-mono text-sm font-bold">
                    <span>Ticket Tracking Number:</span>
                    <span className="underline decoration-indigo-400 underline-offset-4">{ticketNumber}</span>
                  </div>
                )}

                <p className="text-slate-600 dark:text-slate-300 text-sm max-w-md mx-auto leading-relaxed">
                  Thank you for contacting AllCardStation Support. Your message and reference details have been securely logged. Our customer operations team will review your inquiry and respond to your provided email address shortly.
                </p>
                <div className="pt-4">
                  <Button variant="outline" onClick={() => setIsSuccess(false)}>
                    Send Another Message
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    id="contact-fullname"
                    label="Full Name"
                    placeholder="Jane Doe"
                    required
                    value={formData.fullName}
                    onChange={(e) => {
                      setFormData({ ...formData, fullName: e.target.value });
                      if (errors.fullName) setErrors({ ...errors, fullName: undefined });
                    }}
                    error={errors.fullName}
                  />

                  <Input
                    id="contact-email"
                    label="Email Address"
                    type="email"
                    placeholder="jane@example.com"
                    required
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: undefined });
                    }}
                    error={errors.email}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    id="contact-subject"
                    label="Subject"
                    placeholder="e.g. Card Delivery Inquiry"
                    required
                    value={formData.subject}
                    onChange={(e) => {
                      setFormData({ ...formData, subject: e.target.value });
                      if (errors.subject) setErrors({ ...errors, subject: undefined });
                    }}
                    error={errors.subject}
                  />

                  <Input
                    id="contact-ordernumber"
                    label="Order Number (Optional)"
                    placeholder="e.g. ACS-109482"
                    value={formData.orderNumber || ''}
                    onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                  />
                </div>

                {/* Message Textarea */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="contact-message" className="text-sm font-semibold text-slate-700 dark:text-slate-300 select-none">
                    Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    placeholder="Describe how we can assist you with your gift card..."
                    value={formData.message}
                    onChange={(e) => {
                      setFormData({ ...formData, message: e.target.value });
                      if (errors.message) setErrors({ ...errors, message: undefined });
                    }}
                    className={`w-full rounded-xl bg-white dark:bg-slate-900 border text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 p-3.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.message
                        ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20 dark:bg-rose-950/20'
                        : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
                    }`}
                  />
                  {errors.message && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{errors.message}</p>
                  )}
                </div>

                <Button
                  id="btn-submit-contact"
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full mt-2"
                  isLoading={isSubmitting}
                  rightIcon={<Send className="w-4 h-4" />}
                >
                  Send Message
                </Button>
              </form>
            )}
          </div>

          {/* Right Sidebar: Contact Channels */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-slate-900 dark:bg-slate-950 text-white rounded-2xl p-6 space-y-5 shadow-xs border border-slate-800">
              <h4 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <span>Contact Channels</span>
              </h4>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-indigo-400 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs">Customer Support</div>
                    <div className="font-semibold text-white">support@allcardstation.demo</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-amber-400 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs">Response Time</div>
                    <div className="font-semibold text-white">Under 1 hour average</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-emerald-400 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs">Availability</div>
                    <div className="font-semibold text-white">24/7 Digital Operations</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/70 dark:border-indigo-800 rounded-2xl p-6 text-xs text-indigo-950 dark:text-indigo-200 space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-indigo-900 dark:text-white text-sm">
                <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Looking for instant help?</span>
              </div>
              <p className="text-indigo-800 dark:text-indigo-300 leading-relaxed">
                Many answers regarding delivery times, fees, and redemption steps can be found right away in our searchable FAQ section.
              </p>
            </div>
          </div>

        </div>
      </div>
    </PageContainer>
  );
};

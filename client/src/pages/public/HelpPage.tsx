import React, { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, HelpCircle, PhoneCall, Mail, ChevronDown, ChevronUp, FileText, CheckCircle2 } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FAQItem[] = [
  {
    category: 'Eligibility & Application',
    question: 'How do I know which scholarships or schemes I qualify for?',
    answer:
      'Log in with your Samagra ID or Aadhaar details and visit the "Find Scholarships" page. The platform compares your grade, caste category, annual income, and school location against the state eligibility rules engine to instantly show you matching schemes.',
  },
  {
    category: 'Eligibility & Application',
    question: 'Can I apply for more than one scholarship or benefit in the same year?',
    answer:
      'Yes, provided the scheme rules do not conflict. For example, a student receiving a non-monetary benefit like the Free Bicycle Scheme can simultaneously receive the Pre-Matric or Post-Matric DBT Scholarship.',
  },
  {
    category: 'Documents & Verification',
    question: 'What happens if my income or caste certificate is pending renewal?',
    answer:
      'If your document is older than the allowed validity period, the nodal school reviewer will flag the application as "Correction Required" rather than rejecting it. You can upload the updated certificate without restarting your application.',
  },
  {
    category: 'Documents & Verification',
    question: 'How does digital document verification work on Vidya Pragati Setu?',
    answer:
      'The portal connects directly with the State e-District portal and Digilocker. When you provide your certificate registration number, details are verified automatically with no physical paperwork required in most cases.',
  },
  {
    category: 'Disbursal & Banking',
    question: 'Why must my bank account be seeded with Aadhaar for DBT?',
    answer:
      'As per Direct Benefit Transfer guidelines, government payments are credited via the NPCI Aadhaar Payment Bridge (APB). Seeding your savings bank account ensures instant, fraud-proof credit directly to you with zero intermediary deductions.',
  },
  {
    category: 'Bicycles & Physical Assets',
    question: 'How do I track and receive my bicycle?',
    answer:
      'Under "Benefits Tracking", check your bicycle asset status. When it reaches your school depot, your teacher will schedule a handover. Upon scanning the QR code on the bicycle frame and verifying your student OTP, the handover is certified.',
  },
];

export const HelpPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = FAQS.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <PageHeader
        title="Help & Citizen Support Center"
        description="Find answers to frequently asked questions about scholarships, DBT disbursals, document validation, and asset delivery."
      />

      {/* Search Input */}
      <div className="max-w-2xl mx-auto relative">
        <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Type your question or keywords (e.g. Aadhaar, bicycle, income certificate)..."
          className="pl-12 h-12 text-sm shadow-sm"
        />
      </div>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-slate-200 bg-white">
          <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-4">
            <PhoneCall className="h-5 w-5" />
          </div>
          <h4 className="text-base font-bold text-navy-950 mb-1">State Toll-Free Helpline</h4>
          <p className="text-xl font-extrabold text-navy-900 mb-1">1800-233-0101</p>
          <p className="text-xs text-muted-foreground">Toll free across Madhya Pradesh. Mon to Sat 9 AM – 6 PM.</p>
        </Card>

        <Card className="p-6 border-slate-200 bg-white">
          <div className="h-10 w-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mb-4">
            <Mail className="h-5 w-5" />
          </div>
          <h4 className="text-base font-bold text-navy-950 mb-1">Email Grievance Cell</h4>
          <p className="text-sm font-bold text-teal-700 mb-1">support-vps@mp.gov.in</p>
          <p className="text-xs text-muted-foreground">Expected ticket turnaround time: within 24–48 working hours.</p>
        </Card>

        <Card className="p-6 border-slate-200 bg-white">
          <div className="h-10 w-10 rounded-xl bg-saffron-100 text-saffron-800 flex items-center justify-center mb-4">
            <FileText className="h-5 w-5" />
          </div>
          <h4 className="text-base font-bold text-navy-950 mb-1">School Nodal Teacher</h4>
          <p className="text-xs font-semibold text-navy-950 mb-1">In-Person Assistance</p>
          <p className="text-xs text-muted-foreground">
            Contact the appointed scholarship nodal teacher at your enrolled school for manual biometric/document help.
          </p>
        </Card>
      </div>

      {/* FAQs Accordion */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-navy-900" />
          <h3 className="text-xl font-bold text-navy-950">Frequently Asked Questions</h3>
        </div>

        <div className="space-y-3">
          {filteredFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-lg border border-slate-200 bg-white overflow-hidden transition-all shadow-xs"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-0.5 pr-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-saffron-700">
                      {faq.category}
                    </span>
                    <h4 className="text-sm font-semibold text-navy-950">{faq.question}</h4>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-slate-500 shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-500 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

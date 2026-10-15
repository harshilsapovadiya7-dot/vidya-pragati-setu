import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SchemeCard } from '@/components/shared/SchemeCard';
import { reportsApi, schemesApi, Scheme } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  CreditCard,
  Bike,
  Building,
  FileCheck,
  TrendingUp,
  Search,
  Award,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 142580,
    totalApplications: 98450,
    totalDisbursedAmount: 485000000,
    totalBicyclesDistributed: 38200,
    activeSchemesCount: 14,
  });
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryData, schemesData] = await Promise.allSettled([
          reportsApi.summary(),
          schemesApi.list({ active: true }),
        ]);

        if (summaryData.status === 'fulfilled' && summaryData.value) {
          setStats((prev) => ({ ...prev, ...summaryData.value }));
        }

        if (schemesData.status === 'fulfilled' && Array.isArray(schemesData.value) && schemesData.value.length > 0) {
          setSchemes(schemesData.value.slice(0, 3));
        } else {
          // High quality demo fallback schemes
          setSchemes([
            {
              id: 'scheme-1',
              code: 'PMS-2026',
              title: 'Chief Minister Post-Matric Scholarship Scheme',
              shortDescription: 'Financial assistance for SC/ST and OBC students enrolled in Class 11, 12 and Higher Education.',
              description: 'Provides 100% tuition coverage and annual maintenance allowance.',
              category: 'SCHOLARSHIP',
              benefitAmount: 18500,
              benefitType: 'Annual Direct Bank Transfer',
              academicYear: '2026-2027',
              applicationStartDate: '2026-07-01',
              applicationEndDate: '2026-11-30',
              isPublished: true,
              isActive: true,
            },
            {
              id: 'scheme-2',
              code: 'CYC-GIRL-2026',
              title: 'Free Bicycle Scheme for Rural Girl Students',
              shortDescription: 'Free high-durability gear bicycles provided to female students commuting >2km to secondary schools.',
              description: 'Targeted physical distribution with QR-coded serial numbers and depot verification.',
              category: 'TRANSPORT',
              benefitAmount: 4200,
              benefitType: 'Hero All-Terrain 26T Bicycle',
              academicYear: '2026-2027',
              applicationStartDate: '2026-07-15',
              applicationEndDate: '2026-10-31',
              isPublished: true,
              isActive: true,
            },
            {
              id: 'scheme-3',
              code: 'PRE-MAT-2026',
              title: 'State Pre-Matric Merit Scholarship (Grades 9-10)',
              shortDescription: 'Merit-cum-means scholarship for top-ranking students from economically weaker sections.',
              description: 'Direct cash assistance credited to student bank account linked with Aadhaar.',
              category: 'SCHOLARSHIP',
              benefitAmount: 6000,
              benefitType: 'Aadhaar DBT Disbursal',
              academicYear: '2026-2027',
              applicationStartDate: '2026-08-01',
              applicationEndDate: '2026-12-15',
              isPublished: true,
              isActive: true,
            },
          ]);
        }
      } catch {
        // Handled silently
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-20 pb-20 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 bg-gradient-to-b from-white via-slate-50 to-navy-50/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-saffron-100 text-saffron-900 text-xs font-bold tracking-wide uppercase shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-saffron-600" />
                <span>e-Governance Mission • Madhya Pradesh</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-navy-950 tracking-tight leading-[1.12]">
                Every Student Deserves <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-navy-900 via-teal-700 to-saffron-600">
                  Every Opportunity
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                Vidya Pragati Setu unites student scholarships, free bicycle delivery, and academic grants onto a single transparent, automated platform. Powered by Aadhaar verification and end-to-end tracking from application to disbursal.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start pt-2">
                <Button
                  size="lg"
                  onClick={() => navigate('/schemes')}
                  className="w-full sm:w-auto bg-navy-900 hover:bg-navy-800 text-white font-semibold text-base px-7 h-12 shadow-md flex items-center gap-2 group"
                >
                  <span>Explore Schemes</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/login')}
                  className="w-full sm:w-auto h-12 px-7 text-base font-semibold border-slate-300 hover:bg-slate-100"
                >
                  Applicant Portal Login
                </Button>
              </div>

              <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>100% Aadhaar-Seeded DBT</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-teal-600" />
                  <span>Real-Time School Verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-saffron-600" />
                  <span>Zero Intermediary Leakage</span>
                </div>
              </div>
            </div>

            {/* Dashboard Mockup Preview */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto w-full max-w-lg rounded-2xl bg-gradient-to-tr from-navy-900 to-navy-800 p-3 shadow-2xl ring-1 ring-slate-900/10">
                {/* Mock Window Controls */}
                <div className="flex items-center justify-between pb-3 px-2 border-b border-navy-700/60 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <span className="ml-2 font-mono text-[11px] text-slate-400">vidyapragati.gov.in</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold text-[10px]">
                    Live Status
                  </span>
                </div>

                {/* Inner Mock Dashboard Content */}
                <div className="bg-slate-50 rounded-xl p-4 mt-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Student Beneficiary</p>
                      <h4 className="text-sm font-bold text-navy-950">Priya Sharma • Class 10</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Aadhaar Linked
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <p className="text-[10px] text-slate-400 font-medium">Pre-Matric Scholarship</p>
                      <p className="text-sm font-bold text-emerald-600 mt-0.5">₹6,000 Disbursed</p>
                      <span className="text-[9px] text-slate-400">Direct to Bank A/C</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <p className="text-[10px] text-slate-400 font-medium">Bicycle Entitlement</p>
                      <p className="text-sm font-bold text-navy-900 mt-0.5">At School Depot</p>
                      <span className="text-[9px] text-teal-600 font-semibold">QR: VPS-CYC-4412</span>
                    </div>
                  </div>

                  {/* Progress tracker widget */}
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-semibold text-slate-700">Application Milestone</span>
                      <span className="font-bold text-emerald-600">80% Verified</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="w-4/5 h-full bg-emerald-500 rounded-full" />
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-400 pt-0.5">
                      <span>Submitted</span>
                      <span>School Approved</span>
                      <span className="font-bold text-navy-900">District Sanction</span>
                      <span>DBT</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* State Aggregated Statistics */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10">
          <div className="text-center max-w-xl mx-auto mb-8 space-y-1">
            <h2 className="text-2xl font-bold text-navy-950">Scale & Public Impact</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Live automated metrics updated directly across all districts
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1 p-4 rounded-xl bg-slate-50">
              <div className="h-10 w-10 mx-auto rounded-full bg-blue-100 flex items-center justify-center text-blue-800 mb-2">
                <Users className="h-5 w-5" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-navy-950">
                {stats.totalStudents.toLocaleString('en-IN')}
              </p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Students Enrolled</p>
            </div>

            <div className="space-y-1 p-4 rounded-xl bg-slate-50">
              <div className="h-10 w-10 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 mb-2">
                <CreditCard className="h-5 w-5" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-navy-950">
                {formatCurrency(stats.totalDisbursedAmount)}
              </p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">DBT Disbursed</p>
            </div>

            <div className="space-y-1 p-4 rounded-xl bg-slate-50">
              <div className="h-10 w-10 mx-auto rounded-full bg-saffron-100 flex items-center justify-center text-saffron-800 mb-2">
                <Bike className="h-5 w-5" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-navy-950">
                {stats.totalBicyclesDistributed.toLocaleString('en-IN')}
              </p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bicycles Distributed</p>
            </div>

            <div className="space-y-1 p-4 rounded-xl bg-slate-50">
              <div className="h-10 w-10 mx-auto rounded-full bg-teal-100 flex items-center justify-center text-teal-800 mb-2">
                <FileCheck className="h-5 w-5" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-navy-950">
                {stats.totalApplications.toLocaleString('en-IN')}
              </p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sanctioned Grants</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Schemes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-saffron-600 uppercase tracking-wider">Open For Academic Year 2026-27</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 mt-1">
              Featured Government Welfare Schemes
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Apply online in minutes with auto-verification against state educational databases.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/schemes')}
            className="self-start sm:self-auto font-semibold flex items-center gap-1.5"
          >
            <span>View All Schemes</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {schemes.map((scheme) => (
            <SchemeCard
              key={scheme.id}
              scheme={scheme}
              onApply={() => navigate(`/student/apply/${scheme.id}`)}
            />
          ))}
        </div>
      </section>

      {/* How It Works: 5 Steps */}
      <section className="bg-navy-950 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-saffron-400">Streamlined Workflow</span>
            <h2 className="text-3xl sm:text-4xl font-black">How Vidya Pragati Setu Works</h2>
            <p className="text-sm text-slate-400">
              A frictionless journey from student discovery to verifiable doorstep delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              {
                step: '01',
                title: 'Citizen Registration',
                desc: 'One-time registration with Aadhaar & Samagra ID. Profile details are automatically populated.',
              },
              {
                step: '02',
                title: 'Smart Eligibility Check',
                desc: 'Automated rules engine matches caste, grade, income, and gender against active schemes.',
              },
              {
                step: '03',
                title: 'Single-Window Apply',
                desc: 'Apply in 3 clicks with reusable document vault and digital document verification.',
              },
              {
                step: '04',
                title: 'School & District Review',
                desc: 'Nodal teachers & district officers verify attendance and marks via dedicated dashboards.',
              },
              {
                step: '05',
                title: 'Direct Benefit Disbursal',
                desc: 'Scholarship amount directly wired to student bank account or QR bicycle handed over.',
              },
            ].map((s) => (
              <div key={s.step} className="p-5 rounded-xl bg-navy-900 border border-navy-800 space-y-3 relative group hover:border-saffron-500/50 transition-colors">
                <span className="text-3xl font-black text-saffron-400/80 font-mono">{s.step}</span>
                <h4 className="text-base font-bold text-white">{s.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-bold text-navy-950">Engineered for Transparency & Trust</h2>
          <p className="text-sm text-slate-500">
            Eliminating duplicate records, bureaucratic delays, and tracking hurdles at every level of governance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-6 border-slate-200 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-navy-950 mb-2">Zero Fraud & Duplicate Filtering</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every applicant is deduplicated across Aadhaar and state student registry, completely preventing ghost beneficiaries.
            </p>
          </Card>

          <Card className="p-6 border-slate-200 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
              <Bike className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-navy-950 mb-2">Asset QR Traceability</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Physical assets like bicycles are barcode/QR tagged from state dispatch through school depot until student handover confirmation.
            </p>
          </Card>

          <Card className="p-6 border-slate-200 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-xl bg-saffron-50 text-saffron-700 flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-navy-950 mb-2">Public Executive Oversight</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              District officers and State Education Directors inspect approval times, pending backlogs, and fund utilization in real time.
            </p>
          </Card>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-navy-900 via-navy-800 to-teal-900 text-white p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-black">Are you a student in Madhya Pradesh?</h3>
            <p className="text-sm text-slate-300">
              Check your eligibility in 30 seconds and secure your entitled government benefits today.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Button
              size="lg"
              onClick={() => navigate('/schemes')}
              className="bg-saffron-500 hover:bg-saffron-600 text-white font-bold px-7"
            >
              Browse Schemes
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/login')}
              className="bg-transparent border-white/30 text-white hover:bg-white/10 font-bold px-7"
            >
              Staff & Student Login
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

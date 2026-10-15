import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { applicationsApi, reportsApi, Application } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Building2,
  FileText,
  CreditCard,
  Truck,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const SCHOOL_DATA = [
  { name: 'Govt Excellence HSS', applications: 184, approved: 162 },
  { name: 'Model HSS Bairagarh', applications: 142, approved: 120 },
  { name: 'Govt Girls HSS Jahangirabad', applications: 198, approved: 180 },
  { name: 'Govt Subhash HSS', applications: 110, approved: 95 },
  { name: 'Govt HSS Kolar', applications: 86, approved: 72 },
];

const STATUS_DISTRIBUTION = [
  { name: 'Approved & Disbursed', value: 680, color: '#0d9488' },
  { name: 'Under District Review', value: 145, color: '#f59e0b' },
  { name: 'School Level Review', value: 92, color: '#3b82f6' },
  { name: 'Correction Required', value: 48, color: '#ea580c' },
];

export const DistrictDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [pendingApps, setPendingApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await applicationsApi.list({ status: 'UNDER_DISTRICT_REVIEW', limit: 5 });
        if (res && Array.isArray(res.applications)) {
          setPendingApps(res.applications);
        } else {
          setPendingApps([
            {
              id: 'app-d1',
              applicationNumber: 'VPS/2026/00492',
              student: {
                id: 'st-1',
                firstName: 'Priya',
                lastName: 'Sharma',
                schoolName: 'Govt Excellence HSS, Bhopal',
                district: 'Bhopal',
                currentGrade: 'Grade 10',
                casteCategory: 'OBC',
              },
              studentId: 'st-1',
              schemeId: 'scheme-1',
              schemeTitle: 'Pre-Matric Scholarship Scheme',
              status: 'UNDER_DISTRICT_REVIEW',
              academicYear: '2026-2027',
              schoolReviewedAt: '2026-08-18T14:20:00Z',
              createdAt: '2026-08-10T10:30:00Z',
              updatedAt: '2026-08-18T14:20:00Z',
            },
            {
              id: 'app-d2',
              applicationNumber: 'VPS/2026/00730',
              student: {
                id: 'st-5',
                firstName: 'Rajesh',
                lastName: 'Yadav',
                schoolName: 'Model HSS Bairagarh',
                district: 'Bhopal',
                currentGrade: 'Grade 11',
                casteCategory: 'OBC',
              },
              studentId: 'st-5',
              schemeId: 'scheme-1',
              schemeTitle: 'Chief Minister Post-Matric Scholarship',
              status: 'UNDER_DISTRICT_REVIEW',
              academicYear: '2026-2027',
              schoolReviewedAt: '2026-08-19T10:00:00Z',
              createdAt: '2026-08-12T11:00:00Z',
              updatedAt: '2026-08-19T10:00:00Z',
            },
          ]);
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        title="District Education Officer (DEO) — Bhopal District"
        description="District sanction authority for school scholarships, block allotment monitoring, and centralized bicycle consignment management."
      >
        <Button
          onClick={() => navigate('/district/applications')}
          className="bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs flex items-center gap-1.5"
        >
          <span>Sanction Pending Cohort</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </PageHeader>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Affiliated District Schools"
          value="148"
          description="High Schools & Higher Secondary"
          icon={Building2}
          iconBg="bg-blue-50"
          iconColor="text-blue-700"
          onClick={() => navigate('/district/schools')}
        />
        <StatCard
          title="Awaiting DEO Sanction"
          value={pendingApps.length}
          description="Forwarded by school principals"
          icon={Clock}
          iconBg="bg-amber-50"
          iconColor="text-amber-700"
          onClick={() => navigate('/district/applications')}
        />
        <StatCard
          title="District Disbursed Funds"
          value="₹4.28 Cr"
          description="DBT direct credit across Bhopal"
          icon={CreditCard}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-700"
          onClick={() => navigate('/district/reports')}
        />
        <StatCard
          title="Bicycles in District Logistics"
          value="1,850"
          description="Dispatched to school clusters"
          icon={Truck}
          iconBg="bg-saffron-50"
          iconColor="text-saffron-700"
          onClick={() => navigate('/district/assets')}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* School Application Volume (BarChart) */}
        <Card className="lg:col-span-7 border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-navy-950">
              Applications & Sanctions by Cluster School
            </CardTitle>
            <CardDescription className="text-xs">
              Comparison of received student applications vs district sanctioned volume.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SCHOOL_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="applications" fill="#1e293b" name="Total Applications" radius={[4, 4, 0, 0]} />
                <Bar dataKey="approved" fill="#0d9488" name="Approved & Disbursed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Breakdown (PieChart) */}
        <Card className="lg:col-span-5 border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-navy-950">
              District Pipeline Status
            </CardTitle>
            <CardDescription className="text-xs">
              Overall processing distribution across Bhopal district.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={STATUS_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {STATUS_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Pending District Approvals */}
      <Card className="border-slate-200 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold text-navy-950">
              Pending District Sanction Orders
            </CardTitle>
            <CardDescription className="text-xs">
              Forwarded with Principal recommendation, awaiting final DEO digital signature.
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/district/applications')}
            className="text-xs font-semibold text-navy-900"
          >
            <span>View All</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-3 pt-1">
          {pendingApps.map((app) => (
            <div
              key={app.id}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-navy-900">
                    {app.applicationNumber}
                  </span>
                  <StatusBadge status={app.status} />
                </div>
                <h4 className="text-sm font-bold text-navy-950">
                  {app.student?.firstName} {app.student?.lastName} • {app.student?.schoolName}
                </h4>
                <p className="text-xs text-slate-500">
                  Scheme: <strong>{app.schemeTitle}</strong> • Verified by School Principal on {formatDate(app.schoolReviewedAt)}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  onClick={() => navigate(`/district/applications?id=${app.id}`)}
                  className="bg-navy-900 hover:bg-navy-800 text-white text-xs h-9 px-4 font-semibold"
                >
                  Review & Sanction
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

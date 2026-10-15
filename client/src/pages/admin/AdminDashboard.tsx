import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';
import { reportsApi } from '@/lib/api';
import {
  Users,
  FileText,
  CreditCard,
  Bike,
  Building2,
  Clock,
  TrendingUp,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Data for charts using Navy, Saffron, and Teal palettes
const SCHEME_APPLICATIONS_DATA = [
  { scheme: 'SC Post-Matric', count: 48200 },
  { scheme: 'ST Post-Matric', count: 34500 },
  { scheme: 'OBC Pre-Matric', count: 62800 },
  { scheme: 'Girls Bicycle', count: 38200 },
  { scheme: 'Pratibha Merit', count: 12400 },
  { scheme: 'Medhavi Higher Ed', count: 8900 },
];

const APPROVAL_TRENDS_DATA = [
  { week: 'W1 Jul', applications: 12000, approvals: 8400 },
  { week: 'W2 Jul', applications: 24000, approvals: 19500 },
  { week: 'W3 Jul', applications: 38000, approvals: 32000 },
  { week: 'W4 Jul', applications: 54000, approvals: 47000 },
  { week: 'W1 Aug', applications: 72000, approvals: 64500 },
  { week: 'W2 Aug', applications: 89000, approvals: 81200 },
  { week: 'W3 Aug', applications: 98450, approvals: 91400 },
];

const PAYMENT_STATUS_DATA = [
  { name: 'Disbursed Success', value: 84, color: '#0d9488' }, // Teal
  { name: 'In Banking Pipeline', value: 11, color: '#1e293b' }, // Navy
  { name: 'NPCI Seed Retrying', value: 3.5, color: '#f59e0b' }, // Saffron
  { name: 'Failed / Rejected', value: 1.5, color: '#e11d48' }, // Rose
];

const PENDING_BACKLOG_DATA = [
  { month: 'Apr', schoolBacklog: 850, districtBacklog: 420 },
  { month: 'May', schoolBacklog: 1420, districtBacklog: 680 },
  { month: 'Jun', schoolBacklog: 3100, districtBacklog: 1250 },
  { month: 'Jul', schoolBacklog: 4800, districtBacklog: 2400 },
  { month: 'Aug', schoolBacklog: 2100, districtBacklog: 980 },
  { month: 'Sep', schoolBacklog: 920, districtBacklog: 410 },
];

const DISTRICT_COVERAGE_DATA = [
  { district: 'Bhopal', totalDisbursed: 42.8, coveragePercent: 96.4 },
  { district: 'Indore', totalDisbursed: 58.2, coveragePercent: 98.1 },
  { district: 'Jabalpur', totalDisbursed: 38.6, coveragePercent: 94.7 },
  { district: 'Gwalior', totalDisbursed: 34.1, coveragePercent: 92.5 },
  { district: 'Ujjain', totalDisbursed: 28.9, coveragePercent: 95.2 },
  { district: 'Sagar', totalDisbursed: 26.4, coveragePercent: 89.8 },
  { district: 'Rewa', totalDisbursed: 24.0, coveragePercent: 91.0 },
];

export const AdminDashboard: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState('2026-2027');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedScheme, setSelectedScheme] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  return (
    <div className="space-y-8">
      {/* Page Header with Action */}
      <PageHeader
        title="State Executive Command Center"
        description="Unified real-time monitoring of all school welfare schemes, direct benefit transfer releases, bicycle logistics, and district SLA compliance."
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="text-xs font-semibold"
          >
            <Download className="h-4 w-4 mr-1.5" />
            Print State Brief
          </Button>
        </div>
      </PageHeader>

      {/* Global Filter Bar */}
      <Card className="border-slate-200 bg-white shadow-xs p-3.5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-navy-950 uppercase tracking-wider shrink-0">
            <Filter className="h-4 w-4 text-navy-900" />
            <span>State Analytics Filters:</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 flex-1 max-w-4xl">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Academic Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2026-2027">AY 2026-2027 (Active)</SelectItem>
                <SelectItem value="2025-2026">AY 2025-2026</SelectItem>
                <SelectItem value="2024-2025">AY 2024-2025</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="District" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All 52 Districts</SelectItem>
                <SelectItem value="Bhopal">Bhopal</SelectItem>
                <SelectItem value="Indore">Indore</SelectItem>
                <SelectItem value="Jabalpur">Jabalpur</SelectItem>
                <SelectItem value="Gwalior">Gwalior</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedScheme} onValueChange={setSelectedScheme}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="All Schemes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Active Schemes</SelectItem>
                <SelectItem value="PMS">Post-Matric Scholarships</SelectItem>
                <SelectItem value="PRE_MAT">Pre-Matric Scholarships</SelectItem>
                <SelectItem value="CYCLE">Free Bicycle Scheme</SelectItem>
                <SelectItem value="MERIT">Merit Incentives</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Processing Stages</SelectItem>
                <SelectItem value="DISBURSED">Fully Disbursed</SelectItem>
                <SelectItem value="UNDER_REVIEW">Pending Reviews</SelectItem>
                <SelectItem value="FAILED">Flagged Exceptions</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedYear('2026-2027');
              setSelectedDistrict('ALL');
              setSelectedScheme('ALL');
              setSelectedStatus('ALL');
            }}
            className="text-xs h-9 shrink-0 text-slate-500 hover:text-navy-950"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            Reset
          </Button>
        </div>
      </Card>

      {/* 6 Large Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Registered Students"
          value="1,42,580"
          description="Aadhaar KYC verified"
          trend={{ value: '+14.2%', isPositive: true, label: 'vs last year' }}
          icon={Users}
          iconBg="bg-blue-50"
          iconColor="text-blue-700"
        />
        <StatCard
          title="Total Received Apps"
          value="98,450"
          description="Across 14 welfare schemes"
          trend={{ value: '+8.6%', isPositive: true }}
          icon={FileText}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-700"
        />
        <StatCard
          title="DBT Disbursed Outlay"
          value="₹48.50 Cr"
          description="NPCI direct credit"
          trend={{ value: '100% Zero Fee Leakage', isPositive: true }}
          icon={CreditCard}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-700"
        />
        <StatCard
          title="Bicycles Distributed"
          value="38,200"
          description="Delivered to girl students"
          trend={{ value: '98.8% Delivered', isPositive: true }}
          icon={Bike}
          iconBg="bg-saffron-50"
          iconColor="text-saffron-700"
        />
        <StatCard
          title="Affiliated Schools"
          value="4,820"
          description="Active institutional nodes"
          icon={Building2}
          iconBg="bg-purple-50"
          iconColor="text-purple-700"
        />
        <StatCard
          title="Avg Disbursal Velocity"
          value="5.8 Days"
          description="From submission to credit"
          trend={{ value: '-62% Delay', isPositive: true }}
          icon={Clock}
          iconBg="bg-teal-50"
          iconColor="text-teal-700"
        />
      </div>

      {/* Primary Visual Row: Scheme Volume & Approval Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scheme-wise Application Volume (BarChart) */}
        <Card className="lg:col-span-6 border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-navy-950">
              Scheme-Wise Application Volume
            </CardTitle>
            <CardDescription className="text-xs">
              Count of student applications processed per welfare stream.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SCHEME_APPLICATIONS_DATA} margin={{ top: 15, right: 10, left: -10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="scheme" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#1e293b" radius={[4, 4, 0, 0]} name="Applications" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cumulative Submissions vs Approvals (LineChart) */}
        <Card className="lg:col-span-6 border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-navy-950">
              Application & Approval Velocity Trends
            </CardTitle>
            <CardDescription className="text-xs">
              Weekly progress showing continuous clearance by school and district officers.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={APPROVAL_TRENDS_DATA} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="applications"
                  stroke="#f97316"
                  strokeWidth={2.5}
                  name="Applications Received"
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="approvals"
                  stroke="#0d9488"
                  strokeWidth={2.5}
                  name="Sanctions Approved"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Visual Row: Payment Distribution & Pending Backlog */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Payment Status Distribution (PieChart) */}
        <Card className="lg:col-span-5 border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-navy-950">
              Direct Benefit Transfer (DBT) Success Rate
            </CardTitle>
            <CardDescription className="text-xs">
              NPCI payment gateway response breakdown across all disbursements.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={PAYMENT_STATUS_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {PAYMENT_STATUS_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => `${val}%`}
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

        {/* Backlog Clearance Rate (AreaChart) */}
        <Card className="lg:col-span-7 border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-navy-950">
              Review Backlog Clearance by Administrative Tier
            </CardTitle>
            <CardDescription className="text-xs">
              Demonstrates rapid queue reduction at School vs District levels.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PENDING_BACKLOG_DATA} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey="schoolBacklog"
                  stroke="#f97316"
                  fill="#ffedd5"
                  strokeWidth={2}
                  name="School Verification Backlog"
                />
                <Area
                  type="monotone"
                  dataKey="districtBacklog"
                  stroke="#1e293b"
                  fill="#e2e8f0"
                  strokeWidth={2}
                  name="District Sanction Backlog"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* District Performance Table */}
      <Card className="border-slate-200 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold text-navy-950">
              State District Performance & Financial Outlay
            </CardTitle>
            <CardDescription className="text-xs">
              Disbursal volumes and entitlement coverage compliance across key district divisions.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-y text-navy-950 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5 pl-6">District Division</th>
                  <th className="p-3.5">Total Disbursed (₹ Cr)</th>
                  <th className="p-3.5">Eligible Student Coverage</th>
                  <th className="p-3.5">SLA Timeliness Score</th>
                  <th className="p-3.5 pr-6 text-right">Operational Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {DISTRICT_COVERAGE_DATA.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="p-3.5 pl-6 font-bold text-navy-950">{row.district}</td>
                    <td className="p-3.5 font-bold text-emerald-700">₹{row.totalDisbursed} Cr</td>
                    <td className="p-3.5 font-semibold text-slate-700">{row.coveragePercent}%</td>
                    <td className="p-3.5">
                      <div className="w-28 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-teal-600 rounded-full"
                          style={{ width: `${row.coveragePercent}%` }}
                        />
                      </div>
                    </td>
                    <td className="p-3.5 pr-6 text-right">
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Top Performer
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

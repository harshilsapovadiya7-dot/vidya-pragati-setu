import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { applicationsApi, Application } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import {
  Users,
  Clock,
  CheckCircle2,
  Bike,
  FileText,
  ArrowRight,
  ShieldAlert,
  FolderCheck,
} from 'lucide-react';

export const SchoolDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [pendingApps, setPendingApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchoolData = async () => {
      try {
        setLoading(true);
        const res = await applicationsApi.list({ status: 'UNDER_SCHOOL_REVIEW', limit: 5 });
        if (res && Array.isArray(res.applications)) {
          setPendingApps(res.applications);
        } else {
          setPendingApps([
            {
              id: 'app-s1',
              applicationNumber: 'VPS/2026/00912',
              studentId: 'stud-1',
              student: {
                id: 'stud-1',
                firstName: 'Aman',
                lastName: 'Dhakar',
                district: 'Bhopal',
                currentGrade: 'Grade 10',
                casteCategory: 'OBC',
              },
              schemeId: 'scheme-1',
              schemeTitle: 'Pre-Matric Scholarship Scheme for SC/ST/OBC',
              status: 'UNDER_SCHOOL_REVIEW',
              academicYear: '2026-2027',
              submittedAt: '2026-08-14T09:00:00Z',
              createdAt: '2026-08-14T09:00:00Z',
              updatedAt: '2026-08-14T09:00:00Z',
            },
            {
              id: 'app-s2',
              applicationNumber: 'VPS/2026/00918',
              studentId: 'stud-2',
              student: {
                id: 'stud-2',
                firstName: 'Sunita',
                lastName: 'Gond',
                district: 'Bhopal',
                currentGrade: 'Grade 9',
                casteCategory: 'ST',
              },
              schemeId: 'scheme-2',
              schemeTitle: 'Mukhyamantri Rural Girls Bicycle Scheme',
              status: 'UNDER_SCHOOL_REVIEW',
              academicYear: '2026-2027',
              submittedAt: '2026-08-16T11:20:00Z',
              createdAt: '2026-08-16T11:20:00Z',
              updatedAt: '2026-08-16T11:20:00Z',
            },
            {
              id: 'app-s3',
              applicationNumber: 'VPS/2026/00940',
              studentId: 'stud-3',
              student: {
                id: 'stud-3',
                firstName: 'Rohit',
                lastName: 'Malviya',
                district: 'Bhopal',
                currentGrade: 'Grade 10',
                casteCategory: 'SC',
              },
              schemeId: 'scheme-1',
              schemeTitle: 'Pre-Matric Scholarship Scheme for SC/ST/OBC',
              status: 'UNDER_SCHOOL_REVIEW',
              academicYear: '2026-2027',
              submittedAt: '2026-08-18T15:45:00Z',
              createdAt: '2026-08-18T15:45:00Z',
              updatedAt: '2026-08-18T15:45:00Z',
            },
          ]);
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    };

    fetchSchoolData();
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        title="School Nodal Portal — Govt Excellence HSS"
        description="Verify enrolled student scholarship submissions, cross-examine physical registers, and process bicycle distribution inventory."
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Enrolled Students"
          value="842"
          description="Grades 9 through 12"
          icon={Users}
          iconBg="bg-blue-50"
          iconColor="text-blue-700"
          onClick={() => navigate('/school/students')}
        />
        <StatCard
          title="Pending School Reviews"
          value={pendingApps.length}
          description="Requires attendance/marks validation"
          icon={Clock}
          iconBg="bg-amber-50"
          iconColor="text-amber-700"
          onClick={() => navigate('/school/applications')}
        />
        <StatCard
          title="Verified & Forwarded"
          value="184"
          description="Sent to District Education Officer"
          icon={CheckCircle2}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-700"
        />
        <StatCard
          title="Bicycles in School Depot"
          value="48"
          description="Ready for student handover"
          icon={Bike}
          iconBg="bg-saffron-50"
          iconColor="text-saffron-700"
          onClick={() => navigate('/school/assets')}
        />
      </div>

      {/* Pending Applications Review Queue */}
      <Card className="border-slate-200 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold text-navy-950">
              Pending Institutional Verification Queue
            </CardTitle>
            <CardDescription className="text-xs">
              Verify student academic attendance (&gt;75%) and mark authenticity before forwarding to DEO.
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/school/applications')}
            className="text-xs font-semibold text-navy-900"
          >
            <span>View Full Queue</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-3 pt-2">
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
                  {app.student?.firstName} {app.student?.lastName} ({app.student?.currentGrade} • Category: {app.student?.casteCategory})
                </h4>
                <p className="text-xs text-slate-500">
                  Scheme: <strong className="text-slate-700">{app.schemeTitle}</strong> • Submitted {formatDate(app.submittedAt)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => navigate(`/school/applications?id=${app.id}`)}
                  className="bg-navy-900 hover:bg-navy-800 text-white text-xs h-9 px-4 font-semibold"
                >
                  Review & Verify
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

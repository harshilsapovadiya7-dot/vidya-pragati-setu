import React, { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, Column } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';

interface DistrictSchoolItem {
  id: string;
  name: string;
  udiseCode: string;
  principal: string;
  totalStudents: number;
  totalApplications: number;
  verifiedCount: number;
  avgVerificationDays: number;
  complianceRate: number;
}

const DISTRICT_SCHOOLS: DistrictSchoolItem[] = [
  { id: 'sch-1', name: 'Govt Excellence HSS, Bhopal', udiseCode: '23340100101', principal: 'Dr. Sunita Devi', totalStudents: 842, totalApplications: 184, verifiedCount: 162, avgVerificationDays: 2.4, complianceRate: 98.2 },
  { id: 'sch-2', name: 'Model HSS Bairagarh', udiseCode: '23340100105', principal: 'Shri R.K. Saxena', totalStudents: 620, totalApplications: 142, verifiedCount: 120, avgVerificationDays: 3.1, complianceRate: 95.0 },
  { id: 'sch-3', name: 'Govt Girls HSS Jahangirabad', udiseCode: '23340100112', principal: 'Smt. Anjali Rao', totalStudents: 910, totalApplications: 198, verifiedCount: 180, avgVerificationDays: 1.8, complianceRate: 99.4 },
  { id: 'sch-4', name: 'Govt Subhash HSS, TT Nagar', udiseCode: '23340100120', principal: 'Shri Mohan Lal', totalStudents: 540, totalApplications: 110, verifiedCount: 95, avgVerificationDays: 4.2, complianceRate: 91.5 },
  { id: 'sch-5', name: 'Govt HSS Kolar Road', udiseCode: '23340100134', principal: 'Smt. Preeti Joshi', totalStudents: 430, totalApplications: 86, verifiedCount: 72, avgVerificationDays: 3.8, complianceRate: 93.0 },
  { id: 'sch-6', name: 'Govt HSS Berasia Rural', udiseCode: '23340100145', principal: 'Shri Dinesh Pathak', totalStudents: 780, totalApplications: 215, verifiedCount: 190, avgVerificationDays: 2.9, complianceRate: 96.8 },
];

export const DistrictSchools: React.FC = () => {
  const columns: Column<DistrictSchoolItem>[] = [
    {
      header: 'School Name & Code',
      accessorKey: 'name',
      sortable: true,
      cell: (s) => (
        <div>
          <p className="font-bold text-navy-950 text-xs sm:text-sm">{s.name}</p>
          <span className="text-[11px] font-mono text-slate-400">UDISE: {s.udiseCode}</span>
        </div>
      ),
    },
    {
      header: 'Nodal Principal',
      accessorKey: 'principal',
      sortable: true,
      cell: (s) => <span className="text-xs font-semibold text-slate-700">{s.principal}</span>,
    },
    {
      header: 'Enrolled Pupils',
      accessorKey: 'totalStudents',
      sortable: true,
      cell: (s) => <span className="text-xs font-bold text-navy-900">{s.totalStudents}</span>,
    },
    {
      header: 'Applications Forwarded',
      accessorKey: 'totalApplications',
      sortable: true,
      cell: (s) => (
        <div>
          <span className="text-xs font-bold text-slate-800">{s.totalApplications} Applied</span>
          <span className="text-[10px] text-emerald-600 block">({s.verifiedCount} Approved)</span>
        </div>
      ),
    },
    {
      header: 'Avg Turnaround',
      accessorKey: 'avgVerificationDays',
      sortable: true,
      cell: (s) => (
        <span className="text-xs font-semibold text-slate-700">
          {s.avgVerificationDays} Days
        </span>
      ),
    },
    {
      header: 'Compliance Rate',
      accessorKey: 'complianceRate',
      sortable: true,
      cell: (s) => (
        <Badge
          variant="outline"
          className={`text-xs font-bold ${
            s.complianceRate >= 95
              ? 'border-emerald-300 text-emerald-800 bg-emerald-50'
              : 'border-amber-300 text-amber-800 bg-amber-50'
          }`}
        >
          {s.complianceRate}%
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="District Schools & Performance Tracking"
        description="Monitor verification speed, pending backlogs, and scheme delivery compliance across all secondary institutions in Bhopal."
      />

      <DataTable
        columns={columns}
        data={DISTRICT_SCHOOLS}
        searchKey="name"
        searchPlaceholder="Search school by name or UDISE code..."
      />
    </div>
  );
};

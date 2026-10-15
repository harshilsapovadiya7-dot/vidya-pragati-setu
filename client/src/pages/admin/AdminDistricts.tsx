import React, { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, Column } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Landmark, TrendingUp, Building2, Download } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface DistrictItem {
  id: string;
  name: string;
  officerName: string;
  contactEmail: string;
  totalSchools: number;
  allocatedBudget: number;
  disbursedAmount: number;
  performanceScore: number;
}

const DISTRICT_LIST: DistrictItem[] = [
  { id: 'd-1', name: 'Bhopal', officerName: 'Amit Patel', contactEmail: 'deo-bhopal@mp.gov.in', totalSchools: 148, allocatedBudget: 45000000, disbursedAmount: 42800000, performanceScore: 96.4 },
  { id: 'd-2', name: 'Indore', officerName: 'Pooja Tiwari', contactEmail: 'deo-indore@mp.gov.in', totalSchools: 192, allocatedBudget: 60000000, disbursedAmount: 58200000, performanceScore: 98.1 },
  { id: 'd-3', name: 'Jabalpur', officerName: 'Sanjay Shrivastava', contactEmail: 'deo-jabalpur@mp.gov.in', totalSchools: 135, allocatedBudget: 40000000, disbursedAmount: 38600000, performanceScore: 94.7 },
  { id: 'd-4', name: 'Gwalior', officerName: 'Meenakshi Tomar', contactEmail: 'deo-gwalior@mp.gov.in', totalSchools: 120, allocatedBudget: 36000000, disbursedAmount: 34100000, performanceScore: 92.5 },
  { id: 'd-5', name: 'Ujjain', officerName: 'Kamal Sharma', contactEmail: 'deo-ujjain@mp.gov.in', totalSchools: 104, allocatedBudget: 30000000, disbursedAmount: 28900000, performanceScore: 95.2 },
  { id: 'd-6', name: 'Sagar', officerName: 'Rameshwar Dangi', contactEmail: 'deo-sagar@mp.gov.in', totalSchools: 98, allocatedBudget: 28000000, disbursedAmount: 26400000, performanceScore: 89.8 },
  { id: 'd-7', name: 'Rewa', officerName: 'Sudhir Shukla', contactEmail: 'deo-rewa@mp.gov.in', totalSchools: 110, allocatedBudget: 26000000, disbursedAmount: 24000000, performanceScore: 91.0 },
];

export const AdminDistricts: React.FC = () => {
  const columns: Column<DistrictItem>[] = [
    {
      header: 'District Division',
      accessorKey: 'name',
      sortable: true,
      cell: (d) => (
        <div>
          <p className="font-bold text-navy-950 text-sm">{d.name}</p>
          <span className="text-[11px] text-muted-foreground">{d.contactEmail}</span>
        </div>
      ),
    },
    {
      header: 'DEO Officer',
      accessorKey: 'officerName',
      sortable: true,
      cell: (d) => <span className="text-xs font-semibold text-slate-700">{d.officerName}</span>,
    },
    {
      header: 'Schools',
      accessorKey: 'totalSchools',
      sortable: true,
      cell: (d) => <span className="text-xs font-bold text-navy-900">{d.totalSchools}</span>,
    },
    {
      header: 'Allocated Budget',
      accessorKey: 'allocatedBudget',
      sortable: true,
      cell: (d) => <span className="text-xs text-slate-600 font-mono">{formatCurrency(d.allocatedBudget)}</span>,
    },
    {
      header: 'Disbursed (DBT)',
      accessorKey: 'disbursedAmount',
      sortable: true,
      cell: (d) => (
        <span className="text-xs font-bold text-emerald-700 font-mono">
          {formatCurrency(d.disbursedAmount)}
        </span>
      ),
    },
    {
      header: 'Efficiency Rating',
      accessorKey: 'performanceScore',
      sortable: true,
      cell: (d) => (
        <Badge
          variant="outline"
          className={`text-xs font-bold ${
            d.performanceScore >= 95
              ? 'border-emerald-300 text-emerald-800 bg-emerald-50'
              : 'border-blue-300 text-blue-800 bg-blue-50'
          }`}
        >
          {d.performanceScore}%
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Districts & Geographic Coverage"
        description="Oversee budget utilization, allocation ceilings, and sanction timelines across all 52 educational administrative districts in Madhya Pradesh."
      />

      <DataTable
        columns={columns}
        data={DISTRICT_LIST}
        searchKey="name"
        searchPlaceholder="Search district or officer name..."
      />
    </div>
  );
};

import React, { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, Column } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, UserCheck, ShieldCheck } from 'lucide-react';

interface SchoolStudentItem {
  id: string;
  name: string;
  samagraId: string;
  grade: string;
  casteCategory: string;
  attendancePercent: number;
  isBpl: boolean;
  applicationsCount: number;
}

const DEMO_STUDENTS: SchoolStudentItem[] = [
  { id: 'st-1', name: 'Priya Sharma', samagraId: '10928374', grade: 'Grade 10', casteCategory: 'OBC', attendancePercent: 88.5, isBpl: true, applicationsCount: 2 },
  { id: 'st-2', name: 'Aman Dhakar', samagraId: '10928411', grade: 'Grade 10', casteCategory: 'OBC', attendancePercent: 91.0, isBpl: false, applicationsCount: 1 },
  { id: 'st-3', name: 'Sunita Gond', samagraId: '10928509', grade: 'Grade 9', casteCategory: 'ST', attendancePercent: 79.2, isBpl: true, applicationsCount: 2 },
  { id: 'st-4', name: 'Rohit Malviya', samagraId: '10928588', grade: 'Grade 10', casteCategory: 'SC', attendancePercent: 84.0, isBpl: true, applicationsCount: 1 },
  { id: 'st-5', name: 'Deepak Patidar', samagraId: '10928620', grade: 'Grade 11', casteCategory: 'GENERAL', attendancePercent: 93.4, isBpl: false, applicationsCount: 0 },
  { id: 'st-6', name: 'Kavita Ahirwar', samagraId: '10928731', grade: 'Grade 9', casteCategory: 'SC', attendancePercent: 82.1, isBpl: true, applicationsCount: 2 },
  { id: 'st-7', name: 'Vikas Meena', samagraId: '10928812', grade: 'Grade 12', casteCategory: 'ST', attendancePercent: 76.5, isBpl: false, applicationsCount: 1 },
];

export const SchoolStudents: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState<SchoolStudentItem | null>(null);

  const columns: Column<SchoolStudentItem>[] = [
    {
      header: 'Student Name',
      accessorKey: 'name',
      sortable: true,
      cell: (st) => (
        <div>
          <p className="font-bold text-navy-950 text-xs sm:text-sm">{st.name}</p>
          <span className="text-[11px] font-mono text-slate-400">Samagra: {st.samagraId}</span>
        </div>
      ),
    },
    {
      header: 'Class / Grade',
      accessorKey: 'grade',
      sortable: true,
      cell: (st) => <span className="text-xs font-semibold text-slate-700">{st.grade}</span>,
    },
    {
      header: 'Category',
      accessorKey: 'casteCategory',
      sortable: true,
      cell: (st) => (
        <Badge variant="outline" className="text-xs">
          {st.casteCategory}
        </Badge>
      ),
    },
    {
      header: 'Attendance',
      accessorKey: 'attendancePercent',
      sortable: true,
      cell: (st) => (
        <span
          className={`text-xs font-bold ${
            st.attendancePercent >= 75 ? 'text-emerald-700' : 'text-rose-600'
          }`}
        >
          {st.attendancePercent}%
        </span>
      ),
    },
    {
      header: 'BPL Status',
      accessorKey: 'isBpl',
      cell: (st) => (
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
            st.isBpl ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {st.isBpl ? 'BPL Card Holder' : 'Non-BPL'}
        </span>
      ),
    },
    {
      header: 'Applications',
      accessorKey: 'applicationsCount',
      cell: (st) => (
        <span className="text-xs font-bold text-navy-900">
          {st.applicationsCount} Active
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (st) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedStudent(st)}
          className="h-8 px-2.5 text-xs text-navy-900"
        >
          <Eye className="h-3.5 w-3.5 mr-1" />
          Profile
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enrolled Student Registry"
        description="Search, view, and inspect student attendance records and scheme entitlement histories."
      />

      <DataTable
        columns={columns}
        data={DEMO_STUDENTS}
        searchKey="name"
        searchPlaceholder="Search student by name or Samagra ID..."
      />

      {/* Student Quick Detail Dialog */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedStudent?.name}</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-3 text-xs pt-2">
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-slate-500">Samagra ID:</span>
                <strong className="font-mono text-navy-950">{selectedStudent.samagraId}</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-slate-500">Current Grade:</span>
                <strong className="text-navy-950">{selectedStudent.grade}</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-slate-500">Caste Category:</span>
                <strong className="text-navy-950">{selectedStudent.casteCategory}</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-slate-500">Official Attendance:</span>
                <strong className="text-emerald-700">{selectedStudent.attendancePercent}% (Compliant)</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-slate-500">Active Applications:</span>
                <strong className="text-navy-950">{selectedStudent.applicationsCount} Submitted</strong>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

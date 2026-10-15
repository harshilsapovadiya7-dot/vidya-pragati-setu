import React, { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { reportsApi } from '@/lib/api';
import { Download, FileSpreadsheet, Calendar, Filter } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

const MONTHLY_DISBURSEMENT = [
  { month: 'Apr', amount: 18.5 },
  { month: 'May', amount: 22.0 },
  { month: 'Jun', amount: 45.2 },
  { month: 'Jul', amount: 89.0 },
  { month: 'Aug', amount: 142.8 },
  { month: 'Sep', amount: 110.4 },
];

const CATEGORY_DISBURSEMENT = [
  { category: 'SC Pre-Matric', count: 480, amount: '₹28.8 L' },
  { category: 'ST Pre-Matric', count: 320, amount: '₹19.2 L' },
  { category: 'OBC Pre-Matric', count: 640, amount: '₹32.0 L' },
  { category: 'Post-Matric (11-12)', count: 310, amount: '₹57.3 L' },
  { category: 'Merit Pratibha Kiran', count: 85, amount: '₹21.2 L' },
];

export const DistrictReports: React.FC = () => {
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);

  const handleExportCsv = async (type: string) => {
    try {
      setDownloading(true);
      await reportsApi.exportCsv(type);
      toast({
        title: 'Report Download Started',
        description: `Exporting ${type} report as CSV format.`,
        variant: 'success',
      });
    } catch {
      // In demo mode simulate download
      const csvContent =
        'data:text/csv;charset=utf-8,Category,BeneficiaryCount,AmountDisbursed\nSC Pre-Matric,480,2880000\nST Pre-Matric,320,1920000\nOBC Pre-Matric,640,3200000\nPost-Matric,310,5735000\nMerit Pratibha,85,2125000\n';
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `bhopal_district_${type}_report_2026.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Report Exported Successfully',
        description: `Downloaded ${type} CSV.`,
        variant: 'success',
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="District Performance & Financial Reports"
        description="Comprehensive audit-grade financial disbursal statements, application turnaround times, and block data exports."
      >
        <Button
          onClick={() => handleExportCsv('district_disbursements')}
          disabled={downloading}
          className="bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs flex items-center gap-1.5"
        >
          <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
          <span>Export All Data (CSV)</span>
        </Button>
      </PageHeader>

      {/* Financial Disbursals Trend AreaChart */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base font-bold text-navy-950">
            Monthly DBT Fund Disbursals (₹ Lakhs)
          </CardTitle>
          <CardDescription className="text-xs">
            Direct account transfers executed via State Treasury NPCI gateway in Bhopal District.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MONTHLY_DISBURSEMENT} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} unit="L" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#0d9488"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorAmount)"
                name="Disbursed (₹ Lakhs)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Breakdown Table */}
      <Card className="border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold text-navy-950">
              Scheme Category Disbursals (Academic Year 2026-27)
            </CardTitle>
            <CardDescription className="text-xs">
              Aggregate student count and financial outlay across active schemes.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExportCsv('category_summary')}
            className="text-xs flex items-center gap-1"
          >
            <Download className="h-3.5 w-3.5" />
            <span>CSV</span>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-y text-navy-950 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5 pl-6">Scheme Welfare Stream</th>
                  <th className="p-3.5">Sanctioned Beneficiaries</th>
                  <th className="p-3.5">Total Direct Disbursal</th>
                  <th className="p-3.5 pr-6 text-right">Audit Certification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {CATEGORY_DISBURSEMENT.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="p-3.5 pl-6 font-bold text-navy-950">{row.category}</td>
                    <td className="p-3.5 text-slate-700 font-semibold">{row.count} Students</td>
                    <td className="p-3.5 text-emerald-700 font-bold">{row.amount}</td>
                    <td className="p-3.5 pr-6 text-right">
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Audited 100%
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

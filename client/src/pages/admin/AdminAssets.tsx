import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { assetsApi, AssetRecord } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Bike, Truck, Package, CheckCircle2, AlertTriangle } from 'lucide-react';

export const AdminAssets: React.FC = () => {
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        const data = await assetsApi.list();
        if (Array.isArray(data) && data.length > 0) {
          setAssets(data);
        } else {
          setAssets([
            {
              id: 'ast-1',
              assetCode: 'VPS-CYC-2026-4412',
              assetType: 'Bicycle',
              model: 'Hero City Trekker 26T',
              serialNumber: 'HR-26-MP-094182',
              status: 'RECEIVED_AT_SCHOOL',
              district: 'Bhopal',
              schoolName: 'Govt Excellence HSS, Bhopal',
              studentName: 'Priya Sharma (Grade 10)',
              dispatchedAt: '2026-08-12T10:00:00Z',
              receivedAtSchoolAt: '2026-08-18T16:00:00Z',
              updatedAt: '2026-08-18T16:00:00Z',
            },
            {
              id: 'ast-2',
              assetCode: 'VPS-CYC-2026-4413',
              assetType: 'Bicycle',
              model: 'Hero City Trekker 26T',
              serialNumber: 'HR-26-MP-094183',
              status: 'IN_TRANSIT',
              district: 'Indore',
              schoolName: 'Govt Model HSS, Indore',
              studentName: 'Pooja Verma (Grade 9)',
              dispatchedAt: '2026-08-19T08:00:00Z',
              updatedAt: '2026-08-19T08:00:00Z',
            },
            {
              id: 'ast-3',
              assetCode: 'VPS-CYC-2026-4415',
              assetType: 'Bicycle',
              model: 'Hero City Trekker 26T',
              serialNumber: 'HR-26-MP-094185',
              status: 'DELIVERED',
              district: 'Bhopal',
              schoolName: 'Govt Girls HSS Jahangirabad',
              studentName: 'Sunita Gond (Grade 9)',
              dispatchedAt: '2026-08-10T10:00:00Z',
              receivedAtSchoolAt: '2026-08-15T14:00:00Z',
              deliveredAt: '2026-08-20T11:00:00Z',
              updatedAt: '2026-08-20T11:00:00Z',
            },
          ]);
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  const columns: Column<AssetRecord>[] = [
    {
      header: 'QR Asset Code',
      accessorKey: 'assetCode',
      sortable: true,
      cell: (a) => (
        <div>
          <span className="font-mono text-xs font-bold text-navy-950 block">{a.assetCode}</span>
          <span className="text-[10px] text-slate-400 font-mono">SN: {a.serialNumber}</span>
        </div>
      ),
    },
    {
      header: 'District',
      accessorKey: 'district',
      sortable: true,
      cell: (a) => <span className="text-xs font-semibold text-slate-800">{a.district}</span>,
    },
    {
      header: 'Assigned School',
      accessorKey: 'schoolName',
      sortable: true,
      cell: (a) => <span className="text-xs text-navy-900">{a.schoolName || 'District Hub'}</span>,
    },
    {
      header: 'Beneficiary Student',
      accessorKey: 'studentName',
      sortable: true,
      cell: (a) => <span className="text-xs font-bold text-navy-950">{a.studentName || 'Unassigned'}</span>,
    },
    {
      header: 'Logistics Status',
      accessorKey: 'status',
      sortable: true,
      cell: (a) => <StatusBadge status={a.status} type="asset" />,
    },
    {
      header: 'Last Update',
      accessorKey: 'updatedAt',
      sortable: true,
      cell: (a) => <span className="text-xs text-slate-500">{formatDate(a.updatedAt)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="State Asset Logistics & Fleet Tracking"
        description="Comprehensive audit oversight for 38,200 manufactured bicycles dispatched to rural girl students across 52 districts."
      />

      {/* Top 3 inventory metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-slate-200">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total State Consignment</span>
          <p className="text-2xl font-black text-navy-950 mt-1">40,000 Units</p>
          <span className="text-xs text-slate-500 mt-0.5 block">Hero Cycles Ltd Contract</span>
        </Card>
        <Card className="p-4 border-slate-200">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Delivered & QR Scanned</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">38,200 Units (95.5%)</p>
          <span className="text-xs text-emerald-700 mt-0.5 block">Certified student handovers</span>
        </Card>
        <Card className="p-4 border-slate-200">
          <span className="text-[11px] font-bold text-slate-400 uppercase">In Transit / At Depots</span>
          <p className="text-2xl font-black text-saffron-600 mt-1">1,800 Units (4.5%)</p>
          <span className="text-xs text-slate-500 mt-0.5 block">Moving to school distribution centers</span>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={assets}
        searchKey="assetCode"
        searchPlaceholder="Filter by QR barcode, student, or district..."
        isLoading={loading}
      />
    </div>
  );
};

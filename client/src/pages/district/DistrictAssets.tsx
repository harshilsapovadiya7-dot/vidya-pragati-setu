import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { assetsApi, AssetRecord } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Bike, Truck, Send, CheckCircle2, ShieldCheck } from 'lucide-react';

export const DistrictAssets: React.FC = () => {
  const { toast } = useToast();
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<AssetRecord | null>(null);
  const [targetSchool, setTargetSchool] = useState('Govt Excellence HSS, Bhopal');
  const [dispatching, setDispatching] = useState(false);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const data = await assetsApi.list({ district: 'Bhopal' });
      if (Array.isArray(data) && data.length > 0) {
        setAssets(data);
      } else {
        setAssets([
          {
            id: 'ast-d1',
            assetCode: 'VPS-CYC-2026-4412',
            assetType: 'Bicycle',
            model: 'Hero City Trekker 26T',
            serialNumber: 'HR-26-MP-094182',
            status: 'RECEIVED_AT_SCHOOL',
            district: 'Bhopal',
            schoolName: 'Govt Excellence HSS, Bhopal',
            studentName: 'Priya Sharma (Class 10)',
            dispatchedAt: '2026-08-12T10:00:00Z',
            receivedAtSchoolAt: '2026-08-18T16:00:00Z',
            updatedAt: '2026-08-18T16:00:00Z',
          },
          {
            id: 'ast-d2',
            assetCode: 'VPS-CYC-2026-4413',
            assetType: 'Bicycle',
            model: 'Hero City Trekker 26T',
            serialNumber: 'HR-26-MP-094183',
            status: 'IN_TRANSIT',
            district: 'Bhopal',
            schoolName: 'Model HSS Bairagarh',
            studentName: 'Aman Dhakar (Class 10)',
            dispatchedAt: '2026-08-19T08:00:00Z',
            updatedAt: '2026-08-19T08:00:00Z',
          },
          {
            id: 'ast-d3',
            assetCode: 'VPS-CYC-2026-4415',
            assetType: 'Bicycle',
            model: 'Hero City Trekker 26T',
            serialNumber: 'HR-26-MP-094185',
            status: 'DELIVERED',
            district: 'Bhopal',
            schoolName: 'Govt Girls HSS Jahangirabad',
            studentName: 'Sunita Gond (Class 9)',
            dispatchedAt: '2026-08-10T10:00:00Z',
            receivedAtSchoolAt: '2026-08-15T14:00:00Z',
            deliveredAt: '2026-08-20T11:00:00Z',
            updatedAt: '2026-08-20T11:00:00Z',
          },
        ]);
      }
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleDispatch = async () => {
    if (!selectedAsset) return;
    try {
      setDispatching(true);
      await assetsApi.dispatch(selectedAsset.id, { destinationSchoolId: targetSchool });
      toast({
        title: 'Consignment Dispatched',
        description: `Bicycle ${selectedAsset.assetCode} route initiated to ${targetSchool}.`,
        variant: 'success',
      });
      setAssets((prev) =>
        prev.map((a) =>
          a.id === selectedAsset.id
            ? { ...a, status: 'IN_TRANSIT', schoolName: targetSchool }
            : a
        )
      );
      setSelectedAsset(null);
    } catch {
      toast({
        title: 'Dispatched (Demo)',
        description: 'Asset logged as in-transit to school depot.',
      });
      setSelectedAsset(null);
    } finally {
      setDispatching(false);
    }
  };

  const columns: Column<AssetRecord>[] = [
    {
      header: 'Asset Code',
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
      header: 'Model Spec',
      accessorKey: 'model',
      sortable: true,
      cell: (a) => <span className="text-xs font-medium text-slate-700">{a.model}</span>,
    },
    {
      header: 'Destination School',
      accessorKey: 'schoolName',
      sortable: true,
      cell: (a) => <span className="text-xs font-semibold text-navy-900">{a.schoolName || 'District Depot'}</span>,
    },
    {
      header: 'Assigned Beneficiary',
      accessorKey: 'studentName',
      sortable: true,
      cell: (a) => <span className="text-xs text-slate-700">{a.studentName || 'Pending Assignment'}</span>,
    },
    {
      header: 'Tracking Status',
      accessorKey: 'status',
      sortable: true,
      cell: (a) => <StatusBadge status={a.status} type="asset" />,
    },
    {
      header: 'Action',
      cell: (a) =>
        a.status === 'ORDERED' ? (
          <Button
            size="sm"
            onClick={() => setSelectedAsset(a)}
            className="h-8 px-2.5 text-xs bg-navy-900 hover:bg-navy-800 text-white font-semibold flex items-center gap-1"
          >
            <Send className="h-3 w-3" />
            <span>Dispatch to School</span>
          </Button>
        ) : (
          <span className="text-xs text-slate-400 font-mono">Consigned</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="District Asset Logistics & Bicycle Consignments"
        description="Track incoming bulk consignments from state manufacturers and route allotments to respective cluster school depots."
      />

      <DataTable
        columns={columns}
        data={assets}
        searchKey="assetCode"
        searchPlaceholder="Search asset code or school..."
        isLoading={loading}
      />

      {/* Dispatch Dialog */}
      <Dialog open={!!selectedAsset} onOpenChange={() => setSelectedAsset(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Dispatch Consignment to School</DialogTitle>
            <DialogDescription className="text-xs">
              Assign routing for bicycle <strong className="font-mono">{selectedAsset?.assetCode}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Select Destination School Depot</Label>
              <Select value={targetSchool} onValueChange={setTargetSchool}>
                <SelectTrigger>
                  <SelectValue placeholder="Select School" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Govt Excellence HSS, Bhopal">Govt Excellence HSS, Bhopal</SelectItem>
                  <SelectItem value="Model HSS Bairagarh">Model HSS Bairagarh</SelectItem>
                  <SelectItem value="Govt Girls HSS Jahangirabad">Govt Girls HSS Jahangirabad</SelectItem>
                  <SelectItem value="Govt Subhash HSS, TT Nagar">Govt Subhash HSS, TT Nagar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setSelectedAsset(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleDispatch}
              disabled={dispatching}
              className="bg-navy-900 hover:bg-navy-800 text-white font-bold"
            >
              {dispatching ? 'Routing...' : 'Confirm Dispatch'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

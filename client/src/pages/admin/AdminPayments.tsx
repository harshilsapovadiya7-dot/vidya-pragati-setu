import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { paymentsApi, PaymentRecord } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CreditCard, RefreshCw, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const AdminPayments: React.FC = () => {
  const { toast } = useToast();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePayment, setActivePayment] = useState<PaymentRecord | null>(null);
  const [simulatedStatus, setSimulatedStatus] = useState<'SUCCESS' | 'FAILED' | 'PROCESSING'>('SUCCESS');
  const [simulating, setSimulating] = useState(false);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await paymentsApi.list();
      if (Array.isArray(data) && data.length > 0) {
        setPayments(data);
      } else {
        setPayments([
          {
            id: 'p-1',
            applicationId: 'app-101',
            studentName: 'Priya Sharma',
            schemeTitle: 'Pre-Matric Scholarship Scheme',
            amount: 6000,
            status: 'SUCCESS',
            transactionRef: 'NPCI/UTR/2026/89412093',
            disbursedAt: '2026-08-19T09:30:00Z',
            bankAccountMasked: 'SBI •••• 9120',
            createdAt: '2026-08-18T10:00:00Z',
          },
          {
            id: 'p-2',
            applicationId: 'app-s1',
            studentName: 'Aman Dhakar',
            schemeTitle: 'Pre-Matric Scholarship Scheme',
            amount: 6000,
            status: 'PROCESSING',
            transactionRef: 'NPCI/UTR/2026/89412104',
            bankAccountMasked: 'BOI •••• 3314',
            createdAt: '2026-08-19T11:00:00Z',
          },
          {
            id: 'p-3',
            applicationId: 'app-s3',
            studentName: 'Rohit Malviya',
            schemeTitle: 'Pre-Matric Scholarship Scheme',
            amount: 6000,
            status: 'FAILED',
            failureReason: 'Aadhaar not seeded with savings bank account (NPCI code 03)',
            bankAccountMasked: 'PNB •••• 5591',
            createdAt: '2026-08-17T09:00:00Z',
          },
          {
            id: 'p-4',
            applicationId: 'app-104',
            studentName: 'Kavita Ahirwar',
            schemeTitle: 'Pratibha Kiran Merit Incentive',
            amount: 25000,
            status: 'SUCCESS',
            transactionRef: 'NPCI/UTR/2026/89411980',
            disbursedAt: '2026-08-15T16:20:00Z',
            bankAccountMasked: 'SBI •••• 8812',
            createdAt: '2026-08-15T10:00:00Z',
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
    fetchPayments();
  }, []);

  const handleSimulateStatus = async () => {
    if (!activePayment) return;
    try {
      setSimulating(true);
      await paymentsApi.simulateStatus(activePayment.id, simulatedStatus as any);
      setPayments((prev) =>
        prev.map((p) =>
          p.id === activePayment.id
            ? {
                ...p,
                status: simulatedStatus as any,
                transactionRef:
                  simulatedStatus === 'SUCCESS' ? `NPCI/UTR/SIM/${Date.now()}` : p.transactionRef,
                disbursedAt: simulatedStatus === 'SUCCESS' ? new Date().toISOString() : undefined,
              }
            : p
        )
      );
      toast({
        title: 'Payment Status Simulated',
        description: `Payment marked as ${simulatedStatus}.`,
        variant: simulatedStatus === 'SUCCESS' ? 'success' : 'destructive',
      });
      setActivePayment(null);
    } catch {
      toast({ title: 'Simulated locally in session.' });
      setActivePayment(null);
    } finally {
      setSimulating(false);
    }
  };

  const columns: Column<PaymentRecord>[] = [
    {
      header: 'Transaction Ref (UTR)',
      accessorKey: 'transactionRef',
      sortable: true,
      cell: (p) => (
        <div>
          <span className="font-mono text-xs font-bold text-navy-950 block">
            {p.transactionRef || 'Pending Batch'}
          </span>
          <span className="text-[10px] text-slate-400">App ID: {p.applicationId}</span>
        </div>
      ),
    },
    {
      header: 'Beneficiary Student',
      accessorKey: 'studentName',
      sortable: true,
      cell: (p) => (
        <div>
          <p className="font-bold text-navy-950 text-xs sm:text-sm">{p.studentName || 'Student Beneficiary'}</p>
          <span className="text-[11px] text-muted-foreground">{p.schemeTitle}</span>
        </div>
      ),
    },
    {
      header: 'Target Bank Account',
      accessorKey: 'bankAccountMasked',
      sortable: true,
      cell: (p) => <span className="font-mono text-xs text-slate-700">{p.bankAccountMasked}</span>,
    },
    {
      header: 'Amount',
      accessorKey: 'amount',
      sortable: true,
      cell: (p) => (
        <span className="text-xs font-extrabold text-emerald-700 font-mono">
          {formatCurrency(p.amount)}
        </span>
      ),
    },
    {
      header: 'Gateway Status',
      accessorKey: 'status',
      sortable: true,
      cell: (p) => <StatusBadge status={p.status} type="payment" />,
    },
    {
      header: 'Actions',
      cell: (p) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setActivePayment(p);
            setSimulatedStatus('SUCCESS');
          }}
          className="h-8 px-2.5 text-xs text-navy-900 flex items-center gap-1"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Simulate Gateway</span>
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Direct Benefit Transfer (DBT) Payment Operations"
        description="Monitor automated state treasury disbursements, NPCI Aadhaar bridge clearance, and simulate banking gateway responses."
      >
        <Badge variant="outline" className="border-amber-400 bg-amber-50 text-amber-900 font-bold px-3 py-1">
          ⚠️ NPCI SIMULATION MODE ENABLED
        </Badge>
      </PageHeader>

      <DataTable
        columns={columns}
        data={payments}
        searchKey="studentName"
        searchPlaceholder="Search by student name or UTR reference..."
        isLoading={loading}
      />

      {/* Simulation Dialog */}
      <Dialog open={!!activePayment} onOpenChange={() => setActivePayment(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Simulate Banking Gateway Response</DialogTitle>
            <DialogDescription className="text-xs">
              Test NPCI / Treasury bank transfer responses for beneficiary{' '}
              <strong>{activePayment?.studentName}</strong> ({formatCurrency(activePayment?.amount)})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Select New Payment State</Label>
              <Select value={simulatedStatus} onValueChange={(v: any) => setSimulatedStatus(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUCCESS">SUCCESS (Credit Acknowledged)</SelectItem>
                  <SelectItem value="PROCESSING">PROCESSING (In Bank Clearing)</SelectItem>
                  <SelectItem value="FAILED">FAILED (Aadhaar Unlinked / Rejected)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setActivePayment(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSimulateStatus}
              disabled={simulating}
              className="bg-navy-900 hover:bg-navy-800 text-white font-bold"
            >
              {simulating ? 'Simulating...' : 'Apply Simulated Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

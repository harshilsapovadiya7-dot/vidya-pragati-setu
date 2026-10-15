import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ProgressStepper, StepItem } from '@/components/shared/ProgressStepper';
import { paymentsApi, assetsApi, PaymentRecord, AssetRecord } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CreditCard, Bike, QrCode, CheckCircle2, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';

export const BenefitsTracking: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [payRes, astRes] = await Promise.allSettled([
          paymentsApi.list(),
          assetsApi.list(),
        ]);

        if (payRes.status === 'fulfilled' && Array.isArray(payRes.value)) {
          setPayments(payRes.value);
        } else {
          setPayments([
            {
              id: 'p-101',
              applicationId: 'app-101',
              schemeTitle: 'Pre-Matric Scholarship Scheme',
              amount: 6000,
              status: 'SUCCESS',
              transactionRef: 'NPCI/UTR/2026/89412093',
              disbursedAt: '2026-08-19T09:30:00Z',
              bankAccountMasked: 'State Bank of India •••• 9120',
              createdAt: '2026-08-18T10:00:00Z',
            },
            {
              id: 'p-102',
              applicationId: 'app-103',
              schemeTitle: 'Uniform & Stationery Allowance',
              amount: 1800,
              status: 'SUCCESS',
              transactionRef: 'NPCI/UTR/2025/11209341',
              disbursedAt: '2025-07-28T14:15:00Z',
              bankAccountMasked: 'State Bank of India •••• 9120',
              createdAt: '2025-07-25T11:00:00Z',
            },
          ]);
        }

        if (astRes.status === 'fulfilled' && Array.isArray(astRes.value)) {
          setAssets(astRes.value);
        } else {
          setAssets([
            {
              id: 'ast-bicycle-1',
              assetCode: 'VPS-CYC-2026-4412',
              assetType: 'Bicycle',
              model: 'Hero City Trekker 26T (Dual Carrier)',
              serialNumber: 'HR-26-MP-094182',
              status: 'RECEIVED_AT_SCHOOL',
              district: 'Bhopal',
              schoolName: 'Govt Excellence HSS, Bhopal',
              dispatchedAt: '2026-08-12T10:00:00Z',
              receivedAtSchoolAt: '2026-08-18T16:00:00Z',
              updatedAt: '2026-08-18T16:00:00Z',
            },
          ]);
        }
      } catch {
        // Handled
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getBicycleSteps = (asset: AssetRecord): StepItem[] => {
    return [
      {
        id: 1,
        title: 'Factory Dispatch',
        description: 'Quality tested & QR tagged',
        status: 'completed',
        date: formatDate(asset.dispatchedAt),
      },
      {
        id: 2,
        title: 'In Transit',
        description: 'District Logistics Node',
        status: 'completed',
      },
      {
        id: 3,
        title: 'At School Depot',
        description: asset.schoolName || 'Enrolled School',
        status: asset.status === 'RECEIVED_AT_SCHOOL' || asset.status === 'ASSIGNED' ? 'current' : 'completed',
        date: formatDate(asset.receivedAtSchoolAt),
      },
      {
        id: 4,
        title: 'Student Handover',
        description: 'Scan QR at School',
        status: asset.status === 'DELIVERED' ? 'completed' : 'upcoming',
        date: formatDate(asset.deliveredAt),
      },
    ];
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Benefits & Entitlements Tracking"
        description="Complete transparency into monetary bank disbursements (DBT) and physical assets (bicycles) allocated to you."
      />

      {/* Bicycle Tracking Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Bike className="h-5 w-5 text-saffron-600" />
          <h3 className="text-lg font-bold text-navy-950">Free Bicycle Entitlement Tracking</h3>
        </div>

        {assets.map((asset) => (
          <Card key={asset.id} className="border-slate-200">
            <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-bold text-navy-950">{asset.model}</CardTitle>
                  <StatusBadge status={asset.status} type="asset" />
                </div>
                <CardDescription className="text-xs mt-1">
                  Asset Tag ID: <strong className="font-mono text-navy-900">{asset.assetCode}</strong> • Frame SN: <strong className="font-mono">{asset.serialNumber}</strong>
                </CardDescription>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedQR(asset.assetCode)}
                className="text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
              >
                <QrCode className="h-4 w-4" />
                <span>Show Verification QR</span>
              </Button>
            </CardHeader>

            <CardContent className="space-y-6 pt-2">
              <ProgressStepper steps={getBicycleSteps(asset)} />

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row justify-between gap-2">
                <div>
                  <span className="font-semibold text-navy-950">Delivery Location:</span>{' '}
                  {asset.schoolName || 'Govt Excellence HSS, Bhopal'}
                </div>
                <div className="text-teal-700 font-semibold">
                  Handover Verification: Requires student OTP + physical barcode scan
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* DBT Disbursals Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-emerald-600" />
          <h3 className="text-lg font-bold text-navy-950">Direct Benefit Transfer (DBT) Cash Payments</h3>
        </div>

        <div className="space-y-3">
          {payments.map((p) => (
            <Card key={p.id} className="border-slate-200 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-navy-950">{p.schemeTitle}</span>
                    <StatusBadge status={p.status} type="payment" />
                  </div>
                  <p className="text-xs text-slate-500">
                    Disbursed to: <strong className="text-slate-800">{p.bankAccountMasked}</strong>
                  </p>
                  <p className="text-[11px] font-mono text-slate-400">
                    Transaction UTR: {p.transactionRef} • Disbursed {formatDate(p.disbursedAt)}
                  </p>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-lg font-extrabold text-emerald-600 block">
                    {formatCurrency(p.amount)}
                  </span>
                  <span className="text-[10px] text-slate-400">100% Zero Deduction</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Verification QR Dialog */}
      <Dialog open={!!selectedQR} onOpenChange={() => setSelectedQR(null)}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <DialogTitle>Physical Asset Handover QR</DialogTitle>
            <DialogDescription className="text-xs">
              Present this QR to your nodal teacher at the school depot during bicycle distribution.
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-white rounded-2xl border-2 border-navy-900 shadow-inner">
              {/* Clean simulated QR pattern */}
              <div className="h-44 w-44 bg-slate-900 rounded-lg flex items-center justify-center text-white p-3 font-mono text-center text-xs break-all">
                [QR_CODE_DATA: {selectedQR}#BENEFICIARY_PRIYA_SHARMA]
              </div>
            </div>
            <p className="text-xs font-mono font-bold text-navy-900">{selectedQR}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

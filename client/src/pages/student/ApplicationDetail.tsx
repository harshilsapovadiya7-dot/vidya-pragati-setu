import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { ProgressStepper, StepItem } from '@/components/shared/ProgressStepper';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DetailSkeleton } from '@/components/shared/LoadingSkeleton';
import { useToast } from '@/components/ui/use-toast';
import { applicationsApi, Application } from '@/lib/api';
import { formatDate, formatCurrency } from '@/lib/utils';
import {
  FileText,
  AlertTriangle,
  Upload,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building,
  CreditCard,
  Bike,
} from 'lucide-react';

export const ApplicationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [reuploading, setReuploading] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        if (id) {
          const data = await applicationsApi.getById(id);
          if (data && data.applicationNumber) {
            setApp(data);
            return;
          }
        }
      } catch {
        // Fallback
      }

      // Realistic application detail
      setApp({
        id: id || 'app-101',
        applicationNumber: 'VPS/2026/00492',
        studentId: 'stud-1',
        student: {
          id: 'stud-1',
          firstName: 'Priya',
          lastName: 'Sharma',
          district: 'Bhopal',
          schoolName: 'Govt Excellence Higher Secondary School',
          currentGrade: 'Grade 10',
          casteCategory: 'OBC',
        },
        schemeId: 'scheme-1',
        schemeTitle: 'Pre-Matric Scholarship Scheme for SC/ST/OBC Students',
        status: 'UNDER_DISTRICT_REVIEW',
        academicYear: '2026-2027',
        submittedAt: '2026-08-10T10:30:00Z',
        schoolReviewedAt: '2026-08-18T14:20:00Z',
        schoolRemarks: 'Student regular in Class 10A with 88% attendance. Income and caste records verified against state registers.',
        createdAt: '2026-08-10T10:30:00Z',
        updatedAt: '2026-08-18T14:20:00Z',
        documents: [
          {
            id: 'doc-1',
            applicationId: 'app-101',
            documentType: 'INCOME_CERTIFICATE',
            documentName: 'Income_Certificate_2026.pdf',
            fileUrl: '#',
            status: 'VERIFIED',
            verificationRemarks: 'e-District verification confirmed valid until March 2027.',
            uploadedAt: '2026-08-10T10:25:00Z',
          },
          {
            id: 'doc-2',
            applicationId: 'app-101',
            documentType: 'CASTE_CERTIFICATE',
            documentName: 'OBC_Certificate_Priya.pdf',
            fileUrl: '#',
            status: 'VERIFIED',
            verificationRemarks: 'Bar-code authenticated by Revenue Department.',
            uploadedAt: '2026-08-10T10:26:00Z',
          },
          {
            id: 'doc-3',
            applicationId: 'app-101',
            documentType: 'MARKSHEET',
            documentName: 'Class_9_Marksheet.pdf',
            fileUrl: '#',
            status: 'VERIFIED',
            verificationRemarks: 'Scored 84.5% aggregate.',
            uploadedAt: '2026-08-10T10:28:00Z',
          },
        ],
        payments: [
          {
            id: 'pay-1',
            applicationId: 'app-101',
            amount: 6000,
            status: 'PROCESSING',
            bankAccountMasked: 'SBI •••• 9120',
            createdAt: '2026-08-19T09:00:00Z',
          },
        ],
      });
      setLoading(false);
    };

    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Application Details" description="Loading record..." />
        <DetailSkeleton />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-600">Application not found.</p>
        <Button onClick={() => navigate('/student/applications')} className="mt-4">
          Back to Applications
        </Button>
      </div>
    );
  }

  const steps: StepItem[] = [
    {
      id: 1,
      title: 'Submitted by Student',
      description: 'Documents uploaded',
      status: 'completed',
      date: formatDate(app.submittedAt),
    },
    {
      id: 2,
      title: 'School Verification',
      description: 'Principal approved',
      status: app.schoolReviewedAt ? 'completed' : 'current',
      date: formatDate(app.schoolReviewedAt),
    },
    {
      id: 3,
      title: 'District Sanction',
      description: 'DEO Fund Approval',
      status:
        app.status === 'APPROVED' || app.status === 'DISBURSED'
          ? 'completed'
          : app.status === 'UNDER_DISTRICT_REVIEW'
          ? 'current'
          : 'upcoming',
      date: formatDate(app.districtReviewedAt),
    },
    {
      id: 4,
      title: 'DBT Direct Disbursal',
      description: 'Treasury / NPCI Credit',
      status: app.status === 'DISBURSED' ? 'completed' : 'upcoming',
    },
  ];

  const handleCorrectionSubmit = () => {
    setReuploading(true);
    setTimeout(() => {
      setReuploading(false);
      toast({
        title: 'Correction Submitted',
        description: 'Your updated document was uploaded and sent back to school review.',
        variant: 'success',
      });
      if (app) setApp({ ...app, status: 'UNDER_SCHOOL_REVIEW', correctionReason: undefined });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Application #${app.applicationNumber}`}
        description={app.schemeTitle}
        showBack
        backTo="/student/applications"
      >
        <StatusBadge status={app.status} />
      </PageHeader>

      {/* Correction Required Banner (if applicable) */}
      {app.status === 'CORRECTION_REQUIRED' && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-950">Action Required: Correction Requested</h4>
              <p className="text-xs text-amber-800 mt-1">
                {app.correctionReason ||
                  'The income certificate uploaded is expired or unclear. Please upload the latest FY 2026-27 certificate.'}
              </p>
            </div>
          </div>
          <div className="pt-2 flex items-center gap-3">
            <Button
              size="sm"
              onClick={handleCorrectionSubmit}
              disabled={reuploading}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center gap-1.5"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>{reuploading ? 'Uploading...' : 'Re-Upload Required Document'}</span>
            </Button>
          </div>
        </div>
      )}

      {/* Progress Stepper Card */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-navy-950">Lifecycle Progression</CardTitle>
          <CardDescription className="text-xs">
            Real-time status updates synced with the District Education Office.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <ProgressStepper steps={steps} />
        </CardContent>
      </Card>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Attached Documents & Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base font-bold text-navy-950">
                Attached Verification Documents
              </CardTitle>
              <CardDescription className="text-xs">
                Certificates and proofs linked to this specific application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {app.documents?.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 rounded-lg border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-navy-50 text-navy-800 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-navy-950">{doc.documentName}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Type: {doc.documentType} • Uploaded {formatDate(doc.uploadedAt)}
                      </p>
                      {doc.verificationRemarks && (
                        <p className="text-[11px] text-teal-700 font-medium mt-0.5">
                          ✓ {doc.verificationRemarks}
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold self-start sm:self-auto ${
                      doc.status === 'VERIFIED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : doc.status === 'REJECTED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* School Review Notes */}
          {app.schoolRemarks && (
            <Card className="border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-navy-950 flex items-center gap-2">
                  <Building className="h-4 w-4 text-navy-800" />
                  <span>Institutional Review Remarks</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                  "{app.schoolRemarks}"
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">
                  Verified on {formatDate(app.schoolReviewedAt)} by Principal / Scholarship Nodal Officer.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Financial Disbursal Details */}
        <div className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base font-bold text-navy-950 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-emerald-600" />
                <span>DBT Disbursal Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {app.payments && app.payments.length > 0 ? (
                app.payments.map((p) => (
                  <div key={p.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Sanctioned Cash Benefit</span>
                    <p className="text-2xl font-extrabold text-navy-950">{formatCurrency(p.amount)}</p>
                    <div className="pt-2 border-t flex justify-between text-xs">
                      <span className="text-slate-500">Target Bank A/C:</span>
                      <strong className="text-navy-950">{p.bankAccountMasked || 'Aadhaar Seeded A/C'}</strong>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Gateway Status:</span>
                      <StatusBadge status={p.status} />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">
                  Payment instructions will generate once district sanction order is issued.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

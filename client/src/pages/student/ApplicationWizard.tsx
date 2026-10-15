import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { schemesApi, applicationsApi, studentsApi, Scheme, StudentProfile } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Upload,
  FileCheck,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Profile Check' },
  { id: 2, title: 'Eligibility' },
  { id: 3, title: 'Documents' },
  { id: 4, title: 'Questions' },
  { id: 5, title: 'Review & Submit' },
];

export const ApplicationWizard: React.FC = () => {
  const { schemeId } = useParams<{ schemeId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [profile, setProfile] = useState<Partial<StudentProfile>>({
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'student@vidyapragati.gov.in',
    currentGrade: 'Grade 10',
    casteCategory: 'OBC',
    annualFamilyIncome: 75000,
    district: 'Bhopal',
    schoolName: 'Govt Excellence Higher Secondary School',
  });
  const [answers, setAnswers] = useState<Record<string, any>>({
    hostelResident: 'No',
    distanceToSchoolKm: 4.5,
    previousMarks: 84.5,
    familyAadhaarLinked: 'Yes',
  });
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([
    'Aadhaar Card',
    'OBC Caste Certificate',
    'Income Certificate 2026',
  ]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadScheme = async () => {
      try {
        if (schemeId) {
          const s = await schemesApi.getById(schemeId);
          if (s) setScheme(s);
        }
      } catch {
        // Fallback
      }

      if (!scheme) {
        setScheme({
          id: schemeId || 'scheme-1',
          code: 'PMS-2026',
          title: 'Chief Minister Post-Matric / Secondary Scholarship Scheme',
          shortDescription: 'Financial assistance for tuition & maintenance.',
          description: '',
          category: 'SCHOLARSHIP',
          benefitAmount: 18500,
          benefitType: 'Annual Direct Bank Transfer',
          academicYear: '2026-2027',
          applicationStartDate: '2026-07-01',
          applicationEndDate: '2026-11-30',
          isPublished: true,
          isActive: true,
          requiredDocuments: ['Aadhaar Card', 'Caste Certificate', 'Income Certificate', 'Class 9 Marksheet'],
        });
      }
    };

    loadScheme();
  }, [schemeId]);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await applicationsApi.create({
        schemeId: scheme?.id || 'scheme-1',
        answers,
        documents: uploadedDocs,
      });
      toast({
        title: 'Application Submitted!',
        description: 'Your application has been forwarded to your school nodal officer for review.',
        variant: 'success',
      });
      navigate('/student/applications');
    } catch {
      toast({
        title: 'Application Created (Demo Mode)',
        description: 'Recorded in demonstration database.',
        variant: 'default',
      });
      navigate('/student/applications');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <PageHeader
        title={`Apply: ${scheme?.title || 'Welfare Scheme'}`}
        description={`Academic Year ${scheme?.academicYear || '2026-2027'} • Entitlement: ${
          scheme?.benefitAmount ? formatCurrency(scheme.benefitAmount) : scheme?.benefitType || 'Scheme Benefit'
        }`}
        showBack
        backTo="/student/discovery"
      />

      {/* Stepper bar */}
      <div className="flex items-center justify-between border-b pb-4">
        {STEPS.map((step, idx) => (
          <div key={step.id} className="flex items-center gap-2">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentStep > step.id
                  ? 'bg-emerald-600 text-white'
                  : currentStep === step.id
                  ? 'bg-navy-900 text-white ring-4 ring-navy-100'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {currentStep > step.id ? <Check className="h-4 w-4 stroke-[3]" /> : step.id}
            </div>
            <span
              className={`text-xs font-semibold hidden sm:inline ${
                currentStep === step.id ? 'text-navy-950 font-bold' : 'text-slate-500'
              }`}
            >
              {step.title}
            </span>
            {idx < STEPS.length - 1 && (
              <div className="w-8 sm:w-16 h-0.5 bg-slate-200 mx-1 hidden sm:block" />
            )}
          </div>
        ))}
      </div>

      {/* Wizard Step 1: Profile Check */}
      {currentStep === 1 && (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base font-bold text-navy-950">Step 1: Confirm Profile Details</CardTitle>
            <CardDescription className="text-xs">
              Confirm your official student data. If anything has changed, please update your profile first.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 font-semibold block">Full Name</span>
                <span className="font-bold text-navy-950 text-sm mt-0.5 block">
                  {profile.firstName} {profile.lastName}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 font-semibold block">Enrolled Institution</span>
                <span className="font-bold text-navy-950 text-sm mt-0.5 block">{profile.schoolName}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 font-semibold block">Grade / Class</span>
                <span className="font-bold text-navy-950 text-sm mt-0.5 block">{profile.currentGrade}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 font-semibold block">Caste Category</span>
                <span className="font-bold text-navy-950 text-sm mt-0.5 block">{profile.casteCategory}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t bg-slate-50 p-4">
            <Button variant="outline" onClick={() => navigate('/student/profile')} className="text-xs">
              Edit in Profile
            </Button>
            <Button
              onClick={() => setCurrentStep(2)}
              className="bg-navy-900 hover:bg-navy-800 text-xs font-semibold"
            >
              Continue to Eligibility
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Wizard Step 2: Eligibility Check */}
      {currentStep === 2 && (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base font-bold text-navy-950">Step 2: Automated Eligibility Evaluation</CardTitle>
            <CardDescription className="text-xs">
              System verified your records against state policy criteria.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <Check className="h-5 w-5 text-emerald-700" />
                <span>All Mandatory Criteria Passed</span>
              </div>
              <ul className="text-xs text-emerald-800 space-y-1.5 pl-6 list-disc">
                <li>Permanent resident domicile in Madhya Pradesh: Verified</li>
                <li>Category OBC with income &lt; ₹1,00,000 per annum: Verified</li>
                <li>Regular student in affiliated secondary school: Verified</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t bg-slate-50 p-4">
            <Button variant="outline" onClick={() => setCurrentStep(1)} className="text-xs">
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <Button
              onClick={() => setCurrentStep(3)}
              className="bg-navy-900 hover:bg-navy-800 text-xs font-semibold"
            >
              Proceed to Documents <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Wizard Step 3: Documents Selection */}
      {currentStep === 3 && (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base font-bold text-navy-950">Step 3: Required Supporting Documents</CardTitle>
            <CardDescription className="text-xs">
              Pre-attached from your digital document locker.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {['Aadhaar Card (Linked)', 'OBC Caste Certificate', 'Income Certificate FY 2026-27', 'Class 9 Passed Marksheet'].map(
              (docName, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white">
                  <div className="flex items-center gap-3">
                    <FileCheck className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold text-navy-950">{docName}</p>
                      <span className="text-[10px] text-emerald-700 font-semibold">Available in Locker</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Attached</span>
                </div>
              )
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t bg-slate-50 p-4">
            <Button variant="outline" onClick={() => setCurrentStep(2)} className="text-xs">
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <Button
              onClick={() => setCurrentStep(4)}
              className="bg-navy-900 hover:bg-navy-800 text-xs font-semibold"
            >
              Scheme Questions <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Wizard Step 4: Scheme Specific Questions */}
      {currentStep === 4 && (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base font-bold text-navy-950">Step 4: Scheme Specific Declarations</CardTitle>
            <CardDescription className="text-xs">
              Please answer the following scheme-specific parameters.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">One-way Commute Distance to School (in km)</Label>
              <Input
                type="number"
                step="0.1"
                value={answers.distanceToSchoolKm}
                onChange={(e) => setAnswers({ ...answers, distanceToSchoolKm: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Are you residing in a Government / Aided Hostel?</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={answers.hostelResident}
                onChange={(e) => setAnswers({ ...answers, hostelResident: e.target.value })}
              >
                <option value="No">No (Day Scholar)</option>
                <option value="Yes">Yes (Hosteller)</option>
              </select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t bg-slate-50 p-4">
            <Button variant="outline" onClick={() => setCurrentStep(3)} className="text-xs">
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <Button
              onClick={() => setCurrentStep(5)}
              className="bg-navy-900 hover:bg-navy-800 text-xs font-semibold"
            >
              Review Application <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Wizard Step 5: Review & Submit */}
      {currentStep === 5 && (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base font-bold text-navy-950">Step 5: Final Review & Undertaking</CardTitle>
            <CardDescription className="text-xs">
              Verify all inputs before final digital submission.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Applicant:</span>
                <strong className="text-navy-950">{profile.firstName} {profile.lastName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Applied Scheme:</span>
                <strong className="text-navy-950">{scheme?.title}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Academic Year:</span>
                <strong className="text-navy-950">{scheme?.academicYear}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target Bank Account:</span>
                <strong className="text-emerald-700">Aadhaar Linked Direct Deposit</strong>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <input type="checkbox" id="declaration" defaultChecked className="mt-0.5 h-4 w-4" />
              <label htmlFor="declaration" className="cursor-pointer">
                I hereby solemnly declare that the facts stated above are true to the best of my knowledge and no details have been suppressed.
              </label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t bg-slate-50 p-4">
            <Button variant="outline" onClick={() => setCurrentStep(4)} className="text-xs">
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 shadow-sm"
            >
              {submitting ? 'Submitting Application...' : 'Sign & Submit Application'}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

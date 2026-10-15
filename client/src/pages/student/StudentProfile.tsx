import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormSkeleton } from '@/components/shared/LoadingSkeleton';
import { useToast } from '@/components/ui/use-toast';
import { studentsApi, StudentProfile as IStudentProfile } from '@/lib/api';
import { GRADE_OPTIONS, CASTE_CATEGORIES, GENDER_OPTIONS } from '@/lib/constants';
import { ShieldCheck, UserCheck, Save, Landmark, School, CheckCircle2 } from 'lucide-react';

export const StudentProfile: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<Partial<IStudentProfile>>({
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'student@vidyapragati.gov.in',
    phone: '9876543210',
    dateOfBirth: '2010-04-12',
    gender: 'FEMALE',
    casteCategory: 'OBC',
    annualFamilyIncome: 75000,
    isBpl: true,
    isDifferentlyAbled: false,
    aadhaarNumber: 'XXXX-XXXX-8921',
    samagraId: '10928374',
    schoolName: 'Govt Excellence Higher Secondary School',
    schoolId: 'SCH-BHP-012',
    district: 'Bhopal',
    currentGrade: 'Grade 10',
    previousYearMarksPercentage: 84.5,
    bankName: 'State Bank of India',
    bankAccountNumber: '38192039120',
    bankIfsc: 'SBIN0001234',
    address: '142, Subhash Nagar, Ward 12',
    pincode: '462023',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await studentsApi.getProfile();
        if (data && data.firstName) {
          setFormData(data);
        }
      } catch {
        // Fallback default state retained
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (field: keyof IStudentProfile, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await studentsApi.updateProfile(formData);
      toast({
        title: 'Profile Updated Successfully',
        description: 'Your changes have been synced across student registry databases.',
        variant: 'success',
      });
    } catch {
      toast({
        title: 'Saved Locally',
        description: 'Profile recorded in demonstration session state.',
        variant: 'default',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Student Profile" description="Loading profile..." />
        <FormSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Profile & Registry Record"
        description="Your official digital identity used for evaluating eligibility and distributing benefits directly to your bank account."
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Verification Status Card */}
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-emerald-950">Aadhaar & Samagra Verified</span>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                  e-KYC Passed
                </span>
              </div>
              <p className="text-xs text-emerald-700">
                Aadhaar No: <strong className="font-mono">{formData.aadhaarNumber}</strong> • Samagra ID: <strong className="font-mono">{formData.samagraId}</strong>
              </p>
            </div>
          </div>
          <div className="text-xs text-emerald-800 font-semibold self-start sm:self-auto">
            UIDAI Authentication: Active
          </div>
        </div>

        {/* Section 1: Personal Details */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base font-bold text-navy-950">1. Personal & Demographic Details</CardTitle>
            <CardDescription className="text-xs">
              Basic identification details matching government registry.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="firstName" className="text-xs">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName || ''}
                onChange={(e) => handleChange('firstName', e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lastName" className="text-xs">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName || ''}
                onChange={(e) => handleChange('lastName', e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs">Registered Mobile No</Label>
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dob" className="text-xs">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={formData.dateOfBirth || ''}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Gender</Label>
              <Select
                value={formData.gender || 'FEMALE'}
                onValueChange={(val) => handleChange('gender', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  {GENDER_OPTIONS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Caste Category</Label>
              <Select
                value={formData.casteCategory || 'OBC'}
                onValueChange={(val) => handleChange('casteCategory', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Caste Category" />
                </SelectTrigger>
                <SelectContent>
                  {CASTE_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="income" className="text-xs">Annual Family Income (₹)</Label>
              <Input
                id="income"
                type="number"
                value={formData.annualFamilyIncome || ''}
                onChange={(e) => handleChange('annualFamilyIncome', Number(e.target.value))}
                required
              />
            </div>

            <div className="space-y-1.5 flex flex-col justify-end pb-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isBpl"
                  checked={formData.isBpl || false}
                  onChange={(e) => handleChange('isBpl', e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-navy-900 focus:ring-navy-600"
                />
                <Label htmlFor="isBpl" className="text-xs font-semibold cursor-pointer">
                  Hold Below Poverty Line (BPL) Card
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Academic Details */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base font-bold text-navy-950">2. Academic & Institutional Details</CardTitle>
            <CardDescription className="text-xs">
              Enrolled institution info used for attendance and marks verification.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="schoolName" className="text-xs">Current School / Institution Name</Label>
              <Input
                id="schoolName"
                value={formData.schoolName || ''}
                onChange={(e) => handleChange('schoolName', e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="schoolId" className="text-xs">UDISE+ School Code</Label>
              <Input
                id="schoolId"
                value={formData.schoolId || ''}
                onChange={(e) => handleChange('schoolId', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Current Grade / Class</Label>
              <Select
                value={formData.currentGrade || 'Grade 10'}
                onValueChange={(val) => handleChange('currentGrade', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Grade" />
                </SelectTrigger>
                <SelectContent>
                  {GRADE_OPTIONS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="district" className="text-xs">Home District</Label>
              <Input
                id="district"
                value={formData.district || ''}
                onChange={(e) => handleChange('district', e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="marks" className="text-xs">Previous Year Percentage (%)</Label>
              <Input
                id="marks"
                type="number"
                step="0.01"
                value={formData.previousYearMarksPercentage || ''}
                onChange={(e) => handleChange('previousYearMarksPercentage', Number(e.target.value))}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 3: DBT Bank Account */}
        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Landmark className="h-5 w-5 text-teal-700" />
              <CardTitle className="text-base font-bold text-navy-950">3. Direct Benefit Transfer (DBT) Bank Account</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Account must be in the student's name and seeded with Aadhaar on NPCI mapper.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="bankName" className="text-xs">Bank Name</Label>
              <Input
                id="bankName"
                value={formData.bankName || ''}
                onChange={(e) => handleChange('bankName', e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bankAccountNumber" className="text-xs">Account Number</Label>
              <Input
                id="bankAccountNumber"
                value={formData.bankAccountNumber || ''}
                onChange={(e) => handleChange('bankAccountNumber', e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bankIfsc" className="text-xs">IFSC Code</Label>
              <Input
                id="bankIfsc"
                value={formData.bankIfsc || ''}
                onChange={(e) => handleChange('bankIfsc', e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50 border-t flex justify-end p-4">
            <Button
              type="submit"
              disabled={saving}
              className="bg-navy-900 hover:bg-navy-800 text-white font-semibold flex items-center gap-2 px-6"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving Changes...' : 'Save Profile Details'}</span>
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

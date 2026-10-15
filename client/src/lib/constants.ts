export type Role = 'STUDENT' | 'TEACHER' | 'PRINCIPAL' | 'DISTRICT_OFFICER' | 'STATE_ADMIN';

export const ROLE_LABELS: Record<Role, string> = {
  STUDENT: 'Student',
  TEACHER: 'Teacher / Nodal Officer',
  PRINCIPAL: 'School Principal',
  DISTRICT_OFFICER: 'District Education Officer',
  STATE_ADMIN: 'State Administrator',
};

export const ROLE_COLORS: Record<Role, string> = {
  STUDENT: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  TEACHER: 'bg-blue-100 text-blue-800 border-blue-300',
  PRINCIPAL: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  DISTRICT_OFFICER: 'bg-purple-100 text-purple-800 border-purple-300',
  STATE_ADMIN: 'bg-orange-100 text-orange-800 border-orange-300',
};

export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_SCHOOL_REVIEW'
  | 'SCHOOL_VERIFIED'
  | 'SCHOOL_REJECTED'
  | 'UNDER_DISTRICT_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'CORRECTION_REQUIRED'
  | 'DISBURSED';

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  UNDER_SCHOOL_REVIEW: 'Under School Review',
  SCHOOL_VERIFIED: 'School Verified',
  SCHOOL_REJECTED: 'School Rejected',
  UNDER_DISTRICT_REVIEW: 'Under District Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CORRECTION_REQUIRED: 'Correction Required',
  DISBURSED: 'Benefits Disbursed',
};

export const APPLICATION_STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'; bg: string; text: string }
> = {
  DRAFT: { label: 'Draft', variant: 'outline', bg: 'bg-gray-100', text: 'text-gray-700' },
  SUBMITTED: { label: 'Submitted', variant: 'secondary', bg: 'bg-blue-50', text: 'text-blue-700' },
  UNDER_SCHOOL_REVIEW: { label: 'Under School Review', variant: 'warning', bg: 'bg-amber-50', text: 'text-amber-700' },
  SCHOOL_VERIFIED: { label: 'School Verified', variant: 'default', bg: 'bg-indigo-50', text: 'text-indigo-700' },
  SCHOOL_REJECTED: { label: 'School Rejected', variant: 'destructive', bg: 'bg-red-50', text: 'text-red-700' },
  UNDER_DISTRICT_REVIEW: { label: 'Under District Review', variant: 'warning', bg: 'bg-orange-50', text: 'text-orange-700' },
  APPROVED: { label: 'Approved', variant: 'success', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  REJECTED: { label: 'Rejected', variant: 'destructive', bg: 'bg-red-50', text: 'text-red-700' },
  CORRECTION_REQUIRED: { label: 'Correction Required', variant: 'warning', bg: 'bg-yellow-50', text: 'text-yellow-800' },
  DISBURSED: { label: 'Disbursed', variant: 'success', bg: 'bg-teal-50', text: 'text-teal-700' },
};

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'RETRYING';

export const PAYMENT_STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline' }
> = {
  PENDING: { label: 'Pending', variant: 'outline' },
  PROCESSING: { label: 'Processing', variant: 'secondary' },
  SUCCESS: { label: 'Disbursed (Success)', variant: 'success' },
  FAILED: { label: 'Failed', variant: 'destructive' },
  RETRYING: { label: 'Retrying', variant: 'warning' },
};

export type AssetStatus =
  | 'ORDERED'
  | 'IN_TRANSIT'
  | 'RECEIVED_AT_SCHOOL'
  | 'ASSIGNED'
  | 'DELIVERED'
  | 'DAMAGED'
  | 'REPLACED';

export const ASSET_STATUS_CONFIG: Record<
  AssetStatus,
  { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'; step: number }
> = {
  ORDERED: { label: 'Order Placed', variant: 'outline', step: 1 },
  IN_TRANSIT: { label: 'In Transit', variant: 'secondary', step: 2 },
  RECEIVED_AT_SCHOOL: { label: 'At School Depot', variant: 'warning', step: 3 },
  ASSIGNED: { label: 'Assigned to Student', variant: 'default', step: 4 },
  DELIVERED: { label: 'Delivered & Handed Over', variant: 'success', step: 5 },
  DAMAGED: { label: 'Flagged Damaged', variant: 'destructive', step: 0 },
  REPLACED: { label: 'Replacement Dispatched', variant: 'warning', step: 0 },
};

export type DocumentType =
  | 'AADHAAR_CARD'
  | 'INCOME_CERTIFICATE'
  | 'CASTE_CERTIFICATE'
  | 'MARKSHEET'
  | 'BANK_PASSBOOK'
  | 'DOMICILE_CERTIFICATE'
  | 'DISABILITY_CERTIFICATE'
  | 'RATION_CARD'
  | 'BONAFIDE_CERTIFICATE'
  | 'OTHER';

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  AADHAAR_CARD: 'Aadhaar Card',
  INCOME_CERTIFICATE: 'Income Certificate',
  CASTE_CERTIFICATE: 'Caste Certificate',
  MARKSHEET: 'Previous Year Marksheet',
  BANK_PASSBOOK: 'Bank Passbook / Statement',
  DOMICILE_CERTIFICATE: 'Domicile / Residence Proof',
  DISABILITY_CERTIFICATE: 'Disability Certificate',
  RATION_CARD: 'Ration / BPL Card',
  BONAFIDE_CERTIFICATE: 'Bonafide Student Certificate',
  OTHER: 'Other Document',
};

export const SCHEME_TYPE_LABELS: Record<string, string> = {
  SCHOLARSHIP: 'Direct Benefit Transfer (DBT)',
  IN_KIND: 'In-Kind Asset Distribution',
  INCENTIVE: 'Academic Incentive',
  TRANSPORT: 'Transport Assistance (Bicycle)',
  UNIFORM: 'Uniform & Textbook Grant',
};

export const GRADE_OPTIONS = [
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12',
  'Undergraduate Year 1',
  'Undergraduate Year 2',
  'Undergraduate Year 3',
  'Postgraduate',
];

export const CASTE_CATEGORIES = ['GENERAL', 'OBC', 'SC', 'ST', 'EWS', 'MINORITY'];

export const GENDER_OPTIONS = ['MALE', 'FEMALE', 'OTHER'];

export const DEMO_ACCOUNTS = [
  {
    role: 'STUDENT' as Role,
    name: 'Priya Sharma (Student - Class 10)',
    email: 'student@vidyapragati.gov.in',
    password: 'password123',
    description: 'Girl student applying for Pre-Matric Scholarship & Free Bicycle Scheme',
  },
  {
    role: 'TEACHER' as Role,
    name: 'Rajesh Verma (Nodal Teacher)',
    email: 'teacher@vidyapragati.gov.in',
    password: 'password123',
    description: 'Govt High School Rampur - verifies student records and document proofs',
  },
  {
    role: 'PRINCIPAL' as Role,
    name: 'Dr. Sunita Devi (Principal)',
    email: 'principal@vidyapragati.gov.in',
    password: 'password123',
    description: 'Principal approval for forwarded school applications',
  },
  {
    role: 'DISTRICT_OFFICER' as Role,
    name: 'Amit Patel (District Officer - Bhopal)',
    email: 'district@vidyapragati.gov.in',
    password: 'password123',
    description: 'Sanctions district-wide scholarship applications & bicycle allotments',
  },
  {
    role: 'STATE_ADMIN' as Role,
    name: 'Vikramaditya Rao (State Director)',
    email: 'admin@vidyapragati.gov.in',
    password: 'password123',
    description: 'Executive dashboard, budget allocations, DBT disbursement triggers, scheme config',
  },
];

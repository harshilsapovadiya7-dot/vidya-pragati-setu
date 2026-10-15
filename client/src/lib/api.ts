import axios from 'axios';
import { Role, ApplicationStatus, PaymentStatus, AssetStatus } from './constants';

export const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Avoid redirecting if already on login or public pages
      const publicPaths = ['/login', '/', '/schemes', '/help'];
      if (!publicPaths.some((p) => window.location.pathname.startsWith(p))) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// --- Models & Interfaces ---
export interface User {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  phone?: string;
  district?: string;
  schoolId?: string;
  schoolName?: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender: string;
  casteCategory: string;
  annualFamilyIncome: number;
  isBpl: boolean;
  isDifferentlyAbled: boolean;
  aadhaarNumber?: string;
  samagraId?: string;
  schoolId?: string;
  schoolName?: string;
  district: string;
  currentGrade: string;
  previousYearMarksPercentage: number;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankName?: string;
  address?: string;
  pincode?: string;
}

export interface Scheme {
  id: string;
  code: string;
  title: string;
  shortDescription: string;
  description: string;
  category: 'SCHOLARSHIP' | 'IN_KIND' | 'INCENTIVE' | 'TRANSPORT' | 'UNIFORM';
  benefitAmount?: number;
  benefitType: string;
  academicYear: string;
  applicationStartDate: string;
  applicationEndDate: string;
  isPublished: boolean;
  isActive: boolean;
  eligibilityCriteria?: string;
  requiredDocuments?: string[];
  rules?: any[];
  _count?: {
    applications: number;
  };
}

export interface Application {
  id: string;
  applicationNumber: string;
  studentId: string;
  studentName?: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    district: string;
    schoolName?: string;
    currentGrade: string;
    casteCategory: string;
  };
  schemeId: string;
  schemeTitle?: string;
  scheme?: Scheme;
  status: ApplicationStatus;
  academicYear: string;
  submittedAt?: string;
  schoolReviewedAt?: string;
  districtReviewedAt?: string;
  schoolRemarks?: string;
  districtRemarks?: string;
  correctionReason?: string;
  createdAt: string;
  updatedAt: string;
  documents?: ApplicationDocument[];
  payments?: PaymentRecord[];
  assets?: AssetRecord[];
}

export interface ApplicationDocument {
  id: string;
  applicationId: string;
  documentType: string;
  documentName: string;
  fileUrl: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verificationRemarks?: string;
  uploadedAt: string;
}

export interface PaymentRecord {
  id: string;
  applicationId: string;
  studentName?: string;
  schemeTitle?: string;
  amount: number;
  status: PaymentStatus;
  transactionRef?: string;
  disbursedAt?: string;
  failureReason?: string;
  bankAccountMasked?: string;
  createdAt: string;
}

export interface AssetRecord {
  id: string;
  assetCode: string;
  assetType: string;
  model: string;
  serialNumber?: string;
  status: AssetStatus;
  district: string;
  schoolId?: string;
  schoolName?: string;
  studentId?: string;
  studentName?: string;
  applicationId?: string;
  qrCode?: string;
  dispatchedAt?: string;
  receivedAtSchoolAt?: string;
  deliveredAt?: string;
  exceptionRemarks?: string;
  updatedAt: string;
}

export interface EligibilityResult {
  schemeId: string;
  schemeTitle: string;
  isEligible: boolean;
  matchedRules: string[];
  unmatchedRules: string[];
  estimatedBenefit?: number;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface AuditLogItem {
  id: string;
  action: string;
  performedBy: string;
  userRole: string;
  targetResource: string;
  resourceId?: string;
  ipAddress?: string;
  timestamp: string;
  details?: string;
}

// --- API Service Methods ---

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await apiClient.post<{ user: User; token?: string }>('/auth/login', credentials);
    return res.data;
  },
  logout: async () => {
    const res = await apiClient.post('/auth/logout');
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get<{ user: User }>('/auth/me');
    return res.data;
  },
};

export const studentsApi = {
  getProfile: async () => {
    const res = await apiClient.get<StudentProfile>('/students/profile');
    return res.data;
  },
  updateProfile: async (data: Partial<StudentProfile>) => {
    const res = await apiClient.put<StudentProfile>('/students/profile', data);
    return res.data;
  },
  getStudentSchemes: async () => {
    const res = await apiClient.get<{ eligible: Scheme[]; applied: Scheme[] }>('/students/schemes');
    return res.data;
  },
};

export const schemesApi = {
  list: async (params?: { category?: string; active?: boolean; search?: string }) => {
    const res = await apiClient.get<Scheme[]>('/schemes', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<Scheme>(`/schemes/${id}`);
    return res.data;
  },
  create: async (data: Partial<Scheme>) => {
    const res = await apiClient.post<Scheme>('/schemes', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Scheme>) => {
    const res = await apiClient.put<Scheme>(`/schemes/${id}`, data);
    return res.data;
  },
  publish: async (id: string, isPublished: boolean) => {
    const res = await apiClient.patch<Scheme>(`/schemes/${id}/publish`, { isPublished });
    return res.data;
  },
};

export const eligibilityApi = {
  evaluate: async (schemeId: string, studentData?: any) => {
    const res = await apiClient.post<EligibilityResult>(`/eligibility/evaluate/${schemeId}`, studentData);
    return res.data;
  },
  getMyEligibility: async () => {
    const res = await apiClient.get<EligibilityResult[]>('/eligibility/my');
    return res.data;
  },
  getEvaluation: async (schemeId: string) => {
    const res = await apiClient.get<EligibilityResult>(`/eligibility/scheme/${schemeId}`);
    return res.data;
  },
};

export const documentsApi = {
  list: async (applicationId?: string) => {
    const res = await apiClient.get<ApplicationDocument[]>('/documents', { params: { applicationId } });
    return res.data;
  },
  upload: async (formData: FormData) => {
    const res = await apiClient.post<ApplicationDocument>('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<ApplicationDocument>(`/documents/${id}`);
    return res.data;
  },
  verify: async (id: string, data: { status: 'VERIFIED' | 'REJECTED'; remarks?: string }) => {
    const res = await apiClient.post<ApplicationDocument>(`/documents/${id}/verify`, data);
    return res.data;
  },
};

export const applicationsApi = {
  list: async (params?: { status?: string; schemeId?: string; district?: string; page?: number; limit?: number }) => {
    const res = await apiClient.get<{ applications: Application[]; total: number }>('/applications', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<Application>(`/applications/${id}`);
    return res.data;
  },
  create: async (data: { schemeId: string; answers?: Record<string, any>; documents?: string[] }) => {
    const res = await apiClient.post<Application>('/applications', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Application>) => {
    const res = await apiClient.put<Application>(`/applications/${id}`, data);
    return res.data;
  },
  submit: async (id: string) => {
    const res = await apiClient.post<Application>(`/applications/${id}/submit`);
    return res.data;
  },
  requestCorrection: async (id: string, reason: string) => {
    const res = await apiClient.post<Application>(`/applications/${id}/request-correction`, { reason });
    return res.data;
  },
  review: async (id: string, data: { decision: 'APPROVE' | 'REJECT'; remarks?: string; stage: 'SCHOOL' | 'DISTRICT' }) => {
    const res = await apiClient.post<Application>(`/applications/${id}/review`, data);
    return res.data;
  },
};

export const assetsApi = {
  list: async (params?: { status?: string; district?: string; schoolId?: string }) => {
    const res = await apiClient.get<AssetRecord[]>('/assets', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<AssetRecord>(`/assets/${id}`);
    return res.data;
  },
  create: async (data: Partial<AssetRecord>) => {
    const res = await apiClient.post<AssetRecord>('/assets', data);
    return res.data;
  },
  dispatch: async (id: string, data: { destinationSchoolId: string; dispatchNotes?: string }) => {
    const res = await apiClient.post<AssetRecord>(`/assets/${id}/dispatch`, data);
    return res.data;
  },
  receive: async (id: string) => {
    const res = await apiClient.post<AssetRecord>(`/assets/${id}/receive`);
    return res.data;
  },
  assignBeneficiary: async (id: string, studentId: string) => {
    const res = await apiClient.post<AssetRecord>(`/assets/${id}/assign`, { studentId });
    return res.data;
  },
  verifyDelivery: async (id: string, verificationCode?: string) => {
    const res = await apiClient.post<AssetRecord>(`/assets/${id}/verify-delivery`, { verificationCode });
    return res.data;
  },
  recordException: async (id: string, remarks: string) => {
    const res = await apiClient.post<AssetRecord>(`/assets/${id}/exception`, { remarks });
    return res.data;
  },
  getHistory: async (id: string) => {
    const res = await apiClient.get<any[]>(`/assets/${id}/history`);
    return res.data;
  },
  getQR: async (id: string) => {
    const res = await apiClient.get<{ qrCodeData: string }>(`/assets/${id}/qr`);
    return res.data;
  },
};

export const paymentsApi = {
  list: async (params?: { status?: string; schemeId?: string; district?: string }) => {
    const res = await apiClient.get<PaymentRecord[]>('/payments', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<PaymentRecord>(`/payments/${id}`);
    return res.data;
  },
  simulateStatus: async (id: string, status: PaymentStatus) => {
    const res = await apiClient.post<PaymentRecord>(`/payments/${id}/simulate`, { status });
    return res.data;
  },
};

export const notificationsApi = {
  list: async () => {
    const res = await apiClient.get<NotificationItem[]>('/notifications');
    return res.data;
  },
  markRead: async (id: string) => {
    const res = await apiClient.patch(`/notifications/${id}/read`);
    return res.data;
  },
  markAllRead: async () => {
    const res = await apiClient.patch('/notifications/mark-all-read');
    return res.data;
  },
};

export const reportsApi = {
  summary: async () => {
    const res = await apiClient.get<{
      totalStudents: number;
      totalApplications: number;
      totalDisbursedAmount: number;
      totalBicyclesDistributed: number;
      activeSchemesCount: number;
      pendingSchoolReviews: number;
      pendingDistrictReviews: number;
    }>('/reports/summary');
    return res.data;
  },
  applications: async (params?: any) => {
    const res = await apiClient.get<any>('/reports/applications', { params });
    return res.data;
  },
  assets: async (params?: any) => {
    const res = await apiClient.get<any>('/reports/assets', { params });
    return res.data;
  },
  payments: async (params?: any) => {
    const res = await apiClient.get<any>('/reports/payments', { params });
    return res.data;
  },
  exportCsv: async (reportType: string) => {
    const res = await apiClient.get(`/reports/export/${reportType}`, { responseType: 'blob' });
    return res.data;
  },
};

export const auditApi = {
  list: async (params?: { action?: string; limit?: number }) => {
    const res = await apiClient.get<AuditLogItem[]>('/audit', { params });
    return res.data;
  },
};

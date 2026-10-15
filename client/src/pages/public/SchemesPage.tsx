import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scheme, schemesApi } from '@/lib/api';
import { SchemeCard } from '@/components/shared/SchemeCard';
import { FilterBar, FilterConfig } from '@/components/shared/FilterBar';
import { CardGridSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { BookOpen } from 'lucide-react';

const FILTER_CONFIG: FilterConfig[] = [
  {
    id: 'category',
    label: 'Category',
    options: [
      { label: 'DBT Scholarships', value: 'SCHOLARSHIP' },
      { label: 'Bicycle & Transport', value: 'TRANSPORT' },
      { label: 'Incentive Awards', value: 'INCENTIVE' },
      { label: 'In-Kind Entitlements', value: 'IN_KIND' },
      { label: 'Uniform & Books', value: 'UNIFORM' },
    ],
  },
];

const DEFAULT_SCHEMES: Scheme[] = [
  {
    id: 's-101',
    code: 'PMS-SC-2026',
    title: 'Post-Matric Scholarship for SC/ST Students',
    shortDescription: '100% financial assistance and maintenance allowance for Scheduled Caste & Tribe students studying in higher secondary & degree colleges.',
    description: 'A flagship Central-State cooperative scheme providing direct financial support to students whose family annual income is below ₹2,50,000.',
    category: 'SCHOLARSHIP',
    benefitAmount: 18000,
    benefitType: 'Annual Direct Bank Transfer',
    academicYear: '2026-2027',
    applicationStartDate: '2026-07-01',
    applicationEndDate: '2026-11-30',
    isPublished: true,
    isActive: true,
    requiredDocuments: ['Aadhaar Card', 'Caste Certificate', 'Income Certificate', 'Marksheet', 'Bank Passbook'],
  },
  {
    id: 's-102',
    code: 'FREE-CYCLE-GIRL',
    title: 'Mukhyamantri Rural Girls Bicycle Scheme',
    shortDescription: 'Free 26-inch bicycles distributed to female students enrolled in Class 9 commuting more than 2 km to government school.',
    description: 'Promoting girl child retention in secondary education and overcoming commuting obstacles in rural hinterlands.',
    category: 'TRANSPORT',
    benefitAmount: 4200,
    benefitType: '26T Heavy Duty Steel Bicycle with Basket',
    academicYear: '2026-2027',
    applicationStartDate: '2026-07-15',
    applicationEndDate: '2026-10-31',
    isPublished: true,
    isActive: true,
    requiredDocuments: ['Aadhaar Card', 'Bonafide Certificate', 'Distance Declaration'],
  },
  {
    id: 's-103',
    code: 'PRE-MAT-OBC',
    title: 'Pre-Matric Scholarship for Other Backward Classes (OBC)',
    shortDescription: 'Annual stipend for Class 9 and 10 students from OBC category with family income under ₹1,00,000.',
    description: 'Aimed at mitigating school dropout rates in secondary grades.',
    category: 'SCHOLARSHIP',
    benefitAmount: 5000,
    benefitType: 'Direct DBT Bank Transfer',
    academicYear: '2026-2027',
    applicationStartDate: '2026-08-01',
    applicationEndDate: '2026-12-15',
    isPublished: true,
    isActive: true,
    requiredDocuments: ['Aadhaar Card', 'OBC Caste Certificate', 'Income Proof'],
  },
  {
    id: 's-104',
    code: 'MERIT-INCENT-10',
    title: 'Pratibha Kiran Merit Incentive Scheme',
    shortDescription: 'One-time cash incentive of ₹25,000 for government school students scoring 85%+ in Class 10 Board examinations.',
    description: 'Recognizing academic excellence and encouraging STEM pursuits for underserved communities.',
    category: 'INCENTIVE',
    benefitAmount: 25000,
    benefitType: 'Direct DBT to Bank Account',
    academicYear: '2026-2027',
    applicationStartDate: '2026-06-15',
    applicationEndDate: '2026-09-30',
    isPublished: true,
    isActive: true,
    requiredDocuments: ['Class 10 Marksheet', 'Aadhaar Card', 'Bank Passbook'],
  },
  {
    id: 's-105',
    code: 'FREE-TXT-UNIF',
    title: 'Free Textbook & Twin Uniform Grant (Grades 1-8)',
    shortDescription: 'Provision of two sets of school uniforms and NCERT textbooks for all enrolled primary and middle school pupils.',
    description: 'Ensuring zero out-of-pocket costs for elementary education under Right to Education (RTE) mandate.',
    category: 'UNIFORM',
    benefitAmount: 1800,
    benefitType: 'School Kit & Uniform Sets',
    academicYear: '2026-2027',
    applicationStartDate: '2026-06-01',
    applicationEndDate: '2026-10-31',
    isPublished: true,
    isActive: true,
    requiredDocuments: ['School Enrollment Card', 'Samagra ID'],
  },
];

export const SchemesPage: React.FC = () => {
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({
    category: 'ALL',
  });

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      const data = await schemesApi.list({ active: true });
      if (Array.isArray(data) && data.length > 0) {
        setSchemes(data);
      } else {
        setSchemes(DEFAULT_SCHEMES);
      }
    } catch {
      setSchemes(DEFAULT_SCHEMES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  const filteredSchemes = schemes.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedFilters.category === 'ALL' || s.category === selectedFilters.category;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <PageHeader
        title="Public Scheme Catalog"
        description="Explore active state & central welfare schemes for school students in Madhya Pradesh. Check guidelines, benefits, and required documents."
      />

      {/* Filter and Search Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search schemes by name, keyword, or code..."
        filters={FILTER_CONFIG}
        selectedFilters={selectedFilters}
        onFilterChange={(fId, val) =>
          setSelectedFilters((prev) => ({ ...prev, [fId]: val }))
        }
        onReset={() => {
          setSearchQuery('');
          setSelectedFilters({ category: 'ALL' });
        }}
      />

      {/* Scheme Cards Grid */}
      {loading ? (
        <CardGridSkeleton count={6} />
      ) : filteredSchemes.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No Schemes Found"
          description="We couldn't find any schemes matching your current filters. Try resetting the search or category filter."
          actionLabel="Reset Filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedFilters({ category: 'ALL' });
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchemes.map((scheme) => (
            <SchemeCard
              key={scheme.id}
              scheme={scheme}
              onApply={() => navigate(`/student/apply/${scheme.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

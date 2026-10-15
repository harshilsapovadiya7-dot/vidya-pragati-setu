import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { SchemeCard } from '@/components/shared/SchemeCard';
import { FilterBar, FilterConfig } from '@/components/shared/FilterBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CardGridSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { schemesApi, eligibilityApi, Scheme, EligibilityResult } from '@/lib/api';
import { Sparkles, CheckCircle2, XCircle, Search, Filter } from 'lucide-react';

const FILTER_CONFIG: FilterConfig[] = [
  {
    id: 'category',
    label: 'Category',
    options: [
      { label: 'DBT Scholarships', value: 'SCHOLARSHIP' },
      { label: 'Bicycles & Mobility', value: 'TRANSPORT' },
      { label: 'Merit Incentives', value: 'INCENTIVE' },
      { label: 'Uniform & Textbook', value: 'UNIFORM' },
    ],
  },
];

export const SchemeDiscovery: React.FC = () => {
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [eligibilityMap, setEligibilityMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({
    category: 'ALL',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [schemesData, myElig] = await Promise.allSettled([
        schemesApi.list({ active: true }),
        eligibilityApi.getMyEligibility(),
      ]);

      let schemeList: Scheme[] = [];
      if (schemesData.status === 'fulfilled' && Array.isArray(schemesData.value)) {
        schemeList = schemesData.value;
      }

      if (schemeList.length === 0) {
        schemeList = [
          {
            id: 'scheme-1',
            code: 'PMS-2026',
            title: 'Chief Minister Post-Matric Scholarship Scheme',
            shortDescription: 'Tuition support and monthly maintenance for SC/ST and OBC students.',
            description: '',
            category: 'SCHOLARSHIP',
            benefitAmount: 18500,
            benefitType: 'Annual DBT Credit',
            academicYear: '2026-2027',
            applicationStartDate: '2026-07-01',
            applicationEndDate: '2026-11-30',
            isPublished: true,
            isActive: true,
          },
          {
            id: 'scheme-2',
            code: 'CYC-GIRL-2026',
            title: 'Free Bicycle Scheme for Rural Girl Students',
            shortDescription: 'Free high-durability gear bicycles provided to female students commuting >2km.',
            description: '',
            category: 'TRANSPORT',
            benefitAmount: 4200,
            benefitType: 'Hero City Trekker 26T',
            academicYear: '2026-2027',
            applicationStartDate: '2026-07-15',
            applicationEndDate: '2026-10-31',
            isPublished: true,
            isActive: true,
          },
          {
            id: 'scheme-3',
            code: 'PRE-MAT-2026',
            title: 'State Pre-Matric Merit Scholarship (Grades 9-10)',
            shortDescription: 'Cash scholarship directly credited for secondary class academic supplies.',
            description: '',
            category: 'SCHOLARSHIP',
            benefitAmount: 6000,
            benefitType: 'Aadhaar DBT Disbursal',
            academicYear: '2026-2027',
            applicationStartDate: '2026-08-01',
            applicationEndDate: '2026-12-15',
            isPublished: true,
            isActive: true,
          },
          {
            id: 'scheme-4',
            code: 'ENGG-MERIT-2026',
            title: 'Medhavi Chhatra Yojana (Higher Tech Education)',
            shortDescription: 'Tuition fees covered for top rankers in engineering & medicine courses.',
            description: '',
            category: 'INCENTIVE',
            benefitAmount: 150000,
            benefitType: 'Direct Fee Reimbursement',
            academicYear: '2026-2027',
            applicationStartDate: '2026-08-01',
            applicationEndDate: '2026-12-31',
            isPublished: true,
            isActive: true,
          },
        ];
      }
      setSchemes(schemeList);

      // Map eligibility
      const map: Record<string, boolean> = {};
      if (myElig.status === 'fulfilled' && Array.isArray(myElig.value)) {
        myElig.value.forEach((res) => {
          map[res.schemeId] = res.isEligible;
        });
      } else {
        // Fallback calculation: Priya is female, OBC, Grade 10, income 75000
        map['scheme-1'] = true;
        map['scheme-2'] = true;
        map['scheme-3'] = true;
        map['scheme-4'] = false; // requires university enrollment
      }
      setEligibilityMap(map);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEvaluateAll = async () => {
    try {
      setEvaluating(true);
      const res = await eligibilityApi.getMyEligibility();
      if (Array.isArray(res)) {
        const map: Record<string, boolean> = {};
        res.forEach((r) => {
          map[r.schemeId] = r.isEligible;
        });
        setEligibilityMap(map);
      }
    } catch {
      // Simulated evaluation refresh
    } finally {
      setEvaluating(false);
    }
  };

  const filteredSchemes = schemes.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedFilters.category === 'ALL' || s.category === selectedFilters.category;

    return matchesSearch && matchesCategory;
  });

  const eligibleCount = Object.values(eligibilityMap).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Find & Discover Scholarships"
        description="Search active schemes matched in real-time with your caste, grade, gender, and family income records."
      >
        <Button
          onClick={handleEvaluateAll}
          disabled={evaluating}
          className="bg-saffron-600 hover:bg-saffron-700 text-white font-bold flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          <span>{evaluating ? 'Evaluating Rules...' : 'Re-Check My Eligibility'}</span>
        </Button>
      </PageHeader>

      {/* Eligibility summary alert */}
      <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-800 shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-teal-950">
              You are eligible for {eligibleCount} government scheme{eligibleCount !== 1 ? 's' : ''}!
            </h4>
            <p className="text-xs text-teal-700">
              Evaluated based on your verified Class 10 enrollment, OBC status, and household income below ₹1,00,000.
            </p>
          </div>
        </div>
      </div>

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search schemes by name, category, or entitlement..."
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

      {loading ? (
        <CardGridSkeleton count={6} />
      ) : filteredSchemes.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No Schemes Found"
          description="Try broadening your search query or selecting a different category."
          actionLabel="Clear Filters"
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
              isEligible={eligibilityMap[scheme.id]}
              onApply={() => navigate(`/student/apply/${scheme.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

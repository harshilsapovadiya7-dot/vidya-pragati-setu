import React, { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Sliders, Plus, Save, Trash2, CheckCircle2, ShieldCheck } from 'lucide-react';

interface RuleItem {
  id: string;
  schemeCode: string;
  ruleName: string;
  field: string;
  operator: 'EQUALS' | 'LESS_THAN_OR_EQUAL' | 'GREATER_THAN_OR_EQUAL' | 'IN_LIST';
  value: string;
  description: string;
  isActive: boolean;
}

const INITIAL_RULES: RuleItem[] = [
  {
    id: 'r-1',
    schemeCode: 'PMS-2026',
    ruleName: 'SC/ST/OBC Category Filter',
    field: 'casteCategory',
    operator: 'IN_LIST',
    value: 'SC, ST, OBC',
    description: 'Applicant must belong to recognized reserved categories.',
    isActive: true,
  },
  {
    id: 'r-2',
    schemeCode: 'PMS-2026',
    ruleName: 'Annual Family Income Ceiling',
    field: 'annualFamilyIncome',
    operator: 'LESS_THAN_OR_EQUAL',
    value: '250000',
    description: 'Household income must not exceed ₹2,50,000 p.a.',
    isActive: true,
  },
  {
    id: 'r-3',
    schemeCode: 'CYC-GIRL-2026',
    ruleName: 'Female Gender Mandate',
    field: 'gender',
    operator: 'EQUALS',
    value: 'FEMALE',
    description: 'Exclusively intended for girl students in rural government schools.',
    isActive: true,
  },
  {
    id: 'r-4',
    schemeCode: 'CYC-GIRL-2026',
    ruleName: 'Minimum Commute Distance',
    field: 'distanceToSchoolKm',
    operator: 'GREATER_THAN_OR_EQUAL',
    value: '2.0',
    description: 'Student must reside at least 2 kilometers from school campus.',
    isActive: true,
  },
  {
    id: 'r-5',
    schemeCode: 'PRE-MAT-2026',
    ruleName: 'Minimum Academic Attendance',
    field: 'attendancePercent',
    operator: 'GREATER_THAN_OR_EQUAL',
    value: '75',
    description: 'Requires 75% minimum classroom attendance recorded in register.',
    isActive: true,
  },
];

export const AdminRules: React.FC = () => {
  const { toast } = useToast();
  const [rules, setRules] = useState<RuleItem[]>(INITIAL_RULES);

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
    );
    toast({
      title: 'Rule State Updated',
      description: 'Rule status toggled for evaluation engine.',
      variant: 'default',
    });
  };

  const handleSaveAll = () => {
    toast({
      title: 'Eligibility Engine Synced',
      description: 'All 5 active rules compiled into the automated evaluator.',
      variant: 'success',
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Automated Eligibility Rules Engine"
        description="Configure dynamic business logic matching student demographics with active welfare criteria."
      >
        <Button
          onClick={handleSaveAll}
          className="bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs flex items-center gap-1.5"
        >
          <Save className="h-4 w-4" />
          <span>Save & Deploy Rules</span>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4">
        {rules.map((rule) => (
          <Card key={rule.id} className="border-slate-200">
            <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-navy-900 bg-slate-100 px-2 py-0.5 rounded">
                    {rule.schemeCode}
                  </span>
                  <h4 className="text-sm font-bold text-navy-950">{rule.ruleName}</h4>
                  <Badge variant={rule.isActive ? 'success' : 'outline'} className="text-[10px]">
                    {rule.isActive ? 'Active Evaluator' : 'Disabled'}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">{rule.description}</p>
                <div className="pt-1 flex items-center gap-2 text-xs font-mono text-slate-700">
                  <span className="font-semibold text-navy-950">{rule.field}</span>
                  <span className="text-slate-400 font-bold">{rule.operator}</span>
                  <strong className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {rule.value}
                  </strong>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleRule(rule.id)}
                  className="text-xs h-8"
                >
                  {rule.isActive ? 'Disable Rule' : 'Enable Rule'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

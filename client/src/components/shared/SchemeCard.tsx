import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Scheme } from '@/lib/api';
import { SCHEME_TYPE_LABELS } from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Calendar, CheckCircle2, ChevronRight, Award, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SchemeCardProps {
  scheme: Scheme;
  isEligible?: boolean;
  onApply?: () => void;
  applied?: boolean;
}

export const SchemeCard: React.FC<SchemeCardProps> = ({
  scheme,
  isEligible,
  onApply,
  applied = false,
}) => {
  const navigate = useNavigate();

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'SCHOLARSHIP':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'TRANSPORT':
      case 'IN_KIND':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'INCENTIVE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <Card className="flex flex-col justify-between hover:shadow-md transition-shadow border-slate-200">
      <CardHeader className="p-5 pb-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="outline" className={`text-[11px] font-semibold ${getCategoryColor(scheme.category)}`}>
            {SCHEME_TYPE_LABELS[scheme.category] || scheme.category}
          </Badge>

          {isEligible === true && (
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 flex items-center gap-1 font-semibold text-[11px]">
              <CheckCircle2 className="h-3 w-3" />
              Eligible
            </Badge>
          )}
          {isEligible === false && (
            <Badge variant="outline" className="text-slate-400 border-slate-200 text-[11px]">
              Criteria Not Met
            </Badge>
          )}
        </div>

        <h3 className="text-base font-bold text-navy-950 leading-snug hover:text-navy-700 transition-colors cursor-pointer"
            onClick={() => navigate(`/schemes/${scheme.id}`)}>
          {scheme.title}
        </h3>

        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {scheme.shortDescription || scheme.description}
        </p>
      </CardHeader>

      <CardContent className="p-5 pt-0 space-y-3">
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Benefit Grant</span>
            <div className="text-base font-extrabold text-navy-900">
              {scheme.benefitAmount
                ? formatCurrency(scheme.benefitAmount)
                : scheme.benefitType || 'Non-Monetary Benefit'}
            </div>
          </div>
          <div className="h-8 w-8 rounded-full bg-white shadow-xs flex items-center justify-center text-saffron-600">
            <Award className="h-4 w-4" />
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span>Deadline: {formatDate(scheme.applicationEndDate)}</span>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0 gap-2 border-t border-slate-100 mt-2 pt-3 flex justify-between items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/schemes/${scheme.id}`)}
          className="text-xs text-slate-600 hover:text-navy-950 px-2"
        >
          View Details
        </Button>

        {applied ? (
          <Button size="sm" variant="outline" disabled className="text-xs font-semibold bg-slate-50 text-emerald-700 border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
            Applied
          </Button>
        ) : onApply ? (
          <Button
            size="sm"
            onClick={onApply}
            className="text-xs font-semibold bg-navy-900 hover:bg-navy-800 flex items-center gap-1"
          >
            <span>Apply Now</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => navigate(`/student/apply/${scheme.id}`)}
            className="text-xs font-semibold bg-navy-900 hover:bg-navy-800"
          >
            Apply
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

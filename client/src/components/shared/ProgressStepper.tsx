import React from 'react';
import { Check, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StepItem {
  id: string | number;
  title: string;
  description?: string;
  status: 'completed' | 'current' | 'upcoming' | 'error';
  date?: string;
}

interface ProgressStepperProps {
  steps: StepItem[];
  className?: string;
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({ steps, className }) => {
  return (
    <div className={cn('w-full py-2', className)}>
      <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-0">
        {/* Continuous track line behind steps (desktop) */}
        <div className="hidden md:block absolute top-5 left-8 right-8 h-0.5 bg-slate-200 -z-0" />

        {steps.map((step, index) => {
          const isCompleted = step.status === 'completed';
          const isCurrent = step.status === 'current';
          const isError = step.status === 'error';

          return (
            <div
              key={step.id || index}
              className="relative z-10 flex md:flex-col items-center gap-3 md:gap-2 text-left md:text-center w-full md:w-auto"
            >
              {/* Step Icon circle */}
              <div
                className={cn(
                  'h-10 w-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all border-2 bg-white shadow-xs shrink-0',
                  isCompleted && 'border-emerald-600 bg-emerald-600 text-white',
                  isCurrent && 'border-saffron-500 bg-saffron-50 text-saffron-600 ring-4 ring-saffron-100 animate-pulse',
                  isError && 'border-rose-600 bg-rose-50 text-rose-600',
                  !isCompleted && !isCurrent && !isError && 'border-slate-300 text-slate-400'
                )}
              >
                {isCompleted && <Check className="h-5 w-5 stroke-[2.5]" />}
                {isCurrent && <Clock className="h-5 w-5" />}
                {isError && <AlertCircle className="h-5 w-5" />}
                {!isCompleted && !isCurrent && !isError && <span>{index + 1}</span>}
              </div>

              {/* Step info */}
              <div className="flex flex-col">
                <span
                  className={cn(
                    'text-xs font-bold leading-tight',
                    isCompleted && 'text-navy-950',
                    isCurrent && 'text-saffron-700',
                    isError && 'text-rose-700',
                    !isCompleted && !isCurrent && !isError && 'text-slate-400'
                  )}
                >
                  {step.title}
                </span>
                {step.description && (
                  <span className="text-[11px] text-muted-foreground mt-0.5 max-w-[140px] hidden md:block">
                    {step.description}
                  </span>
                )}
                {step.date && (
                  <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                    {step.date}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React from 'react';
import { cn } from '../../lib/utils';
import { Card, CardContent } from '../ui/card';
import { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: { value: number | string; label?: string; isPositive?: boolean };
  className?: string;
  iconColor?: string;
  iconBg?: string;
  onClick?: () => void;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
  iconColor = 'text-navy-600',
  iconBg = 'bg-navy-50',
  onClick,
}: StatCardProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        'transition-all shadow-xs',
        onClick && 'cursor-pointer hover:shadow-md hover:border-navy-300',
        className
      )}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-medium text-slate-500">{title}</p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {description && (
              <p className="text-xs text-slate-400">{description}</p>
            )}
            {trend && (
              <p
                className={cn(
                  'text-xs font-semibold mt-1 flex items-center gap-1',
                  trend.isPositive !== false ? 'text-emerald-600' : 'text-rose-600'
                )}
              >
                <span>{trend.value}</span>
                {trend.label && <span className="font-normal text-slate-500">{trend.label}</span>}
              </p>
            )}
          </div>
          <div className={cn('p-2.5 rounded-xl flex-shrink-0', iconBg)}>
            <Icon className={cn('h-5 w-5', iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { StatCard };

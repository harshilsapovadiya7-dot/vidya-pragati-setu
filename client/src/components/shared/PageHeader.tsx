import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  showBack?: boolean;
  backTo?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  children,
  showBack = false,
  backTo,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          {showBack && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleBack}
              className="h-8 w-8 text-slate-600 hover:text-navy-950 shrink-0"
              title="Go Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-navy-950">
            {title}
          </h1>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground max-w-2xl">
            {description}
          </p>
        )}
      </div>

      {children && (
        <div className="flex items-center flex-wrap gap-2.5 shrink-0">
          {children}
        </div>
      )}
    </div>
  );
};

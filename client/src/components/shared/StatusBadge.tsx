import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  ApplicationStatus,
  PaymentStatus,
  AssetStatus,
  APPLICATION_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
  ASSET_STATUS_CONFIG,
} from '@/lib/constants';

interface StatusBadgeProps {
  status: ApplicationStatus | PaymentStatus | AssetStatus | string;
  type?: 'application' | 'payment' | 'asset' | 'auto';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'auto', className }) => {
  // Check application config
  if ((type === 'auto' || type === 'application') && status in APPLICATION_STATUS_CONFIG) {
    const config = APPLICATION_STATUS_CONFIG[status as ApplicationStatus];
    return (
      <Badge variant={config.variant} className={className}>
        {config.label}
      </Badge>
    );
  }

  // Check payment config
  if ((type === 'auto' || type === 'payment') && status in PAYMENT_STATUS_CONFIG) {
    const config = PAYMENT_STATUS_CONFIG[status as PaymentStatus];
    return (
      <Badge variant={config.variant} className={className}>
        {config.label}
      </Badge>
    );
  }

  // Check asset config
  if ((type === 'auto' || type === 'asset') && status in ASSET_STATUS_CONFIG) {
    const config = ASSET_STATUS_CONFIG[status as AssetStatus];
    return (
      <Badge variant={config.variant} className={className}>
        {config.label}
      </Badge>
    );
  }

  // Fallback
  return (
    <Badge variant="outline" className={className}>
      {status ? status.replace(/_/g, ' ') : 'Unknown'}
    </Badge>
  );
};

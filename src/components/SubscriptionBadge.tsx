import React from 'react';
import { useSubscription } from '@/context/SubscriptionContext';

export const SubscriptionBadge: React.FC = () => {
  const { tier, loading } = useSubscription();

  if (loading) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Loading...
      </span>
    );
  }

  const getBadgeStyles = (tier: string) => {
    switch (tier) {
      case 'star_monthly':
      case 'star_annual':
        return 'bg-yellow-100 text-yellow-800';
      case 'veteran_monthly':
      case 'veteran_annual':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'star_monthly':
        return 'Star (Monthly)';
      case 'star_annual':
        return 'Star (Annual)';
      case 'veteran_monthly':
        return 'Veteran (Monthly)';
      case 'veteran_annual':
        return 'Veteran (Annual)';
      default:
        return 'Free';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeStyles(tier)}`}>
      {getTierLabel(tier)}
    </span>
  );
}; 
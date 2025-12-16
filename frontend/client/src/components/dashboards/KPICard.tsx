import React from 'react';
import { ArrowUp, ArrowDown, TrendingUp, AlertCircle } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  status?: 'normal' | 'warning' | 'critical' | 'success';
  onClick?: () => void;
  className?: string;
}

const statusColors = {
  normal: 'border-l-4 border-l-blue-500 bg-blue-50',
  warning: 'border-l-4 border-l-yellow-500 bg-yellow-50',
  critical: 'border-l-4 border-l-red-500 bg-red-50',
  success: 'border-l-4 border-l-green-500 bg-green-50'
};

const statusIconColors = {
  normal: 'text-blue-600',
  warning: 'text-yellow-600',
  critical: 'text-red-600',
  success: 'text-green-600'
};

export function KPICard({
  title,
  value,
  unit,
  change,
  icon,
  status = 'normal',
  onClick,
  className = ''
}: KPICardProps) {
  return (
    <div
      onClick={onClick}
      className={`p-4 md:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white ${statusColors[status]} ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs md:text-sm font-medium text-gray-600 mb-2 truncate">{title}</p>
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 truncate">
              {typeof value === 'number' ? (value > 1000000 ? `${(value / 1000000).toFixed(1)}M` : value.toLocaleString()) : value}
            </h3>
            {unit && <span className="text-xs md:text-sm text-gray-500 whitespace-nowrap">{unit}</span>}
          </div>
          
          {change && (
            <div className={`flex items-center gap-1 mt-2 md:mt-3 ${change.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {change.isPositive ? (
                <ArrowUp size={14} />
              ) : (
                <ArrowDown size={14} />
              )}
              <span className="text-xs font-semibold">
                {Math.abs(change.value)}% {change.isPositive ? 'up' : 'down'}
              </span>
            </div>
          )}
        </div>

        <div className={`p-2 md:p-3 rounded-lg flex-shrink-0 ${statusColors[status].split(' ')[1]}`}>
          {icon ? (
            <div className={statusIconColors[status]}>
              {icon}
            </div>
          ) : (
            <TrendingUp className={`w-6 h-6 md:w-8 md:h-8 ${statusIconColors[status]}`} />
          )}
        </div>
      </div>
    </div>
  );
}

export default KPICard;

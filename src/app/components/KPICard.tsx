import { Card } from './ui/card';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: number | string;
  icon?: LucideIcon;
  variant?: 'default' | 'warning' | 'danger' | 'success';
  onClick?: () => void;
}

const variantStyles = {
  default: 'border-gray-200 hover:border-gray-300',
  warning: 'border-amber-200 bg-amber-50/50 hover:border-amber-300',
  danger: 'border-red-200 bg-red-50/50 hover:border-red-300',
  success: 'border-green-200 bg-green-50/50 hover:border-green-300',
};

const iconColors = {
  default: 'text-gray-500',
  warning: 'text-amber-600',
  danger: 'text-red-600',
  success: 'text-green-600',
};

export function KPICard({ title, value, icon: Icon, variant = 'default', onClick }: KPICardProps) {
  const isClickable = !!onClick;

  return (
    <Card
      className={`p-4 transition-all ${variantStyles[variant]} ${
        isClickable ? 'cursor-pointer hover:shadow-md' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
        {Icon && (
          <div className={`p-2 rounded-lg bg-background ${iconColors[variant]}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </Card>
  );
}

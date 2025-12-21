import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Users } from 'lucide-react';

interface Segment {
  name: string;
  count: number;
  percentage: number;
}

interface MemberSegmentationChartProps {
  segments: Record<string, {
    count: number;
    percentage: number;
  }>;
  totalMembers: number;
  isLoading?: boolean;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const SEGMENT_DESCRIPTIONS: Record<string, string> = {
  'High-Value Customers': 'Established members with consistent repayment history and high loan activity',
  'Growth Potential': 'Active members showing improvement, ready for increased credit exposure',
  'Standard Members': 'Regular members maintaining normal loan and repayment patterns',
  'At-Risk': 'Members showing signs of financial stress or repayment difficulties',
  'Inactive': 'Members with minimal recent activity, may need reengagement',
};

export const MemberSegmentationChart: React.FC<MemberSegmentationChartProps> = ({
  segments,
  totalMembers,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border/50 shadow-sm p-4 md:p-5">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  const safeSegments = segments && typeof segments === 'object' ? segments : {};
  const chartData: Segment[] = Object.entries(safeSegments).map(([name, data]: any) => ({
    name,
    count: Number(data?.count || 0),
    percentage: Number(data?.percentage || 0),
  }));

  if (chartData.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border/50 shadow-sm p-4 md:p-5">
        <p className="text-muted-foreground text-center py-12">No member data available</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border/50 shadow-sm p-4 md:p-5">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Member Behavioral Segmentation
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {totalMembers} members grouped by behavior and performance patterns
        </p>
      </div>

      <div style={{ width: '100%', height: 300, minWidth: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData as any}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry: any) => `${entry.percentage.toFixed(1)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `${value} members`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {chartData.map((segment, index) => (
          <div key={segment.name} className="border border-border/50 rounded-lg p-3 bg-accent">
            <div className="flex items-start gap-3">
              <div
                className="w-4 h-4 rounded-full flex-shrink-0 mt-1"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              ></div>
              <div className="flex-1">
                <p className="font-medium text-card-foreground">{segment.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {segment.count} members ({segment.percentage.toFixed(1)}%)
                </p>
                <p className="text-xs text-muted-foreground/80 mt-2">
                  {SEGMENT_DESCRIPTIONS[segment.name]}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 bg-purple-500/10 border border-purple-300/40 rounded-lg p-3">
        <p className="text-sm text-purple-300">
          <strong>Insight:</strong> Focus engagement efforts on High-Value and Growth Potential segments 
          to maximize portfolio health, while developing retention strategies for At-Risk and Inactive members.
        </p>
      </div>
    </div>
  );
};

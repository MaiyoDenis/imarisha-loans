import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

interface Prediction {
  date: string;
  forecasted_rate: number;
  lower_bound: number;
  upper_bound: number;
  trend: string;
}

interface ArrearsForcastChartProps {
  data: {
    predictions: Prediction[];
    current_rate: number;
    average_rate: number;
    confidence_level: number;
  };
  isLoading?: boolean;
}

export const ArrearsForcastChart: React.FC<ArrearsForcastChartProps> = ({
  data,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data || !data.predictions || data.predictions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500 text-center py-12">No forecast data available</p>
      </div>
    );
  }

  const chartData = data.predictions.map(pred => ({
    date: new Date(pred.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    rate: parseFloat(pred.forecasted_rate.toFixed(2)),
    upper: parseFloat(pred.upper_bound.toFixed(2)),
    lower: parseFloat(pred.lower_bound.toFixed(2)),
  }));

  const trend = data.predictions[data.predictions.length - 1]?.forecasted_rate > data.current_rate;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Arrears Rate Forecast</h3>
          <p className="text-sm text-gray-500 mt-1">12-month prediction with confidence intervals</p>
        </div>
        <div className="flex items-center gap-2">
          {trend ? (
            <div className="flex items-center gap-1 text-red-600">
              <ArrowUpIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Increasing</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-green-600">
              <ArrowDownIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Decreasing</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Current Rate</p>
          <p className="text-2xl font-bold text-blue-600">{data.current_rate.toFixed(2)}%</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Average Rate</p>
          <p className="text-2xl font-bold text-purple-600">{data.average_rate.toFixed(2)}%</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Confidence Level</p>
          <p className="text-2xl font-bold text-green-600">{data.confidence_level}%</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis label={{ value: 'Arrears Rate (%)', angle: -90, position: 'insideLeft' }} />
          <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
          <Area
            type="monotone"
            dataKey="lower"
            stroke="none"
            fill="transparent"
          />
          <Area
            type="monotone"
            dataKey="rate"
            stroke="#3b82f6"
            fillOpacity={1}
            fill="url(#colorRate)"
          />
          <Area
            type="monotone"
            dataKey="upper"
            stroke="none"
            fill="transparent"
          />
          <Line
            type="monotone"
            dataKey="upper"
            stroke="#ef4444"
            strokeDasharray="5 5"
            dot={false}
            name="Upper Bound"
          />
          <Line
            type="monotone"
            dataKey="lower"
            stroke="#10b981"
            strokeDasharray="5 5"
            dot={false}
            name="Lower Bound"
          />
          <Legend />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Insight:</strong> The forecast suggests {trend ? 'an increasing' : 'a decreasing'} trend in arrears rate over the next 12 months. 
          {trend ? ' Consider implementing preventive measures.' : ' Current strategies appear effective.'}
        </p>
      </div>
    </div>
  );
};

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine, Label } from 'recharts';

interface MatchChartsProps {
  data: any;
}

const MatchCharts: React.FC<MatchChartsProps> = ({ data }) => {
  // Transform advantage data for charts
  const goldAdvantageData = Array.isArray(data?.radiant_gold_adv)
    ? data.radiant_gold_adv.map((adv: number, index: number) => ({
        time: index + 1,
        advantage: adv,
      }))
    : [];

  const xpAdvantageData = Array.isArray(data?.radiant_xp_adv)
    ? data.radiant_xp_adv.map((adv: number, index: number) => ({
        time: index + 1,
        advantage: adv,
      }))
    : [];

  return (
    <div className="space-y-6 mb-8">
      {/* Gold and Experience Advantage Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700 text-white">
          <CardHeader>
            <CardTitle>Net Worth Advantage</CardTitle>
          </CardHeader>
          <CardContent>
            {goldAdvantageData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={goldAdvantageData}>
                  <defs>
                    <linearGradient id="goldSplit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="50%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="50%" stopColor="#EF4444" stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9CA3AF" tickFormatter={(value) => `${value}m`} />
                  <YAxis stroke="#9CA3AF" tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '6px' }}
                    labelFormatter={(label) => `Minute: ${label}`}
                    formatter={(value: number) => [value.toLocaleString(), 'Advantage']}
                  />
                  <ReferenceLine y={0} stroke="#9CA3AF" strokeDasharray="3 3" />
                  <Area type="monotone" dataKey="advantage" stroke="#FBBF24" fill="url(#goldSplit)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">No Gold Advantage data available.</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 text-white">
          <CardHeader>
            <CardTitle>Experience Advantage</CardTitle>
          </CardHeader>
          <CardContent>
            {xpAdvantageData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={xpAdvantageData}>
                    <defs>
                        <linearGradient id="xpSplit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="50%" stopColor="#3B82F6" stopOpacity={0.4} />
                        <stop offset="50%" stopColor="#F59E0B" stopOpacity={0.4} />
                        </linearGradient>
                    </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9CA3AF" tickFormatter={(value) => `${value}m`} />
                  <YAxis stroke="#9CA3AF" tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '6px' }}
                    labelFormatter={(label) => `Minute: ${label}`}
                    formatter={(value: number) => [value.toLocaleString(), 'Advantage']}
                  />
                  <ReferenceLine y={0} stroke="#9CA3AF" strokeDasharray="3 3" />
                  <Area type="monotone" dataKey="advantage" stroke="#A78BFA" fill="url(#xpSplit)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-400">No Experience Advantage data available.</div>
            )}
          </CardContent>
        </Card>
      </div>
       {/* Other charts can be added here once their data is parsed, like teamfights or wards. */}
       {/* For now, they are removed to prevent crashes. */}
    </div>
  );
};

export default MatchCharts;

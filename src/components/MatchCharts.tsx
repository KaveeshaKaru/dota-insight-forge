
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ScatterChart, Scatter } from 'recharts';

interface MatchChartsProps {
  data: any;
}

const MatchCharts: React.FC<MatchChartsProps> = ({ data }) => {
  return (
    <div className="space-y-6 mb-8">
      {/* Gold and Experience Progression */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700 text-white">
          <CardHeader>
            <CardTitle>Gold Progression</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.goldProgression}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="time" 
                  stroke="#9CA3AF"
                  tickFormatter={(value) => `${Math.floor(value/60)}m`}
                />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '6px'
                  }}
                  labelFormatter={(value) => `${Math.floor(value/60)}:${(value%60).toString().padStart(2, '0')}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="radiant" 
                  stackId="1" 
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.3}
                  name="Radiant"
                />
                <Area 
                  type="monotone" 
                  dataKey="dire" 
                  stackId="2" 
                  stroke="#EF4444" 
                  fill="#EF4444" 
                  fillOpacity={0.3}
                  name="Dire"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 text-white">
          <CardHeader>
            <CardTitle>Experience Progression</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.xpProgression}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="time" 
                  stroke="#9CA3AF"
                  tickFormatter={(value) => `${Math.floor(value/60)}m`}
                />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '6px'
                  }}
                  labelFormatter={(value) => `${Math.floor(value/60)}:${(value%60).toString().padStart(2, '0')}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="radiant" 
                  stackId="1" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.3}
                  name="Radiant"
                />
                <Area 
                  type="monotone" 
                  dataKey="dire" 
                  stackId="2" 
                  stroke="#F59E0B" 
                  fill="#F59E0B" 
                  fillOpacity={0.3}
                  name="Dire"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Team Fights and Ward Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700 text-white">
          <CardHeader>
            <CardTitle>Team Fight Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={data.teamFights}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="time" 
                  stroke="#9CA3AF"
                  tickFormatter={(value) => `${Math.floor(value/60)}m`}
                />
                <YAxis 
                  dataKey="deaths" 
                  stroke="#9CA3AF"
                  domain={[0, 10]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '6px'
                  }}
                  formatter={(value, name) => [value, name === 'radiantDeaths' ? 'Radiant Deaths' : 'Dire Deaths']}
                  labelFormatter={(value) => `Time: ${Math.floor(value/60)}:${(value%60).toString().padStart(2, '0')}`}
                />
                <Scatter 
                  dataKey="radiantDeaths" 
                  fill="#10B981" 
                  name="Radiant Deaths"
                />
                <Scatter 
                  dataKey="direDeaths" 
                  fill="#EF4444" 
                  name="Dire Deaths"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 text-white">
          <CardHeader>
            <CardTitle>Ward Placement Map</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-[300px] bg-slate-700/50 rounded-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-red-900/20"></div>
              
              {/* Mock map with ward placements */}
              <div className="relative w-full h-full">
                {data.wardPlacements.map((ward: any, index: number) => (
                  <div
                    key={index}
                    className={`absolute w-3 h-3 rounded-full ${
                      ward.team === 'radiant' ? 'bg-green-400' : 'bg-red-400'
                    } shadow-lg border-2 border-white`}
                    style={{
                      left: `${ward.x}%`,
                      top: `${ward.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    title={`${ward.team} ward at ${Math.floor(ward.time/60)}:${(ward.time%60).toString().padStart(2, '0')}`}
                  />
                ))}
              </div>
              
              <div className="absolute bottom-2 left-2 text-xs text-gray-400">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Radiant Wards</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <span>Dire Wards</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MatchCharts;

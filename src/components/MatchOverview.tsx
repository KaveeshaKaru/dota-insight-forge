
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MatchOverviewProps {
  data: any;
}

const MatchOverview: React.FC<MatchOverviewProps> = ({ data }) => {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Match Result */}
      <Card className="bg-slate-800/50 border-slate-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Match Result
            <Badge 
              className={`${data.radiantWin ? 'bg-green-600' : 'bg-red-600'} text-white`}
            >
              {data.radiantWin ? 'Radiant Victory' : 'Dire Victory'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Duration:</span>
              <span className="font-semibold">{formatDuration(data.duration)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Game Mode:</span>
              <span className="font-semibold">{data.gameMode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Lobby Type:</span>
              <span className="font-semibold">{data.lobbyType}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Scores */}
      <Card className="bg-slate-800/50 border-slate-700 text-white">
        <CardHeader>
          <CardTitle>Team Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-900/30 rounded-lg">
              <span className="font-semibold text-green-400">Radiant</span>
              <span className="text-2xl font-bold">{data.radiantScore}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-900/30 rounded-lg">
              <span className="font-semibold text-red-400">Dire</span>
              <span className="text-2xl font-bold">{data.direScore}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Match Stats */}
      <Card className="bg-slate-800/50 border-slate-700 text-white">
        <CardHeader>
          <CardTitle>Match Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Kills:</span>
              <span className="font-semibold">{data.totalKills}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">First Blood:</span>
              <span className="font-semibold">{formatDuration(data.firstBloodTime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Towers Destroyed:</span>
              <span className="font-semibold">{data.towersDestroyed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Roshan Kills:</span>
              <span className="font-semibold">{data.roshanKills}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MatchOverview;

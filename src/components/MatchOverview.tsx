import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MatchOverviewProps {
  data: any;
}

// Helper to get game mode and lobby type names. In a real app, this would be more extensive.
const gameModeMap: { [key: string]: string } = { '22': 'All Pick', '4': 'Captain\'s Mode', '3': 'Random Draft', '23': 'Turbo' };
const lobbyTypeMap: { [key: string]: string } = { '7': 'Ranked', '0': 'Normal', '1': 'Practice' };

const MatchOverview: React.FC<MatchOverviewProps> = ({ data }) => {
  const formatDuration = (seconds: number) => {
    if (isNaN(seconds) || seconds === null) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const radiantScore = data?.radiant_score ?? 'N/A';
  const direScore = data?.dire_score ?? 'N/A';
  const totalKills = (data?.radiant_score ?? 0) + (data?.dire_score ?? 0);
  const gameMode = gameModeMap[data?.game_mode] || `Mode ${data?.game_mode || 'N/A'}`;
  const lobbyType = lobbyTypeMap[data?.lobby_type] || `Lobby ${data?.lobby_type || 'N/A'}`;

  // Calculate tower and roshan kills from objectives if available
  // Radiant team is 2, Dire team is 3 in OpenDota objectives
  const radiantTowersKilled =
    Array.isArray(data?.objectives)
      ? data.objectives.filter(obj => obj.type === 'tower_kill' && obj.team === 2).length
      : 0;

  const direTowersKilled =
    Array.isArray(data?.objectives)
      ? data.objectives.filter(obj => obj.type === 'tower_kill' && obj.team === 3).length
      : 0;
  const roshanKills = data?.objectives?.filter((obj: any) => obj.type === 'CHAT_MESSAGE_ROSHAN_KILL').length ?? 0;
  
  const towerDisplay = `${radiantTowersKilled} (R) / ${direTowersKilled} (D)`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Match Result */}
      <Card className="bg-slate-800/50 border-slate-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Match Result
            {data?.radiant_win !== undefined && (
              <Badge
                className={`${data.radiant_win ? 'bg-green-600' : 'bg-red-600'} text-white`}
              >
                {data.radiant_win ? 'Radiant Victory' : 'Dire Victory'}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Duration:</span>
              <span className="font-semibold">{formatDuration(data?.duration)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Game Mode:</span>
              <span className="font-semibold">{gameMode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Lobby Type:</span>
              <span className="font-semibold">{lobbyType}</span>
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
            <div className="flex items-center justify-between p-3 bg-green-900/90 rounded-lg">
              <span className="font-semibold text-green-400">Radiant</span>
              <span className="text-2xl font-bold">{radiantScore}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-900/90 rounded-lg">
              <span className="font-semibold text-red-400">Dire</span>
              <span className="text-2xl font-bold">{direScore}</span>
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
              <span className="font-semibold">{totalKills}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">First Blood:</span>
              <span className="font-semibold">{formatDuration(data?.first_blood_time)}</span>
            </div>
            {/* <div className="flex justify-between">
              <span className="text-gray-400">Towers Destroyed:</span>
              <span className="font-semibold">{towerDisplay}</span>
            </div> */}
            <div className="flex justify-between">
              <span className="text-gray-400">Roshan Kills:</span>
              <span className="font-semibold">{roshanKills}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MatchOverview;

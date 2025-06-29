
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Player {
  id: number;
  name: string;
  hero: string;
  team: 'radiant' | 'dire';
  kills: number;
  deaths: number;
  assists: number;
  gpm: number;
  xpm: number;
  netWorth: number;
  items: string[];
  level: number;
  lastHits: number;
  denies: number;
}

interface PlayerStatsProps {
  players: Player[];
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ players }) => {
  const radiantPlayers = players.filter(p => p.team === 'radiant');
  const direPlayers = players.filter(p => p.team === 'dire');

  const PlayerCard: React.FC<{ player: Player }> = ({ player }) => (
    <div className="bg-slate-700/50 rounded-lg p-4 space-y-3">
      <div className="flex items-center space-x-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={`/heroes/${player.hero.toLowerCase()}.jpg`} />
          <AvatarFallback className="bg-slate-600 text-white">
            {player.hero.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h4 className="font-semibold text-white">{player.name}</h4>
          <p className="text-sm text-gray-400">{player.hero}</p>
        </div>
        <Badge variant="outline" className="ml-auto text-yellow-400 border-yellow-400">
          Level {player.level}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-lg font-bold text-green-400">{player.kills}</div>
          <div className="text-xs text-gray-400">KILLS</div>
        </div>
        <div>
          <div className="text-lg font-bold text-red-400">{player.deaths}</div>
          <div className="text-xs text-gray-400">DEATHS</div>
        </div>
        <div>
          <div className="text-lg font-bold text-blue-400">{player.assists}</div>
          <div className="text-xs text-gray-400">ASSISTS</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">GPM:</span>
          <span className="text-yellow-400 font-semibold">{player.gpm}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">XPM:</span>
          <span className="text-blue-400 font-semibold">{player.xpm}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Net Worth:</span>
          <span className="text-green-400 font-semibold">{player.netWorth.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">LH/D:</span>
          <span className="text-white font-semibold">{player.lastHits}/{player.denies}</span>
        </div>
      </div>

      <div>
        <h5 className="text-sm font-semibold text-gray-300 mb-2">Items:</h5>
        <div className="grid grid-cols-6 gap-1">
          {player.items.map((item, index) => (
            <div
              key={index}
              className="aspect-square bg-slate-600 rounded border border-slate-500 flex items-center justify-center"
              title={item}
            >
              <span className="text-xs text-gray-300">{item.substring(0, 2).toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 mb-8">
      {/* Radiant Team */}
      <Card className="bg-slate-800/50 border-slate-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span>Radiant Team</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {radiantPlayers.map(player => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dire Team */}
      <Card className="bg-slate-800/50 border-slate-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span>Dire Team</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {direPlayers.map(player => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayerStats;

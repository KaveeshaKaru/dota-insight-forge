
import React from 'react';
import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MatchOverview from './MatchOverview';
import PlayerStats from './PlayerStats';
import MatchCharts from './MatchCharts';
import GameplayInsights from './GameplayInsights';
import { mockMatchData } from '@/data/mockMatchData';

interface MatchAnalysisProps {
  matchId: string;
  steamId?: string;
  onBack: () => void;
}

const MatchAnalysis: React.FC<MatchAnalysisProps> = ({ matchId, steamId, onBack }) => {
  const matchData = mockMatchData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              onClick={onBack}
              variant="ghost"
              className="text-gray-300 hover:text-white mb-4"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Search
            </Button>
            
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-2">
                Match Analysis
              </h1>
              <p className="text-gray-400">Match ID: {matchId}</p>
            </div>
          </div>

          {/* Match Overview */}
          <MatchOverview data={matchData} />

          {/* Player Statistics */}
          <PlayerStats players={matchData.players} />

          {/* Charts and Visualizations */}
          <MatchCharts data={matchData} />

          {/* Gameplay Insights */}
          <GameplayInsights data={matchData} steamId={steamId} />
        </div>
      </div>
    </div>
  );
};

export default MatchAnalysis;

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
    <div className="min-h-screen relative overflow-hidden">
      {/* Video Background */}
      <div className="fixed inset-0 w-full h-full z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute min-w-full min-h-full object-cover"
        >
          <source src="/SpectreLooped.mp4" type="video/mp4" />
        </video>
        {/* Overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-blue-900/90 to-slate-800/95"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              onClick={onBack}
              variant="ghost"
              className="text-gray-300 hover:text-white mb-4 backdrop-blur-sm"
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

          {/* Match Overview with backdrop blur */}
          <div className="backdrop-blur-sm">
            <MatchOverview data={matchData} />
          </div>

          {/* Player Statistics with backdrop blur */}
          <div className="backdrop-blur-sm">
            <PlayerStats players={matchData.players} />
          </div>

          {/* Charts and Visualizations with backdrop blur */}
          <div className="backdrop-blur-sm">
            <MatchCharts data={matchData} />
          </div>

          {/* Gameplay Insights with backdrop blur */}
          <div className="backdrop-blur-sm">
            <GameplayInsights data={matchData} steamId={steamId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchAnalysis;

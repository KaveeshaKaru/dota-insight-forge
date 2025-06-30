import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MatchOverview from './MatchOverview';
import PlayerStats from './PlayerStats';
import MatchCharts from './MatchCharts';
import GameplayInsights from './GameplayInsights';

interface MatchAnalysisProps {
  matchId: string;
  steamId?: string;
  onBack: () => void;
}

const MatchAnalysis: React.FC<MatchAnalysisProps> = ({ matchId, steamId, onBack }) => {
  const [matchData, setMatchData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!matchId) return;
    const fetchMatchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://api.opendota.com/api/matches/${matchId}`);
        if (!response.ok) throw new Error(`Failed to fetch match data: ${response.statusText} (Status: ${response.status})`);
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        setMatchData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatchData();
  }, [matchId]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Video Background */}
      <div className="fixed inset-0 w-full h-full z-0">
        <video autoPlay loop muted playsInline className="absolute min-w-full min-h-full object-cover">
          <source src="/SpectreLooped.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-blue-900/60 to-slate-800/70"></div>

      </div>

      {/* Content */}
      <div className="relative z-10 py-6">
        {/* Centered content container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Button onClick={onBack} variant="ghost" className="text-gray-300 hover:text-white mb-4 backdrop-blur-sm">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Search
            </Button>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-2">Match Analysis</h1>
              <p className="text-gray-400">Match ID: {matchId}</p>
            </div>
          </div>
          {loading && (
            <div className="flex flex-col items-center justify-center text-white text-center p-8 bg-slate-800/50 rounded-lg">
              <Loader2 className="h-12 w-12 animate-spin mb-4" />
              <p className="text-xl font-semibold">Fetching Match Data...</p>
            </div>
          )}
          {error && (
            <div className="flex flex-col items-center justify-center text-white text-center p-8 bg-red-900/50 rounded-lg">
              <AlertTriangle className="h-12 w-12 text-red-400 mb-4" />
              <p className="text-xl font-semibold">Error Fetching Data</p>
              <p className="text-red-300">{error}</p>
            </div>
          )}
        </div>

        {/* Render components once data is available */}
        {!loading && !error && matchData && (
          <div className="space-y-8">
            {/* Centered Component */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="backdrop-blur-sm">
                <MatchOverview data={matchData} />
              </div>
            </div>

            {/* Full-width component (it controls its own padding) */}
            <div className="backdrop-blur-sm">
              <PlayerStats players={matchData.players} />
            </div>

            {/* Centered Components */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="backdrop-blur-sm">
                <MatchCharts data={matchData} />
              </div>
              <div className="backdrop-blur-sm">
                <GameplayInsights data={matchData} steamId={steamId} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchAnalysis;

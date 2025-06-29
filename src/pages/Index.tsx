
import React, { useState } from 'react';
import { SearchIcon, BarChart3, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MatchAnalysis from '@/components/MatchAnalysis';

const Index = () => {
  const [matchId, setMatchId] = useState('');
  const [steamId, setSteamId] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const handleAnalyze = async () => {
    if (!matchId.trim()) return;
    
    setIsAnalyzing(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsAnalyzing(false);
    setShowAnalysis(true);
  };

  const handleReset = () => {
    setShowAnalysis(false);
    setMatchId('');
    setSteamId('');
  };

  if (showAnalysis) {
    return <MatchAnalysis matchId={matchId} steamId={steamId} onBack={handleReset} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-yellow-600/20"></div>
        <div className="relative px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Dota 2 Match
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-yellow-400">
                {" "}Analyzer
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300 max-w-2xl mx-auto">
              Comprehensive match analysis tool providing detailed statistics, visualizations, 
              and strategic insights to improve your gameplay.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 mb-16">
            <Card className="bg-slate-800/50 border-slate-700 text-white">
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-red-400 mb-2" />
                <CardTitle>Match Statistics</CardTitle>
                <CardDescription className="text-gray-400">
                  Detailed KDA, GPM, XPM, and net worth analysis
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700 text-white">
              <CardHeader>
                <ChartIcon className="h-8 w-8 text-yellow-400 mb-2" />
                <CardTitle>Visual Analytics</CardTitle>
                <CardDescription className="text-gray-400">
                  Gold graphs, team fights, and ward placement maps
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700 text-white">
              <CardHeader>
                <Zap className="h-8 w-8 text-blue-400 mb-2" />
                <CardTitle>Strategic Insights</CardTitle>
                <CardDescription className="text-gray-400">
                  AI-powered suggestions to improve your gameplay
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Input Section */}
          <Card className="bg-slate-800/50 border-slate-700 text-white max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Analyze Your Match</CardTitle>
              <CardDescription className="text-center text-gray-400">
                Enter your Dota 2 match ID to get comprehensive analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Match ID *
                </label>
                <Input
                  type="text"
                  placeholder="e.g., 7123456789"
                  value={matchId}
                  onChange={(e) => setMatchId(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Steam ID (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="e.g., 76561198000000000"
                  value={steamId}
                  onChange={(e) => setSteamId(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                />
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={!matchId.trim() || isAnalyzing}
                className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-semibold"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analyzing Match...
                  </>
                ) : (
                  <>
                    <SearchIcon className="h-4 w-4 mr-2" />
                    Analyze Match
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Custom Chart Icon component since chart-line isn't in our allowed icons
const ChartIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

export default Index;

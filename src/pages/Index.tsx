import React, { useState } from 'react';
import { SearchIcon, BarChart3, Users, Zap, Shield, Sword, Target, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MatchAnalysis from '@/components/MatchAnalysis';
import { Link as RouterLink } from 'react-router-dom';

const Index = () => {
  const [matchId, setMatchId] = useState('');
  const [steamId, setSteamId] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
      {/* Main Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/Panthom.jpg)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/90 to-slate-900"></div>
      </div>

      {/* Gaming Header */}
      <header className="relative z-50">
        <nav className="border-b border-slate-700/50 backdrop-blur-md bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-yellow-500 rounded-lg flex items-center justify-center transform rotate-45">
                    <div className="w-6 h-6 bg-slate-900 rounded-md flex items-center justify-center transform -rotate-45">
                      <Sword className="w-4 h-4 text-red-500" />
                    </div>
                  </div>
                  <span className="text-xl font-bold text-white tracking-wider">
                    DOTA<span className="text-red-500">INSIGHT</span>
                  </span>
                </div>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <RouterLink to="/" className="text-gray-300 hover:text-white transition-colors">Home</RouterLink>
                <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
                <RouterLink to="/counter-picker" className="text-gray-300 hover:text-white transition-colors">Counter Picker</RouterLink>
                <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Testimonials</a>
                <Button
                  variant="ghost"
                  className="bg-gradient-to-r from-red-500 to-yellow-500 text-white hover:from-red-600 hover:to-yellow-600 border-none"
                >
                  Connect Steam
                </Button>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-gray-300 hover:text-white"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-slate-800/95 backdrop-blur-md border-t border-slate-700/50">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <RouterLink to="/" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-700/50 transition-colors">
                  Home
                </RouterLink>
                <RouterLink to="/counter-picker" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-700/50 transition-colors">
                  Counter Picker
                </RouterLink>
                <RouterLink to="/matches/7891739226" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-700/50 transition-colors">
                  Match Analysis
                </RouterLink>
                <Button
                  variant="ghost"
                  className="w-full bg-gradient-to-r from-red-500 to-yellow-500 text-white hover:from-red-600 hover:to-yellow-600 border-none mt-2"
                >
                  Connect Steam
                </Button>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <div className="relative min-h-[600px] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-transparent"></div>

        {/* Phantom Assassin Image */}
        <div className="absolute left-0 top-1/2 w-[600px] h-[600px] pointer-events-none z-20 animate-float-reverse">
          <img
            src="/PhantomHero.png"
            alt="Phantom Assassin"
            className="w-full h-full object-contain animate-phantom-pulse"
          />
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-cyan-500/20 blur-3xl -z-10 animate-pulse"></div>
        </div>

        {/* Lina Image */}
        <div className="absolute right-0 top-1/2 w-[600px] h-[600px] pointer-events-none z-20 animate-float">
          <img
            src="/lina.png"
            alt="Lina"
            className="w-full h-full object-contain animate-flame-pulse"
          />
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-orange-500/20 blur-3xl -z-10 animate-pulse"></div>
        </div>

        <div className="relative px-4 py-20 sm:px-6 lg:px-8 z-10 w-full">
          <div className="text-center animate-fade-in max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl mb-4 animate-scale-in">
                Dota 2 Match
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-yellow-400 to-red-500">
                  {" "}Analyzer
                </span>
              </h1>
              <div className="w-32 h-1 bg-gradient-to-r from-red-500 to-yellow-500 mx-auto mb-6"></div>
            </div>

            <p className="mt-6 text-xl leading-8 text-gray-300 max-w-3xl mx-auto">
              Unlock the secrets of your gameplay with our comprehensive match analysis tool.
              Get detailed statistics, visualizations, and AI-powered insights to dominate the Ancient.
            </p>

            <div className="mt-8 flex justify-center space-x-4">
              <div className="px-4 py-2 bg-red-600/20 rounded-full border border-red-500/30 backdrop-blur-sm">
                <span className="text-red-400 font-medium">Professional Analysis</span>
              </div>
              <div className="px-4 py-2 bg-blue-600/20 rounded-full border border-blue-500/30 backdrop-blur-sm">
                <span className="text-blue-400 font-medium">Real-time Data</span>
              </div>
              <div className="px-4 py-2 bg-yellow-600/20 rounded-full border border-yellow-500/30 backdrop-blur-sm">
                <span className="text-yellow-400 font-medium">AI Insights</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section with Shadow Fiend Background */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 relative">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{ backgroundImage: 'url(/shadow.jpg)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/90 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl font-bold text-white mb-4">
              Why Choose Our Analyzer?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Join thousands of Dota 2 players who have improved their gameplay with our advanced analytics
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center animate-fade-in delay-300">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-white">10M+</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Matches Analyzed</h3>
              <p className="text-gray-400">Comprehensive data from millions of matches</p>
            </div>

            <div className="text-center animate-fade-in delay-500">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-white">500K+</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Active Users</h3>
              <p className="text-gray-400">Trusted by the Dota 2 community worldwide</p>
            </div>

            <div className="text-center animate-fade-in delay-700">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-white">99.9%</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Accuracy Rate</h3>
              <p className="text-gray-400">Precise data analysis and insights</p>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 mb-16">
            <Card className="bg-slate-800/50 border-slate-700 text-white hover:bg-slate-800/70 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-red-500/10 animate-fade-in delay-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Advanced Statistics</CardTitle>
                <CardDescription className="text-gray-400">
                  Deep dive into KDA, GPM, XPM, net worth, and item progression analysis
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 text-white hover:bg-slate-800/70 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/10 animate-fade-in delay-500">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <ChartIcon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Visual Analytics</CardTitle>
                <CardDescription className="text-gray-400">
                  Interactive gold graphs, team fight timelines, and strategic ward placement maps
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 text-white hover:bg-slate-800/70 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-yellow-500/10 animate-fade-in delay-700">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">AI-Powered Insights</CardTitle>
                <CardDescription className="text-gray-400">
                  Smart recommendations and gameplay improvements based on match analysis
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-yellow-600/10 rounded-3xl blur-xl"></div>
            <Card className="bg-slate-800/70 border-slate-700 text-white max-w-3xl mx-auto relative backdrop-blur-sm animate-fade-in delay-900">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-3xl mb-2 bg-gradient-to-r from-red-400 to-yellow-400 bg-clip-text text-transparent">
                  Ready to Analyze Your Match?
                </CardTitle>
                <CardDescription className="text-gray-300 text-lg">
                  Enter your Dota 2 match ID and unlock comprehensive insights to improve your gameplay
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 px-6 pb-8">
                {/* Match ID Input */}
                <div className="w-full max-w-md mx-auto">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Match ID <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="e.g., 7123456789"
                    value={matchId}
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                      setMatchId(numericValue);
                    }}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedData = e.clipboardData.getData('text');
                      const numericValue = pastedData.replace(/[^0-9]/g, '').slice(0, 10);
                      setMatchId(numericValue);
                    }}
                    maxLength={10}
                    className="w-full h-12 bg-slate-700/50 border border-slate-600 text-white placeholder:text-gray-400 text-lg rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none transition-all duration-200"
                  />
                </div>

                {/* Analyze Button */}
                <div className="w-full max-w-md mx-auto">
                  <Button
                    onClick={handleAnalyze}
                    disabled={!matchId.trim() || isAnalyzing}
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-red-600 via-red-500 to-yellow-500 hover:from-red-700 hover:via-red-600 hover:to-yellow-600 text-white transition-all duration-300 rounded-lg shadow-md hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Analyzing Match...
                      </>
                    ) : (
                      <>
                        <SearchIcon className="h-5 w-5 mr-3" />
                        Analyze Match Now
                      </>
                    )}
                  </Button>
                </div>

                {/* Note */}
                <p className="text-center text-sm text-gray-400">
                  Get your match ID from <span className="text-red-400 font-medium">Dota 2</span> or{" "}
                  <span className="text-blue-400 font-medium">OpenDota</span>.
                </p>
              </CardContent>

            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400">
              Built for the Dota 2 community with ❤️ | Powered by Zack Malli
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Custom Chart Icon component
const ChartIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012-2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

export default Index;

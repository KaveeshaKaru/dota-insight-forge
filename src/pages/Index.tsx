import React, { useState } from 'react';
import { SearchIcon, BarChart3, Users, Zap, Shield, Sword, Target, Menu, X, BrainCircuit, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MatchAnalysis from '@/components/MatchAnalysis';
import { Link as RouterLink } from 'react-router-dom';
import ScrambledText from '../components/ScrambleText';

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
      <div id="features" className="py-16 px-4 sm:px-6 lg:px-8 relative">
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
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2 mb-16">
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6 text-white" />}
              title="Advanced Statistics"
              description="Deep dive into KDA, GPM, XPM, net worth, and item progression analysis"
              shadowColor="red"
              link="/match-analysis"
            />
             <FeatureCard
              icon={<Bot className="h-6 w-6 text-white" />}
              title="Counter Picker"
              description="Get best hero suggestions to counter your opponents and synergize with your team."
              shadowColor="blue"
              link="/counter-picker"
            />
            <FeatureCard
              icon={<Users className="h-6 w-6 text-white" />}
              title="Team Fight Analysis"
              description="Break down crucial team fights to understand positioning, ability usage, and impact"
              shadowColor="yellow"
              link="/match-analysis"
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6 text-white" />}
              title="Performance Benchmarking"
              description="Compare your performance against benchmarks for your bracket and hero"
              shadowColor="purple"
              link="/match-analysis"
            />
          </div>
        </div>
      </div>
    </div>
  );
};


const FeatureCard = ({ icon, title, description, shadowColor, link }) => {
  const shadowVariants = {
    red: 'hover:shadow-red-500/20',
    blue: 'hover:shadow-blue-500/20',
    green: 'hover:shadow-green-500/20',
    yellow: 'hover:shadow-yellow-500/20',
    purple: 'hover:shadow-purple-500/20',
    pink: 'hover:shadow-pink-500/20',
  };

  const content = (
      <Card className={`bg-slate-800/50 border-slate-700 text-white h-full flex flex-col hover:bg-slate-800/70 transition-all duration-300 hover:scale-105 hover:shadow-xl ${shadowVariants[shadowColor] || ''}`}>
        <CardHeader>
          <div className={`w-12 h-12 bg-gradient-to-r from-${shadowColor}-500 to-${shadowColor}-600 rounded-lg flex items-center justify-center mb-4`}>
            {icon}
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription className="text-gray-400">
            {description}
          </CardDescription>
        </CardHeader>
      </Card>
  );

  if (link) {
    return <RouterLink to={link} className="h-full">{content}</RouterLink>
  }

  return content;
}

export default Index;

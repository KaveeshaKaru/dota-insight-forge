import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { AlertTriangle, TrendingUp, Eye, Target, Shield, Zap, Clock, Users, Trophy, Brain, Swords, Award, Activity, Loader2 } from 'lucide-react';
import { heroService } from '../services/hero-service';

// --- Interfaces and Type Definitions ---
interface GameplayInsightsProps {
  data: any;
  steamId?: string;
}

interface Insight {
  type: string;
  icon: React.ElementType;
  title: string;
  description: string;
  suggestion: string;
  severity: string;
}

interface CoachingRecommendations {
  priority_focus_areas: string[];
  improvement_potential: string;
}

interface AiAnalysis {
  insights: Insight[];
  coaching_recommendations: CoachingRecommendations;
}

const iconMap: { [key: string]: React.ElementType } = {
  warning: AlertTriangle, improvement: TrendingUp, vision: Eye, objective: Target, farming: Activity, itemization: Award,
  positioning: Users, timing: Clock, aggression: Zap, macro: Brain, laning: Target, resources: Trophy, teamfighting: Swords,
  economy: Award, default: Brain
};

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY; 

// --- Helper Functions for Performance Metrics (Client-Side Calculations) ---
const getGrade = (score: number): string => { if (score >= 90) return 'A+'; if (score >= 80) return 'A'; if (score >= 70) return 'B'; if (score >= 60) return 'C'; if (score >= 50) return 'D'; return 'F'; };
const getColor = (score: number): string => { if (score >= 80) return 'blue'; if (score >= 70) return 'green'; if (score >= 60) return 'yellow'; return 'red'; };
const calculateFarmingScore = (gpm: number): number => { if (gpm >= 700) return 95; if (gpm >= 600) return 85; if (gpm >= 550) return 80; if (gpm >= 450) return 70; if (gpm >= 350) return 60; if (gpm >= 250) return 45; return 30; };
const calculateTeamfightScore = (player: any, teamTotalKills: number): number => { if (teamTotalKills === 0) return 50; const participation = ((player.kills || 0) + (player.assists || 0)) / teamTotalKills; const kda = ((player.kills || 0) + (player.assists || 0)) / (player.deaths || 1); const participationScore = Math.min(participation * 100, 100); const kdaScore = Math.min((kda / 5) * 100, 100); return Math.round((participationScore * 0.6) + (kdaScore * 0.4)); };
const calculateVisionScore = (wardsPlaced: number, durationMinutes: number): number => { if (durationMinutes === 0) return 0; const wardsPer10Min = (wardsPlaced / durationMinutes) * 10; if (wardsPer10Min >= 7) return 90; if (wardsPer10Min >= 5) return 75; if (wardsPer10Min >= 3) return 60; if (wardsPer10Min >= 1) return 40; return 20; };

// Helper functions for styling
  const getSeverityColor = (severity: string) => {
  switch (severity.toLowerCase()) {
    case 'high':
      return 'bg-red-500/20 border-red-500 text-red-300';
    case 'medium':
      return 'bg-yellow-500/20 border-yellow-500 text-yellow-300';
    case 'low':
      return 'bg-green-500/20 border-green-500 text-green-300';
    default:
      return 'bg-gray-500/20 border-gray-500 text-gray-300';
  }
};

const getSeverityBadgeColor = (severity: string) => {
  switch (severity.toLowerCase()) {
    case 'high':
      return 'bg-red-600 hover:bg-red-700';
    case 'medium':
      return 'bg-yellow-600 hover:bg-yellow-700';
    case 'low':
      return 'bg-green-600 hover:bg-green-700';
    default:
      return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
    case 'strength':
      return 'text-green-400';
    case 'weakness':
      return 'text-red-400';
    case 'opportunity':
      return 'text-blue-400';
    default:
      return 'text-gray-400';
  }
};

const GameplayInsights: React.FC<GameplayInsightsProps> = ({ data, steamId }) => {
  // State for AI-driven analysis
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysis | null>(null);
  const [loadingAi, setLoadingAi] = useState(true);
  const [errorAi, setErrorAi] = useState<string | null>(null);

  // State for client-side calculated performance highlights
  const [performanceMetrics, setPerformanceMetrics] = useState<any[]>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  // useEffect for AI-Generated Insights AND Coaching Tips
  useEffect(() => {
    if (!data) return;

    const generateAiContent = async () => {
      setLoadingAi(true);
      setErrorAi(null);

      try {
        const heroMap = await heroService.getHeroMap();
        if (!heroMap) throw new Error("Hero data map is not available.");

        // Create a summary with hero names instead of IDs
        const summary = {
          players: data.players.map((p: any) => ({
            hero_name: heroMap[p.hero_id]?.localized_name || `Hero ID ${p.hero_id}`,
            is_radiant: p.is_radiant,
            kills: p.kills,
            deaths: p.deaths,
            assists: p.assists,
            gpm: p.gold_per_min,
            xpm: p.xp_per_min,
            net_worth: p.net_worth,
          })),
        };

        const prompt = `
            You are an expert Dota 2 analyst. Analyze the following JSON data for a Dota 2 match.
            Match Data:
            ${JSON.stringify(summary, null, 2)}
            Your response MUST be a single, valid JSON object. Do not include any text, notes, or markdown formatting outside of the JSON object.
            The JSON object must have two top-level keys: "insights" and "coaching_recommendations".
            1. "insights" should be an array of 5-7 objects. Refer to players by their hero_name, NOT an ID. Each object has: "type", "title", "description", "suggestion", "severity".
            2. "coaching_recommendations" should be an object with two keys: "priority_focus_areas" (array of 3-4 strings) and "improvement_potential" (a single string).
        `;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        });

        if (!response.ok) throw new Error(`Gemini API request failed: ${response.statusText}`);

        const geminiData = await response.json();
        const textResponse = geminiData.candidates[0].content.parts[0].text;
        const cleanedJson = textResponse.replace(/```json|```/g, '').trim();
        const parsedAnalysis = JSON.parse(cleanedJson);

        const insightsWithIcons = parsedAnalysis.insights.map((insight: any) => ({ ...insight, icon: iconMap[insight.type] || iconMap.default }));
        setAiAnalysis({ insights: insightsWithIcons, coaching_recommendations: parsedAnalysis.coaching_recommendations });
      } catch (err) {
        console.error("Error generating or parsing AI content:", err);
        setErrorAi(err instanceof Error ? err.message : 'Failed to generate AI content.');
      } finally {
        setLoadingAi(false);
      }
    };
    generateAiContent();
  }, [data]);

  // useEffect for Client-Side Calculated Performance Highlights
  useEffect(() => {
    // This logic remains the same as before
    setLoadingMetrics(true);
    if (!data || !data.players || data.players.length === 0) { setLoadingMetrics(false); return; }
    const players = data.players;
    const durationMinutes = (data.duration || 0) / 60;
    const topFarmer = [...players].sort((a, b) => (b.gold_per_min || 0) - (a.gold_per_min || 0))[0];
    const topFighter = [...players].sort((a, b) => ((b.kills || 0) + (b.assists || 0)) - ((a.kills || 0) + (a.assists || 0)))[0];
    const topWarder = [...players].sort((a, b) => (b.obs_placed || 0) - (a.obs_placed || 0))[0];
    const topNetWorth = [...players].sort((a, b) => (b.net_worth || 0) - (a.net_worth || 0))[0];
    const farmingScore = calculateFarmingScore(topFarmer.gold_per_min || 0);
    const teamTotalKills = players.filter((p: any) => p.is_radiant === topFighter.is_radiant).reduce((sum: number, p: any) => sum + (p.kills || 0), 0);
    const teamfightScore = calculateTeamfightScore(topFighter, teamTotalKills);
    const visionScore = calculateVisionScore(topWarder.obs_placed || 0, durationMinutes);
    const economyScore = Math.round(Math.min((topNetWorth.net_worth / 50000) * 100, 100));
    setPerformanceMetrics([{ category: 'Top Farmer', playerName: topFarmer.hero_name || 'Anonymous', score: farmingScore, grade: getGrade(farmingScore), color: getColor(farmingScore), icon: iconMap.farming, description: `Highest GPM in the match: ${topFarmer.gpm?.toLocaleString() || 0}.`, details: `Player: ${topFarmer.hero_name || 'Anonymous'}\nGPM: ${topFarmer.gpm?.toLocaleString() || 0}\nLast Hits: ${topFarmer.last_hits || 0}` }, { category: 'Top Team Fighter', playerName: topFighter.hero_name || 'Anonymous', score: teamfightScore, grade: getGrade(teamfightScore), color: getColor(teamfightScore), icon: iconMap.teamfighting, description: `Most impactful fighter with ${topFighter.kills || 0}/${topFighter.deaths || 0}/${topFighter.assists || 0}.`, details: `Player: ${topFighter.hero_name || 'Anonymous'}\nKDA: ${topFighter.kills || 0}/${topFighter.deaths || 0}/${topFighter.assists || 0}\nHero Damage: ${(topFighter.hero_damage || 0).toLocaleString()}` }, { category: 'Top Vision Provider', playerName: topWarder.hero_name || 'Anonymous', score: visionScore, grade: getGrade(visionScore), color: getColor(visionScore), icon: iconMap.vision, description: `Placed the most observer wards: ${topWarder.obs_placed || 0}.`, details: `Player: ${topWarder.hero_name || 'Anonymous'}\nObserver Wards: ${topWarder.obs_placed || 0}\nSentry Wards: ${topWarder.sen_placed || 0}` }, { category: 'Top Economic Impact', playerName: topNetWorth.hero_name || 'Anonymous', score: economyScore, grade: getGrade(economyScore), color: getColor(economyScore), icon: iconMap.economy, description: `Highest net worth: ${topNetWorth.net_worth?.toLocaleString() || 0}.`, details: `Player: ${topNetWorth.hero_name || 'Anonymous'}\nFinal Net Worth: ${(topNetWorth.net_worth || 0).toLocaleString()}` }]);
    setLoadingMetrics(false);
  }, [data]);

  const getColorClasses = (color: string) => { switch (color) { case 'green': return { bg: 'bg-green-900/30', text: 'text-green-400', textSecondary: 'text-green-300', progress: 'bg-green-500', border: 'border-green-500/30' }; case 'yellow': return { bg: 'bg-yellow-900/30', text: 'text-yellow-400', textSecondary: 'text-yellow-300', progress: 'bg-yellow-500', border: 'border-yellow-500/30' }; case 'red': return { bg: 'bg-red-900/30', text: 'text-red-400', textSecondary: 'text-red-300', progress: 'bg-red-500', border: 'border-red-500/30' }; case 'blue': return { bg: 'bg-blue-900/30', text: 'text-blue-400', textSecondary: 'text-blue-300', progress: 'bg-blue-500', border: 'border-blue-500/30' }; default: return { bg: 'bg-gray-900/30', text: 'text-gray-400', textSecondary: 'text-gray-300', progress: 'bg-gray-500', border: 'border-gray-500/30' }; } };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Card 1: AI-Powered Gameplay Insights */}
        <Card className="bg-slate-800/50 border-slate-700 text-white">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2"><Brain className="h-6 w-6 text-blue-400" /><span>AI-Powered Gameplay Insights</span></CardTitle>
          </CardHeader>
          <CardContent>
            {loadingAi && <div className="flex items-center justify-center p-4"><Loader2 className="h-8 w-8 animate-spin" /></div>}
            {errorAi && <div className="text-center p-4 text-red-400">{errorAi}</div>}
            {aiAnalysis && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {aiAnalysis.insights.map((insight, index) => {
                const IconComponent = insight.icon;
                return (
                    <div key={index} className={`bg-slate-800/60 rounded-lg p-4 space-y-3 border-l-4 ${getSeverityColor(insight.severity)}`}>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <IconComponent className={`h-5 w-5`} />
                        <h4 className="font-semibold text-white">{insight.title}</h4>
                        </div>
                        <Badge className={`${getSeverityBadgeColor(insight.severity)} text-white text-xs`}>{insight.severity.toUpperCase()}</Badge>
                      </div>
                      <p className="text-gray-300 text-sm pl-8">{insight.description}</p>
                      <div className="bg-slate-700/50 rounded p-3 ml-8"><p className="text-sm font-medium text-blue-300 mb-1">🤖 AI Suggestion:</p><p className="text-sm text-gray-200">{insight.suggestion}</p></div>
                  </div>
                );
              })}
            </div>
            )}
          </CardContent>
        </Card>

        {/* Card 2: Interactive Performance Summary */}
        <Card className="bg-slate-800/50 border-slate-700 text-white overflow-hidden">
          <CardHeader><CardTitle className="flex items-center space-x-2"><Trophy className="h-6 w-6 text-yellow-400" /><span>Match Performance Highlights</span></CardTitle><p className="text-sm text-gray-400">Analysis of the top performers in key categories.</p></CardHeader>
          <CardContent>
            {loadingMetrics && <div className="flex items-center justify-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>}
            {!loadingMetrics && performanceMetrics.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 gap-6">{performanceMetrics.map((metric, index) => <Tooltip key={index}><TooltipTrigger asChild><div className={`relative p-6 rounded-lg border-2 ${getColorClasses(metric.color).bg} ${getColorClasses(metric.color).border} hover:scale-105 transition-all duration-300 cursor-pointer group`}><div className="relative z-10"><div className="flex items-center justify-between mb-4"><metric.icon className={`h-8 w-8 ${getColorClasses(metric.color).text} group-hover:scale-110 transition-transform duration-300`} /><div className="text-right"><div className={`text-3xl font-bold ${getColorClasses(metric.color).text} mb-1`}>{metric.grade}</div><div className={`text-xs ${getColorClasses(metric.color).textSecondary}`}>{metric.playerName}</div></div></div><div className="space-y-3"><h3 className={`font-semibold ${getColorClasses(metric.color).textSecondary} text-lg`}>{metric.category}</h3><div className="space-y-2"><div className="flex justify-between text-sm"><span className="text-gray-300">Performance Score</span><span className={getColorClasses(metric.color).text}>{metric.score}%</span></div><div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden"><div className={`h-full ${getColorClasses(metric.color).progress} rounded-full`} style={{ width: `${metric.score}%` }}></div></div></div><p className="text-sm text-gray-400 group-hover:text-gray-300">{metric.description}</p></div></div></div></TooltipTrigger><TooltipContent side="top" className="max-w-xs"><div className="space-y-2"><h4 className="font-semibold">{metric.category} Details</h4><pre className="text-xs whitespace-pre-line">{metric.details}</pre></div></TooltipContent></Tooltip>)}</div>) : !loadingMetrics && <div className="text-center py-12 text-gray-400"><p>Performance data could not be generated.</p></div>}
          </CardContent>
        </Card>

        {/* Card 3: AI Coaching Recommendations */}
        <Card className="bg-slate-800/50 border-slate-700 text-white">
          <CardHeader><CardTitle className="flex items-center space-x-2"><Brain className="h-6 w-6 text-purple-400" /><span>AI Coaching Recommendations</span></CardTitle></CardHeader>
          <CardContent>
            {loadingAi && <div className="flex items-center justify-center p-4"><Loader2 className="h-8 w-8 animate-spin" /></div>}
            {errorAi && <div className="text-center p-4 text-red-400">{errorAi}</div>}
            {aiAnalysis && aiAnalysis.coaching_recommendations && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-4">
                <h4 className="font-semibold text-purple-300 mb-2">🎯 Priority Focus Areas</h4>
                  <ul className="text-sm text-gray-300 list-disc list-inside space-y-1">
                    {aiAnalysis.coaching_recommendations.priority_focus_areas.map((area, i) => <li key={i}>{area}</li>)}
                </ul>
              </div>
              <div className="bg-gradient-to-r from-green-900/30 to-teal-900/30 rounded-lg p-4">
                <h4 className="font-semibold text-green-300 mb-2">📈 Improvement Potential</h4>
                  <p className="text-sm text-gray-300">{aiAnalysis.coaching_recommendations.improvement_potential}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default GameplayInsights;

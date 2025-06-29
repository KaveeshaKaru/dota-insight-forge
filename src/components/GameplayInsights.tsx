
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, Eye, Target } from 'lucide-react';

interface GameplayInsightsProps {
  data: any;
  steamId?: string;
}

const GameplayInsights: React.FC<GameplayInsightsProps> = ({ data, steamId }) => {
  const insights = [
    {
      type: 'warning',
      icon: AlertTriangle,
      title: 'High Early Game Deaths',
      description: 'Player "Shadow_Blade" had 4 deaths in the first 10 minutes, affecting early game impact.',
      suggestion: 'Focus on positioning and map awareness during laning phase.',
      severity: 'high'
    },
    {
      type: 'improvement',
      icon: TrendingUp,
      title: 'Low GPM Performance',
      description: 'Support players averaged 280 GPM, which is below optimal for this match duration.',
      suggestion: 'Consider more efficient farming patterns and stack clearing.',
      severity: 'medium'
    },
    {
      type: 'vision',
      icon: Eye,
      title: 'Poor Vision Control',
      description: 'Only 12 observer wards placed throughout the match, leading to limited map control.',
      suggestion: 'Increase ward placement frequency, especially before objectives.',
      severity: 'high'
    },
    {
      type: 'objective',
      icon: Target,
      title: 'Missed Roshan Opportunity',
      description: 'Team had a 15-second window to secure Roshan at 28:45 but retreated.',
      suggestion: 'Be more decisive with objective calls when you have the advantage.',
      severity: 'medium'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'warning': return 'text-red-400';
      case 'improvement': return 'text-yellow-400';
      case 'vision': return 'text-blue-400';
      case 'objective': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700 text-white">
        <CardHeader>
          <CardTitle>AI-Powered Gameplay Insights</CardTitle>
          {steamId && (
            <p className="text-sm text-gray-400">
              Personalized analysis for Steam ID: {steamId}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {insights.map((insight, index) => {
              const IconComponent = insight.icon;
              return (
                <div key={index} className="bg-slate-700/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <IconComponent className={`h-5 w-5 ${getTypeColor(insight.type)}`} />
                      <h4 className="font-semibold text-white">{insight.title}</h4>
                    </div>
                    <Badge className={`${getSeverityColor(insight.severity)} text-white text-xs`}>
                      {insight.severity.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-300 text-sm">
                    {insight.description}
                  </p>
                  
                  <div className="bg-slate-600/50 rounded p-3">
                    <p className="text-sm font-medium text-blue-300 mb-1">💡 Suggestion:</p>
                    <p className="text-sm text-gray-200">{insight.suggestion}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card className="bg-slate-800/50 border-slate-700 text-white">
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-900/30 rounded-lg">
              <div className="text-2xl font-bold text-green-400 mb-2">B+</div>
              <div className="text-sm font-semibold text-green-300 mb-1">Farming Efficiency</div>
              <div className="text-xs text-gray-400">Good last-hitting and GPM</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-900/30 rounded-lg">
              <div className="text-2xl font-bold text-yellow-400 mb-2">C</div>
              <div className="text-sm font-semibold text-yellow-300 mb-1">Team Fighting</div>
              <div className="text-xs text-gray-400">Needs better positioning</div>
            </div>
            
            <div className="text-center p-4 bg-red-900/30 rounded-lg">
              <div className="text-2xl font-bold text-red-400 mb-2">D+</div>
              <div className="text-sm font-semibold text-red-300 mb-1">Map Control</div>
              <div className="text-xs text-gray-400">Insufficient ward coverage</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameplayInsights;

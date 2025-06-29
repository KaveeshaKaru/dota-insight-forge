
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, Eye, Target, Shield, Zap, Clock, Users, Trophy, Brain } from 'lucide-react';

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
      suggestion: 'Focus on positioning and map awareness during laning phase. Consider buying more regen items.',
      severity: 'high'
    },
    {
      type: 'improvement',
      icon: TrendingUp,
      title: 'Low GPM Performance',
      description: 'Support players averaged 280 GPM, which is below optimal for this match duration.',
      suggestion: 'Consider more efficient farming patterns and stack clearing. Prioritize last-hitting creeps.',
      severity: 'medium'
    },
    {
      type: 'vision',
      icon: Eye,
      title: 'Poor Vision Control',
      description: 'Only 12 observer wards placed throughout the match, leading to limited map control.',
      suggestion: 'Increase ward placement frequency, especially before objectives. Aim for 1 ward per 2 minutes.',
      severity: 'high'
    },
    {
      type: 'objective',
      icon: Target,
      title: 'Missed Roshan Opportunity',
      description: 'Team had a 15-second window to secure Roshan at 28:45 but retreated.',
      suggestion: 'Be more decisive with objective calls when you have the advantage. Practice smoke coordination.',
      severity: 'medium'
    },
    {
      type: 'farming',
      icon: TrendingUp,
      title: 'Inefficient Farming Pattern',
      description: 'Core players missed 45% of last hits in the first 10 minutes.',
      suggestion: 'Practice last-hitting in demo mode. Focus on creep aggro management and timing.',
      severity: 'high'
    },
    {
      type: 'itemization',
      icon: Shield,
      title: 'Suboptimal Item Builds',
      description: 'Carry built Radiance at 28 minutes, which is too late for effectiveness.',
      suggestion: 'Adapt item builds based on game tempo. Consider faster farming items when behind.',
      severity: 'medium'
    },
    {
      type: 'positioning',
      icon: Users,
      title: 'Poor Team Fight Positioning',
      description: 'Support players were caught out of position in 3 out of 5 team fights.',
      suggestion: 'Stay behind cores during fights. Use fog of war and high ground advantage.',
      severity: 'high'
    },
    {
      type: 'timing',
      icon: Clock,
      title: 'Inefficient Ability Usage',
      description: 'Ultimate abilities were used at 67% efficiency compared to optimal timing.',
      suggestion: 'Coordinate ultimates with team. Save big spells for key moments rather than farming.',
      severity: 'medium'
    },
    {
      type: 'aggression',
      icon: Zap,
      title: 'Missed Kill Opportunities',
      description: 'Team failed to capitalize on 8 potential kills due to hesitation.',
      suggestion: 'Improve communication and commit to kills when enemies are low. Use voice chat.',
      severity: 'medium'
    },
    {
      type: 'macro',
      icon: Brain,
      title: 'Poor Map Control',
      description: 'Lost map control after 22 minutes, leading to unsafe farming.',
      suggestion: 'Group up as 5 to secure map control. Establish vision before splitting to farm.',
      severity: 'high'
    },
    {
      type: 'laning',
      icon: Target,
      title: 'Weak Laning Phase',
      description: 'Lost 2 out of 3 lanes, giving enemy cores early advantage.',
      suggestion: 'Focus on creep equilibrium and harassing enemy laners. Request ganks when pushed.',
      severity: 'high'
    },
    {
      type: 'resources',
      icon: Trophy,
      title: 'Inefficient Resource Usage',
      description: 'Neutral items were not optimally distributed among team members.',
      suggestion: 'Prioritize neutral items on cores first, then supports. Communicate item needs.',
      severity: 'low'
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
      case 'farming': return 'text-orange-400';
      case 'itemization': return 'text-purple-400';
      case 'positioning': return 'text-pink-400';
      case 'timing': return 'text-cyan-400';
      case 'aggression': return 'text-red-300';
      case 'macro': return 'text-indigo-400';
      case 'laning': return 'text-lime-400';
      case 'resources': return 'text-amber-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-blue-400" />
            <span>AI-Powered Gameplay Insights</span>
          </CardTitle>
          {steamId && (
            <p className="text-sm text-gray-400">
              Personalized analysis for Steam ID: {steamId}
            </p>
          )}
          <p className="text-sm text-blue-300">
            Advanced AI analysis of your gameplay patterns and performance metrics
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {insights.map((insight, index) => {
              const IconComponent = insight.icon;
              return (
                <div key={index} className="bg-slate-700/50 rounded-lg p-4 space-y-3 hover:bg-slate-700/70 transition-colors">
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
                    <p className="text-sm font-medium text-blue-300 mb-1">🤖 AI Suggestion:</p>
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
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-6 w-6 text-yellow-400" />
            <span>Performance Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

            <div className="text-center p-4 bg-blue-900/30 rounded-lg">
              <div className="text-2xl font-bold text-blue-400 mb-2">A-</div>
              <div className="text-sm font-semibold text-blue-300 mb-1">Item Builds</div>
              <div className="text-xs text-gray-400">Solid item progression</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Coaching Tips */}
      <Card className="bg-slate-800/50 border-slate-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-purple-400" />
            <span>AI Coaching Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-4">
              <h4 className="font-semibold text-purple-300 mb-2">🎯 Priority Focus Areas</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Improve early game safety and positioning</li>
                <li>• Increase ward placement frequency</li>
                <li>• Practice last-hitting mechanics</li>
                <li>• Better team fight coordination</li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-r from-green-900/30 to-teal-900/30 rounded-lg p-4">
              <h4 className="font-semibold text-green-300 mb-2">📈 Improvement Potential</h4>
              <p className="text-sm text-gray-300">
                Based on your performance patterns, focusing on vision control and positioning 
                could increase your win rate by an estimated 15-20%.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameplayInsights;

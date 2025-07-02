import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, Swords, Shield, Plus, Loader2, BarChart, BrainCircuit, Ban } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { heroService } from '@/services/hero-service';

const RANKS = ["Herald", "Guardian", "Crusader", "Archon", "Legend", "Ancient", "Divine", "Immortal"];
const ROLES = ["Carry", "Midlaner", "Offlaner", "Soft Support", "Hard Support"];

const getHeroImageUrl = (hero: any) => {
  if (!hero || !hero.name) return '';
  const internalHeroName = hero.name.replace('npc_dota_hero_', '');
  return `https://cdn.dota2.com/apps/dota2/images/heroes/${internalHeroName}_full.png`;
};

// Main Component
const CounterPicker: React.FC = () => {
  const [allHeroes, setAllHeroes] = useState<any[]>([]);
  const [alliedHeroes, setAlliedHeroes] = useState<(any | null)[]>(Array(4).fill(null));
  const [enemyHeroes, setEnemyHeroes] = useState<(any | null)[]>(Array(5).fill(null));
  const [heroNameMap, setHeroNameMap] = useState<{ [key: string]: any }>({});
  const [rank, setRank] = useState("Legend");
  const [role, setRole] = useState("Carry");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<any | null>(null);
  const [bannedSuggestionIds, setBannedSuggestionIds] = useState<Set<number>>(new Set());
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  useEffect(() => {
    const fetchHeroes = async () => {
      const heroData = await heroService.getHeroMap();
      if (heroData) {
        const heroesArray = Object.values(heroData);
        setAllHeroes(heroesArray);
        const nameMap = heroesArray.reduce((acc, hero) => {
          acc[hero.localized_name.toLowerCase()] = hero;
          return acc;
        }, {} as { [key: string]: any });
        setHeroNameMap(nameMap);
      }
    };
    fetchHeroes();
  }, []);

  const pickedHeroIds = useMemo(() => {
    const picked = new Set<number>();
    [...alliedHeroes, ...enemyHeroes].forEach(h => h && picked.add(h.id));
    return picked;
  }, [alliedHeroes, enemyHeroes]);

  const handleSelectHero = (hero: any, team: 'allies' | 'enemies', index: number) => {
    const setter = team === 'allies' ? setAlliedHeroes : setEnemyHeroes;
    setter(current => {
      const newTeam = [...current];
      newTeam[index] = hero;
      return newTeam;
    });
  };

  const handleRemoveHero = (team: 'allies' | 'enemies', index: number) => {
    const setter = team === 'allies' ? setAlliedHeroes : setEnemyHeroes;
    setter(current => {
      const newTeam = [...current];
      newTeam[index] = null;
      return newTeam;
    });
  };

  const handleConfirmPick = () => {
    if (!selectedSuggestion) return;
    const firstEmptyIndex = alliedHeroes.findIndex(h => h === null);
    if (firstEmptyIndex !== -1) {
      setAlliedHeroes(currentAllies => {
        const newAllies = [...currentAllies];
        newAllies[firstEmptyIndex] = selectedSuggestion;
        return newAllies;
      });
    }
    setSelectedSuggestion(null);
  };

  const handleBanSuggestion = (heroId: number) => {
    setBannedSuggestionIds(prev => new Set(prev).add(heroId));
  };

  const handleSuggestHeroes = async () => {
    setIsSuggesting(true);
    setError(null);

    const allies = alliedHeroes.filter(Boolean).map(h => h.localized_name);
    const enemies = enemyHeroes.filter(Boolean).map(h => h.localized_name);

    if (enemies.length === 0) {
      setError("Please select at least one enemy hero to generate suggestions.");
      setIsSuggesting(false);
      return;
    }
    if (allies.length === 0) {
      setError("Please select at least one allied hero for synergy analysis.");
      setIsSuggesting(false);
      return;
    }

    const bannedHeroes = Array.from(bannedSuggestionIds)
      .map(id => allHeroes.find(h => h.id === id)?.localized_name)
      .filter(Boolean);

    const unpickedHeroes = allHeroes
      .filter(h => !pickedHeroIds.has(h.id) && !bannedSuggestionIds.has(h.id))
      .map(h => h.localized_name);

    const prompt = `
      **Dota 2 Counter Picker Assistant**
      **Goal:** Suggest the top 5 best heroes for the **${role}** role for "Your Team" to counter the "Enemy Team" and synergize with existing allies. This is for the last pick of the draft.
      **Context:**
      - Player Rank: ${rank}
      - Role to Fill: ${role}
      - Your Team (Allies): ${allies.join(', ') || 'None'}
      - Enemy Team: ${enemies.join(', ')}
      - Banned Heroes: ${bannedHeroes.join(', ') || 'None'}
      - Available Heroes: ${unpickedHeroes.join(', ')}
      **Task:** Return a JSON array of the top 5 hero suggestions. For each hero, provide:
      1.  "heroName": The name of the suggested hero.
      2.  "advantageScore": A number from 0-100 indicating how good the pick is.
      3.  "counterStrategy": A brief explanation of why this hero counters the enemy team.
      4.  "synergyStrategy": A brief explanation of how this hero synergizes with the allied team.
      5.  "roles": An array of strings for the hero's primary roles (e.g., "Carry", "Support").
      **Output Format:** Your response MUST be a valid JSON array string inside a \`\`\`json code block. Do not include any other text before or after the code block.
      **Example of a single hero entry in the array:**
      {
        "heroName": "Silencer",
        "advantageScore": 85,
        "counterStrategy": "Global Silence interrupts key enemy spells. Arcane Curse punishes spell-heavy lineups.",
        "synergyStrategy": "Global Silence sets up teamfights for allies like Axe or Magnus to initiate.",
        "roles": ["Support", "Disabler"]
      }
    `;

    let text = '';
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { response_mime_type: "application/json" } }),
      });

      if (!response.ok) {
        let errorDetails = `Status: ${response.status}.`;
        try {
          const errorData = await response.json();
          errorDetails += ` Message: ${errorData.error?.message || JSON.stringify(errorData)}`;
        } catch (e) {
          errorDetails += ' Could not parse error response body.';
        }
        throw new Error(`Google API request failed. ${errorDetails}`);
      }
      
      const data = await response.json();
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error("AI returned an empty response.");
      }
      
      text = data.candidates[0].content.parts[0].text;
      
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```|(\[[\s\S]*\])/);
      if (!jsonMatch) {
          throw new Error("Could not find a JSON block in the AI's response.");
      }
      const jsonString = jsonMatch[1] || jsonMatch[2];
      const parsedSuggestions = JSON.parse(jsonString);
      
      const enrichedSuggestions = parsedSuggestions.map((suggestion: any) => {
        const heroData = heroNameMap[suggestion.heroName.toLowerCase()];
        return { ...suggestion, ...heroData };
      }).filter((s: any) => s.id);

      setSuggestions(enrichedSuggestions);
    } catch (e: any) {
      console.error("Failed to get suggestions:", e);
      if (text) {
        console.error("Raw text that failed parsing:", text);
      }
      setError(`Failed to process AI suggestions. ${e.message}`);
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-red-400">
              Dota 2 Counter Picker
            </h1>
            <p className="mt-2 text-lg text-gray-300">AI-powered hero suggestions for your perfect draft</p>
          </header>

          <CounterPickerFilters rank={rank} setRank={setRank} role={role} setRole={setRole} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <TeamSection 
              title="Your Team" 
              heroes={alliedHeroes} 
              onSelectHero={(h, i) => handleSelectHero(h, 'allies', i)} 
              onRemoveHero={(i) => handleRemoveHero('allies', i)} 
              allHeroes={allHeroes} 
              pickedHeroIds={pickedHeroIds} 
              icon={<Shield className="h-6 w-6 text-blue-400" />} 
            />
            <TeamSection 
              title="Enemy Team" 
              heroes={enemyHeroes} 
              onSelectHero={(h, i) => handleSelectHero(h, 'enemies', i)} 
              onRemoveHero={(i) => handleRemoveHero('enemies', i)} 
              allHeroes={allHeroes} 
              pickedHeroIds={pickedHeroIds} 
              icon={<Swords className="h-6 w-6 text-red-400" />} 
            />
          </div>

          <div className="mt-8 flex justify-center">
            <Button 
              size="lg" 
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold text-lg py-6 px-8 rounded-lg transition-all duration-300 transform hover:scale-105" 
              onClick={handleSuggestHeroes} 
              disabled={isSuggesting}
            >
              {isSuggesting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing Draft...
                </>
              ) : (
                "Suggest Heroes"
              )}
            </Button>
          </div>

          <SuggestionResults 
            suggestions={suggestions} 
            isLoading={isSuggesting} 
            error={error}
            onSuggestionClick={setSelectedSuggestion}
            onBanSuggestion={handleBanSuggestion}
            bannedSuggestionIds={bannedSuggestionIds}
          />

          <AlertDialog open={!!selectedSuggestion} onOpenChange={() => setSelectedSuggestion(null)}>
            <AlertDialogContent className="bg-gray-800/95 border-gray-700 text-white">
              <AlertDialogHeader>
                <AlertDialogTitle>Do you want to pick {selectedSuggestion?.heroName}?</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-300">
                  This will add {selectedSuggestion?.heroName} to the next available slot in Your Team.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-gray-600 hover:bg-gray-500 border-0">Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-blue-600 hover:bg-blue-500" onClick={handleConfirmPick}>Yes, Pick Hero</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </TooltipProvider>
  );
};

const CounterPickerFilters = ({ rank, setRank, role, setRole }) => (
  <Card className="bg-gray-800/50 border-gray-700 shadow-lg backdrop-blur-sm rounded-xl">
    <CardContent className="pt-6 flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <label className="text-sm font-medium text-gray-200 mb-2 block">Player Rank</label>
        <Select value={rank} onValueChange={setRank}>
          <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700 text-white rounded-lg">
            {RANKS.map(r => (
              <SelectItem key={r} value={r} className="hover:bg-gray-700">{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1">
        <label className="text-sm font-medium text-gray-200 mb-2 block">Role to Fill</label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700 text-white rounded-lg">
            {ROLES.map(m => (
              <SelectItem key={m} value={m} className="hover:bg-gray-700">{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </CardContent>
  </Card>
);

const SuggestionResults = ({ suggestions, isLoading, error, onSuggestionClick, onBanSuggestion, bannedSuggestionIds }) => {
  if (isLoading) {
    return (
      <div className="mt-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-400" />
        <p className="mt-2 text-gray-300">AI is analyzing the draft...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="mt-8 text-center text-red-400 p-4 bg-red-900/20 rounded-lg shadow-lg">
        {error}
      </div>
    );
  }
  if (suggestions.length === 0) {
    return (
      <div className="mt-8">
        <Card className="bg-gray-800/50 border-gray-700 shadow-lg backdrop-blur-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">Suggested Picks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">Select allied and enemy heroes, then click "Suggest Heroes" to see recommendations.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <Card className="bg-gray-800/50 border-gray-700 shadow-lg backdrop-blur-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white">AI-Powered Suggestions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {suggestions.map((s, i) => (
            <SuggestionCard 
              key={i} 
              suggestion={s} 
              onSuggestionClick={onSuggestionClick} 
              onBanSuggestion={onBanSuggestion}
              isBanned={bannedSuggestionIds.has(s.id)}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

const SuggestionCard = ({ suggestion, onSuggestionClick, onBanSuggestion, isBanned }) => {
  const cardClasses = `relative bg-gray-700/50 rounded-lg p-4 space-y-3 border-l-4 border-blue-500 transition-all duration-300 shadow-md ${
    isBanned 
      ? 'opacity-50 grayscale cursor-not-allowed' 
      : 'hover:bg-gray-700 transform hover:scale-105 cursor-pointer'
  }`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div onClick={() => !isBanned && onSuggestionClick(suggestion)} className={cardClasses}>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12 rounded-lg border-2 border-gray-600">
                <AvatarImage src={getHeroImageUrl(suggestion)} />
                <AvatarFallback className="bg-gray-600 text-white">{suggestion.heroName.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-semibold text-white text-lg">{suggestion.heroName}</h4>
                <div className="flex items-center text-sm text-green-400 font-bold">
                  <BarChart className="h-4 w-4 mr-1" />
                  {suggestion.advantageScore}%
                </div>
              </div>
            </div>
            {!isBanned && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onBanSuggestion(suggestion.id);
                }}
                className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-600/50"
                title="Ban this suggestion"
              >
                <Ban className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="text-xs text-gray-300">
            {suggestion.roles.join(', ')}
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs bg-gray-800 border-gray-700 text-white p-4 rounded-lg shadow-lg">
        <div className="space-y-2">
          <div className="font-bold text-lg">{suggestion.heroName}</div>
          <div><strong className="text-red-400">Counters:</strong> {suggestion.counterStrategy}</div>
          <div><strong className="text-blue-400">Synergy:</strong> {suggestion.synergyStrategy}</div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

interface TeamSectionProps {
  title: string;
  heroes: (any | null)[];
  onSelectHero: (hero: any, index: number) => void;
  onRemoveHero: (index: number) => void;
  allHeroes: any[];
  pickedHeroIds: Set<number>;
  icon: React.ReactNode;
}

const TeamSection: React.FC<TeamSectionProps> = ({ title, heroes, onSelectHero, onRemoveHero, allHeroes, pickedHeroIds, icon }) => (
  <Card className="bg-gray-800/50 border-gray-700 shadow-lg backdrop-blur-sm rounded-xl">
    <CardHeader>
      <CardTitle className="flex items-center space-x-2 text-xl font-bold text-white">
        {icon}
        <span>{title}</span>
      </CardTitle>
    </CardHeader>
    <CardContent className="grid grid-cols-5 gap-3">
      {heroes.map((hero, index) => (
        <HeroSlot
          key={index}
          hero={hero}
          onSelect={(h) => onSelectHero(h, index)}
          onRemove={() => onRemoveHero(index)}
          allHeroes={allHeroes}
          pickedHeroIds={pickedHeroIds}
        />
      ))}
      {title === "Your Team" && (
        <div className="h-20 w-20 bg-gray-700/50 rounded-lg flex items-center justify-center border-2 border-dashed border-blue-500 transition-all duration-300 hover:bg-gray-700" title="This is the hero you need to pick">
          <BrainCircuit className="h-8 w-8 text-blue-400" />
        </div>
      )}
    </CardContent>
  </Card>
);

interface HeroSlotProps {
  hero: any | null;
  onSelect: (hero: any) => void;
  onRemove: () => void;
  allHeroes: any[];
  pickedHeroIds: Set<number>;
}

const HeroSlot: React.FC<HeroSlotProps> = ({ hero, onSelect, onRemove, allHeroes, pickedHeroIds }) => {
  const [open, setOpen] = useState(false);
  
  if (hero) {
    return (
      <div className="relative group">
        <Avatar className="h-20 w-20 border-2 border-gray-600 rounded-lg transition-all duration-300 group-hover:scale-105">
          <AvatarImage src={getHeroImageUrl(hero)} alt={hero.localized_name} />
          <AvatarFallback className="bg-gray-600 text-white">{hero.localized_name.substring(0, 2)}</AvatarFallback>
        </Avatar>
        <button
          onClick={onRemove}
          className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-600 rounded-full p-1.5 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="h-20 w-20 bg-gray-700/50 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-all duration-300 transform hover:scale-105">
          <Plus className="h-8 w-8 text-gray-400" />
        </button>
      </DialogTrigger>
      <HeroPicker
        allHeroes={allHeroes}
        pickedHeroIds={pickedHeroIds}
        onSelectHero={(h) => {
          onSelect(h);
          setOpen(false);
        }}
      />
    </Dialog>
  );
};

interface HeroPickerProps {
  allHeroes: any[];
  pickedHeroIds: Set<number>;
  onSelectHero: (hero: any) => void;
}

const HeroPicker: React.FC<HeroPickerProps> = ({ allHeroes, pickedHeroIds, onSelectHero }) => {
  const [search, setSearch] = useState('');
  const [attribute, setAttribute] = useState<'all' | 'str' | 'agi' | 'int'>('all');

  const filteredHeroes = useMemo(() => {
    return allHeroes
      .filter(h => !pickedHeroIds.has(h.id))
      .filter(h => search === '' || h.localized_name.toLowerCase().includes(search.toLowerCase()))
      .filter(h => attribute === 'all' || h.primary_attr === attribute)
      .sort((a, b) => a.localized_name.localeCompare(b.localized_name));
  }, [allHeroes, pickedHeroIds, search, attribute]);

  return (
    <DialogContent className="max-w-4xl bg-gray-900/95 border-gray-700 text-white rounded-xl shadow-xl">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-white">Select a Hero</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <Input
          placeholder="Search heroes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="max-h-[60vh] overflow-y-auto grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 pr-2">
        {filteredHeroes.map(hero => (
          <button 
            key={hero.id} 
            onClick={() => onSelectHero(hero)} 
            className="space-y-1 group transition-all duration-300"
          >
            <Avatar className="h-16 w-16 rounded-lg border-2 border-transparent group-hover:border-blue-500 transition-all duration-200">
              <AvatarImage src={getHeroImageUrl(hero)} />
              <AvatarFallback className="bg-gray-600 text-white">{hero.localized_name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <p className="text-xs text-center text-gray-300 group-hover:text-white transition-colors truncate">{hero.localized_name}</p>
          </button>
        ))}
      </div>
    </DialogContent>
  );
};

export default CounterPicker;
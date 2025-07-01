import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, Swords, Shield, Plus, Loader2, BarChart, BrainCircuit } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { heroService } from '@/services/hero-service';

const RANKS = ["Herald", "Guardian", "Crusader", "Archon", "Legend", "Ancient", "Divine", "Immortal"];
const GAME_MODES = ["All Pick", "Captains Mode", "Random Draft", "Turbo"];

const getHeroImageUrl = (hero: any) => {
  if (!hero || !hero.name) return '';
  const internalHeroName = hero.name.replace('npc_dota_hero_', '');
  return `https://cdn.dota2.com/apps/dota2/images/heroes/${internalHeroName}_full.png`;
};

// Main Component
const CounterPicker: React.FC = () => {
  const [allHeroes, setAllHeroes] = useState<any[]>([]);
  const [alliedHeroes, setAlliedHeroes] = useState<(any | null)[]>(Array(5).fill(null));
  const [enemyHeroes, setEnemyHeroes] = useState<(any | null)[]>(Array(5).fill(null));
  const [heroNameMap, setHeroNameMap] = useState<{ [key: string]: any }>({});
  
  const [rank, setRank] = useState("Legend");
  const [gameMode, setGameMode] = useState("All Pick");

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const GEMINI_API_KEY = 'AIzaSyCQoymIaFGlrTFhuTyRsGVLePoOlnxTM-s';

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

  const handleSuggestHeroes = async () => {
    setIsSuggesting(true);
    setError(null);
    setSuggestions([]);

    const allies = alliedHeroes.filter(Boolean).map(h => h.localized_name);
    const enemies = enemyHeroes.filter(Boolean).map(h => h.localized_name);

    if (enemies.length === 0) {
      setError("Please select at least one enemy hero to generate suggestions.");
      setIsSuggesting(false);
      return;
    }

    const unpickedHeroes = allHeroes.filter(h => !pickedHeroIds.has(h.id)).map(h => h.localized_name);

    const prompt = `
      **Dota 2 Counter Picker Assistant**
      **Goal:** Suggest the top 5 best heroes for "Your Team" to counter the "Enemy Team" and synergize with existing allies.
      **Context:**
      - Player Rank: ${rank}
      - Game Mode: ${gameMode}
      - Your Team (Allies): ${allies.join(', ') || 'None'}
      - Enemy Team: ${enemies.join(', ')}
      - Available Heroes: ${unpickedHeroes.join(', ')}
      **Task:** Return a JSON array of the top 5 hero suggestions. For each hero, provide:
      1.  "heroName": The name of the suggested hero.
      2.  "advantageScore": A number from 0-100 indicating how good the pick is.
      3.  "counterStrategy": A brief explanation of why this hero counters the enemy team.
      4.  "synergyStrategy": A brief explanation of how this hero synergizes with the allied team.
      5.  "roles": An array of strings for the hero's primary roles (e.g., "Carry", "Support").
      **Output Format:** Your response MUST be a valid JSON array string. Do not include any other text.
    `;

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
      const text = data.candidates[0].content.parts[0].text;
      const parsedSuggestions = JSON.parse(text.match(/(\[.*\])/s)[0]);
      
      const enrichedSuggestions = parsedSuggestions.map((suggestion: any) => {
        const heroData = heroNameMap[suggestion.heroName.toLowerCase()];
        return { ...suggestion, ...heroData };
      }).filter((s: any) => s.id); // Ensure we only show heroes found in our service

      setSuggestions(enrichedSuggestions);
    } catch (e: any) {
      console.error("Failed to get suggestions:", e);
      setError(`Failed to get AI suggestions. ${e.message}`);
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="bg-slate-900 text-white min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Counter Picker</h1>
            <p className="mt-2 text-lg text-slate-400">Get AI-powered hero suggestions to counter your opponent's draft.</p>
          </header>

          <CounterPickerFilters rank={rank} setRank={setRank} gameMode={gameMode} setGameMode={setGameMode} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <TeamSection title="Your Team" heroes={alliedHeroes} onSelectHero={(h, i) => handleSelectHero(h, 'allies', i)} onRemoveHero={(i) => handleRemoveHero('allies', i)} allHeroes={allHeroes} pickedHeroIds={pickedHeroIds} icon={<Shield className="h-6 w-6 text-blue-400" />} />
            <TeamSection title="Enemy Team" heroes={enemyHeroes} onSelectHero={(h, i) => handleSelectHero(h, 'enemies', i)} onRemoveHero={(i) => handleRemoveHero('enemies', i)} allHeroes={allHeroes} pickedHeroIds={pickedHeroIds} icon={<Swords className="h-6 w-6 text-red-400" />} />
          </div>

          <div className="mt-8">
            <Button size="lg" className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 font-semibold text-lg" onClick={handleSuggestHeroes} disabled={isSuggesting}>
              {isSuggesting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing Draft...</> : "Suggest Heroes"}
            </Button>
          </div>

          <SuggestionResults suggestions={suggestions} isLoading={isSuggesting} error={error} />
        </div>
      </div>
    </TooltipProvider>
  );
};

const CounterPickerFilters = ({ rank, setRank, gameMode, setGameMode }) => (
  <Card className="bg-slate-800/50 border-slate-700">
    <CardContent className="pt-6 flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <label className="text-sm font-medium text-slate-300 mb-2 block">Player Rank</label>
        <Select value={rank} onValueChange={setRank}>
          <SelectTrigger className="bg-slate-700 border-slate-600"><SelectValue /></SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700 text-white">{RANKS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="flex-1">
        <label className="text-sm font-medium text-slate-300 mb-2 block">Game Mode</label>
        <Select value={gameMode} onValueChange={setGameMode}>
          <SelectTrigger className="bg-slate-700 border-slate-600"><SelectValue /></SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700 text-white">{GAME_MODES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
        </Select>
      </div>
    </CardContent>
  </Card>
);

const SuggestionResults = ({ suggestions, isLoading, error }) => {
  if (isLoading) {
    return <div className="mt-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto" /><p className="mt-2">AI is thinking...</p></div>;
  }
  if (error) {
    return <div className="mt-8 text-center text-red-400 p-4 bg-red-900/20 rounded-lg">{error}</div>;
  }
  if (suggestions.length === 0) {
    return (
        <div className="mt-8">
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader><CardTitle>Suggested Picks</CardTitle></CardHeader>
                <CardContent><p className="text-slate-400">Select enemy heroes and click "Suggest Heroes" to see recommendations.</p></CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="mt-8">
        <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader><CardTitle>AI-Powered Suggestions</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {suggestions.map((s, i) => <SuggestionCard key={i} suggestion={s} />)}
            </CardContent>
        </Card>
    </div>
  );
};

const SuggestionCard = ({ suggestion }) => (
    <Tooltip>
        <TooltipTrigger asChild>
            <div className="bg-slate-700/50 rounded-lg p-4 space-y-3 border-l-4 border-blue-500 hover:bg-slate-700 transition-colors cursor-pointer">
                <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12"><AvatarImage src={getHeroImageUrl(suggestion)} /><AvatarFallback>{suggestion.heroName.substring(0,2)}</AvatarFallback></Avatar>
                    <div>
                        <h4 className="font-semibold text-white">{suggestion.heroName}</h4>
                        <div className="flex items-center text-sm text-green-400 font-bold">
                            <BarChart className="h-4 w-4 mr-1" />
                            {suggestion.advantageScore}%
                        </div>
                    </div>
                </div>
                <div className="text-xs text-slate-300">
                    {suggestion.roles.join(', ')}
                </div>
            </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs bg-slate-800 border-slate-700 text-white">
            <div className="space-y-2 p-2">
                <div className="font-bold text-lg">{suggestion.heroName}</div>
                <div><strong className="text-red-400">Counters:</strong> {suggestion.counterStrategy}</div>
                <div><strong className="text-blue-400">Synergy:</strong> {suggestion.synergyStrategy}</div>
            </div>
        </TooltipContent>
    </Tooltip>
);

// TeamSection Component
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
  <Card className="bg-slate-800/50 border-slate-700">
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        {icon}
        <span>{title}</span>
      </CardTitle>
    </CardHeader>
    <CardContent className="grid grid-cols-5 gap-4">
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
    </CardContent>
  </Card>
);

// HeroSlot Component
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
        <Avatar className="h-20 w-20 border-2 border-slate-600 rounded-lg">
          <AvatarImage src={getHeroImageUrl(hero)} alt={hero.localized_name} />
          <AvatarFallback>{hero.localized_name.substring(0, 2)}</AvatarFallback>
        </Avatar>
        <button
          onClick={onRemove}
          className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-600 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="h-20 w-20 bg-slate-700/50 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors">
          <Plus className="h-8 w-8 text-slate-500" />
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

// HeroPicker Component
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
        <DialogContent className="max-w-4xl bg-slate-900 border-slate-700 text-white">
            <DialogHeader>
                <DialogTitle>Select a Hero</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <Input
                    placeholder="Search heroes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-slate-800 border-slate-600"
                />
            </div>
            <div className="max-h-[60vh] overflow-y-auto grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 pr-2">
                {filteredHeroes.map(hero => (
                    <button key={hero.id} onClick={() => onSelectHero(hero)} className="space-y-1 group">
                        <Avatar className="h-16 w-16 rounded-lg border-2 border-transparent group-hover:border-blue-500 transition-all">
                            <AvatarImage src={getHeroImageUrl(hero)} />
                            <AvatarFallback>{hero.localized_name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <p className="text-xs text-center text-slate-300 truncate">{hero.localized_name}</p>
                    </button>
                ))}
            </div>
        </DialogContent>
    )
}

export default CounterPicker; 
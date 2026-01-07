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
  DialogDescription,
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
import ScrambledText from '@/components/ScrambleText';
import SplashCursor from '@/components/SplashCursor';
import HeroGuideNew from '@/components/HeroGuideNew';

const RANKS = ["Herald", "Guardian", "Crusader", "Archon", "Legend", "Ancient", "Divine", "Immortal"];
const ROLES = ["Carry", "Midlaner", "Offlaner", "Soft Support", "Hard Support"];

const getHeroImageUrl = (hero: any) => {
  if (!hero || !hero.name) return '';
  const internalHeroName = hero.name.replace('npc_dota_hero_', '');
  // Use Steam CDN as alternative to avoid SSL certificate issues
  return `https://steamcdn-a.akamaihd.net/apps/dota2/images/heroes/${internalHeroName}_full.png`;
};

// Main Component
const CounterPicker: React.FC = () => {
  const [allHeroes, setAllHeroes] = useState<any[]>([]);
  const [alliedHeroes, setAlliedHeroes] = useState<{ hero: any | null; role: string }[]>(
    ROLES.map(role => ({ hero: null, role }))
  );
  const [enemyHeroes, setEnemyHeroes] = useState<(any | null)[]>(Array(5).fill(null));
  const [heroNameMap, setHeroNameMap] = useState<{ [key: string]: any }>({});
  const [rank, setRank] = useState("Legend");
  const [role, setRole] = useState("Carry");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<any | null>(null);
  const [bannedSuggestionIds, setBannedSuggestionIds] = useState<Set<number>>(new Set());
  const [guidePick, setGuidePick] = useState<{ hero: any, role: string } | null>(null);

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
    alliedHeroes.forEach(p => p.hero && picked.add(p.hero.id));
    enemyHeroes.forEach(h => h && picked.add(h.id));
    return picked;
  }, [alliedHeroes, enemyHeroes]);

  const handleSelectHero = (hero: any, team: 'allies' | 'enemies', index: number) => {
    if (team === 'allies') {
      setAlliedHeroes(current => {
        const newTeam = [...current];
        newTeam[index] = { ...newTeam[index], hero: hero };
        return newTeam;
      });
    } else {
      setEnemyHeroes(current => {
        const newTeam = [...current];
        newTeam[index] = hero;
        return newTeam;
      });
    }
  };

  const handleRemoveHero = (team: 'allies' | 'enemies', index: number) => {
    if (team === 'allies') {
      setAlliedHeroes(current => {
        const newTeam = [...current];
        newTeam[index] = { ...newTeam[index], hero: null };
        return newTeam;
      });
    } else {
      setEnemyHeroes(current => {
        const newTeam = [...current];
        newTeam[index] = null;
        return newTeam;
      });
    }
  };

  const handleConfirmPick = () => {
    if (!selectedSuggestion) return;

    const targetIndex = alliedHeroes.findIndex(p => p.role === role && p.hero === null);

    if (targetIndex !== -1) {
      setAlliedHeroes(currentAllies => {
        const newAllies = [...currentAllies];
        newAllies[targetIndex] = { ...newAllies[targetIndex], hero: selectedSuggestion };
        return newAllies;
      });
    } else {
      const firstEmptyIndex = alliedHeroes.findIndex(p => p.hero === null);
      if (firstEmptyIndex !== -1) {
        setAlliedHeroes(currentAllies => {
          const newAllies = [...currentAllies];
          newAllies[firstEmptyIndex] = { ...newAllies[firstEmptyIndex], hero: selectedSuggestion };
          return newAllies;
        });
      }
    }
    setSelectedSuggestion(null);
  };

  const handleBanSuggestion = (heroId: number) => {
    setBannedSuggestionIds(prev => new Set(prev).add(heroId));
  };

  const handleShowGuide = (hero: any, role: string) => {
    setGuidePick({ hero, role });
  };

  const handleSuggestHeroes = async (roleToFill: string) => {
    if (!roleToFill) {
      setError("No role selected to suggest for.");
      return;
    }

    setRole(roleToFill);
    setIsSuggesting(true);
    setError(null);

    const allies = alliedHeroes.filter(p => p.hero).map(p => `${p.hero.localized_name} (${p.role})`);
    const enemies = enemyHeroes.filter(Boolean).map(h => h.localized_name);

    if (enemies.length === 0) {
      setError("Please select at least one enemy hero to generate suggestions.");
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
      **You are a Dota 2 Counter Picker Assistant helping with Dota 2 drafting strategy **
      **Goal:** Suggest the top 5 heroes for the **${roleToFill}** role for "Your Team" to counter the "Enemy Team" and synergize with existing allies in a **${rank}** rank game. This is for the **last pick** in the draft, meaning the suggestion should maximize counter potential against the enemy team while complementing the allied team's composition.
      **Context:**
      - **Player Rank**: ${rank} (e.g., Herald prioritizes simple heroes with straightforward mechanics, Immortal emphasizes high-skill-ceiling heroes and meta strategies).
      - **Role to Fill**: ${roleToFill} (${roleToFill === "Carry" ? "needs farm priority and scales well into late game" : roleToFill === "Midlaner" ? "controls tempo and excels in 1v1 matchups" : roleToFill === "Offlaner" ? "initiates fights and survives in tough lanes" : roleToFill === "Soft Support" ? "provides utility and roaming potential" : "focuses on team sustain and defensive abilities"}).
      - **Your Team (Allies)**: ${allies.join(', ') || 'None'} (consider their roles, attributes [Strength, Agility, Intelligence], and synergy potential, e.g., combo ultimates, lane support).
      - **Enemy Team**: ${enemies.join(', ')} (analyze their roles, attributes, and key threats, e.g., enemy carry or midlaner).
      - **Banned Heroes**: ${bannedHeroes.join(', ') || 'None'} (do not suggest these heroes).
      - **Available Heroes**: ${unpickedHeroes.join(', ')} (only suggest heroes from this list).
      **Task:** Return a JSON array of exactly 5 hero suggestions. For each hero, provide:
      1. **heroName**: The exact name of the suggested hero from the available heroes list.
      2. **advantageScore**: A number from 0-100 indicating how effective the hero is (based on counter strength and synergy; higher scores for heroes that counter key enemy threats and synergize well).
      3. **counterStrategy**: A 1-2 sentence explanation of why this hero counters the enemy team (e.g., "Silencer's Global Silence disrupts enemy spellcasters like Storm Spirit" or "Axe's high armor counters physical damage dealers like Phantom Assassin").
      4. **synergyStrategy**: A 1-2 sentence explanation of how this hero synergizes with allies (e.g., "Enigma's Black Hole sets up teamfights for Magnus' Reverse Polarity" or "Oracle's False Promise enhances Faceless Void's survivability in Chronosphere").
      5. **roles**: An array of the hero's primary roles (e.g., ["Carry", "Durable"], ["Support", "Disabler"]).
      6. **primaryAttribute**: The hero's primary attribute ("Strength", "Agility", or "Intelligence").
      **Constraints:**
      - Only suggest heroes from the **Available Heroes** list.
      - Do not suggest heroes in the **Banned Heroes** list or already picked heroes.
      - Prioritize heroes that counter the enemy team's key threats (e.g., their carry or midlaner) while maintaining synergy with allies.
      - Consider rank-specific playstyles: simpler heroes for lower ranks (Herald, Guardian), meta or high-skill heroes for higher ranks (Divine, Immortal).
      - Balance countering enemies (e.g., silences vs. spellcasters, armor vs. physical damage) and synergy with allies (e.g., setup for ultimates, lane compatibility).
      - Avoid generic suggestions unless justified by specific matchups (e.g., don't default to overpicked heroes like Sniper unless they strongly counter the enemy).
      **Output Format:** A valid JSON array string inside a \`\`\`json code block. Do not include any text before or after the code block. Each entry must follow this format:
      \`\`\`json
      [
        {
          "heroName": "Silencer",
          "advantageScore": 85,
          "counterStrategy": "Global Silence interrupts Storm Spirit and Lina's high-damage spells.",
          "synergyStrategy": "Arcane Curse enhances Skywrath Mage's spell damage in lane.",
          "roles": ["Support", "Disabler"],
          "primaryAttribute": "Intelligence"
        }
      ]
      \`\`\`
      `;

    // console.log("Gemini Prompt for CounterPicker:", prompt);
    let text = '';
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        let errorDetails = `Status: ${response.status}.`;
        try {
          const errorData = await response.json();
          errorDetails += ` Message: ${errorData.error?.message || JSON.stringify(errorData)}`;
        } catch (e) {
          errorDetails += ' Could not parse error response body.';
        }
        throw new Error(`API request failed. ${errorDetails}`);
      }

      const data = await response.json();

      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error("Dota-Forger returned an empty response.");
      }

      text = data.candidates[0].content.parts[0].text;

      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```|(\[[\s\S]*\])/);
      if (!jsonMatch) {
        throw new Error("Could not find a JSON block in the Dota-Forger's response.");
      }
      const jsonString = jsonMatch[1] || jsonMatch[2];
      const parsedSuggestions = JSON.parse(jsonString);

      const enrichedSuggestions = parsedSuggestions.map((suggestion: any) => {
        const heroData = heroNameMap[suggestion.heroName.toLowerCase()];
        return { ...suggestion, ...heroData };
      }).filter((s: any) => s.id && !pickedHeroIds.has(s.id));

      setSuggestions(enrichedSuggestions);
    } catch (e: any) {
      console.error("Failed to get suggestions:", e);
      if (text) {
        console.error("Raw text that failed parsing:", text);
      }
      setError(`Failed to process Dota-Forger suggestions. ${e.message}`);
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="relative min-h-screen">
        {/* <SplashCursor /> */}
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="fixed inset-0 w-full h-full object-cover z-0"
          src="/WraithKing.mp4"
        />
        {/* Overlay for darkening and blur */}
        <div className="fixed inset-0 bg-black/20 z-10" />
        <div className="relative z-20 min-h-screen bg-gradient-to-b from-gray-900/50 to-gray-800/80 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <header className="mb-8 text-center">
              <ScrambledText
                className="text-4xl sm:text-8xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-red-400 m-0 max-w-none"
                radius={150}
                duration={0.8}
                speed={0.3}
                scrambleChars=".:!@#$%^&*()"
              >
                Dota 2 Counter Picker
              </ScrambledText>
              <ScrambledText
                className="mt-2 text-lg text-gray-300 m-0 max-w-none"
                radius={80}
                duration={0.6}
                speed={0.4}
                scrambleChars=".:!@#$%^&*()"
              >
                Smart hero suggestions to outdraft your opponents
              </ScrambledText>
            </header>

            <CounterPickerFilters rank={rank} setRank={setRank} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <TeamSection
                title="Your Team"
                heroes={alliedHeroes}
                onSelectHero={(h, i) => handleSelectHero(h, 'allies', i)}
                onRemoveHero={(i) => handleRemoveHero('allies', i)}
                allHeroes={allHeroes}
                pickedHeroIds={pickedHeroIds}
                icon={<Shield className="h-6 w-6 text-blue-400" />}
                isAlly={true}
                onShowGuide={handleShowGuide}
                onSuggest={handleSuggestHeroes}
              />
              <TeamSection
                title="Enemy Team"
                heroes={enemyHeroes}
                onSelectHero={(h, i) => handleSelectHero(h, 'enemies', i)}
                onRemoveHero={(i) => handleRemoveHero('enemies', i)}
                allHeroes={allHeroes}
                pickedHeroIds={pickedHeroIds}
                icon={<Swords className="h-6 w-6 text-red-400" />}
                isAlly={false}
                onShowGuide={() => { }}
              />
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
            <HeroGuideNew
              hero={guidePick?.hero}
              role={guidePick?.role}
              allies={alliedHeroes}
              enemies={enemyHeroes}
              open={!!guidePick}
              onOpenChange={(isOpen) => !isOpen && setGuidePick(null)}
            />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

const CounterPickerFilters = ({ rank, setRank }) => (
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
    </CardContent>
  </Card>
);

const SuggestionResults = ({ suggestions, isLoading, error, onSuggestionClick, onBanSuggestion, bannedSuggestionIds }) => {
  if (isLoading) {
    return (
      <div className="mt-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-400" />
        <p className="mt-2 text-gray-300">Dota-Forger is analyzing the draft...</p>
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
        <Card className="h-[280px] bg-gray-800/50 border-gray-700 shadow-lg backdrop-blur-sm rounded-xl">

          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">Suggested Picks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">
              Use <span className="text-red-400 font-semibold">'Suggest'</span> on empty slots to see optimal picks.
              Want deeper insights? Just click a <span className="text-blue-400 font-semibold">picked hero</span> to view a personalized guide.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <Card className="bg-gray-800/50 border-gray-700 shadow-lg backdrop-blur-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white">Dota-Forger Suggestions</CardTitle>
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
  const cardClasses = `relative bg-gray-700/50 rounded-lg p-4 space-y-3 border-l-4 border-blue-500 transition-all duration-300 shadow-md ${isBanned
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
  heroes: any[];
  onSelectHero: (hero: any, index: number) => void;
  onRemoveHero: (index: number) => void;
  allHeroes: any[];
  pickedHeroIds: Set<number>;
  icon: React.ReactNode;
  isAlly: boolean;
  onShowGuide: (hero: any, role: string) => void;
  onSuggest?: (role: string) => void;
}

const TeamSection: React.FC<TeamSectionProps> = ({ title, heroes, onSelectHero, onRemoveHero, allHeroes, pickedHeroIds, icon, isAlly, onShowGuide, onSuggest }) => (
  <Card className="bg-gray-800/50 border-gray-700 shadow-lg backdrop-blur-sm rounded-xl">
    <CardHeader>
      <CardTitle className="flex items-center space-x-2 text-xl font-bold text-white">
        {icon}
        <span>{title}</span>
      </CardTitle>
    </CardHeader>
    <CardContent className="grid grid-cols-5 gap-3">
      {heroes.map((item, index) => (
        <HeroSlot
          key={index}
          hero={isAlly ? item.hero : item}
          role={isAlly ? item.role : ''}
          onSelect={(h) => onSelectHero(h, index)}
          onRemove={() => onRemoveHero(index)}
          allHeroes={allHeroes}
          pickedHeroIds={pickedHeroIds}
          isAlly={isAlly}
          onShowGuide={onShowGuide}
          onSuggest={isAlly ? onSuggest : undefined}
        />
      ))}
    </CardContent>
  </Card>
);

interface HeroSlotProps {
  hero: any | null;
  role: string;
  onSelect: (hero: any) => void;
  onRemove: () => void;
  allHeroes: any[];
  pickedHeroIds: Set<number>;
  isAlly: boolean;
  onShowGuide: (hero: any, role: string) => void;
  onSuggest?: (role: string) => void;
}

const HeroSlot: React.FC<HeroSlotProps> = ({
  hero,
  role,
  onSelect,
  onRemove,
  allHeroes,
  pickedHeroIds,
  isAlly,
  onShowGuide,
  onSuggest,
}) => {
  const [open, setOpen] = useState(false);

  if (hero) {
    return (
      <div className="relative group text-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => isAlly && onShowGuide(hero, role)}
              disabled={!isAlly}
              className="disabled:cursor-not-allowed"
            >
              <Avatar className="h-20 w-20 border-2 border-gray-600 rounded-lg transition-all duration-300 group-hover:scale-105 group-hover:border-blue-500">
                <AvatarImage src={getHeroImageUrl(hero)} alt={hero.localized_name} />
                <AvatarFallback className="bg-gray-600 text-white">{hero.localized_name.substring(0, 2)}</AvatarFallback>
              </Avatar>
            </button>
          </TooltipTrigger>
          {isAlly && (
            <TooltipContent>
              <p>Click to see OpenAI's guide for {role}</p>
            </TooltipContent>
          )}
        </Tooltip>
        {role && <p className="text-xs text-gray-400 mt-1 truncate font-semibold">{role}</p>}
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
    <div className="text-center">
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
          role={role}
          onSuggest={(roleForSuggest) => {
            if (onSuggest) {
              onSuggest(roleForSuggest);
            }
            setOpen(false);
          }}
        />
      </Dialog>
      {role && <p className="text-xs text-gray-400 mt-1 truncate font-semibold">{role}</p>}
    </div>
  );
};

interface HeroPickerProps {
  allHeroes: any[];
  pickedHeroIds: Set<number>;
  onSelectHero: (hero: any) => void;
  role: string;
  onSuggest: (role: string) => void;
}

const HeroPicker: React.FC<HeroPickerProps> = ({
  allHeroes,
  pickedHeroIds,
  onSelectHero,
  role,
  onSuggest,
}) => {
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
        <DialogTitle className="text-2xl font-bold text-white">Select a Hero for {role}</DialogTitle>
        <DialogDescription className="text-gray-400">
          Choose a hero from the list below or use AI suggestions to find the best pick for this role.
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        {onSuggest && (
          <Button onClick={() => onSuggest(role)} className="bg-blue-600 hover:bg-blue-700">
            <BrainCircuit className="h-4 w-4" />
            <span className="ml-2"> Suggest for {role}</span>
          </Button>
        )}
        <Input
          placeholder="Search heroes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="max-h-[60vh] overflow-y-auto pr-2">
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
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
      </div>
    </DialogContent>
  );
};

export default CounterPicker;
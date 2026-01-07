import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Loader2, Swords, Shield, Star, Skull, BookOpen } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface HeroGuideProps {
  hero: any;
  role?: string;
  allies: { hero: any | null; role: string }[];
  enemies: any[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const HeroGuideNew: React.FC<HeroGuideProps> = ({ hero, role, allies, enemies, open, onOpenChange }) => {
  const [guide, setGuide] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && hero) {
      const fetchGuide = async () => {
        setIsLoading(true);
        setError(null);
        setGuide(null);

        const alliedNames = allies.filter(p => p.hero).map(p => `${p.hero.localized_name} (${p.role})`);
        const enemyNames = enemies.filter(Boolean).map(h => h.localized_name);

        let openDotaContext = '';
        try {
          const [matchupRes, itemRes] = await Promise.all([
            fetch(`https://api.opendota.com/api/heroes/${hero.id}/matchups`),
            fetch(`https://api.opendota.com/api/heroes/${hero.id}/itemPopularity`)
          ]);

          if (matchupRes.ok) {
            const matchupStats = await matchupRes.json();
            const topCounters = matchupStats
              .filter(enemy => enemyNames.includes(enemy.hero_localized_name))
              .sort((a, b) => (a.wins / a.games_played) - (b.wins / b.games_played))
              .slice(0, 3);

            if (topCounters.length > 0) {
              const topCountersInfo = topCounters.map(c => `${c.hero_localized_name} (${((c.wins / c.games_played) * 100).toFixed(0)}% winrate vs them)`).join(', ');
              openDotaContext += `- **Historical Matchups vs Enemies**: ${hero.localized_name} struggles against: ${topCountersInfo}.\n`;
            }
          }

          if (itemRes.ok) {
            const itemStats = await itemRes.json();
            const allPopularItems = {
              ...itemStats.early_game_items,
              ...itemStats.mid_game_items,
              ...itemStats.late_game_items,
            };

            const topItems = Object.entries(allPopularItems)
              .sort(([, a], [, b]) => Number(b) - Number(a))
              .slice(0, 5)
              .map(([item]) => item.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '));

            if (topItems.length > 0) {
              openDotaContext += `- **Most Popular Items**: ${topItems.join(', ')}.\n`;
            }
          }
        } catch (e) {
          console.error("Failed to fetch OpenDota data", e);
          openDotaContext = 'Failed to fetch real-time data from OpenDota.';
        }

        const prompt = `
          You are a Dota 2 expert coach and analyst.

          Goal: Generate a personalized, strategic hero guide for ${hero.localized_name} playing as **${role}**. The guide must be tailored to the specific matchup context provided below.

          Matchup Context:
          - Selected Hero: ${hero.localized_name}
          - Role: ${role}
          - Allied Team Picks: ${alliedNames.join(', ') || 'None'}
          - Enemy Team Picks: ${enemyNames.join(', ') || 'None'}

          **Extra Data from OpenDota API (use this to inform your suggestions):**
          ${openDotaContext || 'N/A'}

          Instructions:
          - Your response must be a valid single JSON object. Do not include any text or markdown outside the JSON object.
          - Tailor all guidance to this specific draft and matchup. Use the OpenDota data to provide statistically-backed advice. For example, if ${hero.localized_name} has a low winrate against an enemy, suggest items or strategies to mitigate that.
          - Avoid generic advice. All recommendations must be matchup-specific and practical.
          - Be concise: 4-5 bullet points per section max.

          Required JSON Structure:

          {
            "itemBuild": {
              "startingItems": ["Tango", "Quelling Blade"],
              "coreItems": [
                { "item": "Black King Bar", "reason": "To counter enemy disables from Lion and Skywrath Mage" },
                { "item": "Blink Dagger", "reason": "To initiate on their squishy backliners" }
              ],
              "situationalItems": [
                { "item": "Lotus Orb", "reason": "To reflect or remove silences" },
                { "item": "Shiva's Guard", "reason": "To reduce enemy healing and armor" }
              ]
            },
            "skillBuild": "Prioritize Arc Lightning for lane harass and wave clear. Take one level in Lightning Bolt early for vision and burst. Suggested build: Q-Q-E-Q-R-Q-Q.",
            "laningPhase": [
              "Focus on safe last-hitting with your high base damage.",
              "Harass enemy offlaner when they try to last hit.",
              "Use spells conservatively against mana burners like Nyx or AM."
            ],
            "midGame": [
              "Join fights after key item timings (e.g., BKB or Blink).",
              "Play around vision and avoid solo pickoffs.",
              "Control objectives like towers and Roshan with your team."
            ],
            "lateGame": [
              "Position behind your frontline to avoid getting jumped.",
              "Use core item actives wisely—e.g., BKB after silence chains.",
              "Look for buyback + TP plays near towers or Rosh."
            ],
            "thingsToAvoid": [
              "Avoid face-checking high ground without vision.",
              "Don't use your key abilities on illusion bait heroes.",
              "Avoid splitting from your team once fights break out."
            ]
          }

          Additional Guidelines:
          - Be specific with item and skill justifications, explaining *why* they are good in this specific role and against the enemy team composition.
          - Mention counterplay and synergy based on allied and enemy picks.
          - Use accurate Dota 2 item/spell names only.
          - Your response must be 100% valid JSON. No extra commentary.
        `;

        // console.log("OpenAI Prompt for HeroGuide:", prompt);
        try {
          const response = await fetch('/api/openai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt }),
          });

          if (!response.ok) {
            throw new Error('Failed to fetch guide from Dota-Forger.');
          }

          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (!content) {
            throw new Error("Dota-Forger returned an empty response.");
          }

          setGuide(JSON.parse(content));
        } catch (e: any) {
          setError(e.message);
        } finally {
          setIsLoading(false);
        }
      };

      fetchGuide();
    }
  }, [open, hero, role, allies, enemies]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        style={{ width: '60vw', maxWidth: 'none' }}
        className="bg-gray-900/90 border-gray-700 text-white overflow-y-auto"
      >
        {hero && (
          <SheetHeader>
            <SheetTitle className="text-3xl text-white flex items-center gap-4">
              <img
                src={`https://steamcdn-a.akamaihd.net/apps/dota2/images/heroes/${hero.name.replace('npc_dota_hero_', '')}_icon.png`}
                alt={hero.localized_name}
                className="h-12 w-12 rounded-lg"
              />
              <div>
                {hero.localized_name} Guide
                {role && <span className="block text-lg font-normal text-blue-300">{role}</span>}
              </div>
            </SheetTitle>
            <SheetDescription className="text-gray-400">
            Dota-Forger's guide tailored to the current matchup and role.
            </SheetDescription>
          </SheetHeader>
        )}
        <div className="py-4 space-y-6">
          {isLoading && <GuideSkeleton />}
          {error && (
            <div className="text-red-400 text-center p-4 bg-red-900/20 rounded-lg">{error}</div>
          )}
          {guide && (
            <>
              <GuideSection title="Item Build" icon={<Swords className="text-yellow-400" />}>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-blue-300 mb-1">Starting Items</h4>
                    <p className="text-gray-300">{guide.itemBuild?.startingItems?.join(', ') || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-300 mb-1">Core Items</h4>
                    <ul className="list-disc list-inside text-gray-300 pl-2 space-y-1">
                      {(guide.itemBuild?.coreItems || []).map((item: { item: string, reason: string }, index: number) => (
                        <li key={index}><strong>{item.item}:</strong> {item.reason}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-300 mb-1">Situational Items</h4>
                    <ul className="list-disc list-inside text-gray-300 pl-2 space-y-1">
                      {(guide.itemBuild?.situationalItems || []).map((item: { item: string, reason: string }, index: number) => <li key={index}><strong>{item.item}:</strong> {item.reason}</li>)}
                    </ul>
                  </div>
                </div>
              </GuideSection>

              <GuideSection title="Skill Build" icon={<Star className="text-green-400" />}>
                <p className="text-gray-300">{guide.skillBuild || 'N/A'}</p>
              </GuideSection>

              <GuideSection title="Laning Phase (0-10 min)" icon={<Shield className="text-blue-400" />}>
                <ul className="list-disc list-inside space-y-1 text-gray-300 pl-2">
                  {(guide.laningPhase || []).map((tip: string, index: number) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </GuideSection>

              <GuideSection title="Mid Game (10-25 min)" icon={<Shield className="text-blue-400" />}>
                <ul className="list-disc list-inside space-y-1 text-gray-300 pl-2">
                  {(guide.midGame || []).map((tip: string, index: number) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </GuideSection>

              <GuideSection title="Late Game (25+ min)" icon={<Shield className="text-blue-400" />}>
                <ul className="list-disc list-inside space-y-1 text-gray-300 pl-2">
                  {(guide.lateGame || []).map((tip: string, index: number) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </GuideSection>

              <GuideSection title="Things to Avoid" icon={<Skull className="text-red-500" />}>
                <ul className="list-disc list-inside space-y-1 text-red-300 pl-2">
                  {(guide.thingsToAvoid || []).map((avoid: string, index: number) => <li key={index}>{avoid}</li>)}
                </ul>
              </GuideSection>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

const GuideSection = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
    <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-3">
      {icon}
      {title}
    </h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const GuideSkeleton = () => (
  <div className="space-y-6">
    <div className="text-center py-4">
      <p className="text-lg font-semibold text-white animate-pulse">We are still cooking for you...</p>
    </div>
    <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="h-7 w-7 rounded-md" />
        <Skeleton className="h-7 w-32" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/3 mt-2" />
        <div className="pl-2 space-y-1 mt-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    </div>
    <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="h-7 w-7 rounded-md" />
        <Skeleton className="h-7 w-28" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
    <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="h-7 w-7 rounded-md" />
        <Skeleton className="h-7 w-40" />
      </div>
      <div className="pl-2 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  </div>
);

export default HeroGuideNew; 
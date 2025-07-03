import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Loader2, Swords, Shield, Star, Skull, BookOpen } from 'lucide-react';

interface HeroGuideProps {
  hero: any;
  allies: any[];
  enemies: any[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const HeroGuide: React.FC<HeroGuideProps> = ({ hero, allies, enemies, open, onOpenChange }) => {
  const [guide, setGuide] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && hero) {
      const fetchGuide = async () => {
        setIsLoading(true);
        setError(null);
        setGuide(null);

        const alliedNames = allies.filter(Boolean).map(h => h.localized_name);
        const enemyNames = enemies.filter(Boolean).map(h => h.localized_name);

        const prompt = `
          You are a Dota 2 expert coach and analyst.

          Goal: Generate a personalized, strategic hero guide for ${hero.localized_name}, based on current team composition.

          Matchup Context:
          - Selected Hero: ${hero.localized_name}
          - Allied Team Picks: ${alliedNames.join(', ') || 'None'}
          - Enemy Team Picks: ${enemyNames.join(', ') || 'None'}

          Instructions:
          - Your response must be a valid single JSON object inside a \`\`\`json code block. Do not include any text or markdown outside this block.
          - Tailor all guidance to this specific draft and matchup.
          - Avoid generic advice. All recommendations must be matchup-specific and practical.
          - Be concise: 3-4 bullet points per section max.

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
          - Be specific with item and skill justifications.
          - Mention counterplay and synergy based on allied and enemy picks.
          - Use accurate Dota 2 item/spell names only.
          - Your response must be 100% valid JSON in a single \`\`\`json code block. No extra commentary.
        `;

        try {
          const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt }),
          });

          if (!response.ok) {
            throw new Error('Failed to fetch guide from AI.');
          }

          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) {
            throw new Error("AI returned an empty response.");
          }

          const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```|({[\s\S]*})/);
          if (!jsonMatch) {
            throw new Error("Could not find a JSON block in the AI's response.");
          }
          const jsonString = jsonMatch[1] || jsonMatch[2];

          setGuide(JSON.parse(jsonString));
        } catch (e: any) {
          setError(e.message);
        } finally {
          setIsLoading(false);
        }
      };

      fetchGuide();
    }
  }, [open, hero, allies, enemies]);

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
                src={`https://cdn.dota2.com/apps/dota2/images/heroes/${hero.name.replace('npc_dota_hero_', '')}_icon.png`}
                alt={hero.localized_name}
                className="h-12 w-12 rounded-lg"
              />
              {hero.localized_name} Guide
            </SheetTitle>
            <SheetDescription className="text-gray-400">
              AI-generated guide tailored to the current matchup.
            </SheetDescription>
          </SheetHeader>
        )}
        <div className="py-4 space-y-6">
          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
            </div>
          )}
          {error && (
            <div className="text-red-400 text-center p-4 bg-red-900/20 rounded-lg">{error}</div>
          )}
          {guide && (
            <>
              <GuideSection title="Item Build" icon={<Swords className="text-yellow-400" />}>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-blue-300 mb-1">Starting Items</h4>
                    <p className="text-gray-300">{guide.itemBuild.startingItems.join(', ')}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-300 mb-1">Core Items</h4>
                    <ul className="list-disc list-inside text-gray-300 pl-2 space-y-1">
                      {guide.itemBuild.coreItems.map((item: { item: string, reason: string }, index: number) => (
                        <li key={index}><strong>{item.item}:</strong> {item.reason}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-300 mb-1">Situational Items</h4>
                    <ul className="list-disc list-inside text-gray-300 pl-2 space-y-1">
                      {guide.itemBuild.situationalItems.map((item: { item: string, reason: string }, index: number) => <li key={index}><strong>{item.item}:</strong> {item.reason}</li>)}
                    </ul>
                  </div>
                </div>
              </GuideSection>

              <GuideSection title="Skill Build" icon={<Star className="text-green-400" />}>
                <p className="text-gray-300">{guide.skillBuild}</p>
              </GuideSection>

              <GuideSection title="Laning Phase (0-10 min)" icon={<Shield className="text-blue-400" />}>
                <ul className="list-disc list-inside space-y-1 text-gray-300 pl-2">
                  {guide.laningPhase.map((tip: string, index: number) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </GuideSection>

              <GuideSection title="Mid Game (10-25 min)" icon={<Shield className="text-blue-400" />}>
                <ul className="list-disc list-inside space-y-1 text-gray-300 pl-2">
                  {guide.midGame.map((tip: string, index: number) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </GuideSection>

              <GuideSection title="Late Game (25+ min)" icon={<Shield className="text-blue-400" />}>
                <ul className="list-disc list-inside space-y-1 text-gray-300 pl-2">
                  {guide.lateGame.map((tip: string, index: number) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </GuideSection>

              <GuideSection title="Things to Avoid" icon={<Skull className="text-red-500" />}>
                <ul className="list-disc list-inside space-y-1 text-red-300 pl-2">
                  {guide.thingsToAvoid.map((avoid: string, index: number) => <li key={index}>{avoid}</li>)}
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

export default HeroGuide;
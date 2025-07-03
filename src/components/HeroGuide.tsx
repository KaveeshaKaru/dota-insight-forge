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
          **Dota 2 Hero Guide Assistant**
          **Goal:** Generate a concise, actionable in-game guide for the hero **${hero.localized_name}** tailored to the specific matchup.
          **Matchup Context:**
          - **Selected Hero:** ${hero.localized_name}
          - **Allied Team:** ${alliedNames.join(', ')}
          - **Enemy Team:** ${enemyNames.join(', ')}

          **Task:** Provide a detailed guide in a valid JSON object format. The guide must include the following sections:
          1. **"itemBuild"**: An object with three keys:
             - **"startingItems"**: An array of 3-4 starting item names (e.g., "Tango", "Quelling Blade"). These should be essential for the laning phase.
             - **"coreItems"**: An array of 2-3 essential core item names for this specific matchup (e.g., "Black King Bar", "Blink Dagger"). Include a brief reason for each (e.g., "Black King Bar to counter enemy disables").
             - **"situationalItems"**: An array of 2-3 situational item names with a brief reason for each (e.g., "Heaven's Halberd to disarm their carry"). These should address specific threats or opportunities in the matchup.
          2. **"skillBuild"**: A brief description of the recommended skill build order for the first 7 levels, including a short justification (e.g., "Prioritize 'Breathe Fire' for lane dominance, taking one level in 'Dragon Tail' for the stun. Build: Q-W-Q-E-Q-R-Q").
          3. **"laningPhase"**: 2-3 bullet points on how to approach the laning phase (0-10 minutes). Focus on:
             - Last-hitting and denying.
             - Harassing or trading with the enemy laner(s).
             - Surviving against likely enemy laners or gankers.
          4. **"midGame"**: 2-3 bullet points for the mid-game (10-25 minutes). Focus on:
             - Key objectives (e.g., towers, Roshan).
             - Power spikes from items or levels.
             - Team fight participation and positioning.
          5. **"lateGame"**: 2-3 bullet points for the late game (25+ minutes). Focus on:
             - Role in team fights (e.g., initiator, damage dealer).
             - High-impact item usage (e.g., BKB timing, Blink Dagger initiations).
             - Winning conditions or strategies to close out the game.
          6. **"thingsToAvoid"**: 2-3 critical mistakes to avoid in this specific matchup (e.g., "Avoid initiating on Anti-Mage without a guaranteed stun" or "Don't use Black Hole until key enemy spells are on cooldown").

          **Instructions:**
          - Ensure all advice is concise, actionable, and specific to the hero's role and the matchup.
          - Consider the hero's strengths, weaknesses, and synergies with allies and counters to enemies.
          - For item and skill builds, provide brief justifications to explain why they are recommended.
          - Keep each section focused and avoid general advice—tailor it to the given team compositions.
          - Limit each section to 2-3 bullet points or a short paragraph for clarity.

          **Output Format:** Your response MUST be a single, valid JSON object string inside a \`\`\`json code block. Do not include any other text, notes, or markdown formatting outside of the JSON object.
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
                    <ul className="list-disc list-inside text-gray-300 pl-2">
                      {guide.itemBuild.coreItems.map((item: string, index: number) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-300 mb-1">Situational Items</h4>
                    <ul className="list-disc list-inside text-gray-300 pl-2">
                      {guide.itemBuild.situationalItems.map((item: string, index: number) => (
                        <li key={index}>{item}</li>
                      ))}
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
                <ul className="list-disc list-inside space-y-1 text-red-400 pl-2">
                  {guide.thingsToAvoid.map((avoid: string, index: number) => (
                    <li key={index}>{avoid}</li>
                  ))}
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
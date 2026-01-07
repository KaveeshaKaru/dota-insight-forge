import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { heroService } from '../services/hero-service';
import { itemService } from '../services/item-service';

// Interface for the main player data from the match
interface ApiPlayer {
  account_id: number;
  personaname: string;
  name?: string;
  hero_id: number;
  player_slot: number; // Using player_slot for team determination
  is_radiant: boolean; // Keep for fallback if needed, but slot is primary
  kills: number;
  deaths: number;
  assists: number;
  gold_per_min: number;
  xp_per_min: number;
  net_worth: number;
  level: number;
  last_hits: number;
  denies: number;
  item_0: number;
  item_1: number;
  item_2: number;
  item_3: number;
  item_4: number;
  item_5: number;
}

// Interface for the static hero data
interface HeroData {
  id: number;
  name: string;
  localized_name: string;
}

interface ItemData {
  id: number;
  dname: string;
  qual?: string;
  cost?: number;
  behavior?: string | string[];
  desc?: string;
  notes?: string;
  attrib?: {
    key: string;
    header?: string;
    value: string | string[];
    display?: string;
    footer?: string;
  }[];
  mc?: number | boolean;
  cd?: number | boolean;
  lore?: string;
  components?: string[] | null;
  created?: boolean;
  img?: string;
  abilities?: { type: string; title: string; description: string }[];
}

type HeroDataMap = { [key: number]: HeroData };
type ItemDataMapById = { [key: number]: ItemData };
type ItemDataMapByName = { [key: string]: ItemData };

interface PlayerStatsProps {
  players: ApiPlayer[];
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ players }) => {
  const [heroDataMap, setHeroDataMap] = useState<HeroDataMap | null>(null);
  const [itemMapById, setItemMapById] = useState<ItemDataMapById | null>(null);
  const [itemMapByName, setItemMapByName] = useState<ItemDataMapByName | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [heroes, itemsById, itemsByName] = await Promise.all([
          heroService.getHeroMap(),
          itemService.getItemMapById(),
          itemService.getItemMapByName()
        ]);
        setHeroDataMap(heroes);
        setItemMapById(itemsById);
        setItemMapByName(itemsByName);
      } catch (error) {
        console.error("Could not fetch constant data for PlayerStats:", error);
      }
    };
    fetchData();
  }, []);

  if (!Array.isArray(players) || !heroDataMap || !itemMapById || !itemMapByName) {
    return <Card className="bg-slate-800/50 border-slate-700 text-white p-4 text-center max-w-7xl mx-auto"><p>Loading Player Stats...</p></Card>;
  }

  // Use player_slot for reliable team filtering.
  const radiantPlayers = players.filter(p => p.player_slot < 128);
  const direPlayers = players.filter(p => p.player_slot >= 128);

  const PlayerCard: React.FC<{ player: ApiPlayer }> = ({ player }) => {
    const items = [
        player.item_0, player.item_1, player.item_2, 
        player.item_3, player.item_4, player.item_5
    ].filter(id => id > 0);

    const hero = heroDataMap[player.hero_id];
    const heroName = hero?.localized_name || `ID: ${player.hero_id}`;
    const internalHeroName = hero?.name?.replace('npc_dota_hero_', '');
    const heroImageUrl = internalHeroName ? `https://steamcdn-a.akamaihd.net/apps/dota2/images/heroes/${internalHeroName}_full.png` : '';
    const playerName = player.personaname || player.name || 'Anonymous';

    return (
      <div className="bg-slate-700/50 rounded-lg p-4 space-y-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12 flex-shrink-0">
            <AvatarImage src={heroImageUrl} alt={heroName} />
            <AvatarFallback className="bg-slate-600 text-white">{heroName.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-white truncate" title={playerName}>{playerName}</h4>
            <p className="text-sm text-gray-400">{heroName}</p>
          </div>
          <Badge variant="outline" className="ml-auto text-yellow-400 border-yellow-400 flex-shrink-0">Lv {player.level ?? 'N/A'}</Badge>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div><div className="text-lg font-bold text-green-400">{player.kills ?? 0}</div><div className="text-xs text-gray-400">KILLS</div></div>
          <div><div className="text-lg font-bold text-red-400">{player.deaths ?? 0}</div><div className="text-xs text-gray-400">DEATHS</div></div>
          <div><div className="text-lg font-bold text-blue-400">{player.assists ?? 0}</div><div className="text-xs text-gray-400">ASSISTS</div></div>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-400">GPM:</span><span className="text-yellow-400 font-semibold">{player.gold_per_min ?? 0}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">XPM:</span><span className="text-blue-400 font-semibold">{player.xp_per_min ?? 0}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Net Worth:</span><span className="text-green-400 font-semibold">{(player.net_worth ?? 0).toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">LH/D:</span><span className="text-white font-semibold">{player.last_hits ?? 0}/{player.denies ?? 0}</span></div>
        </div>
        <div>
          <h5 className="text-sm font-semibold text-gray-300 mb-2">Items:</h5>
          <div className="grid grid-cols-6 gap-2">
            {items.map((itemId) => {
              const item = itemMapById[itemId];
              const itemImageUrl = item?.img ? `https://cdn.dota2.com${item.img}` : '';
              const components = item?.components?.map(name => itemMapByName[name]).filter(Boolean) || [];

              return (
                <Tooltip key={itemId} delayDuration={100}>
                  <TooltipTrigger asChild>
                    <div className="aspect-square bg-slate-600 rounded border border-slate-500 overflow-hidden hover:border-yellow-400 transition-colors">
                      {item ? (<img src={itemImageUrl} alt={item.dname} className="w-full h-full object-cover" />) : (<div className="w-full h-full" />)}
                    </div>
                  </TooltipTrigger>
                  {item && (
                    <TooltipContent className="bg-[#0e1625] border-[#1c2a40] text-gray-200 p-0 max-w-sm" side="top" align="center">
                      <div className="flex flex-col">
                        <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 p-3 flex items-center space-x-3">
                          <img src={itemImageUrl} alt={item.dname} className="w-16 h-12 object-contain" />
                          <div>
                            <h3 className="text-lg font-bold">{item.dname}</h3>
                            <div className="flex items-center space-x-2 text-yellow-400">
                              <img src="https://cdn.dota2.com/apps/dota2/images/tooltips/gold.png" alt="gold" className="w-5 h-5" />
                              <span>{item.cost}</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 space-y-3">
                          <div className="space-y-1 border-b border-slate-700 pb-3 mb-3">
                            {item.behavior && <p className="text-xs text-gray-400">ABILITY: {Array.isArray(item.behavior) ? item.behavior.join(', ') : item.behavior}</p>}
                            {item.attrib?.filter(attr => attr.display).map(attr => (<p key={attr.key} className="text-sm text-gray-300" dangerouslySetInnerHTML={{ __html: attr.display!.replace('{value}', attr.value as string) }} />))}
                          </div>

                          {item.abilities?.map((ability, index) => (
                            <div key={index} className="bg-slate-800/60 p-3 rounded-md space-y-2">
                              <div className="flex justify-between items-center"><h4 className="font-semibold text-white">{ability.title}</h4><div className="flex items-center space-x-3 text-sm">
                                {typeof item.mc === 'number' && item.mc > 0 && <div className="flex items-center space-x-1"><div className="w-4 h-4 bg-blue-500 rounded-sm border border-blue-300" /><span className="text-blue-300">{item.mc}</span></div>}
                                {typeof item.cd === 'number' && item.cd > 0 && <div className="flex items-center space-x-1"><div className="w-4 h-4 bg-slate-600 rounded-sm border border-slate-400" /><span className="text-gray-300">{item.cd}</span></div>}
                              </div></div>
                              <p className="text-sm text-gray-300 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: ability.description.replace(/\\n/g, "<br />").replace(/%%/g, "%") }} />
                            </div>
                          ))}

                          {item.notes && <div className="bg-slate-800/60 p-3 rounded-md"><p className="text-xs text-gray-400">{item.notes}</p></div>}
                          {item.lore && <p className="text-xs text-gray-500 italic pt-2">{item.lore}</p>}

                          {components.length > 0 && (
                            <div className="border-t border-slate-700 pt-3 mt-3">
                              <h4 className="text-xs text-gray-400 mb-2">Components:</h4>
                              <div className="flex space-x-2">
                                {components.map(comp => (
                                  <img key={comp.id} src={`https://cdn.dota2.com${comp.img}`} title={comp.dname} className="w-10 h-8 object-contain bg-slate-800 rounded" />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
            {Array(6 - items.length).fill(0).map((_, index) => (<div key={`empty-${index}`} className="aspect-square bg-slate-800/50 rounded"></div>))}
          </div>
        </div>
      </div>
    );
  }

  // On large screens (lg), we show 5 columns. We also add padding to the container.
  const gridClasses = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4";

  return (
    // This container now controls its own padding to look good at full width
    <TooltipProvider>
      <div className="space-y-6 px-4 sm:px-6 lg:px-8">
        <Card className="bg-slate-800/50 border-slate-700 text-white">
          <CardHeader><CardTitle className="flex items-center space-x-2"><div className="w-4 h-4 bg-green-500 rounded-full"></div><span>Radiant Team</span></CardTitle></CardHeader>
          <CardContent><div className={gridClasses}>{radiantPlayers.map((player, i) => (<PlayerCard key={player.account_id || i} player={player} />))}</div></CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700 text-white">
          <CardHeader><CardTitle className="flex items-center space-x-2"><div className="w-4 h-4 bg-red-500 rounded-full"></div><span>Dire Team</span></CardTitle></CardHeader>
          <CardContent><div className={gridClasses}>{direPlayers.map((player, i) => (<PlayerCard key={player.account_id || i} player={player} />))}</div></CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default PlayerStats;

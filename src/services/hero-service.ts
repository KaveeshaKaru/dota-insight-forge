interface HeroData {
  id: number;
  name: string;
  localized_name: string;
}

type HeroMap = { [key: number]: HeroData };

class HeroService {
  private static instance: HeroService;
  private heroMap: Promise<HeroMap> | null = null;

  private constructor() {
    this.initialize();
  }

  public static getInstance(): HeroService {
    if (!HeroService.instance) {
      HeroService.instance = new HeroService();
    }
    return HeroService.instance;
  }

  private initialize() {
    this.heroMap = fetch('https://api.opendota.com/api/constants/heroes')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch hero data');
        }
        return response.json();
      })
      .catch(error => {
        console.error("Could not initialize HeroService:", error);
        return {}; // Return empty object on failure
      });
  }

  public async getHeroName(heroId: number): Promise<string> {
    const map = await this.heroMap;
    return map?.[heroId]?.localized_name || `Hero ID ${heroId}`;
  }
  
  public async getHeroMap(): Promise<HeroMap | null> {
      return this.heroMap;
  }
}

export const heroService = HeroService.getInstance(); 
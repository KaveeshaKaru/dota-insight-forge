// A more detailed interface to match the rich data from the API
interface ItemData {
  id: number;
  dname: string; // Display Name
  qual?: string;
  cost?: number;
  desc?: string;
  notes?: string;
  attrib?: {
    key: string;
    header: string;
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
}

// The API gives us an object with internal names as keys. We want a map with IDs as keys.
type ItemDataMap = { [key: number]: ItemData };

// The service now also stores the map keyed by the internal name for component lookups
class ItemService {
  private static instance: ItemService;
  private itemMapById: Promise<ItemDataMap> | null = null;
  private itemMapByName: Promise<{ [key: string]: ItemData }> | null = null;

  private constructor() {
    this.initialize();
  }

  public static getInstance(): ItemService {
    if (!ItemService.instance) {
      ItemService.instance = new ItemService();
    }
    return ItemService.instance;
  }

  private initialize() {
    // We fetch the items, which are keyed by name (e.g., "phase_boots")
    const itemsPromise = fetch('https://api.opendota.com/api/constants/items')
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch item data');
        return response.json();
      })
      .catch(error => {
        console.error("Could not initialize ItemService:", error);
        return {}; // Return empty object on failure
      });

    this.itemMapByName = itemsPromise;

    // We then transform it into a map keyed by item ID for easier lookup
    this.itemMapById = itemsPromise.then(itemsByName => {
      const mapById: ItemDataMap = {};
      for (const itemName in itemsByName) {
        const item = itemsByName[itemName];
        if (item && item.id) {
          mapById[item.id] = item;
        }
      }
      return mapById;
    });
  }
  
  public async getItemMapById(): Promise<ItemDataMap | null> {
    return this.itemMapById;
  }
  
  public async getItemMapByName(): Promise<{ [key: string]: ItemData } | null> {
    return this.itemMapByName;
  }
}

export const itemService = ItemService.getInstance(); 
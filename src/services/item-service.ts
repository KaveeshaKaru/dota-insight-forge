interface ItemData {
  id: number;
  dname: string; // Display Name
  img: string;   // Image path
}

// The API gives us an object with item names as keys. We want a map with IDs as keys.
type ItemMap = { [key: number]: ItemData };

class ItemService {
  private static instance: ItemService;
  private itemMap: Promise<ItemMap> | null = null;

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
    this.itemMap = fetch('https://api.opendota.com/api/constants/items')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch item data');
        }
        return response.json();
      })
      .then(itemsByName => {
        // Transform the fetched object into a map keyed by item ID
        const mapById: ItemMap = {};
        for (const itemName in itemsByName) {
          const item = itemsByName[itemName];
          if (item && item.id) {
            mapById[item.id] = item;
          }
        }
        return mapById;
      })
      .catch(error => {
        console.error("Could not initialize ItemService:", error);
        return {}; // Return empty object on failure
      });
  }
  
  public async getItemMap(): Promise<ItemMap | null> {
      return this.itemMap;
  }
}

export const itemService = ItemService.getInstance(); 
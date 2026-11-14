/**
 * Businesses that place orders. Each has a contact (TOWNSFOLK index), a vibe, the
 * goods it's interested in, and a signature booster it hands out to loyal suppliers.
 * A client only appears once its unlockLevel is reached AND you own a way to make
 * at least one thing it wants.
 */
export const CLIENTS = {
  market: {
    id: 'market', name: 'Corner Market', contact: 0, unlockLevel: 1, color: '#7cc6f2', emblem: 'egg', booster: 'voucher',
    vibe: 'Everyday groceries for the whole town.',
    wants: ['wheat', 'corn', 'carrot', 'egg', 'milk', 'bread', 'sugar', 'cheese'],
  },
  cafe: {
    id: 'cafe', name: 'Sunny Café', contact: 2, unlockLevel: 1, color: '#ffb347', emblem: 'bread', booster: 'rush',
    vibe: 'Fresh bakes and something sweet with every coffee.',
    wants: ['bread', 'cornbread', 'pancakes', 'cream', 'butter', 'carrotcake', 'jam', 'strawberry'],
  },
  coop: {
    id: 'coop', name: "Farmers' Co-op", contact: 1, unlockLevel: 2, color: '#95d06f', emblem: 'wheat', booster: 'tonic',
    vibe: 'Buys raw goods in bulk for the county fair.',
    wants: ['wheat', 'corn', 'carrot', 'sugarcane', 'strawberry', 'cotton', 'wool', 'feather', 'egg', 'milk'],
  },
  cinema: {
    id: 'cinema', name: 'Starlight Cinema', contact: 3, unlockLevel: 3, color: '#ff6b6b', emblem: 'popcorn', booster: 'rush',
    vibe: 'Movie-night snacks, extra butter.',
    wants: ['popcorn', 'sugar', 'jam', 'strawberry', 'cornbread', 'butter'],
  },
  kitchen: {
    id: 'kitchen', name: "Grandma's Kitchen", contact: 5, unlockLevel: 5, color: '#c97b4a', emblem: 'carrotcake', booster: 'tonic',
    vibe: 'Hearty home cooking, just like it used to be.',
    wants: ['carrot', 'cheese', 'butter', 'carrotcake', 'pancakes', 'milk', 'egg', 'bread'],
  },
  boutique: {
    id: 'boutique', name: 'Thread & Thimble', contact: 6, unlockLevel: 9, color: '#e08bb0', emblem: 'sweater', booster: 'voucher',
    vibe: 'A little boutique of handmade fashion.',
    wants: ['fabric', 'yarn', 'tshirt', 'sweater', 'wool', 'cotton'],
  },
  homestore: {
    id: 'homestore', name: 'Nest Home Goods', contact: 7, unlockLevel: 12, color: '#8ea5d8', emblem: 'pillow', booster: 'rush',
    vibe: 'Everything soft and cozy for the home.',
    wants: ['pillow', 'quilt', 'feather', 'fabric', 'yarn'],
  },
  weddings: {
    id: 'weddings', name: 'Petal & Vine Weddings', contact: 4, unlockLevel: 13, color: '#ff7eb3', emblem: 'bouquet', booster: 'voucher',
    vibe: 'Flowers and sweet favours for the big day.',
    wants: ['tulip', 'bouquet', 'flowercrown', 'jam', 'strawberry'],
  },
}

/** Reputation XP needed to reach each level (index = level). Level 1 is where everyone starts. */
export const REP_XP = [0, 0, 30, 90, 200, 380]
export const MAX_REP = REP_XP.length - 1

/** What each reputation level unlocks with a business. */
export function repPerks(level) {
  return {
    coinBonus: level >= 4 ? 0.2 : level >= 2 ? 0.1 : 0,
    xpBonus: level >= 3 ? 0.1 : 0,
    giftEvery: level >= 5 ? 1 : level >= 3 ? 3 : 0, // a signature booster every N orders
    skipFactor: level >= 4 ? 0.5 : 1, // trusted suppliers lose less when skipping
  }
}

/** One-time boosters (of the business's signature type) for reaching a reputation level. */
export const REP_LEVEL_GIFT = { 2: 1, 3: 2, 4: 2, 5: 3 }

/** Human-readable perk list, used by the Clients tab and the rep-up popup. */
export const REP_PERK_TEXT = {
  2: '+10% coins on their orders',
  3: '+10% XP, and a free booster every 3rd order',
  4: '+20% coins, and skipping costs half as much',
  5: 'A free booster with every order',
}

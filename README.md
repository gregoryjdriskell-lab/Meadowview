# Meadowvale

A cozy, **ad-free** town-building and farming game for phone browsers. You plant crops, bake goods, and fill your neighbours' orders to earn coins and XP, which unlock new buildings, crops, and land.

Built with React 19, Vite, and Tailwind CSS v4. All art is original vector code, so the game looks finished with zero image files. When you're ready, you can swap in your own sprite sheets through one JSON file. You don't need to change any code.

---

## Quick start

```bash
npm install
```

```bash
npm run dev
```

The dev server listens on your LAN (`server.host: true`). To play on your phone, connect it to the same Wi-Fi and open the **Network** URL that Vite prints (e.g. `http://192.168.1.20:5173`). If you use "Add to Home Screen", it runs full-screen.

### Play on your phone

- **Anywhere (GitHub Pages):** every push to `main` builds and deploys the game to
  `https://<your-user>.github.io/<repo>/` via `.github/workflows/deploy.yml`.
  One-time setup: repo **Settings → Pages → Source: GitHub Actions**.
- **On your Wi-Fi (while developing):** run `npm run dev` and open the **Network** URL on your phone.

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload (LAN-visible) |
| `npm run build` / `npm run preview` | Production build / serve it |
| `npm test` | Game-logic unit tests (Vitest) |
| `npm run sprites:list` | Every sprite id the game uses, and whether it's custom or vector |
| `npm run sprites:check` | Validate `sprites.config.json` (ids, files, frames, sheet sizes) |

## How to play

1. **Farm**: tap an empty field and pick a seed. You stay in *planting mode*, so you can tap or **swipe across** fields to plant a whole row. Swiping over ripe fields harvests them. Outside planting mode, a single tap harvests a ripe field.
2. **Produce**: tap the Bakery and press **Make**. Each factory has a 3-slot queue that works through jobs one after another. A bubble appears when goods are ready, and you tap the building to collect them.
3. **Deliver**: open the **Order Board** (tap the board on the map or the Orders button). Fill requests for coins and XP. If you skip an order, a new one shows up after 30 seconds.
4. **Grow**: level-ups bring a coin bonus, extra order slots, and new crops, recipes, and buildings. Spend coins in **Build** on fields, homes (which pay rent), factories, decor, and **land expansions**.
5. **Raise animals** (level 7+): build a **Feed Mill** and an animal pen. Tap a pen to feed hungry animals, and tap again when goods are ready to collect them. Each pen holds up to 5 animals.
6. **Arrange**: open any building's panel and choose **Move**. Tap the map to position the ghost (green means valid), then press ✓.

**Zoom**: pinch with two fingers (or ctrl/⌘ + scroll on desktop). The zoom level is remembered.

### Production chains

| Level | Unlocks | Chain |
| --- | --- | --- |
| 1–6 | Wheat, corn, carrot, sugarcane, strawberry · Bakery, Snack Stand, Sugar Mill | crops → bread, popcorn, sugar, cake, jam |
| 7 | Feed Mill, Chicken Coop | wheat + corn → poultry feed (×3) → 🐔 eggs |
| 8 | Cow Pasture, Dairy | corn + carrot → cow feed → 🐄 milk → cream |
| 9 | Cotton, Textile Factory | cheese, pancakes (egg + milk + wheat), cotton → fabric |
| 10 | Sheep Meadow | wheat + carrot → sheep feed → 🐑 wool → yarn, cream → butter |
| 11 | Tailor Shop | fabric → T-shirt |
| 12 | Duck Pond, Down Feather Factory | poultry feed → 🦆 down feathers → pillow, yarn + fabric → sweater |
| 13–15 | Tulips, Florist | quilt (feathers + fabric + yarn), bouquet, flower crown |
| 15–18 | Second pens | one extra coop / pasture / meadow / pond |

The game has 20 levels and 20 rows of land, unlocked in strips at levels 2, 4, 6, 9, 12 and 15.

Timers use real timestamps, so crops keep growing and rent keeps building up while the game is closed. Progress saves automatically to `localStorage`.

---

## Project structure

```
meadowvale/
├── index.html                    # mobile viewport, safe-area, Fredoka font
├── vite.config.js                # React + Tailwind plugins, LAN host, Vitest
├── public/
│   └── assets/sprites/
│       ├── sprites.config.json         # ← your custom-art mapping (empty = all vector)
│       ├── sprites.config.example.json # annotated example
│       ├── sheets/                     # drop sprite sheets here
│       └── images/                     # drop single images here
├── scripts/
│   └── sprites.mjs               # sprites:list / sprites:check tooling
└── src/
    ├── main.jsx                  # providers: SpriteManifest → Game → App
    ├── App.jsx                   # interaction layer: taps → actions, panels, modes
    ├── index.css                 # Tailwind theme (pastel palette, animations)
    ├── game/                     # ── pure game logic, no React in here ──
    │   ├── config/               # data-driven content (edit these to rebalance)
    │   │   ├── crops.js          #   grow time, yield, seed cost, art colors
    │   │   ├── recipes.js        #   factory inputs → product (optional batch yield)
    │   │   ├── animals.js        #   animals: feed, timer, product
    │   │   ├── buildings.js      #   size, cost, limits, rent, queue slots
    │   │   ├── levels.js         #   XP curve, order slots, land expansions, grid size
    │   │   ├── townsfolk.js      #   order requesters
    │   │   └── index.js          #   ITEMS (crops + products) lookup
    │   ├── engine/
    │   │   ├── grid.js           #   occupancy, bounds, free-spot search
    │   │   ├── orders.js         #   order generation and reward math
    │   │   ├── rng.js            #   seeded PRNG (keeps the reducer pure)
    │   │   └── time.js           #   duration formatting, progress
    │   └── state/
    │       ├── initialState.js   #   new-game layout and save version
    │       ├── rules.js          #   canPlant / canQueue / canFulfill … (shared by UI + reducer)
    │       ├── reducer.js        #   all state transitions
    │       ├── reducer.test.js   #   unit tests for the core loop
    │       ├── persistence.js    #   localStorage load/save/migrate
    │       ├── unlocks.js        #   "what's new at level N"
    │       └── GameProvider.jsx  #   context, 500 ms clock, autosave, action creators
    ├── assets/
    │   ├── vector/               # original SVG art, written as code
    │   │   ├── buildings.jsx     #   parametric Cottage / Workshop templates + decor
    │   │   ├── crops.jsx         #   procedural growth stages from crop.art config
    │   │   ├── items.jsx         #   item icons (+ items2.jsx for the animal/industry set)
    │   │   ├── animals.jsx       #   chicken, cow, sheep, duck
    │   │   └── ui.jsx            #   coin, XP star, land, townsfolk avatars
    │   ├── spriteKeys.js         # canonical list of sprite ids
    │   ├── spriteRegistry.jsx    # id → vector art
    │   └── SpriteManifestProvider.jsx # loads + preloads sprites.config.json
    └── components/
        ├── ui/Sprite.jsx         # <Sprite id="…"/>: custom art → vector → placeholder
        ├── ui/primitives.jsx     # Sheet, Button, CoinTag, ItemNeed, ProgressBar
        ├── ui/BuildingIcon.jsx   # menu icon (pens shown with animals)
        ├── hud/                  # TopBar (level/XP/coins), BottomBar (Build/Orders/Barn)
        ├── town/                 # TownGrid (input, ghost, fx), BuildingView (overlays)
        └── panels/               # BuildShop, FieldPanel, FactoryPanel, OrderBoard,
                                  # AnimalPanel, BarnPanel, InfoPanel, LevelUpModal, SettingsPanel
```

### Architecture in one paragraph

All rules live in `src/game` as plain JS. `gameReducer(state, action)` is pure: each action carries `now`, randomness comes from a seeded PRNG stored in state, and invalid actions return the previous state unchanged. `rules.js` holds the `canX()` checks. The reducer enforces them, and the UI reuses them to disable buttons and explain why. React only renders state and translates taps. That keeps the logic easy to test and portable. If you move to React Native/Expo later, `src/game` can be reused as-is.

### Adding content

Most content is data:

- **New crop**: add an entry to `crops.js` with an `art.kind` of `grain | cob | root | cane | berry`. It automatically gets growth-stage art, a seed card, and order eligibility. Add an icon to `vector/items.jsx` (or supply custom art).
- **New recipe**: add an entry to `recipes.js` that points at an existing factory.
- **New animal**: add it to `animals.js` (feed item, timer, product), add a pen to `buildings.js` (`category: 'animals'`, `animal`, `startAnimals`, `maxAnimals`, `animalCost`), and add a sprite to `vector/animals.jsx` plus a `Pen` line in `vector/buildings.jsx`. A test in `reducer.test.js` checks that every feed and input is unlocked before it's needed.
- **New factory**: add it to `buildings.js` (`category: 'factory'`, `queueSlots`), then add a line in `vector/buildings.jsx` using the `Workshop` template (colors plus the product shown on its sign).

---

## Custom art: dropping in AI-generated sprites

Every piece of game art goes through `<Sprite id="…" />`, which resolves sprites in this order:

1. your entry in `public/assets/sprites/sprites.config.json`
2. the built-in vector art
3. a dashed placeholder

You can replace one sprite at a time, and anything you don't map keeps its vector art. The config is fetched when the game loads, so in dev you only need to refresh the page. No rebuild is required.

### 1. See what ids exist

```bash
npm run sprites:list
```

```
○ vector  building.house           aspect 200:200
○ vector  item.bread               aspect 100:100
○ vector  crop.wheat.2             aspect 100:100
…
```

| Id pattern | Example | Notes |
| --- | --- | --- |
| `building.<id>` | `building.bakery` | Aspect = footprint. 2×2 buildings are square, the board (2×1) is 2:1 |
| `item.<id>` | `item.bread` | Square icon used in the barn, orders, recipes, and bubbles |
| `crop.<id>.<stage>` | `crop.wheat.2` | 0 = sprout, 1 = growing, 2 = ripe. Drawn **on top of** `building.field`, so give it a transparent background |
| `animal.<id>` | `animal.cow` | Drawn inside pens, facing right, with feet near the bottom |
| `avatar.<n>` | `avatar.3` | Townsfolk portraits (0–7) |
| `ui.<name>` | `ui.coin` | `coin`, `xp`, `land` |

### 2. Generate the art

Prompting tips for Midjourney, DALL·E, and similar tools:

- Ask for a **consistent style across the set**, e.g. *"cozy flat vector game asset, soft pastel palette, rounded shapes, top-down 3/4 view, centered, isolated on transparent background, no text"*. Reuse the same style suffix or `--sref` for every prompt.
- Ask for **one object per image**, centered, with some padding. Many generators can't output true transparency, so remove the background afterwards (e.g. with `rembg` or an image editor) and export **PNG** or **WebP**.
- Match the aspect ratio from `sprites:list`. 256×256 per tile is plenty (so 512×512 for a 2×2 building).
- Buildings look best when the base sits near the bottom of the image. The art is bottom-anchored.

### 3. Drop the files in

- Single images go in `public/assets/sprites/images/`.
- Sprite sheets go in `public/assets/sprites/sheets/`. A sheet is a uniform grid where every frame has the same size, read left to right and top to bottom.

### 4. Map them in `sprites.config.json`

```jsonc
{
  "sheets": {
    // name → grid description. Paths are relative to public/assets/sprites/
    "buildings": { "src": "sheets/buildings.png", "columns": 4, "rows": 2 },
    "wheat":     { "src": "sheets/wheat-stages.png", "columns": 3, "rows": 1 }
  },
  "sprites": {
    // From a sheet: frame index (row-major)…
    "building.house":  { "sheet": "buildings", "frame": 0 },
    // …or [column, row], with optional fine-tuning
    "building.bakery": { "sheet": "buildings", "frame": [1, 0], "scale": 1.1, "offset": [0, -4] },
    "crop.wheat.0": { "sheet": "wheat", "frame": 0 },
    "crop.wheat.1": { "sheet": "wheat", "frame": 1 },
    "crop.wheat.2": { "sheet": "wheat", "frame": 2 },
    // Or a standalone image
    "item.bread": { "src": "images/bread.png" },
    "avatar.0":   { "src": "images/mabel.png", "fit": "cover" }
  }
}
```

(JSON doesn't allow comments. They're only here for explanation. See `sprites.config.example.json` for a valid file.)

| Field | Applies to | Meaning |
| --- | --- | --- |
| `src` | sheet / sprite | Path relative to `public/assets/sprites/`, an absolute `/path`, or an `https:` URL |
| `columns`, `rows` | sheet | Grid size (default 1) |
| `pixelated` | sheet / sprite | `true` for crisp pixel art scaling |
| `frame` | sprite | Index (row-major) or `[col, row]` |
| `scale` | sprite | Enlarge or shrink from the bottom-center (e.g. `1.15` for art that should overhang its tile) |
| `offset` | sprite | `[x%, y%]` nudge |
| `fit` | image sprite | `contain` (default) or `cover` |

### 5. Validate

```bash
npm run sprites:check
```

The check catches typos in ids, missing files, frames outside the grid, and sheets whose pixel size doesn't divide evenly into the grid. At runtime, any image that fails to load is skipped with a console warning and falls back to vector art, so a bad path won't break the game.

---

## Design notes

- **Mobile-first**: `100dvh` layout, safe-area padding, `touch-action` tuned so the map pans natively but locks during swipe-planting, 44px+ touch targets, and bottom sheets in easy thumb reach.
- **DOM grid instead of canvas**: at this scale (≤ 140 tiles), absolutely positioned SVG stays crisp at any zoom and works with native touch scrolling. If you later want thousands of animated sprites, `TownGrid` is the only component to replace. Game state doesn't care how it's drawn.
- **No monetization hooks**: there are no premium currencies, timers you pay to skip, ads, or analytics.

## Roadmap ideas

- Barn capacity and upgrades, selling surplus items
- More industries: paper and stationery, furniture, jewelry, perfume
- Helicopter or train deliveries with bigger multi-item orders
- Construction timers for large buildings, building upgrades
- Drag-to-move buildings, sound effects
- PWA manifest and service worker for offline play

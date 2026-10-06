/* =========================================================
   DAILY DESIGN RANDOMIZER — script.js
   One reel engine drives both lanes (Theme + Palette).
   ========================================================= */


/* ---------- 1. DATA (edit freely) ---------- */

const designPrompts = [
  "Poster",
  "Album Cover",
  "Business Card",
  "Social Media Post",
  "Book Cover",
  "Logo Concept",
  "Camera Roll"
];

const colorPalettes = [
  {
    name: "Terracotta Morning",
    hexCodes: ["#E07A5F", "#F2CC8F", "#81B29A", "#3D405B"],
    description: "A warm, earthy palette built on complementary contrast, softened by sage and sand."
  },
  {
    name: "Neon Nightlife",
    hexCodes: ["#0D0221", "#FF2E63", "#08D9D6", "#EAEAEA"],
    description: "High-contrast dark mode with electric accents, inspired by signage and screens."
  },
  {
    name: "Soft Botanical",
    hexCodes: ["#F1FAEE", "#A8DADC", "#457B9D", "#1D3557"],
    description: "A cool, analogous palette moving from near-white through teal into deep navy calm, trustworthy, and clean."
  },
  {
    name: "Retro Diner",
    hexCodes: ["#FFF3B0", "#E09F3E", "#9E2A2B", "#335C67"],
    description: "Mustard, rust, and brick red evoke mid-century print and diner signage, grounded by a dusty teal for balance."
  },
  {
    name: "Monochrome Ink",
    hexCodes: ["#FFFFFF", "#CCCCCC", "#666666", "#111111"],
    description: "A pure grayscale ramp. Removing hue entirely forces attention onto contrast, shape, and typography."
  },
  {
    name: "Coastal Pastel",
    hexCodes: ["#CDECFF", "#FFD6E0", "#FFF6BD", "#B8E0D2"],
    description: "Low-saturation analogous pastels drawn from beach and sky. Friendly and gentle, good for lifestyle branding."
  },
  {
    name: "Brutalist Primary",
    hexCodes: ["#F94144", "#F9C74F", "#277DA1", "#000000"],
    description: "Bold primary colors on black, referencing constructivist posters. Direct, graphic, and unapologetically loud."
  },
  {
    name: "Frutiger Aero",
    hexCodes: ["#A8DFF0", "#5DBB63", "#FFFFFF", "#1E90FF"],
    description: "A glossy, optimistic palette from mid-2000s tech UI design, evoking clean water, nature, and polished glass interfaces."
  }
];


/* ---------- 2. CONFIG ---------- */

const CARDS_TO_TRAVEL = 24;     // how many cards the strip passes before the winner
const EDGE_CARDS = 12;          // spare cards left/right so the strip never looks empty
const SPIN_DURATION_MS = 5000;  // must equal the tick sound length (5s) to stay in sync
const SPIN_EASING = "cubic-bezier(0.33, 1, 0.68, 1)"; // fast start, soft stop

// Tints of the same blue hue, used for the colored bar on theme cards
const TONES = ["#E8F4FD", "#9AD3F6", "#62BAF2", "#2F8FD0", "#1B6AA3"];

const TICK_SOUND_PATH = "https://res.cloudinary.com/pav3kc8d/video/upload/v1787218806/CS_Case_Tick.mp3";
const LAND_SOUND_PATH = "https://res.cloudinary.com/pav3kc8d/video/upload/v1787218806/CS_Case_Land.mp3";


/* ---------- 3. AUDIO (logic unchanged) ----------
   One Audio object per sound, rewound before every play,
   so sounds never stack on top of each other. */

const tickAudio = new Audio(TICK_SOUND_PATH);
const landAudio = new Audio(LAND_SOUND_PATH);
tickAudio.volume = 0.5;
landAudio.volume = 0.7;

// Plays once from the start, for its full length. .catch() hides the
// browser's "autoplay blocked" error.
function playTickSound() {
  tickAudio.pause();
  tickAudio.currentTime = 0;
  tickAudio.play().catch(() => {});
}

function playLandSound() {
  tickAudio.pause(); // cut any tick still ringing
  landAudio.pause();
  landAudio.currentTime = 0;
  landAudio.play().catch(() => {});
}


/* ---------- 4. SMALL HELPERS ---------- */

const $ = (selector, root = document) => root.querySelector(selector);

// Random item from a list
const rand = (list) => list[Math.floor(Math.random() * list.length)];

// Random index that is never `avoid`: roll one slot fewer, then skip over
// the avoided slot. No re-roll loop needed.
function pickIndex(length, avoid = -1) {
  if (length < 2 || avoid < 0) return Math.floor(Math.random() * length);
  const i = Math.floor(Math.random() * (length - 1));
  return i < avoid ? i : i + 1;
}

// Tiny element builder: h("div", { class: "x" }, child1, child2)
function h(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  node.append(...children);
  return node;
}

// localStorage can throw (private mode, blocked cookies), so wrap it
const store = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch { /* ignore */ } }
};

// Fade + slide in; `delay` lets the land sound hit before the text appears
const reveal = (...els) => els.forEach((el) => el.animate(
  [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }],
  { duration: 450, delay: 350, easing: "ease-out", fill: "backwards" }
));


/* ---------- 5. LANES ----------
   Each lane only describes what is different: its data, how a reel card
   looks, and how the result is shown. The spin logic below is shared. */

const lanes = {
  theme: {
    items: designPrompts,
    storeKey: "lastPrompt",
    name: (item) => item,

    card: (item) => h("div", {
      class: "card",
      "data-initial": item[0],
      style: `--tone:${TONES[designPrompts.indexOf(item) % TONES.length]}`
    }, item),

    show(item) {
      const { result, hint } = this.ui;
      result.textContent = item;
      result.classList.remove("is-empty");
      hint.textContent = "Roll again if you want a different theme.";
      reveal(result, hint);
    }
  },

  palette: {
    items: colorPalettes,
    storeKey: "lastPaletteName",
    name: (item) => item.name,

    card: (p) => h("div", { class: "card card--palette" },
      h("div", { class: "chips" }, ...p.hexCodes.map((hex) => h("i", { style: `background:${hex}` }))),
      h("span", {}, p.name)
    ),

    show(p) {
      const { swatches, result, hint } = this.ui;
      swatches.replaceChildren(...p.hexCodes.map((hex) => h("span", {
        class: "swatch",
        style: `background:${hex};color:${isLight(hex) ? "#0D3A5C" : "#fff"}`
      }, hex)));
      result.textContent = p.name;
      result.classList.remove("is-empty");
      hint.textContent = p.description;
      reveal(swatches, result, hint);
    }
  }
};

// Light colors get dark hex labels, dark colors get white ones
function isLight(hex) {
  const [r, g, b] = hex.slice(1).match(/../g).map((n) => parseInt(n, 16));
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}


/* ---------- 6. REEL ENGINE ----------
   The strip is one long row of cards. Its left edge sits at the viewport's
   center (CSS), so translateX(-cardCenter) puts that card under the marker.
   Positions are measured from the real DOM, so card size can change in CSS
   without touching this file. */

const centerX = (card) => card.offsetLeft + card.offsetWidth / 2;

// Snap the strip so the lane's current card sits under the marker
function place(lane) {
  const card = lane.ui.track.children[lane.at];
  lane.ui.track.style.transform = `translateX(${-centerX(card)}px)`;
}

async function spin(lane) {
  const { track } = lane.ui;

  // Stop leftovers from the previous spin
  tickAudio.pause();
  landAudio.pause();

  // 1. Decide the winner first. It never changes during the spin.
  const winnerIndex = pickIndex(lane.items.length, lane.lastIndex);
  const winner = lane.items[winnerIndex];
  lane.lastIndex = winnerIndex;

  // 2. The previous winner stays on screen as the starting card, so the
  //    strip continues from where it stopped instead of jumping back.
  lane.root.classList.remove("is-done");
  lane.root.classList.add("is-spinning");

  const drop = Math.max(0, lane.at - EDGE_CARDS); // trim old cards far to the left
  [...track.children].slice(0, drop).forEach((card) => card.remove());
  lane.at -= drop;
  track.children[lane.at].classList.remove("is-winner");

  // 3. Add new cards up to the winner (random fillers + the winner + a few after it)
  const target = lane.at + CARDS_TO_TRAVEL;
  const total = target + 1 + EDGE_CARDS;
  const have = track.children.length;
  track.append(...Array.from({ length: total - have }, (_, i) =>
    lane.card(have + i === target ? winner : rand(lane.items))
  ));

  // 4. Landing math: how far the strip must travel
  const from = -centerX(track.children[lane.at]);
  const to = -centerX(track.children[target]);

  // 5. Slide. Set the end position first, then animate from the start one.
  //    Tick starts in the same moment, so sound and motion stay in sync.
  track.style.transform = `translateX(${to}px)`;
  const slide = track.animate(
    [{ transform: `translateX(${from}px)` }, { transform: `translateX(${to}px)` }],
    { duration: SPIN_DURATION_MS, easing: SPIN_EASING }
  );
  playTickSound();
  await slide.finished; // resolves when the strip really stops

  // 6. Landed
  playLandSound();
  lane.at = target;
  place(lane); // exact position, also fixes a window resize during the spin
  track.children[target].classList.add("is-winner");
  lane.root.classList.replace("is-spinning", "is-done");

  lane.show(winner);
  store.set(lane.storeKey, lane.name(winner));
  lane.ui.last.textContent = `Last time: ${lane.name(winner)}`;
}


/* ---------- 7. CLICKS ----------
   `busy` locks both Roll buttons while any reel spins. Both lanes share one
   tick sound, so starting a second spin mid-way would restart it and break
   the sync. aria-disabled (not `disabled`) keeps keyboard focus on the button. */

let busy = false;

document.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-roll]");
  if (!button || busy) return;

  busy = true;
  document.querySelectorAll("[data-roll]").forEach((b) => b.setAttribute("aria-disabled", "true"));
  try {
    await spin(lanes[button.dataset.roll]);
  } finally {
    busy = false;
    document.querySelectorAll("[data-roll]").forEach((b) => b.setAttribute("aria-disabled", "false"));
  }
});


/* ---------- 8. START ---------- */

for (const [key, lane] of Object.entries(lanes)) {
  const root = $(`[data-lane="${key}"]`);
  lane.root = root;
  lane.ui = {
    track: $(".reel-track", root),
    viewport: $(".reel", root),
    result: $(".result", root),
    hint: $(".hint", root),
    last: $(".last", root),
    swatches: $(".swatches", root)
  };

  // Don't repeat last session's pick on the first roll, and show it as "Last time"
  const saved = store.get(lane.storeKey);
  lane.lastIndex = lane.items.findIndex((item) => lane.name(item) === saved);
  if (saved) lane.ui.last.textContent = `Last time: ${saved}`;

  // Idle strip: random cards with one centered, so the page isn't empty before the first roll
  lane.at = EDGE_CARDS;
  lane.ui.track.replaceChildren(
    ...Array.from({ length: EDGE_CARDS * 2 + 1 }, () => lane.card(rand(lane.items)))
  );
  place(lane);

  // Keep the strip centered when the window is resized (not mid-spin)
  new ResizeObserver(() => { if (!busy) place(lane); }).observe(lane.ui.viewport);
}
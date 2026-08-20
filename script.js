/* =========================================================
   DAILY DESIGN RANDOMIZER — SCRIPT.JS
   This file is written for a JS beginner. The first time a
   concept shows up (arrays, functions, event listeners,
   Math.random, localStorage) there's a plain-language comment
   explaining what it does and why it's used.
   ========================================================= */


/* =========================================================
   PART 1: DATA — EDIT THESE ARRAYS FREELY
   An "array" is just a list of items stored in a single
   variable, written inside square brackets [ ] and separated
   by commas. You can add or remove items here without
   touching any other code in this file.
   ========================================================= */

// A simple array of strings — each one is a design task.
// Add or delete lines here; just keep the commas between items.
const designPrompts = [
  "Poster",
  "Album Cover",
  "App Icon",
  "Business Card",
  "Social Media Post",
  "Book Cover",
  "Logo Concept",
  "Packaging Label"
];

// An array of "objects." An object is a way to group related
// pieces of information together using label: value pairs.
// Each palette object here has a name, a list of hex codes,
// and a short description of the thinking behind it.
const colorPalettes = [
  {
    name: "Terracotta Morning",
    hexCodes: ["#E07A5F", "#F2CC8F", "#81B29A", "#3D405B"],
    description: "A warm, earthy palette built on complementary contrast — clay orange against muted blue-violet, softened by sage and sand."
  },
  {
    name: "Neon Nightlife",
    hexCodes: ["#0D0221", "#FF2E63", "#08D9D6", "#EAEAEA"],
    description: "High-contrast dark mode with electric accents, inspired by signage and screens. Built for energy and urgency."
  },
  {
    name: "Soft Botanical",
    hexCodes: ["#F1FAEE", "#A8DADC", "#457B9D", "#1D3557"],
    description: "A cool, analogous palette moving from near-white through teal into deep navy — calm, trustworthy, and clean."
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
  }
];


/* =========================================================
   PART 2: GRABBING ELEMENTS FROM THE PAGE
   "document.getElementById" finds an HTML element by its id
   attribute so JavaScript can read or change it. We do this
   once at the top and store each result in a variable so we
   don't have to look it up again every time we need it.
   ========================================================= */

const promptDisplay = document.getElementById("promptDisplay");
const randomizePromptBtn = document.getElementById("randomizePromptBtn");
const yesterdayPromptEl = document.getElementById("yesterdayPrompt");

const swatchRow = document.getElementById("swatchRow");
const paletteName = document.getElementById("paletteName");
const paletteDescription = document.getElementById("paletteDescription");
const randomizePaletteBtn = document.getElementById("randomizePaletteBtn");
const yesterdayPaletteEl = document.getElementById("yesterdayPalette");


/* =========================================================
   PART 3: STATE — TRACKING WHAT WAS SHOWN LAST
   These variables remember the most recent prompt/palette
   shown *during this session*, so we can avoid repeating it
   on the very next click. They start as null, meaning
   "nothing picked yet."
   ========================================================= */

let lastPromptIndex = null;
let lastPaletteIndex = null;


/* =========================================================
   PART 4: HELPER FUNCTION — RANDOM INDEX WITHOUT REPEATS
   A "function" is a reusable block of code you can run
   whenever you need it, by calling its name followed by ().
   This function picks a random position ("index") in an
   array, but re-rolls if it matches the last index used, so
   the same item never appears twice in a row.

   Math.random() gives a random decimal between 0 (inclusive)
   and 1 (exclusive), e.g. 0.4839. Multiplying by the array's
   length and rounding down with Math.floor() turns that into
   a whole number we can use as an array position.
   ========================================================= */
function getRandomIndex(arrayLength, lastIndex) {
  // If there's only one item, there's nothing to avoid repeating.
  if (arrayLength <= 1) {
    return 0;
  }

  let newIndex;

  // "do...while" runs the code block at least once, then keeps
  // repeating it as long as the condition after "while" is true.
  // Here, we keep rolling a new random number until it's
  // different from the last one we used.
  do {
    newIndex = Math.floor(Math.random() * arrayLength);
  } while (newIndex === lastIndex);

  return newIndex;
}


/* =========================================================
   PART 5: STRETCH GOAL — localStorage HISTORY
   localStorage lets a webpage save small pieces of text data
   directly in the browser, which persists even after the tab
   or browser is closed. It's perfect for a lightweight
   "remember what happened last time" feature with no backend
   or database needed. Data is always stored as text, so
   objects/arrays need to be converted with JSON.stringify()
   before saving and JSON.parse() after loading.
   ========================================================= */

// Saves the most recent prompt and palette name under a given key.
function saveToHistory(key, value) {
  localStorage.setItem(key, value);
}

// Reads a previously saved value back out. Returns null if nothing
// has been saved yet (e.g. this is the user's first visit).
function loadFromHistory(key) {
  return localStorage.getItem(key);
}

// On page load, show whatever was picked last time (if anything),
// as a small "Yesterday's pick" note under each section.
function showPreviousPicks() {
  const previousPrompt = loadFromHistory("lastPrompt");
  const previousPalette = loadFromHistory("lastPaletteName");

  if (previousPrompt) {
    yesterdayPromptEl.textContent = "Last time: " + previousPrompt;
  }

  if (previousPalette) {
    yesterdayPaletteEl.textContent = "Last time: " + previousPalette;
  }
}


/* =========================================================
   PART 6: MAIN FUNCTIONS — UPDATING THE PAGE
   ========================================================= */

// Picks a new design prompt and displays it.
function randomizePrompt() {
  const newIndex = getRandomIndex(designPrompts.length, lastPromptIndex);
  lastPromptIndex = newIndex;

  const chosenPrompt = designPrompts[newIndex];
  promptDisplay.textContent = chosenPrompt;

  // Save this pick to localStorage so it can be shown as
  // "Last time" the next time the app is opened.
  saveToHistory("lastPrompt", chosenPrompt);
}

// Picks a new color palette, builds its swatches, and displays
// its name and description.
function randomizePalette() {
  const newIndex = getRandomIndex(colorPalettes.length, lastPaletteIndex);
  lastPaletteIndex = newIndex;

  const chosenPalette = colorPalettes[newIndex];

  // Clear out any swatches from the previous palette before
  // adding the new ones.
  swatchRow.innerHTML = "";

  // "forEach" runs a block of code once for every item in an
  // array. Here we use it to create one swatch div per hex code.
  chosenPalette.hexCodes.forEach(function (hex) {
    // document.createElement makes a brand-new HTML element in
    // memory. It won't appear on the page until we attach it.
    const swatch = document.createElement("div");
    swatch.className = "swatch";
    swatch.style.backgroundColor = hex;

    const hexLabel = document.createElement("span");
    hexLabel.className = "hex-label";
    hexLabel.textContent = hex;
    swatch.appendChild(hexLabel);

    // appendChild attaches the new element inside a parent
    // element that's already on the page, making it visible.
    swatchRow.appendChild(swatch);
  });

  paletteName.textContent = chosenPalette.name;
  paletteDescription.textContent = chosenPalette.description;

  saveToHistory("lastPaletteName", chosenPalette.name);
}


/* =========================================================
   PART 7: EVENT LISTENERS
   An "event listener" tells the browser to run a function
   whenever something specific happens on the page — in this
   case, a button being clicked. addEventListener takes two
   things: the event name to watch for ("click"), and the
   function to run when it happens.
   ========================================================= */

randomizePromptBtn.addEventListener("click", randomizePrompt);
randomizePaletteBtn.addEventListener("click", randomizePalette);


/* =========================================================
   PART 8: RUN ON PAGE LOAD
   Show any saved history as soon as the script runs, so the
   "Last time" notes appear immediately without needing a
   button click.
   ========================================================= */

showPreviousPicks();

/* =========================================================
   DAILY DESIGN RANDOMIZER — SCRIPT.JS
   Written for a JS beginner. The first time a concept shows up
   (arrays, objects, functions, event listeners, Math.random,
   localStorage, CSS transitions from JS) there's a plain-language
   comment explaining what it does and why it's used.

   The whole app — including the "case opening" style reel
   animation — lives in this one file now. There's no separate
   "instant" version anymore; randomizePrompt() and
   randomizePalette() ARE the reel-reveal functions.
   ========================================================= */


/* =========================================================
   PART 1: DATA — EDIT THESE ARRAYS FREELY
   An "array" is a list of items stored in a single variable,
   written inside square brackets [ ] and separated by commas.
   Add or remove items here without touching any other code.
   ========================================================= */

// A simple array of strings — each one is a design task.
const designPrompts = [
  "Poster",
  "Album Cover",
  "Business Card",
  "Social Media Post",
  "Book Cover",
  "Logo Concept",
  "Camera Roll"
];

// An array of "objects." An object groups related pieces of
// information together using label: value pairs. Each palette
// object has a name, a list of hex codes, and a short
// description of the thinking behind it.
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
const promptReelViewport = document.getElementById("promptReelViewport");
const promptReelTrack = document.getElementById("promptReelTrack");

const swatchRow = document.getElementById("swatchRow");
const paletteName = document.getElementById("paletteName");
const paletteDescription = document.getElementById("paletteDescription");
const randomizePaletteBtn = document.getElementById("randomizePaletteBtn");
const yesterdayPaletteEl = document.getElementById("yesterdayPalette");
const paletteReelViewport = document.getElementById("paletteReelViewport");
const paletteReelTrack = document.getElementById("paletteReelTrack");


/* =========================================================
   PART 3: STATE
   Variables that change while the app is running (as opposed
   to the fixed data above). lastPromptIndex/lastPaletteIndex
   track what was shown last so we can avoid repeats.
   isPromptSpinning/isPaletteSpinning stop a button from
   starting a second spin while one is already in progress.
   ========================================================= */

let lastPromptIndex = null;
let lastPaletteIndex = null;
let isPromptSpinning = false;
let isPaletteSpinning = false;


/* =========================================================
   PART 4: REEL / SOUND CONFIG
   REEL_ITEM_WIDTH and REEL_ITEM_GAP must stay equal to
   --reel-item-width and --reel-item-gap in style.css, and
   SPIN_DURATION_MS must match the "4.2s" on .reel-track.is-spinning
   there too. They're kept as separate numbers (rather than read
   from CSS automatically) to keep the landing math easy to follow.
   ========================================================= */

const REEL_ITEM_WIDTH = 120;  // px — must match style.css
const REEL_ITEM_GAP = 10;     // px — must match style.css
const REEL_PITCH = REEL_ITEM_WIDTH + REEL_ITEM_GAP; // one card's left edge to the next
const REEL_TRACK_PADDING = 8; // px — must match .reel-track's padding-left in style.css

const ITEMS_BEFORE_WINNER = 24; // filler cards before the real winner
const ITEMS_AFTER_WINNER = 6;   // a few filler cards after, so the strip doesn't visually "end" right at the winner

// How long the reel spins, in milliseconds. This is set to match
// the tick sound's real length (5 seconds) — the tick now plays
// exactly once per spin, uncut, so it needs to run for the whole
// animation instead of being scheduled repeatedly. This value is
// applied straight to the track's transition-duration from JS
// (see animateReel below), so nothing in style.css needs to change
// to keep them in sync.
const SPIN_DURATION_MS = 5000;

// Swap these two paths for your own audio files any time — can be
// a local path ("sounds/tick.mp3") or a full URL, e.g. a Cloudinary
// asset link. Nothing else below needs to change either way.
const TICK_SOUND_PATH = "https://res.cloudinary.com/pav3kc8d/video/upload/v1787218806/CS_Case_Tick.mp3"; // <-- placeholder: short tick/blip
const LAND_SOUND_PATH = "https://res.cloudinary.com/pav3kc8d/video/upload/v1787218806/CS_Case_Land.mp3"; // <-- placeholder: landing thud/chime


/* =========================================================
   PART 5: HELPER FUNCTIONS
   ========================================================= */

/* Picks a random position ("index") in an array, but re-rolls if
   it matches the last index used, so the same item never appears
   twice in a row.

   Math.random() gives a random decimal between 0 (inclusive) and
   1 (exclusive), e.g. 0.4839. Multiplying by the array's length
   and rounding down with Math.floor() turns that into a whole
   number we can use as an array position. */
function getRandomIndex(arrayLength, lastIndex) {
  if (arrayLength <= 1) return 0;

  let newIndex;
  // "do...while" runs the block at least once, then repeats it as
  // long as the condition after "while" stays true — here, until
  // we roll something different from last time.
  do {
    newIndex = Math.floor(Math.random() * arrayLength);
  } while (newIndex === lastIndex);

  return newIndex;
}

/* The Audio object is a built-in browser feature for playing short
   sound files from JavaScript. new Audio(path) loads a file, and
   .play() starts it. play() returns a "promise" that can fail (for
   example, if the browser is blocking audio that hasn't been
   triggered by a real user click yet) — .catch(() => {}) quietly
   ignores that case instead of throwing an error into the console.

   We create ONE Audio object per sound here, up front, instead of
   a fresh "new Audio(...)" inside every playTickSound() call. That
   one detail is what was causing sounds to double up: a burst of
   ticks each spawning its own multi-second clip meant several
   copies were always overlapping. Reusing the same element and
   rewinding it (currentTime = 0) before every play() interrupts
   whatever was still sounding instead of stacking another copy
   on top of it. */
const tickAudio = new Audio(TICK_SOUND_PATH);
const landAudio = new Audio(LAND_SOUND_PATH);
tickAudio.volume = 0.5;
landAudio.volume = 0.7;

/* Plays the tick sound exactly once, from the start, for its full
   natural length (5 seconds — see SPIN_DURATION_MS above). Reusing
   the single tickAudio instance and rewinding it (currentTime = 0)
   before play() is what keeps repeated presses from ever creating
   overlapping copies of the sound: there's only ever one Audio
   element for ticks, so a new press restarts it cleanly instead of
   stacking another one on top. Nothing here cuts the sound short —
   it's left to play all the way through on its own. */
function playTickSound() {
  tickAudio.pause();
  tickAudio.currentTime = 0;
  tickAudio.play().catch(function () {});
}

function playLandSound() {
  // Stop any tick still ringing out so it doesn't overlap the
  // landing sound.
  tickAudio.pause();

  landAudio.pause();
  landAudio.currentTime = 0;
  landAudio.play().catch(function () {});
}


/* =========================================================
   PART 6: localStorage HISTORY ("Last time" feature)
   localStorage lets a webpage save small pieces of text data
   directly in the browser, which persists even after the tab or
   browser is closed — perfect for "remember what happened last
   time" with no backend or database. Data is always stored as
   text, so anything that isn't already a string (objects, arrays)
   would need JSON.stringify()/JSON.parse(); our values here are
   already plain strings, so we can store them directly.
   ========================================================= */

function saveToHistory(key, value) {
  localStorage.setItem(key, value);
}

function loadFromHistory(key) {
  return localStorage.getItem(key);
}

// On page load, show whatever was picked last time (if anything).
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
   PART 7: REEL CARD BUILDERS
   Small functions that turn one array item into one reel card
   (a div styled by the .reel-item CSS class in style.css).
   ========================================================= */

function buildPromptReelCard(promptText) {
  const card = document.createElement("div");
  card.className = "reel-item";
  card.textContent = promptText;
  return card;
}

function buildPaletteReelCard(paletteObj) {
  const card = document.createElement("div");
  card.className = "reel-item palette-reel-item";

  const chipRow = document.createElement("div");
  chipRow.className = "mini-swatch-row";
  paletteObj.hexCodes.forEach(function (hex) {
    const chip = document.createElement("div");
    chip.className = "mini-swatch";
    chip.style.backgroundColor = hex;
    chipRow.appendChild(chip);
  });

  const label = document.createElement("span");
  label.textContent = paletteObj.name;

  card.appendChild(chipRow);
  card.appendChild(label);
  return card;
}


/* =========================================================
   PART 8: THE ANIMATION ENGINE
   One shared function drives both reels. It doesn't know or care
   what's inside the cards — it just slides a track of already-built
   cards so a specific one (winnerPositionIndex) ends up centered
   under the marker, then calls onLanded() once it has actually
   stopped moving.
   ========================================================= */
function animateReel(viewportEl, trackEl, winnerPositionIndex, winnerCardEl, onLanded) {

  // Cancel any lingering sound from an earlier spin before this one
  // starts (the land clip especially can still be trailing off).
  tickAudio.pause();
  landAudio.pause();

  /* --- STEP 1: snap the strip back to its starting position ---
     IMPORTANT: we do this by REMOVING the "is-spinning" class,
     not by setting an inline `style.transition = "none"`. Inline
     styles always override CSS classes, no matter what order
     things happen in JS — so if we ever set transition:none
     inline here, it would permanently block the class-based
     transition later, even after adding "is-spinning" back. Since
     the base .reel-track class has no transition property at all,
     simply having no "is-spinning" class already means "no
     transition," with nothing left over to clean up.

     We do explicitly reset transition-duration to 0s, though —
     that ONE property is set from JS every spin (see Step 3 below)
     so SPIN_DURATION_MS can control the real animation length
     without needing to also edit style.css. Since it's set as an
     inline style, it persists across spins unless we clear it here
     first, which would otherwise make this instant reset itself
     animate slowly on the next spin. */
  trackEl.style.transitionDuration = "0s";
  trackEl.classList.remove("is-spinning", "is-landed");
  trackEl.style.transform = "translateX(0px)";
  winnerCardEl.classList.remove("is-winner-landed");

  // Reading offsetHeight forces the browser to apply the reset
  // above right now, before anything else changes. Without this
  // "forced reflow," the browser can batch the reset and the real
  // animation together and the slide won't visibly play at all.
  void trackEl.offsetHeight;

  /* -------------------------------------------------------
     STEP 2: THE LANDING MATH
     a) Every card is REEL_ITEM_WIDTH wide with REEL_ITEM_GAP of
        space after it. One "pitch" (left edge to next left edge)
        is REEL_PITCH = REEL_ITEM_WIDTH + REEL_ITEM_GAP.
     b) The winning card sits at position winnerPositionIndex in
        the strip (0 = first card). Its LEFT EDGE, measured from
        the very start of the strip, is:
           winnerLeftEdge = winnerPositionIndex * REEL_PITCH + REEL_TRACK_PADDING
     c) We want the winning card's CENTER under the marker, so we
        add half a card's width:
           winnerCenter = winnerLeftEdge + REEL_ITEM_WIDTH / 2
     d) The marker sits in the horizontal middle of the viewport:
           markerX = viewportWidth / 2
     e) finalDistance is how far the winner's center currently sits
        to the right of the marker — how far the strip must travel:
           finalDistance = winnerCenter - markerX
     f) CSS moves things right with a positive translateX and left
        with a negative one, so to bring the winner onto the
        marker we slide by the negative of that distance:
           finalX = -finalDistance
     Resize cards or the viewport later and this formula keeps
     working automatically — no hand-tuned stop position needed.
     ------------------------------------------------------- */
  const viewportWidth = viewportEl.clientWidth;
  const markerX = viewportWidth / 2;
  const winnerLeftEdge = winnerPositionIndex * REEL_PITCH + REEL_TRACK_PADDING;
  const winnerCenter = winnerLeftEdge + REEL_ITEM_WIDTH / 2;
  const finalDistance = winnerCenter - markerX;
  const finalX = -finalDistance;

  // Used by the CSS "bounce" keyframes (.reel-track.is-landed in
  // style.css) so the bounce happens around the resting spot.
  trackEl.style.setProperty("--reel-final-x", finalX + "px");

  /* -------------------------------------------------------
     STEP 3: PLAY THE TICK SOUND ONCE, AND START THE SLIDE
     The tick now plays a single time per spin, right as the visual
     motion begins, instead of being scheduled repeatedly at every
     card boundary. Because SPIN_DURATION_MS (5000ms) is set to
     match the tick clip's real length, letting it play all the way
     through lines it up with the whole animation from start to
     landing, with nothing cutting it off or overlapping it.

     transition-duration is also set here, from JS, using the same
     SPIN_DURATION_MS constant — that's what keeps the reel's visual
     timing and the tick's audio timing equal without needing to
     also hand-edit a duration inside style.css. The "is-spinning"
     class still supplies which property transitions (transform)
     and the easing curve (cubic-bezier); only the duration comes
     from here.

     requestAnimationFrame waits for the browser's next paint,
     guaranteeing the Step 1 reset has actually been rendered before
     we change the transform — this is what makes the motion play
     smoothly instead of jumping straight to the end position. */
  requestAnimationFrame(function () {
    trackEl.style.transitionDuration = SPIN_DURATION_MS + "ms";
    trackEl.classList.add("is-spinning");
    trackEl.style.transform = "translateX(" + finalX + "px)";
    playTickSound();
  });

  /* -------------------------------------------------------
     STEP 4: WHEN THE STRIP ACTUALLY STOPS
     "transitionend" is a browser event that fires when a CSS
     transition finishes. We listen for it instead of a plain
     setTimeout so the landing sound and bounce are always synced
     to the real animation, even if timing drifts slightly (e.g.
     a backgrounded browser tab).
     ------------------------------------------------------- */
  function handleTransitionEnd(event) {
    // A track only has one property that transitions here, but
    // this check keeps things correct if that ever changes.
    if (event.propertyName !== "transform") return;
    trackEl.removeEventListener("transitionend", handleTransitionEnd);

    trackEl.classList.remove("is-spinning");
    trackEl.classList.add("is-landed");
    winnerCardEl.classList.add("is-winner-landed");
    playLandSound();

    // A short pause lets the landing bounce actually be seen
    // before the full result text/description appears underneath.
    setTimeout(function () {
      trackEl.classList.remove("is-landed");
      onLanded();
    }, 450);
  }

  trackEl.addEventListener("transitionend", handleTransitionEnd);
}


/* =========================================================
   PART 9: MAIN FUNCTIONS — RUN A FULL RANDOMIZE-AND-REVEAL
   These decide the winner FIRST using getRandomIndex(), build a
   reel with that winner planted at a fixed position among random
   filler cards, animate the strip to it, and only update the real
   on-page result once the strip has actually stopped. The winner
   is never re-rolled once the spin starts — the animation only
   ever visually catches up to a result decided at the very start.
   ========================================================= */

function randomizePrompt() {
  if (isPromptSpinning) return; // ignore extra clicks mid-spin
  isPromptSpinning = true;
  randomizePromptBtn.disabled = true;

  const winnerIndex = getRandomIndex(designPrompts.length, lastPromptIndex);
  lastPromptIndex = winnerIndex;
  const winningPrompt = designPrompts[winnerIndex];

  promptReelTrack.innerHTML = "";
  const totalCards = ITEMS_BEFORE_WINNER + 1 + ITEMS_AFTER_WINNER;
  let winnerCardEl = null;

  for (let i = 0; i < totalCards; i++) {
    const isWinnerSlot = i === ITEMS_BEFORE_WINNER;
    // Filler cards are random picks purely for visual variety —
    // repeats among fillers are fine, only winningPrompt (already
    // decided above) is what ends up displayed at the end.
    const text = isWinnerSlot
      ? winningPrompt
      : designPrompts[Math.floor(Math.random() * designPrompts.length)];

    const cardEl = buildPromptReelCard(text);
    if (isWinnerSlot) winnerCardEl = cardEl;
    promptReelTrack.appendChild(cardEl);
  }

  promptReelViewport.classList.add("is-active");

  animateReel(promptReelViewport, promptReelTrack, ITEMS_BEFORE_WINNER, winnerCardEl, function onLanded() {
    promptDisplay.textContent = winningPrompt;
    promptDisplay.classList.add("result-fade-in");
    setTimeout(function () { promptDisplay.classList.remove("result-fade-in"); }, 400);

    saveToHistory("lastPrompt", winningPrompt);
    // Refresh the "Last time" line immediately so it doesn't wait
    // for a page reload to reflect the pick that just happened.
    showPreviousPicks();

    promptReelViewport.classList.remove("is-active");
    randomizePromptBtn.disabled = false;
    isPromptSpinning = false;
  });
}

function randomizePalette() {
  if (isPaletteSpinning) return; // ignore extra clicks mid-spin
  isPaletteSpinning = true;
  randomizePaletteBtn.disabled = true;

  const winnerIndex = getRandomIndex(colorPalettes.length, lastPaletteIndex);
  lastPaletteIndex = winnerIndex;
  const winningPalette = colorPalettes[winnerIndex];

  paletteReelTrack.innerHTML = "";
  const totalCards = ITEMS_BEFORE_WINNER + 1 + ITEMS_AFTER_WINNER;
  let winnerCardEl = null;

  for (let i = 0; i < totalCards; i++) {
    const isWinnerSlot = i === ITEMS_BEFORE_WINNER;
    const paletteObj = isWinnerSlot
      ? winningPalette
      : colorPalettes[Math.floor(Math.random() * colorPalettes.length)];

    const cardEl = buildPaletteReelCard(paletteObj);
    if (isWinnerSlot) winnerCardEl = cardEl;
    paletteReelTrack.appendChild(cardEl);
  }

  paletteReelViewport.classList.add("is-active");

  animateReel(paletteReelViewport, paletteReelTrack, ITEMS_BEFORE_WINNER, winnerCardEl, function onLanded() {
    // Build the full-size swatches shown underneath the reel.
    swatchRow.innerHTML = "";
    winningPalette.hexCodes.forEach(function (hex) {
      const swatch = document.createElement("div");
      swatch.className = "swatch";
      swatch.style.backgroundColor = hex;

      const hexLabel = document.createElement("span");
      hexLabel.className = "hex-label";
      hexLabel.textContent = hex;
      swatch.appendChild(hexLabel);

      swatchRow.appendChild(swatch);
    });

    paletteName.textContent = winningPalette.name;
    paletteDescription.textContent = winningPalette.description;

    [swatchRow, paletteName, paletteDescription].forEach(function (el) {
      el.classList.add("result-fade-in");
    });
    setTimeout(function () {
      [swatchRow, paletteName, paletteDescription].forEach(function (el) {
        el.classList.remove("result-fade-in");
      });
    }, 400);

    saveToHistory("lastPaletteName", winningPalette.name);
    showPreviousPicks();

    paletteReelViewport.classList.remove("is-active");
    randomizePaletteBtn.disabled = false;
    isPaletteSpinning = false;
  });
}


/* =========================================================
   PART 10: EVENT LISTENERS
   An "event listener" tells the browser to run a function
   whenever something specific happens — here, a button click.
   addEventListener takes the event name to watch for ("click")
   and the function to run when it happens.
   ========================================================= */

randomizePromptBtn.addEventListener("click", randomizePrompt);
randomizePaletteBtn.addEventListener("click", randomizePalette);


/* =========================================================
   PART 11: RUN ON PAGE LOAD
   Show any saved history as soon as the script runs, so the
   "Last time" notes appear immediately without needing a click.
   ========================================================= */

showPreviousPicks();
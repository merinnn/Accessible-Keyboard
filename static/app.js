/* Layouts */
const ALPHA = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
const QWERTY = ["Q","W","E","R","T","Y","U","I","O","P","A","S","D","F","G","H","J","K","L","Z","X","C","V","B","N","M"];
const NUMBERS = ["1","2","3","4","5","6","7","8","9","0"];
const LANGUAGE_LAYOUTS = {
  english: ALPHA,
  hindi: ["अ", "आ", "इ", "ई", "उ", "ऊ", "ए", "ऐ", "ओ", "औ", "क", "ख", "ग", "घ", "ङ", "च", "छ", "ज", "झ", "ञ", "ट", "ठ", "ड", "ढ", "ण", "त", "थ", "द", "ध", "न", "प", "फ", "ब", "भ", "म", "य", "र", "ल", "व", "श", "ष", "स", "ह"],
  kannada: ["ಅ", "ಆ", "ಇ", "ಈ", "ಉ", "ಊ", "ಋ", "ಎ", "ಏ", "ಐ", "ಒ", "ಓ", "ಔ", "ಕ", "ಖ", "ಗ", "ಘ", "ಙ", "ಚ", "ಛ", "ಜ", "ಝ", "ಞ", "ಟ", "ಠ", "ಡ", "ಢ", "ಣ", "ತ", "ಥ", "ದ", "ಧ", "ನ", "ಪ", "ಫ", "ಬ", "ಭ", "ಮ", "ಯ", "ರ", "ಲ", "ವ", "ಶ", "ಷ", "ಸ", "ಹ"],
  malayalam: ["അ", "ആ", "ഇ", "ഈ", "ഉ", "ഊ", "ഋ", "എ", "ഏ", "ഐ", "ഒ", "ഓ", "ഔ", "ക", "ഖ", "ഗ", "ഘ", "ങ", "ച", "ഛ", "ജ", "ഝ", "ഞ", "ട", "ഠ", "ഡ", "ഢ", "ണ", "ത", "ഥ", "ദ", "ധ", "ന", "പ", "ഫ", "ബ", "ഭ", "മ", "യ", "ര", "ല", "വ", "ശ", "ഷ", "സ", "ഹ"],
  tamil: ["அ", "ஆ", "இ", "ஈ", "உ", "ஊ", "எ", "ஏ", "ஐ", "ஒ", "ஓ", "ஔ", "க", "ங", "ச", "ஞ", "ட", "ண", "த", "ந", "ப", "ம", "ய", "ர", "ல", "வ", "ழ", "ள", "ற", "ன"]
};
let currentLayout = 'alpha'; // start with alpha layout to show generative keys
let currentLanguage = 'english';

const elToggle = document.getElementById('toggleLayout');
function updateToggleText() {
  let text;
  if (currentLayout === 'numbers') text = 'Numbers';
  else if (currentLayout === 'alpha') text = 'Alphabetical';
  else if (currentLayout === 'qwerty') text = 'QWERTY';
  elToggle.innerHTML = `<i class="fas fa-exchange-alt"></i> Layout: ${text}`;
}
updateToggleText();

/* Simple spatial personalization model saved in localStorage */
const DEFAULT_SIGMA = 14;
const LEARN_RATE = 0.15;

function loadModel(){ const raw = localStorage.getItem('spatialModel'); return raw ? JSON.parse(raw) : {}; }
function saveModel(m){ localStorage.setItem('spatialModel', JSON.stringify(m)); }
let model = loadModel();

function gaussianProb(dx, dy, muX, muY, sx, sy){
  const nx = (dx - muX) / sx; const ny = (dy - muY) / sy;
  return Math.exp(-0.5 * (nx*nx + ny*ny));
}
function learn(key, dx, dy){
  const k = model[key] || {muX:0, muY:0, sx:DEFAULT_SIGMA, sy:DEFAULT_SIGMA};
  k.muX = (1 - LEARN_RATE) * k.muX + LEARN_RATE * dx;
  k.muY = (1 - LEARN_RATE) * k.muY + LEARN_RATE * dy;
  const adx = Math.abs(dx - k.muX), ady = Math.abs(dy - k.muY);
  k.sx = (1 - LEARN_RATE) * k.sx + LEARN_RATE * Math.max(DEFAULT_SIGMA*0.6, adx + 6);
  k.sy = (1 - LEARN_RATE) * k.sy + LEARN_RATE * Math.max(DEFAULT_SIGMA*0.6, ady + 6);
  model[key] = k; saveModel(model);
}

/* DOM references */
const elKeyboard = document.getElementById('keyboard');
const elEditor = document.getElementById('editor');
const elSize = document.getElementById('keySize');
const elContrast = document.getElementById('highContrast');
const elBackspace = document.getElementById('backspace');
const elEnter = document.getElementById('enter');
const elMic = document.getElementById('mic');
const elMicStatus = document.getElementById('micStatus');
const elClear = document.getElementById('clearText');
const elExportDocx = document.getElementById('exportDocx');
const elExportPdf = document.getElementById('exportPdf');
const elScaffolding = document.getElementById('scaffolding');
const elLanguage = document.getElementById('languageSelect');
const elDarkMode = document.getElementById('toggleDarkMode');
const elUndo = document.getElementById('undoBtn');
const elRedo = document.getElementById('redoBtn');
const elWordCount = document.getElementById('wordCount');

// Language mappings for voice recognition
const languageCodes = {
  english: 'en-US',
  hindi: 'hi-IN',
  kannada: 'kn-IN',
  malayalam: 'ml-IN',
  tamil: 'ta-IN'
};

function layoutKeys(){
  elKeyboard.innerHTML = '';
  let layout;
  if (currentLayout === 'alpha') layout = LANGUAGE_LAYOUTS[currentLanguage] || ALPHA;
  else if (currentLayout === 'qwerty') layout = QWERTY;
  else if (currentLayout === 'numbers') layout = NUMBERS;
  layout.forEach(key => {
    const b = document.createElement('button');
    b.className = 'key';
    b.textContent = key;
    b.setAttribute('data-key', key);
    b.setAttribute('aria-label', `Key ${key}`);
    elKeyboard.appendChild(b);
  });
  // Add generative keys only for alpha and qwerty layouts
  if (currentLayout === 'alpha' || currentLayout === 'qwerty') {
    GENERATIVE_KEYS.forEach(key => {
      const b = document.createElement('button');
      b.className = 'key generative-key';
      b.textContent = key;
      b.setAttribute('data-key', key);
      b.setAttribute('aria-label', key);
      elKeyboard.appendChild(b);
    });
  }
}
layoutKeys();

function getKeyCenter(el){
  const r = el.getBoundingClientRect();
  return {cx: r.left + r.width/2, cy: r.top + r.height/2};
}

function chooseKeyByTouch(clientX, clientY){
  const candidates = [...document.querySelectorAll('.key')];
  let bestKey = null, bestProb = 0;
  candidates.forEach(keyEl => {
    const center = getKeyCenter(keyEl);
    const dx = clientX - center.cx, dy = clientY - center.cy;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < 100) { // within 100px
      const k = model[keyEl.dataset.key] || {muX:0, muY:0, sx:DEFAULT_SIGMA, sy:DEFAULT_SIGMA};
      const prob = gaussianProb(dx, dy, k.muX, k.muY, k.sx, k.sy);
      if (prob > bestProb) { bestProb = prob; bestKey = keyEl; }
    }
  });
  return bestKey;
}

elKeyboard.addEventListener('touchstart', e => {
  e.preventDefault();
  const touch = e.touches[0];
  const keyEl = chooseKeyByTouch(touch.clientX, touch.clientY);
  if (keyEl) {
    keyEl.classList.add('active');
    const key = keyEl.dataset.key;
    elEditor.value += key;
    saveState();
    updateWordCount();
    learn(key, touch.clientX - getKeyCenter(keyEl).cx, touch.clientY - getKeyCenter(keyEl).cy);
  }
});

elKeyboard.addEventListener('touchend', e => {
  e.preventDefault();
  document.querySelectorAll('.key.active').forEach(el => el.classList.remove('active'));
});

// Add click support for desktop users
elKeyboard.addEventListener('click', e => {
  if (e.target.classList.contains('key')) {
    const key = e.target.dataset.key;
    elEditor.value += key;
    saveState();
    updateWordCount();
    e.target.classList.add('active');
    setTimeout(() => e.target.classList.remove('active'), 100);
  }
});

elSize.oninput = () => {
  const size = elSize.value;
  document.documentElement.style.setProperty('--key-size', `${size}px`);
  localStorage.setItem('keySize', size);
};
const savedSize = localStorage.getItem('keySize');
if (savedSize) { elSize.value = savedSize; elSize.oninput(); }

elContrast.onchange = () => {
  document.body.classList.toggle('high-contrast', elContrast.checked);
  localStorage.setItem('highContrast', elContrast.checked);
};
if (localStorage.getItem('highContrast') === 'true') { elContrast.checked = true; elContrast.onchange(); }

elDarkMode.onclick = () => {
  const isDark = elDarkMode.getAttribute('aria-pressed') === 'true';
  const newState = !isDark;
  document.body.classList.toggle('dark', newState);
  elDarkMode.setAttribute('aria-pressed', newState.toString());
  localStorage.setItem('darkMode', newState);
};
if (localStorage.getItem('darkMode') === 'true') {
  elDarkMode.setAttribute('aria-pressed', 'true');
  document.body.classList.add('dark');
}

elToggle.onclick = () => {
  if (currentLayout === 'numbers') currentLayout = 'alpha';
  else if (currentLayout === 'alpha') currentLayout = 'qwerty';
  else if (currentLayout === 'qwerty') currentLayout = 'numbers';
  updateToggleText();
  layoutKeys();
};

elBackspace.onclick = () => {
  elEditor.value = elEditor.value.slice(0, -1);
  saveState();
  updateWordCount();
};
elEnter.onclick = () => {
  elEditor.value += '\n';
  saveState();
  updateWordCount();
};
elClear.onclick = () => {
  elEditor.value = '';
  saveState();
  updateWordCount();
};

/* Undo/Redo functionality */
let history = [''];
let historyIndex = 0;
let isRestoring = false;

function saveState() {
  if (isRestoring) return;
  history = history.slice(0, historyIndex + 1);
  history.push(elEditor.value);
  historyIndex++;
  if (history.length > 50) {
    history.shift();
    historyIndex--;
  }
  updateUndoRedoButtons();
}

function updateUndoRedoButtons() {
  elUndo.disabled = historyIndex <= 0;
  elRedo.disabled = historyIndex >= history.length - 1;
}

elUndo.onclick = () => {
  if (historyIndex > 0) {
    isRestoring = true;
    historyIndex--;
    elEditor.value = history[historyIndex];
    updateUndoRedoButtons();
    isRestoring = false;
  }
};

elRedo.onclick = () => {
  if (historyIndex < history.length - 1) {
    isRestoring = true;
    historyIndex++;
    elEditor.value = history[historyIndex];
    updateUndoRedoButtons();
    isRestoring = false;
  }
};

elEditor.addEventListener('input', saveState);
saveState(); // Initial state

/* Word count functionality */
function updateWordCount() {
  const text = elEditor.value;
  const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
  const chars = text.length;
  elWordCount.textContent = `Words: ${words} | Characters: ${chars}`;
}

elEditor.addEventListener('input', updateWordCount);
updateWordCount(); // Initial count

/* Voice typing */
const savedLanguage = localStorage.getItem('language') || 'english';
let recognizer;
if ('webkitSpeechRecognition' in window) {
  recognizer = new webkitSpeechRecognition();
  recognizer.continuous = false;
  recognizer.interimResults = true;
  recognizer.lang = languageCodes[savedLanguage] || 'en-US';
  recognizer.onresult = e => {
    let transcript = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      transcript += e.results[i][0].transcript;
    }
    elEditor.value += transcript;
    saveState();
    updateWordCount();
    elMicStatus.textContent = 'Listening… (interim: ' + transcript + ')';
  };
  recognizer.onend = () => elMicStatus.textContent = 'Mic stopped.';
  recognizer.onerror = e => elMicStatus.textContent = 'Mic error: ' + e.error;
  elMic.onclick = () => {
    elMicStatus.textContent = 'Listening… (speak)'; recognizer.start();
  };

  // Language selection for voice typing and keyboard layout
  elLanguage.onchange = () => {
    const lang = elLanguage.value;
    currentLanguage = lang;
    if (recognizer) {
      recognizer.lang = languageCodes[lang] || 'en-US';
    }
    localStorage.setItem('language', lang);
    layoutKeys(); // Update keyboard layout when language changes
  };

  elLanguage.value = savedLanguage;
  currentLanguage = savedLanguage;
}

async function postJSON(url, payload){
  const baseUrl = 'http://localhost:5000';
  const res = await fetch(baseUrl + url, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
  const blob = await res.blob();
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = url.endsWith('pdf') ? 'assignment.pdf' : 'assignment.docx';
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(a.href);
}
elExportDocx.onclick = () => postJSON('/export/docx', {text: elEditor.value, generated: elGeneratedContent.innerHTML});
elExportPdf.onclick  = () => postJSON('/export/pdf',  {text: elEditor.value, generated: elGeneratedContent.innerHTML});


/* ---------------------------
Simple Autocorrect (Client-Side)
---------------------------- */

/* ---------------------------
Simple Autocorrect (Client-Side)
---------------------------- */

// Edit distance function (Levenshtein)
function editDistance(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => []);
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
      else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

// Assignment mode dictionaries
const dictionaries = {
  none: [
    "assignment", "accessible", "keyboard", "typing", "student",
    "digital", "voice", "accuracy", "machine", "learning", "exam",
    "performance", "classroom", "education", "document", "notes"
  ],
  essay: [
    "introduction", "conclusion", "paragraph", "thesis", "argument",
    "evidence", "analysis", "summary", "transition", "topic", "sentence",
    "structure", "outline", "draft", "revision", "citation", "reference"
  ],
  lab: [
    "experiment", "hypothesis", "procedure", "observation", "data",
    "analysis", "conclusion", "variable", "control", "method", "result",
    "equipment", "measurement", "accuracy", "precision", "error", "graph"
  ]
};

let currentDictionary = dictionaries.none;

// Assignment scaffolding templates
const scaffoldingTemplates = {
  essay: {
    "Introduction": "In this essay, I will discuss... ",
    "Body Paragraph 1": "One compelling reason for this is... ",
    "Counter-argument": "However, some may argue that... ",
    "Conclusion": "In conclusion, ... "
  },
  lab: {
    "Hypothesis": "The hypothesis for this experiment is... ",
    "Procedure": "The procedure involved... ",
    "Observation": "During the experiment, I observed... ",
    "Conclusion": "Based on the data, I conclude that... "
  }
};

// Change assignment mode
function changeAssignmentMode() {
  const mode = document.getElementById('assignmentMode').value;
  currentDictionary = dictionaries[mode];
  elScaffolding.innerHTML = '';
  if (mode !== 'none' && scaffoldingTemplates[mode]) {
    elScaffolding.style.display = 'block';
    Object.keys(scaffoldingTemplates[mode]).forEach(key => {
      const btn = document.createElement('button');
      btn.className = 'scaffold-btn';
      btn.textContent = key;
      btn.onclick = () => insertTemplate(scaffoldingTemplates[mode][key]);
      elScaffolding.appendChild(btn);
    });
  } else {
    elScaffolding.style.display = 'none';
  }
}

// Insert template at cursor position
function insertTemplate(template) {
  const start = elEditor.selectionStart;
  const end = elEditor.selectionEnd;
  const text = elEditor.value;
  elEditor.value = text.slice(0, start) + template + text.slice(end);
  saveState();
  updateWordCount();
  elEditor.focus();
  elEditor.setSelectionRange(start + template.length, start + template.length);
}

// Autocorrect: find closest word
function autocorrect(word) {
  let bestWord = word;
  let minDist = Infinity;

  currentDictionary.forEach(dictWord => {
    const dist = editDistance(word.toLowerCase(), dictWord.toLowerCase());
    if (dist < minDist) {
      minDist = dist;
      bestWord = dictWord;
    }
  });

  return bestWord;
}

// Apply autocorrect when SPACE is pressed
elEditor.addEventListener("keyup", function (event) {
  if (event.code === "Space" || event.code === "Enter" || event.key === "." || event.key === ",") {
    let words = this.value.trim().split(" ");
    let lastWord = words[words.length - 1];

    if (lastWord) {
      let corrected = autocorrect(lastWord);
      if (corrected !== lastWord) {
        words[words.length - 1] = corrected;
        this.value = words.join(" ") + " ";
        saveState();
        updateWordCount();
      }
    }
  }
});

/* ---------------------------
Generative AI for Complex Content
--------------------------- */

// DOM references for generated content
const elGeneratedContent = document.getElementById('generatedContent');
const elInsertContent = document.getElementById('insertContent');
const elClearGenerated = document.getElementById('clearGenerated');

// Add new keys to keyboard layout
const GENERATIVE_KEYS = ['📊 Graph', '📐 Equation', '📈 Diagram'];

// Handle generative key clicks
elKeyboard.addEventListener('click', e => {
  if (e.target.classList.contains('key')) {
    const key = e.target.dataset.key;
    if (GENERATIVE_KEYS.includes(key)) {
      handleGenerativeKey(key);
    } else {
      elEditor.value += key;
      e.target.classList.add('active');
      setTimeout(() => e.target.classList.remove('active'), 100);
    }
  }
});

function handleGenerativeKey(key) {
  let description = prompt(`Describe the ${key.toLowerCase()}:`);
  if (!description) return;

  let endpoint;
  if (key === '📊 Graph') endpoint = '/generate/graph';
  else if (key === '📐 Equation') endpoint = '/generate/equation';
  else if (key === '📈 Diagram') endpoint = '/generate/diagram';

  fetch('http://localhost:5000' + endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description })
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      alert('Error: ' + data.error);
      return;
    }
    // Store data in localStorage for the new tab
    localStorage.setItem('generatedData', JSON.stringify({ key, content: data }));
    // Open new tab with generated content
    window.open('generated.html', '_blank');
  })
  .catch(err => {
    console.error('Error generating content:', err);
    alert('Failed to generate content.');
  });
}

function displayGeneratedContent(data, key) {
  elGeneratedContent.innerHTML = '';
  if (key === '📊 Graph' && data.chart) {
    const canvas = document.createElement('canvas');
    elGeneratedContent.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const chartData = JSON.parse(data.chart);
    new Chart(ctx, chartData);
  } else if (key === '📐 Equation' && data.latex) {
    elGeneratedContent.innerHTML = `\\[${data.latex}\\]`;
    MathJax.typeset();
  } else if (key === '📈 Diagram' && data.mermaid) {
    const div = document.createElement('div');
    div.className = 'mermaid';
    div.textContent = data.mermaid;
    elGeneratedContent.appendChild(div);
    mermaid.init(undefined, div);
  }
}

elInsertContent.onclick = () => {
  const content = elGeneratedContent.innerHTML;
  if (content) {
    elEditor.value += '\n' + content + '\n';
  }
};

elClearGenerated.onclick = () => {
  elGeneratedContent.innerHTML = '';
};

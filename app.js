// ===== STATE VARIABLES =====
let activeScreen = 'screen-home';
let playerName = 'Champ';
let category = 'all';
let difficulty = 'easy';
let score = 0;
let streak = 0;
let maxStreak = 0;
let currentQIndex = 0;
let quizQuestions = [];
let currentQuestion = null;
let timeLeft = 15;
let timerInterval = null;
let hintsLeft = 3;
let usedHint = false;
let correctAnswersCount = 0;
let lastAnswerWasCorrect = false;
const INJECTED_KEY = '__GEMINI_API_KEY_PLACEHOLDER__';
let apiKey = '';

// ===== INITIALIZE API KEY =====
// Key is either injected by GitHub Actions at deploy-time (production)
// or loaded from the local .env file during development.
async function initApiKey() {
  if (INJECTED_KEY && !INJECTED_KEY.startsWith('__')) {
    // Production: key was injected by the CI/CD pipeline
    apiKey = INJECTED_KEY;
    console.log('✅ Using production API key (injected at build time).');
  } else {
    // Development: load from local .env file
    await loadLocalApiKey();
    if (!apiKey) {
      console.warn('⚠️ No API key found in .env — AI features will use offline fallback data.');
    }
  }
}

// ===== GEMINI MODEL =====
const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_BASE = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// ===== CATEGORY → PROMPT MAPPING =====
const CATEGORY_PROMPTS = {
  'all':        'any topic: world history, science, geography, arts, culture, sports, technology, nature, or general knowledge',
  'history':    'world history — ancient civilizations, empires, wars, revolutions, and key historical events across all continents',
  'culture':    'global arts, music, literature, food, traditions, festivals, mythology, and pop culture from around the world',
  'geography':  'world geography — countries, capitals, continents, landmarks, rivers, mountains, oceans, and flags',
  'government': 'world governments, political systems, international organizations, famous leaders, constitutions, and civics'
};

// ===== LOAD LOCAL ENV API KEY =====
async function loadLocalApiKey() {
  try {
    const res = await fetch('.env');
    if (res.ok) {
      const text = await res.text();
      const lines = text.split('\n');
      for (let line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const eqIndex = trimmed.indexOf('=');
          if (eqIndex !== -1) {
            const key = trimmed.substring(0, eqIndex).trim();
            const val = trimmed.substring(eqIndex + 1).trim();
            if (key === 'GEMINI_API_KEY') {
              const parsedVal = val.replace(/^['"]|['"]$/g, '');
              if (parsedVal && parsedVal !== 'YOUR_GEMINI_API_KEY_HERE') {
                apiKey = parsedVal;
                localStorage.setItem('naijalearn_gemini_api_key', apiKey);
                console.log('Successfully loaded Gemini API key from local .env');
                break;
              }
            }
          }
        }
      }
    }
  } catch (err) {
    // Fail silently, fall back to localStorage/modal
    console.log('No local .env found or accessible. Using localStorage/modal fallback.');
  }
}

// ===== DOM CONTENT LOADED =====
document.addEventListener('DOMContentLoaded', async () => {
  initParticles();
  await initApiKey();

  // Category buttons
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      category = btn.getAttribute('data-cat');
    });
  });

  // Difficulty buttons
  document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      difficulty = btn.getAttribute('data-diff');
    });
  });

  // Start quiz
  const btnStart = document.getElementById('btnStart');
  if (btnStart) btnStart.addEventListener('click', startQuizSession);

  // Hint & Skip
  const btnHint = document.getElementById('btnHint');
  if (btnHint) btnHint.addEventListener('click', handle5050Hint);

  const btnSkip = document.getElementById('btnSkip');
  if (btnSkip) btnSkip.addEventListener('click', handleSkip);

  // Fun fact → continue to next question
  const btnContinue = document.getElementById('btnContinue');
  if (btnContinue) {
    btnContinue.addEventListener('click', () => {
      currentQIndex++;
      showScreen('screen-quiz');
      showQuestion();
    });
  }

  // Ask Gemini More (chat panel)
  const btnAskGemini = document.getElementById('btnAskGemini');
  if (btnAskGemini) {
    btnAskGemini.addEventListener('click', () => {
      openGeminiPanel();
    });
  }

  // Gemini panel controls
  const geminiClose = document.getElementById('geminiClose');
  if (geminiClose) {
    geminiClose.addEventListener('click', () => {
      document.getElementById('geminiPanel')?.classList.remove('open');
    });
  }

  const geminiSend = document.getElementById('geminiSend');
  if (geminiSend) geminiSend.addEventListener('click', sendGeminiMessage);

  const geminiInput = document.getElementById('geminiInput');
  if (geminiInput) {
    geminiInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') sendGeminiMessage();
    });
  }

  // Loading screen buttons
  const btnLoadingRetry = document.getElementById('btnLoadingRetry');
  if (btnLoadingRetry) btnLoadingRetry.addEventListener('click', startQuizSession);

  const btnLoadingBack = document.getElementById('btnLoadingBack');
  if (btnLoadingBack) btnLoadingBack.addEventListener('click', () => showScreen('screen-home'));

  // Stop button
  const btnStopQuiz = document.getElementById('btnStopQuiz');
  if (btnStopQuiz) {
    btnStopQuiz.addEventListener('click', () => {
      clearInterval(timerInterval);
      showScreen('screen-home');
    });
  }

  // Leaderboard navigation
  const btnLeaderboard = document.getElementById('btnLeaderboard');
  if (btnLeaderboard) {
    btnLeaderboard.addEventListener('click', () => {
      renderLeaderboard();
      showScreen('screen-leaderboard');
    });
  }

  const btnViewLeaderboard = document.getElementById('btnViewLeaderboard');
  if (btnViewLeaderboard) {
    btnViewLeaderboard.addEventListener('click', () => {
      renderLeaderboard();
      showScreen('screen-leaderboard');
    });
  }

  const lbBack = document.getElementById('lbBack');
  if (lbBack) lbBack.addEventListener('click', () => showScreen('screen-home'));

  const btnClearLb = document.getElementById('btnClearLb');
  if (btnClearLb) btnClearLb.addEventListener('click', clearLeaderboard);

  // Results screen
  const btnPlayAgain = document.getElementById('btnPlayAgain');
  if (btnPlayAgain) btnPlayAgain.addEventListener('click', startQuizSession);

  const btnHome2 = document.getElementById('btnHome2');
  if (btnHome2) btnHome2.addEventListener('click', () => showScreen('screen-home'));
});

// ===== FLOATING PARTICLES =====
function initParticles() {
  const container = document.getElementById('bgParticles');
  if (!container) return;
  container.innerHTML = '';
  const colors = ['#008751', '#f5a623', '#ff6b00', '#ffffff'];
  for (let i = 0; i < 25; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 8 + 4;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.left = `${Math.random() * 100}%`;
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.animationDuration = `${Math.random() * 12 + 8}s`;
    p.style.animationDelay = `${Math.random() * -20}s`;
    container.appendChild(p);
  }
}

// ===== SCREEN SWITCHING =====
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const active = document.getElementById(screenId);
  if (active) {
    active.classList.add('active');
    activeScreen = screenId;
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== LOADING SCREEN =====
function showLoadingScreen(message = '✨ NL AI is crafting your questions...') {
  const msgEl   = document.getElementById('loadingMessage');
  const spinner = document.getElementById('loadingSpinner');
  const errorBtns = document.getElementById('loadingErrorBtns');
  const subEl   = document.getElementById('loadingSub');

  if (msgEl)   msgEl.textContent = message;
  if (spinner) spinner.style.display = 'block';
  if (subEl)   subEl.style.display = 'block';
  if (errorBtns) errorBtns.style.display = 'none';

  showScreen('screen-loading');
}

function showLoadingError(message = '⚠️ Could not generate questions. Check your API key and try again.') {
  const msgEl   = document.getElementById('loadingMessage');
  const spinner = document.getElementById('loadingSpinner');
  const errorBtns = document.getElementById('loadingErrorBtns');
  const subEl   = document.getElementById('loadingSub');

  if (msgEl)   msgEl.textContent = message;
  if (spinner) spinner.style.display = 'none';
  if (subEl)   subEl.style.display = 'none';
  if (errorBtns) errorBtns.style.display = 'flex';
}

// ===== SESSION INITIALIZATION =====
async function startQuizSession() {
  const nameInput = document.getElementById('playerName');
  playerName = nameInput ? nameInput.value.trim() : '';
  if (!playerName) playerName = 'Champ';

  // If no API key is available, skip straight to fallback offline questions
  if (!apiKey) {
    console.warn('No API key — using offline fallback questions.');
    resetGameStats();
    showLoadingScreen('📚 Loading offline questions...');
    const result = typeof getFallbackQuestions === 'function' ? getFallbackQuestions(category) : [];
    if (!result || result.length === 0) {
      showLoadingError('⚠️ Could not load questions. Please refresh the page.');
      return;
    }
    quizQuestions = result.slice(0, 20);
    showScreen('screen-quiz');
    showQuestion();
    return;
  }

  // Update quiz header labels
  const qPlayerName = document.getElementById('quizPlayerName');
  const qCategory   = document.getElementById('quizCategory');
  if (qPlayerName) qPlayerName.textContent = playerName;
  if (qCategory)   qCategory.textContent   = getFriendlyCategory(category);

  resetGameStats();
  showLoadingScreen();

  let result = await fetchQuestionsFromGemini();

  // If the API fails or there's an error, use the fallback questions from data.js
  if (!result || result.error || result.length === 0) {
    console.warn("API failed or errored. Using offline fallback questions.");
    if (typeof getFallbackQuestions === 'function') {
      result = getFallbackQuestions(category);
    } else {
      const errorMsg = result?.error || '⚠️ Could not generate questions and fallback data is missing.';
      showLoadingError(errorMsg);
      return;
    }
  }

  quizQuestions = result.slice(0, 20); // ensure we have max 20
  showScreen('screen-quiz');
  showQuestion();
}

function resetGameStats() {
  score = 0;
  streak = 0;
  maxStreak = 0;
  currentQIndex = 0;
  correctAnswersCount = 0;
  hintsLeft = 3;
  updateQuizHeaderUI();
}

// ===== GEMINI: GENERATE QUESTIONS =====
async function fetchQuestionsFromGemini() {
  const catPrompt = CATEGORY_PROMPTS[category] || CATEGORY_PROMPTS['all'];
  const diffDesc = {
    easy:   'beginner-friendly, widely-known facts',
    medium: 'moderate — requires some study',
    hard:   'challenging, expert-level knowledge'
  }[difficulty] || '';

  const prompt = `Generate exactly 20 multiple-choice trivia questions about ${catPrompt}.
Difficulty: ${difficulty} (${diffDesc}).
Ensure questions are highly unique, diverse, and cover obscure but interesting facts to avoid recycling questions across sessions. Seed: ${Date.now()}.
Each question needs exactly 4 answer options. Only one is correct.
"ans" is the 0-based index of the correct option.
Respond with ONLY a JSON array, nothing else:
[
  {
    "q": "What is the capital of France?",
    "opts": ["London", "Berlin", "Paris", "Madrid"],
    "ans": 2,
    "emoji": "🏙️",
    "cat": "${category}",
    "diff": "${difficulty}"
  }
]`;

  try {
    const res = await fetch(`${GEMINI_BASE}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.9, maxOutputTokens: 8192 }
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error('NL AI API error:', res.status, errData);
      const msg = errData?.error?.message || `API Error: ${res.status}`;
      return { error: `⚠️ NL AI Error: ${msg}` };
    }

    const data = await res.json();
    let raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('Gemini raw response:', raw.substring(0, 200));

    // Strip markdown code fences
    raw = raw.replace(/```json/gi, '').replace(/```/g, '').trim();

    // Try to extract JSON array using regex if direct parse fails
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const match = raw.match(/(\[\s*\{[\s\S]*\}\s*\])/);
      if (match) {
        parsed = JSON.parse(match[1]);
      } else {
        console.error('Could not extract JSON from response:', raw.substring(0, 300));
        return { error: '⚠️ Invalid format received from NL AI. Please try again.' };
      }
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return { error: '⚠️ NL AI returned an empty question list.' };
    }

    // Validate each question
    const valid = parsed.filter(q =>
      q.q &&
      Array.isArray(q.opts) && q.opts.length === 4 &&
      typeof q.ans === 'number' && q.ans >= 0 && q.ans <= 3
    ).slice(0, 20);

    console.log(`✅ Got ${valid.length} valid questions from NL AI`);
    if (valid.length === 0) return { error: '⚠️ NL AI failed to generate correctly formatted questions.' };
    return valid;

  } catch (err) {
    console.error('NL AI question fetch error:', err);
    return { error: `⚠️ Network error: ${err.message || 'Check your connection.'}` };
  }
}

// ===== GEMINI: GENERATE FUN FACT =====
async function fetchFunFactFromGemini(questionText) {
  const prompt = `Give me one surprising fun fact related to: "${questionText}"
Keep it to 1-2 sentences. Make it educational and interesting.
Respond with ONLY this JSON, nothing else:
{"emoji": "💡", "text": "Your fun fact here."}`;

  try {
    const res = await fetch(`${GEMINI_BASE}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 512 }
      })
    });

    if (!res.ok) return null;

    const data = await res.json();
    let raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    raw = raw.replace(/```json/gi, '').replace(/```/g, '').trim();

    let fact;
    try {
      fact = JSON.parse(raw);
    } catch {
      // Try extracting JSON object with regex
      const match = raw.match(/(\{[\s\S]*\})/);
      if (match) fact = JSON.parse(match[1]);
    }

    return (fact && fact.text) ? fact : null;

  } catch (err) {
    console.error('Gemini fun fact error:', err);
    return null;
  }
}

// ===== DISPLAYING QUESTIONS =====
function showQuestion() {
  if (currentQIndex >= quizQuestions.length) {
    endQuiz();
    return;
  }

  usedHint = false;
  currentQuestion = quizQuestions[currentQIndex];

  const questionBadge = document.getElementById('questionBadge');
  if (questionBadge) {
    questionBadge.textContent = `${currentQuestion.emoji || '🌍'} Question ${currentQIndex + 1}`;
  }

  const questionText = document.getElementById('questionText');
  if (questionText) questionText.textContent = currentQuestion.q;

  const progressBar   = document.getElementById('progressBar');
  const progressLabel = document.getElementById('progressLabel');
  const percent = ((currentQIndex + 1) / quizQuestions.length) * 100;
  if (progressBar)   progressBar.style.width     = `${percent}%`;
  if (progressLabel) progressLabel.textContent   = `Question ${currentQIndex + 1} of 20`;

  // Shuffle & render options
  const optionsGrid = document.getElementById('optionsGrid');
  if (optionsGrid) {
    optionsGrid.innerHTML = '';
    const correctText   = currentQuestion.opts[currentQuestion.ans];
    const shuffledOpts  = [...currentQuestion.opts].sort(() => Math.random() - 0.5);

    shuffledOpts.forEach((optText, index) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.setAttribute('data-text', optText);

      const label = document.createElement('span');
      label.className = 'option-label';
      label.textContent = String.fromCharCode(65 + index);

      const text = document.createElement('span');
      text.className = 'option-text';
      text.textContent = optText;

      btn.appendChild(label);
      btn.appendChild(text);
      btn.addEventListener('click', () => handleOptionClick(btn, optText, correctText));
      optionsGrid.appendChild(btn);
    });
  }

  const btnHint = document.getElementById('btnHint');
  if (btnHint) {
    btnHint.disabled = (hintsLeft <= 0);
    btnHint.textContent = `💡 50/50 Hint (${hintsLeft} left)`;
  }

  startTimer();
}

// ===== TIMER =====
function startTimer() {
  clearInterval(timerInterval);
  timeLeft = 15;
  updateTimerUI();

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerUI();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      handleTimeOut();
    }
  }, 1000);
}

function updateTimerUI() {
  const timerText = document.getElementById('timerText');
  const timerArc  = document.getElementById('timerArc');
  if (timerText) timerText.textContent = timeLeft;

  if (timerArc) {
    timerArc.style.strokeDashoffset = 163 * (1 - timeLeft / 15);
    if (timeLeft <= 5) {
      timerArc.style.stroke = 'var(--wrong)';
      if (timerText) timerText.style.color = 'var(--wrong)';
    } else {
      timerArc.style.stroke = 'var(--amber)';
      if (timerText) timerText.style.color = 'var(--text)';
    }
  }
}

// ===== USER SELECTION =====
function handleOptionClick(selectedBtn, selectedText, correctText) {
  clearInterval(timerInterval);
  const buttons = document.querySelectorAll('.option-btn');
  buttons.forEach(btn => (btn.disabled = true));

  if (selectedText === correctText) {
    selectedBtn.classList.add('correct');
    scoreCorrectAnswer();
  } else {
    selectedBtn.classList.add('wrong');
    buttons.forEach(btn => {
      if (btn.getAttribute('data-text') === correctText) btn.classList.add('reveal');
    });
    scoreWrongAnswer();
  }
}

function scoreCorrectAnswer() {
  correctAnswersCount++;
  streak++;
  if (streak > maxStreak) maxStreak = streak;

  const basePoints = difficulty === 'hard' ? 200 : difficulty === 'medium' ? 150 : 100;
  const streakBonus = Math.round(basePoints * (Math.min(streak * 10, 50) / 100));
  score += basePoints + streakBonus;

  updateQuizHeaderUI();
  showFeedback(true, basePoints + streakBonus);
}

function scoreWrongAnswer() {
  streak = 0;
  updateQuizHeaderUI();
  showFeedback(false, 0);
}

function handleTimeOut() {
  streak = 0;
  updateQuizHeaderUI();

  const buttons = document.querySelectorAll('.option-btn');
  buttons.forEach(btn => (btn.disabled = true));
  const correctText = currentQuestion.opts[currentQuestion.ans];
  buttons.forEach(btn => {
    if (btn.getAttribute('data-text') === correctText) btn.classList.add('reveal');
  });

  showFeedback('timeout', 0);
}

function updateQuizHeaderUI() {
  const scoreVal  = document.getElementById('quizScore');
  const streakVal = document.getElementById('quizStreak');
  if (scoreVal)  scoreVal.textContent  = score;
  if (streakVal) streakVal.textContent = streak;
}

// ===== FEEDBACK OVERLAY =====
function showFeedback(type, pointsEarned) {
  const overlay  = document.getElementById('feedbackOverlay');
  const iconEl   = document.getElementById('feedbackIcon');
  const titleEl  = document.getElementById('feedbackTitle');
  const msgEl    = document.getElementById('feedbackMsg');
  const pointsEl = document.getElementById('pointsBurst');

  if (!overlay) return;

  const correctTitles = ['Brilliant! 🌟', 'Nailed it! 🔥', 'You got it! ✨', 'Perfect! 💯', 'Genius! 🧠'];
  const wrongTitles   = ['Not quite! 😔', 'Oops! 💔', 'Keep trying! 🤝', 'Study up! 📚', 'Close one! 🤷'];
  const timeoutTitles = ["Time's up! ⏳", 'Too slow! ⚡', 'Hurry next time! ⏰'];

  if (type === true) {
    lastAnswerWasCorrect = true;
    iconEl.textContent   = '✅';
    titleEl.textContent  = correctTitles[Math.floor(Math.random() * correctTitles.length)];
    msgEl.textContent    = 'Excellent! You answered correctly!';
    pointsEl.textContent = `+${pointsEarned} PTS`;
    pointsEl.style.color = 'var(--correct)';
  } else if (type === false) {
    lastAnswerWasCorrect = false;
    iconEl.textContent   = '❌';
    titleEl.textContent  = wrongTitles[Math.floor(Math.random() * wrongTitles.length)];
    msgEl.textContent    = `Correct answer: "${currentQuestion.opts[currentQuestion.ans]}"`;
    pointsEl.textContent = '0 PTS';
    pointsEl.style.color = 'var(--wrong)';
  } else {
    lastAnswerWasCorrect = false;
    iconEl.textContent   = '⏰';
    titleEl.textContent  = timeoutTitles[Math.floor(Math.random() * timeoutTitles.length)];
    msgEl.textContent    = `Time ran out! Answer: "${currentQuestion.opts[currentQuestion.ans]}"`;
    pointsEl.textContent = '0 PTS';
    pointsEl.style.color = 'var(--muted)';
  }

  overlay.classList.add('show');

  const autoClose = setTimeout(closeFeedbackAndProceed, 2500);
  overlay.onclick = () => {
    clearTimeout(autoClose);
    closeFeedbackAndProceed();
  };
}

function closeFeedbackAndProceed() {
  const overlay = document.getElementById('feedbackOverlay');
  if (overlay) {
    overlay.classList.remove('show');
    overlay.onclick = null;
  }

  if (lastAnswerWasCorrect) {
    // ✅ Correct — skip fun fact, go straight to next question
    currentQIndex++;
    showQuestion();
  } else {
    // ❌ Wrong / timeout — streak broken → show NL AI fun fact
    showFunFactScreen();
  }
}

// ===== HINT & SKIP =====
function handle5050Hint() {
  if (hintsLeft <= 0 || usedHint) return;

  const buttons     = Array.from(document.querySelectorAll('.option-btn'));
  const correctText = currentQuestion.opts[currentQuestion.ans];
  const toHide = buttons
    .filter(btn => btn.getAttribute('data-text') !== correctText)
    .sort(() => Math.random() - 0.5)
    .slice(0, 2);

  toHide.forEach(btn => (btn.style.visibility = 'hidden'));
  hintsLeft--;
  usedHint = true;

  const btnHint = document.getElementById('btnHint');
  if (btnHint) {
    btnHint.disabled    = true;
    btnHint.textContent = `💡 Hint (${hintsLeft} left)`;
  }
}

function handleSkip() {
  clearInterval(timerInterval);
  streak = 0;
  updateQuizHeaderUI();
  lastAnswerWasCorrect = false;  // treat skip as wrong for fun-fact logic
  showFunFactScreen();
}

// ===== FUN FACT SCREEN (only shown after streak loss) =====
async function showFunFactScreen() {
  // Close Gemini panel & clear chat
  document.getElementById('geminiPanel')?.classList.remove('open');
  const chat = document.getElementById('geminiChat');
  if (chat) chat.innerHTML = '';

  showScreen('screen-funfact');

  const progressEl = document.getElementById('funfactProgress');
  if (progressEl) progressEl.textContent = `Fact ${currentQIndex + 1} of 20`;

  const emojiEl = document.getElementById('funfactEmoji');
  const textEl  = document.getElementById('funfactText');

  // Show loading state while NL AI generates the fact
  if (emojiEl) emojiEl.textContent = '⏳';
  if (textEl)  textEl.textContent  = 'NL AI is generating a fun fact for you...';

  const questionText = currentQuestion ? currentQuestion.q : 'world knowledge';
  let fact = await fetchFunFactFromGemini(questionText);
  
  if (!fact || !fact.text) {
      fact = getRandomFallbackFact();
  }

  if (fact && fact.text) {
    if (emojiEl) emojiEl.textContent = fact.emoji || '💡';
    if (textEl)  textEl.textContent  = fact.text;
  } else {
    if (emojiEl) emojiEl.textContent = '🌍';
    if (textEl)  textEl.textContent  = 'Every mistake is a stepping stone to mastery. Keep pushing — knowledge is power!';
  }
}

// ===== GEMINI CHAT PANEL =====

function openGeminiPanel() {
  const panel = document.getElementById('geminiPanel');
  if (!panel) return;
  panel.classList.add('open');
  panel.scrollIntoView({ behavior: 'smooth' });

  const chat = document.getElementById('geminiChat');
  if (chat && chat.children.length === 0) {
    const factText = document.getElementById('funfactText')?.textContent || 'this topic';
    appendChatMessage('bot', `Hi! I'm NL AI 🤖 — I can tell you more about: "${factText}". What would you like to know?`);
  }
}

async function sendGeminiMessage() {
  const input = document.getElementById('geminiInput');
  const text  = input ? input.value.trim() : '';
  if (!text) return;

  if (input) input.value = '';
  appendChatMessage('user', text);
  const loadingMsg = appendChatMessage('bot loading', 'NL AI is thinking...');

  try {
    const factText = document.getElementById('funfactText')?.textContent || '';
    const res = await fetch(`${GEMINI_BASE}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{
            text: `You are an enthusiastic and knowledgeable trivia AI companion. Be warm, educational, and engaging.
Context — the player just read this fun fact: "${factText}".
Player asks: ${text}
Respond clearly and concisely (2-3 paragraphs max).`
          }]
        }]
      })
    });

    if (loadingMsg?.parentNode) loadingMsg.parentNode.removeChild(loadingMsg);

    if (!res.ok) {
      appendChatMessage('bot', '⚠️ Connection issue. Please check your API key and try again.');
      return;
    }

    const data = await res.json();
    const botText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received. Try again!';
    appendChatMessage('bot', botText);

  } catch (err) {
    if (loadingMsg?.parentNode) loadingMsg.parentNode.removeChild(loadingMsg);
    appendChatMessage('bot', '📡 Network error. Please check your connection and try again.');
  }
}

function appendChatMessage(senderClass, msgText) {
  const chat = document.getElementById('geminiChat');
  if (!chat) return null;

  const msg = document.createElement('div');
  msg.className = `gemini-msg ${senderClass}`;
  msg.innerHTML = senderClass.includes('loading') ? msgText : safeFormatMarkdown(msgText);

  chat.appendChild(msg);
  chat.scrollTo({ top: chat.scrollHeight, behavior: 'smooth' });
  return msg;
}

function safeFormatMarkdown(text) {
  let escaped = escapeHtml(text);
  escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  escaped = escaped.replace(/\*(.*?)\*/g,     '<em>$1</em>');
  escaped = escaped.replace(/\n/g,             '<br>');
  return escaped;
}

// ===== RESULTS & CONFETTI =====
function endQuiz() {
  clearInterval(timerInterval);
  showScreen('screen-results');
  triggerConfetti();

  const total    = quizQuestions.length;
  const accuracy = total > 0 ? Math.round((correctAnswersCount / total) * 100) : 0;

  document.getElementById('statScore')?.setAttribute('data-val', score);
  document.getElementById('statScore')  && (document.getElementById('statScore').textContent   = score);
  document.getElementById('statCorrect') && (document.getElementById('statCorrect').textContent = correctAnswersCount);
  document.getElementById('statPercent') && (document.getElementById('statPercent').textContent = `${accuracy}%`);
  document.getElementById('statStreak')  && (document.getElementById('statStreak').textContent  = maxStreak);
  document.getElementById('resultsPlayer') && (document.getElementById('resultsPlayer').textContent = `Great job, ${playerName}!`);

  let gradeIcon = '⭐', gradeTextStr = '';
  if (accuracy >= 90)      { gradeIcon = '👑'; gradeTextStr = 'Mastermind! You are a true trivia legend!'; }
  else if (accuracy >= 70) { gradeIcon = '🌟'; gradeTextStr = 'Excellent! You really know your stuff!'; }
  else if (accuracy >= 50) { gradeIcon = '📖'; gradeTextStr = 'Good effort! Keep learning and try again!'; }
  else                     { gradeIcon = '🧠'; gradeTextStr = 'Keep studying! Knowledge grows with practice!'; }

  document.getElementById('gradeIcon') && (document.getElementById('gradeIcon').textContent = gradeIcon);
  document.getElementById('gradeText') && (document.getElementById('gradeText').textContent = gradeTextStr);

  saveToLeaderboard();
}

function triggerConfetti() {
  const container = document.getElementById('resultsConfetti');
  if (!container) return;
  container.innerHTML = '';

  const colors = ['#008751', '#f5a623', '#ff6b00', '#ffffff', '#00c853', '#ff1744'];
  for (let i = 0; i < 80; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left              = `${Math.random() * 100}%`;
    piece.style.top               = `-${Math.random() * 20 + 10}px`;
    piece.style.background        = colors[Math.floor(Math.random() * colors.length)];
    piece.style.width             = `${Math.random() * 6 + 6}px`;
    piece.style.height            = `${Math.random() * 10 + 6}px`;
    piece.style.animationDuration = `${Math.random() * 3 + 2}s`;
    piece.style.animationDelay   = `${Math.random() * 2}s`;
    container.appendChild(piece);
  }
}

// ===== LEADERBOARD =====
function saveToLeaderboard() {
  let lb = JSON.parse(localStorage.getItem('naijalearn_leaderboard')) || [];
  lb.push({ name: playerName, score, category, difficulty, streak: maxStreak, date: new Date().toLocaleDateString() });
  lb.sort((a, b) => b.score - a.score);
  lb = lb.slice(0, 10);
  localStorage.setItem('naijalearn_leaderboard', JSON.stringify(lb));
}

function renderLeaderboard() {
  const lbList = document.getElementById('lbList');
  if (!lbList) return;
  lbList.innerHTML = '';

  const lb = JSON.parse(localStorage.getItem('naijalearn_leaderboard')) || [];
  if (lb.length === 0) {
    lbList.innerHTML = `<div class="lb-empty">No scores yet. Be the first champion!</div>`;
    return;
  }

  lb.forEach((entry, index) => {
    const item = document.createElement('div');
    item.className = 'lb-item';
    const rank = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`;
    item.innerHTML = `
      <div class="lb-rank">${rank}</div>
      <div class="lb-info">
        <div class="lb-name">${escapeHtml(entry.name)}</div>
        <div class="lb-detail">${getFriendlyCategory(entry.category)} • ${capitalize(entry.difficulty)} • Streak: ${entry.streak}</div>
      </div>
      <div class="lb-score">${entry.score}</div>
    `;
    lbList.appendChild(item);
  });
}

function clearLeaderboard() {
  if (confirm('Clear the leaderboard?')) {
    localStorage.removeItem('naijalearn_leaderboard');
    renderLeaderboard();
  }
}

// ===== HELPERS =====
function getFriendlyCategory(cat) {
  const map = {
    history: 'History',
    geography: 'Geography',
    culture: 'Culture',
    science: 'Science',
    all: 'General Trivia'
  };
  return map[cat] || 'Trivia';
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getRandomFallbackFact() {
  const facts = [
    { emoji: "🌍", text: "Did you know? The shortest war in history lasted only 38 minutes between Britain and Zanzibar on August 27, 1896." },
    { emoji: "🔬", text: "Water can boil and freeze at the same time! It's called the 'triple point', which occurs when temperature and pressure are just right." },
    { emoji: "🏛️", text: "Oxford University is actually older than the Aztec Empire. Teaching at Oxford started around 1096." },
    { emoji: "🌟", text: "There are more trees on Earth than stars in the Milky Way galaxy. About 3 trillion trees compared to 100-400 billion stars!" },
    { emoji: "🎨", text: "Leonardo da Vinci could write with one hand and draw with the other at the very same time." },
    { emoji: "🐝", text: "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible." },
    { emoji: "🐙", text: "Octopuses have three hearts, nine brains, and blue blood. Two hearts pump blood to the gills, while the third pumps it to the rest of the body." },
    { emoji: "🗼", text: "The Eiffel Tower can be 15 cm taller during the summer due to thermal expansion meaning the iron heats up, the particles gain kinetic energy and take up more space." },
    { emoji: "🍓", text: "Strawberries aren't actually berries, but bananas, pumpkins, and avocados are! This is due to botanical classifications." },
    { emoji: "🧊", text: "About 68 percent of the freshwater on Earth is trapped in glaciers and ice caps." }
  ];
  return facts[Math.floor(Math.random() * facts.length)];
}

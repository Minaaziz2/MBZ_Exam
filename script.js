// ---- State ----
let answeredQuestions = 0;
let correctAnswers = 0;
let incorrectAnswers = 0;
let answersVisible = false;
let navigationVisible = true;
let totalQuestions = 0;
let dataCache = null;

// ---- Boot ----
document.addEventListener('DOMContentLoaded', async function () {
  await loadQuestions();
  initializeEventListeners();
  updateProgress();
  updateScore();
  addTooltips();
  lazyLoadSections();
  loadProgress();
});

// ---- Data & Rendering ----
async function loadQuestions() {
  try {
    // Works in root or subfolders (e.g., /MBZ_Exam/)
    const base = (location.origin + location.pathname).replace(/\/[^/]*$/, '/');
    const url = `${base}questions.json?v=${Date.now()}`;

    const resp = await fetch(url, { cache: 'no-store' });
    if (!resp.ok) throw new Error(`Failed to fetch questions.json: ${resp.status} ${resp.statusText}`);

    dataCache = await resp.json();

    const content = document.getElementById('content');
    content.innerHTML = '';

    let qCount = 0;
    (dataCache.sections || []).forEach(section => {
      // section container
      const secDiv = document.createElement('div');
      secDiv.className = 'section';
      secDiv.id = section.id;

      // section header
      const header = document.createElement('div');
      header.className = 'section-header ' + (section.id || '').replace(/[^a-z\-]/g,'');
      header.textContent = `${section.title} (Questions ${section.questionRange})`;
      secDiv.appendChild(header);

      // questions
      (section.questions || []).forEach(q => {
        qCount += 1;
        const qDiv = document.createElement('div');
        qDiv.className = 'question';
        qDiv.setAttribute('data-correct', q.correct);

        const num = document.createElement('div');
        num.className = 'question-number';
        num.textContent = `Q${q.id}`;
        qDiv.appendChild(num);

        const status = document.createElement('div');
        status.className = 'question-status status-unanswered';
        status.textContent = 'Unanswered';
        qDiv.appendChild(status);

        const qText = document.createElement('div');
        qText.className = 'question-text';
        qText.textContent = q.text;
        qDiv.appendChild(qText);

        const opts = document.createElement('div');
        opts.className = 'options';
        (q.options || []).forEach((opt, idx) => {
          const o = document.createElement('div');
          o.className = 'option';
          const letter = ['A','B','C','D'][idx] || '?';
          o.setAttribute('data-value', letter);
          o.textContent = opt;
          o.addEventListener('click', function () { handleOptionClick(this); });
          opts.appendChild(o);
        });
        qDiv.appendChild(opts);

        const ans = document.createElement('div');
        ans.className = 'answer';
        ans.style.display = answersVisible ? 'block' : 'none';
        ans.innerHTML = `<div class="answer-label">Answer:</div> ${q.correct}) ${q.explanation}`;
        qDiv.appendChild(ans);

        secDiv.appendChild(qDiv);
      });

      content.appendChild(secDiv);
    });

    totalQuestions = qCount;
    const pt = document.querySelector('.progress-text');
    if (pt) pt.innerHTML = `Progress: <span id="progress-count">0</span>/${totalQuestions}`;
  } catch (e) {
    console.error(e);
    const content = document.getElementById('content');
    content.innerHTML = `
      <div style="padding:16px;border:1px solid #f99;border-radius:12px;background:#fff7f7">
        <strong>Couldn’t load questions.json.</strong><br>
        <em>${e.message}</em><br>
        Tip: Make sure <code>questions.json</code> is in the same folder as <code>index.html</code>,
        and do a hard refresh (Ctrl+F5 / Cmd+Shift+R).
      </div>
    `;
  }
}

// ---- Events & Controls ----
function initializeEventListeners() {
  // Smooth scroll for right-nav
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const target = document.querySelector(targetId);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Keyboard: 1–4 select; Arrows move sections; A toggles answers; N toggles nav
  document.addEventListener('keydown', handleKeyboardNavigation);

  // Scroll highlights current section in right-nav
  window.addEventListener('scroll', updateNavigationIndicator);
}

// Answer click handler
function handleOptionClick(clickedOption) {
  const question = clickedOption.closest('.question');
  const options = question.querySelectorAll('.option');
  const correctAnswer = question.getAttribute('data-correct');
  const selectedAnswer = clickedOption.getAttribute('data-value');
  const questionStatus = question.querySelector('.question-status');
  const wasAnswered = question.querySelector('.option.selected') !== null;

  // clear previous selection
  options.forEach(opt => opt.classList.remove('selected', 'correct', 'incorrect'));
  clickedOption.classList.add('selected');

  // scoring
  if (selectedAnswer === correctAnswer) {
    clickedOption.classList.add('correct');
    questionStatus.textContent = 'Correct';
    questionStatus.className = 'question-status status-correct';

    if (!wasAnswered) {
      correctAnswers++;
      answeredQuestions++;
    } else if (question.dataset.wasCorrect === 'false') {
      correctAnswers++;
      incorrectAnswers--;
    }
    question.dataset.wasCorrect = 'true';
  } else {
    clickedOption.classList.add('incorrect');
    questionStatus.textContent = 'Incorrect';
    questionStatus.className = 'question-status status-incorrect';

    if (!wasAnswered) {
      incorrectAnswers++;
      answeredQuestions++;
    } else if (question.dataset.wasCorrect === 'true') {
      incorrectAnswers++;
      correctAnswers--;
    }
    question.dataset.wasCorrect = 'false';
  }

  updateProgress();
  updateScore();
}

// Progress/score UI
function updateProgress() {
  const pct = totalQuestions ? (answeredQuestions / totalQuestions) * 100 : 0;
  const pc = document.querySelector('#progress-count');
  if (pc) pc.textContent = answeredQuestions;
  const fill = document.querySelector('.progress-fill');
  if (fill) fill.style.width = pct + '%';
}

function updateScore() {
  const c = document.querySelector('#correct-count');
  const i = document.querySelector('#incorrect-count');
  const s = document.querySelector('#score-percentage');
  if (c) c.textContent = correctAnswers;
  if (i) i.textContent = incorrectAnswers;
  if (s) s.textContent = (answeredQuestions ? Math.round((correctAnswers / answeredQuestions) * 100) : 0) + '%';
  saveProgress();
}

// Show/hide all explanations
function toggleAnswers() {
  answersVisible = !answersVisible;
  const answers = document.querySelectorAll('.answer');
  const toggleButton = document.querySelector('#answer-toggle');

  answers.forEach(a => a.style.display = answersVisible ? 'block' : 'none');
  if (toggleButton) toggleButton.textContent = answersVisible ? 'Hide Answers' : 'Show Answers';
}

// Show/hide right nav
function toggleNavigation() {
  navigationVisible = !navigationVisible;
  const nav = document.querySelector('#navigation');
  const btn = document.querySelector('.nav-toggle');
  if (!nav || !btn) return;

  if (navigationVisible) {
    nav.classList.remove('hidden');
    btn.textContent = '☰ Nav';
  } else {
    nav.classList.add('hidden');
    btn.textContent = '☰ Nav';
  }
}

// Print (temporarily show answers for print)
function printQuestions() {
  const wasVisible = answersVisible;
  if (!answersVisible) toggleAnswers();
  setTimeout(() => {
    window.print();
    if (!wasVisible) setTimeout(() => toggleAnswers(), 300);
  }, 100);
}

// Export results as JSON
function exportResults() {
  const results = {
    examTitle: (dataCache && dataCache.metadata && dataCache.metadata.title) || 'Exam',
    timestamp: new Date().toISOString(),
    totalQuestions,
    answeredQuestions,
    correctAnswers,
    incorrectAnswers,
    scorePercentage: answeredQuestions ? Math.round((correctAnswers / answeredQuestions) * 100) : 0,
    questions: []
  };

  document.querySelectorAll('.question').forEach((qEl, index) => {
    const qText = qEl.querySelector('.question-text')?.textContent || '';
    const selected = qEl.querySelector('.option.selected');
    const correct = qEl.getAttribute('data-correct');
    const answerText = qEl.querySelector('.answer')?.textContent.replace('Answer:', '').trim() || '';
    const isCorrect = qEl.dataset.wasCorrect === 'true';
    const sectionId = qEl.closest('.section')?.id || '';

    results.questions.push({
      questionNumber: index + 1,
      question: qText.trim(),
      selectedAnswer: selected ? selected.textContent.trim() : 'Not answered',
      correctAnswer: correct,
      correctAnswerText: answerText,
      isCorrect: selected ? isCorrect : null,
      section: sectionId
    });
  });

  const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ml_exam_results_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Tooltips and niceties
function addTooltips() {
  document.querySelectorAll('.answer').forEach(a => {
    a.title = 'Click to highlight this explanation';
    a.style.cursor = 'help';
    a.addEventListener('click', function () {
      this.style.transform = this.style.transform === 'scale(1.02)' ? 'scale(1)' : 'scale(1.02)';
      setTimeout(() => { this.style.transform = 'scale(1)'; }, 200);
    });
  });

  const ansToggle = document.querySelector('#answer-toggle');
  if (ansToggle) ansToggle.title = 'Show/hide all answer explanations (Shortcut: A)';
  const navToggle = document.querySelector('.nav-toggle');
  if (navToggle) navToggle.title = 'Show/hide navigation sidebar (Shortcut: N)';
}

// Section highlight on scroll
function updateNavigationIndicator() {
  const sections = document.querySelectorAll('.section');
  const navItems = document.querySelectorAll('.nav-item');
  let current = '';
  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= 100 && rect.bottom > 100) {
      current = section.getAttribute('id');
    }
  });
  navItems.forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('href') === '#' + current) item.classList.add('active');
  });
}

// Lazy “loaded” class for sections
function lazyLoadSections() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('loaded');
    });
  });
  document.querySelectorAll('.section').forEach(section => observer.observe(section));
}

// LocalStorage (lightweight)
function saveProgress() {
  if (typeof Storage === 'undefined') return;
  const progress = { answeredQuestions, correctAnswers, incorrectAnswers, timestamp: new Date().toISOString() };
  localStorage.setItem('mlExamProgress', JSON.stringify(progress));
}
function loadProgress() {
  if (typeof Storage === 'undefined') return;
  const saved = localStorage.getItem('mlExamProgress');
  if (saved) { try { JSON.parse(saved); } catch {} }
}

// Keyboard support
function handleKeyboardNavigation(e) {
  // 1..4 select option on hovered/first question
  const q = document.querySelector('.question:hover') || document.querySelector('.question');
  if (q && ['1','2','3','4'].includes(e.key)) {
    const options = q.querySelectorAll('.option');
    const idx = parseInt(e.key, 10) - 1;
    if (options[idx]) options[idx].click();
  }

  // ArrowUp/Down -> section scroll
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    e.preventDefault();
    const sections = Array.from(document.querySelectorAll('.section'));
    const currentIndex = sections.findIndex(section => {
      const rect = section.getBoundingClientRect();
      return rect.top <= 50 && rect.bottom > 50;
    });
    let nextIndex = currentIndex;
    if (e.key === 'ArrowUp') nextIndex = Math.max(0, currentIndex - 1);
    if (e.key === 'ArrowDown') nextIndex = Math.min(sections.length - 1, currentIndex + 1);
    if (sections[nextIndex]) sections[nextIndex].scrollIntoView({ behavior: 'smooth' });
  }

  // A = toggle answers, N = toggle nav
  if ((e.key === 'a' || e.key === 'A') && !e.ctrlKey && !e.metaKey) toggleAnswers();
  if ((e.key === 'n' || e.key === 'N') && !e.ctrlKey && !e.metaKey) toggleNavigation();
}

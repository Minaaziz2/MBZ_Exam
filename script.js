// Global variables (computed after load)
let answeredQuestions = 0;
let correctAnswers = 0;
let incorrectAnswers = 0;
let answersVisible = false;
let navigationVisible = true;
let totalQuestions = 0;
let dataCache = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', async function () {
  console.log('PhD ML Exam loaded successfully!');
  console.log('Use keyboard shortcuts:');
  console.log('- Press 1, 2, 3, or 4 to select options');
  console.log('- Use arrow keys to navigate between sections');

  await loadQuestions();
  initializeEventListeners();
  updateProgress();
  updateScore();
  addTooltips();
  lazyLoadSections();
  loadProgress();
});

async function loadQuestions() {
  try {
    // Build a robust base URL that works in root *or* subfolders (e.g., /MBZ_Exam/)
    const base = (location.origin + location.pathname).replace(/\/[^/]*$/, '/');
    const url = `${base}questions.json?v=${Date.now()}`;

    const resp = await fetch(url, { cache: 'no-store' });
    if (!resp.ok) throw new Error(`Failed to fetch questions.json: ${resp.status} ${resp.statusText}`);

    dataCache = await resp.json();

    const content = document.getElementById('content');
    content.innerHTML = '';

    let qCount = 0;
    dataCache.sections.forEach(section => {
      const secDiv = document.createElement('div');
      secDiv.className = 'section';
      secDiv.id = section.id;

      const header = document.createElement('div');
      header.className = 'section-header ' + section.id.replace(/[^a-z\-]/g,'');
      header.textContent = `${section.title} (Questions ${section.questionRange})`;
      secDiv.appendChild(header);

      section.questions.forEach(q => {
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
        ans.style.display = 'none';
        ans.innerHTML = `<div class="answer-label">Answer:</div> ${q.correct}) ${q.explanation}`;
        qDiv.appendChild(ans);

        secDiv.appendChild(qDiv);
      });

      content.appendChild(secDiv);
    });

    totalQuestions = qCount;
    document.querySelector('.progress-text').innerHTML =
      `Progress: <span id="progress-count">0</span>/${totalQuestions}`;

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


// Initialize all event listeners
function initializeEventListeners() {
  // Smooth scrolling for navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Interactive option selection (delegated for dynamically added nodes)
  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('option')) {
      handleOptionClick(e.target);
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', handleKeyboardNavigation);

  // Scroll indicator for navigation
  window.addEventListener('scroll', updateNavigationIndicator);
}

// Handle option click
function handleOptionClick(clickedOption) {
  const question = clickedOption.closest('.question');
  const options = question.querySelectorAll('.option');
  const correctAnswer = question.getAttribute('data-correct');
  const selectedAnswer = clickedOption.getAttribute('data-value');
  const questionStatus = question.querySelector('.question-status');

  // Check if this question was previously answered
  const wasAnswered = question.querySelector('.option.selected') !== null;

  // Remove previous selections in this question
  options.forEach(opt => {
    opt.classList.remove('selected', 'correct', 'incorrect');
  });

  // Highlight selected option
  clickedOption.classList.add('selected');

  // Update question status and scoring
  if (selectedAnswer === correctAnswer) {
    clickedOption.classList.add('correct');
    questionStatus.textContent = 'Correct';
    questionStatus.className = 'question-status status-correct';

    if (!wasAnswered) {
      correctAnswers++;
      answeredQuestions++;
    } else {
      // If previously incorrect, adjust counts
      const wasCorrect = question.dataset.wasCorrect === 'true';
      if (!wasCorrect) {
        correctAnswers++;
        incorrectAnswers--;
      }
    }
    question.dataset.wasCorrect = 'true';
  } else {
    clickedOption.classList.add('incorrect');
    questionStatus.textContent = 'Incorrect';
    questionStatus.className = 'question-status status-incorrect';

    if (!wasAnswered) {
      incorrectAnswers++;
      answeredQuestions++;
    } else {
      // If previously correct, adjust counts
      const wasCorrect = question.dataset.wasCorrect === 'true';
      if (wasCorrect) {
        incorrectAnswers++;
        correctAnswers--;
      }
    }
    question.dataset.wasCorrect = 'false';
  }

  updateProgress();
  updateScore();
}

// Update progress tracking
function updateProgress() {
  const progressPercent = totalQuestions ? (answeredQuestions / totalQuestions) * 100 : 0;
  document.querySelector('#progress-count').textContent = answeredQuestions;
  document.querySelector('.progress-fill').style.width = progressPercent + '%';
}

// Update score display
function updateScore() {
  document.querySelector('#correct-count').textContent = correctAnswers;
  document.querySelector('#incorrect-count').textContent = incorrectAnswers;

  const scorePercentage = answeredQuestions > 0 ? Math.round((correctAnswers / answeredQuestions) * 100) : 0;
  document.querySelector('#score-percentage').textContent = scorePercentage + '%';
}

// Toggle answers visibility
function toggleAnswers() {
  answersVisible = !answersVisible;
  const answers = document.querySelectorAll('.answer');
  const toggleButton = document.querySelector('#answer-toggle');

  answers.forEach(answer => {
    if (answersVisible) {
      answer.classList.add('show');
      answer.style.display = 'block';
    } else {
      answer.classList.remove('show');
      answer.style.display = 'none';
    }
  });

  toggleButton.textContent = answersVisible ? 'Hide Answers' : 'Show Answers';
}

// Toggle navigation visibility
function toggleNavigation() {
  navigationVisible = !navigationVisible;
  const navigation = document.querySelector('#navigation');
  const toggleButton = document.querySelector('.nav-toggle');

  if (navigationVisible) {
    navigation.classList.remove('hidden');
    toggleButton.textContent = '☰ Hide';
  } else {
    navigation.classList.add('hidden');
    toggleButton.textContent = '☰ Show';
  }
}

// Handle keyboard navigation
function handleKeyboardNavigation(e) {
  const currentQuestion = document.querySelector('.question:hover') || document.querySelector('.question');

  if (currentQuestion && ['1', '2', '3', '4'].includes(e.key)) {
    const options = currentQuestion.querySelectorAll('.option');
    const optionIndex = parseInt(e.key) - 1;

    if (options[optionIndex]) {
      options[optionIndex].click();
    }
  }

  // Navigate sections with arrow keys
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    e.preventDefault();
    const sections = Array.from(document.querySelectorAll('.section'));
    const currentSectionIndex = sections.findIndex(section => {
      const rect = section.getBoundingClientRect();
      return rect.top <= 50 && rect.bottom > 50;
    });

    let nextIndex;
    if (e.key === 'ArrowUp') {
      nextIndex = Math.max(0, currentSectionIndex - 1);
    } else {
      nextIndex = Math.min(sections.length - 1, currentSectionIndex + 1);
    }

    if (sections[nextIndex]) {
      sections[nextIndex].scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Toggle answers with 'A' key
  if (e.key === 'a' || e.key === 'A') {
    if (!e.ctrlKey && !e.metaKey) {
      toggleAnswers();
    }
  }

  // Toggle navigation with 'N' key
  if (e.key === 'n' || e.key === 'N') {
    if (!e.ctrlKey && !e.metaKey) {
      toggleNavigation();
    }
  }
}

// Update navigation indicator
function updateNavigationIndicator() {
  const sections = document.querySelectorAll('.section');
  const navItems = document.querySelectorAll('.nav-item');

  let current = '';
  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= 100) {
      current = section.getAttribute('id');
    }
  });

  navItems.forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('href') === '#' + current) {
      item.classList.add('active');
    }
  });
}

// Print functionality
function printQuestions() {
  const wasVisible = answersVisible;
  if (!answersVisible) toggleAnswers();

  setTimeout(() => {
    window.print();
    if (!wasVisible) setTimeout(() => toggleAnswers(), 300);
  }, 100);
}

// Export results functionality
function exportResults() {
  const results = {
    examTitle: 'PhD Machine Learning - 100 Practice Questions',
    timestamp: new Date().toISOString(),
    totalQuestions: totalQuestions,
    answeredQuestions: answeredQuestions,
    correctAnswers: correctAnswers,
    incorrectAnswers: incorrectAnswers,
    scorePercentage: answeredQuestions > 0 ? Math.round((correctAnswers / answeredQuestions) * 100) : 0,
    questions: []
  };

  document.querySelectorAll('.question').forEach((question, index) => {
    const questionText = question.querySelector('.question-text').textContent;
    const selectedOption = question.querySelector('.option.selected');
    const correctAnswer = question.getAttribute('data-correct');
    const answerText = question.querySelector('.answer').textContent.replace('Answer:', '').trim();
    const isCorrect = question.dataset.wasCorrect === 'true';

    results.questions.push({
      questionNumber: index + 1,
      question: questionText.trim(),
      selectedAnswer: selectedOption ? selectedOption.textContent.trim() : 'Not answered',
      correctAnswer: correctAnswer,
      correctAnswerText: answerText,
      isCorrect: selectedOption ? isCorrect : null,
      section: question.closest('.section').id
    });
  });

  const dataStr = JSON.stringify(results, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `ml_exam_results_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

// Add tooltips for better user experience
function addTooltips() {
  document.querySelectorAll('.answer').forEach(answer => {
    answer.title = 'Click to highlight this explanation';
    answer.style.cursor = 'help';
    answer.addEventListener('click', function () {
      this.style.transform = this.style.transform === 'scale(1.02)' ? 'scale(1)' : 'scale(1.02)';
      setTimeout(() => { this.style.transform = 'scale(1)'; }, 200);
    });
  });

  const ansToggle = document.querySelector('#answer-toggle');
  if (ansToggle) ansToggle.title = 'Show/hide all answer explanations (Shortcut: A)';
  const navToggle = document.querySelector('.nav-toggle');
  if (navToggle) navToggle.title = 'Show/hide navigation sidebar (Shortcut: N)';
}

// Performance optimization: Lazy load sections
function lazyLoadSections() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('loaded');
      }
    });
  });

  document.querySelectorAll('.section').forEach(section => {
    observer.observe(section);
  });
}

// Auto-save progress to localStorage
function saveProgress() {
  if (typeof Storage !== "undefined") {
    const progress = {
      answeredQuestions,
      correctAnswers,
      incorrectAnswers,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('mlExamProgress', JSON.stringify(progress));
  }
}

function loadProgress() {
  if (typeof Storage !== "undefined") {
    const saved = localStorage.getItem('mlExamProgress');
    if (saved) {
      const progress = JSON.parse(saved);
      console.log('Previous progress found:', progress);
    }
  }
}

// Hook to save progress whenever score updates
const _originalUpdateScore = updateScore;
updateScore = function () {
  _originalUpdateScore();
  saveProgress();
};

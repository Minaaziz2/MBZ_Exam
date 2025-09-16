// Global variables (computed after load)
let answeredQuestions = 0;
let correctAnswers = 0;
let incorrectAnswers = 0;
let answersVisible = false;
let navigationVisible = true;
let totalQuestions = 0;
let dataCache = null;

document.addEventListener('DOMContentLoaded', async function () {
  await loadQuestions();
  initializeEventListeners();
  updateProgress();
  updateScore();
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
    document.querySelector('.progress-text').innerHTML = `Progress: <span id="progress-count">0</span>/${totalQuestions}`;
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

// ... rest of script (handleOptionClick, updateProgress, updateScore, toggleAnswers, etc.) remain same ...

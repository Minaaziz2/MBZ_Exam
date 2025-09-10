// Smooth scrolling for navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function(e) {
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

// Interactive option selection
document.querySelectorAll('.option').forEach(option => {
    option.addEventListener('click', function() {
        // Remove previous selections in this question
        const question = this.closest('.question');
        question.querySelectorAll('.option').forEach(opt => {
            opt.style.backgroundColor = '#ffffff';
            opt.style.borderColor = '#ecf0f1';
            opt.classList.remove('selected');
        });
        
        // Highlight selected option
        this.style.backgroundColor = '#e3f2fd';
        this.style.borderColor = '#2196f3';
        this.classList.add('selected');
    });
});

// Add scroll indicator for navigation
window.addEventListener('scroll', function() {
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
        item.style.backgroundColor = 'transparent';
        if (item.getAttribute('href') === '#' + current) {
            item.classList.add('active');
            item.style.backgroundColor = '#f1f2f6';
        }
    });
});

// Question progress tracking
let answeredQuestions = 0;
const totalQuestions = 100;

function updateProgress() {
    answeredQuestions = document.querySelectorAll('.option.selected').length;
    
    // Create or update progress bar if it doesn't exist
    let progressBar = document.querySelector('.progress-bar');
    if (!progressBar) {
        progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressBar.innerHTML = `
            <div class="progress-text">Progress: <span id="progress-count">0</span>/${totalQuestions}</div>
            <div class="progress-fill" style="width: 0%"></div>
        `;
        document.querySelector('.header').appendChild(progressBar);
    }
    
    const progressPercent = (answeredQuestions / totalQuestions) * 100;
    document.querySelector('#progress-count').textContent = answeredQuestions;
    document.querySelector('.progress-fill').style.width = progressPercent + '%';
}

// Add event listeners for progress tracking
document.querySelectorAll('.option').forEach(option => {
    option.addEventListener('click', function() {
        setTimeout(updateProgress, 100); // Small delay to ensure selection is processed
    });
});

// Keyboard navigation
document.addEventListener('keydown', function(e) {
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
});

// Add tooltips for answer explanations
document.querySelectorAll('.answer').forEach(answer => {
    answer.style.cursor = 'help';
    answer.addEventListener('click', function() {
        this.style.transform = this.style.transform === 'scale(1.02)' ? 'scale(1)' : 'scale(1.02)';
    });
});

// Print functionality
function printQuestions() {
    window.print();
}

// Export results functionality
function exportResults() {
    const results = [];
    document.querySelectorAll('.question').forEach((question, index) => {
        const questionText = question.querySelector('.question-text').textContent;
        const selectedOption = question.querySelector('.option.selected');
        const answer = question.querySelector('.answer').textContent;
        
        results.push({
            questionNumber: index + 1,
            question: questionText,
            selectedAnswer: selectedOption ? selectedOption.textContent : 'Not answered',
            correctAnswer: answer
        });
    });
    
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ml_exam_results.json';
    link.click();
    
    URL.revokeObjectURL(url);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('PhD ML Exam loaded successfully!');
    console.log('Use keyboard shortcuts:');
    console.log('- Press 1, 2, 3, or 4 to select options');
    console.log('- Use arrow keys to navigate between sections');
    
    // Add utility buttons
    const utilityButtons = document.createElement('div');
    utilityButtons.className = 'utility-buttons';
    utilityButtons.innerHTML = `
        <button onclick="printQuestions()" class="util-btn">Print</button>
        <button onclick="exportResults()" class="util-btn">Export Results</button>
        <button onclick="location.reload()" class="util-btn">Reset</button>
    `;
    document.querySelector('.header').appendChild(utilityButtons);
});

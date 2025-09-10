# PhD Machine Learning - 100 Practice Questions

A comprehensive set of 100 multiple choice questions designed for PhD Machine Learning admission screening exams.

## 📚 Topics Covered

- **Linear Algebra (Q1-25)**: Matrix operations, eigenvalues, SVD, decompositions
- **Calculus & Optimization (Q26-45)**: Gradients, Hessians, optimization methods
- **Probability Theory (Q46-65)**: Distributions, Bayes' theorem, random variables
- **Statistics & Inference (Q66-80)**: MLE, hypothesis testing, confidence intervals
- **Machine Learning Fundamentals (Q81-100)**: Bias-variance, algorithms, evaluation

## 🚀 Features

- **Interactive Interface**: Click-to-select answers with visual feedback
- **Progress Tracking**: Monitor your completion status
- **Keyboard Navigation**: Use 1-4 keys for quick answer selection
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Export Results**: Save your answers in JSON format
- **Print Support**: Generate PDF for offline study

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ml-phd-exam-questions.git
cd ml-phd-exam-questions
```

2. Open `index.html` in your web browser or serve with a local server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

## 📁 File Structure

```
ml-phd-exam-questions/
├── index.html          # Main HTML structure
├── styles.css          # CSS styling and responsive design
├── script.js           # JavaScript functionality
├── questions.json      # Question data in JSON format
└── README.md          # This file
```

## 🎯 Usage

### Basic Navigation
- Scroll through sections or use the navigation panel on the right
- Click on any option (A, B, C, D) to select your answer
- Selected answers are highlighted in blue

### Keyboard Shortcuts
- Press `1`, `2`, `3`, `4` to select options A, B, C, D
- Use `↑` and `↓` arrow keys to navigate between sections
- Press `Ctrl+P` to print the questions

### Utility Features
- **Reset**: Reload the page to clear all answers
- **Export**: Download your answers as a JSON file
- **Print**: Generate a printer-friendly version

## 📊 Question Distribution

| Section | Questions | Focus Areas |
|---------|-----------|-------------|
| Linear Algebra | 25 | Matrix theory, eigenvalues, decompositions |
| Calculus | 20 | Optimization, derivatives, gradients |
| Probability | 20 | Distributions, Bayes, random variables |
| Statistics | 15 | Inference, testing, estimation |
| ML Fundamentals | 20 | Algorithms, evaluation, theory |

## 🎨 Customization

### Modifying Questions
Edit `questions.json` to add/modify questions:
```json
{
  "id": 101,
  "text": "Your question here?",
  "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
  "correct": "A",
  "explanation": "Explanation of the correct answer"
}
```

### Styling
Modify `styles.css` to change:
- Color schemes (section headers use CSS gradients)
- Typography and spacing
- Responsive breakpoints
- Animation effects

### Functionality
Extend `script.js` to add:
- Timer functionality
- Score calculation
- Answer submission
- Additional keyboard shortcuts

## 🧪 Testing Your Knowledge

### Difficulty Levels
- **Beginner**: Focus on definitions and basic concepts
- **Intermediate**: Application of theorems and formulas
- **Advanced**: Complex problem-solving and proofs

### Study Tips
1. **Review fundamentals** in each section before attempting
2. **Time yourself** - aim for 1-2 minutes per question
3. **Understand explanations** rather than memorizing answers
4. **Identify weak areas** using the progress tracking
5. **Practice regularly** - mathematics requires consistent practice

## 📝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b add-new-questions`
3. Add your questions following the existing format
4. Test thoroughly on different devices
5. Submit a pull request with detailed description

### Question Guidelines
- Ensure mathematical accuracy
- Provide clear, detailed explanations
- Follow the existing difficulty progression
- Include relevant formulas and theorems
- Test on multiple browsers



## 🙏 Acknowledgments

- Questions inspired by standard PhD admission exams
- Mathematical notation uses Unicode and HTML entities
- Responsive design follows modern web standards
- Color scheme optimized for accessibility

## 📞 Support

If you encounter any issues or have suggestions:
- Open an issue on GitHub
- Check browser compatibility (Chrome, Firefox, Safari, Edge)
- Ensure JavaScript is enabled
- Try refreshing the page or clearing browser cache

## 🔗 Related Resources

- [Khan Academy Linear Algebra](https://www.khanacademy.org/math/linear-algebra)
- [MIT OpenCourseWare Machine Learning](https://ocw.mit.edu/)
- [Stanford CS229 Machine Learning](http://cs229.stanford.edu/)
- [The Elements of Statistical Learning](https://web.stanford.edu/~hastie/ElemStatLearn/)

---

**Good luck with your PhD applications! 🎓**

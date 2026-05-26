let gameState = {
    digits: 0,
    num1: 0,
    num2: 0,
    score: 0,
    gameActive: false,
    userName: '',
    operation: '' // 'addition' or 'subtraction'
};

// Select operation (addition or subtraction)
function selectOperation(operation) {
    gameState.operation = operation;

    // Update subtitle
    const subtitle = operation === 'addition' ? 'Addition Quest' : 'Subtraction Quest';
    document.getElementById('subtitleText').textContent = subtitle;

    // Show difficulty options
    document.getElementById('difficultyLabel').style.display = 'block';
    document.getElementById('digitOptions').style.display = 'flex';

    // Highlight selected operation button
    const buttons = document.querySelectorAll('.operation-btn');
    buttons.forEach(btn => btn.style.opacity = '0.5');
    event.target.closest('.operation-btn').style.opacity = '1';
}

// Setup the game
function setupGame(digits, name = '') {
    // Validate that name is provided
    if (!name || name.trim() === '') {
        alert('Please enter your name to start!');
        document.getElementById('userName').focus();
        return;
    }

    // Validate that operation is selected
    if (!gameState.operation) {
        alert('Please select an operation first!');
        return;
    }

    gameState.digits = digits;
    gameState.score = 0;
    gameState.gameActive = true;
    gameState.userName = name.trim();

    // Hide setup section, show game section
    document.getElementById('setupSection').classList.add('hidden');
    document.getElementById('gameSection').classList.remove('hidden');

    // Generate first problem
    generateProblem();

    // Focus on input
    document.getElementById('answerInput').focus();
}

// Generate a new problem (addition or subtraction)
function generateProblem() {
    const maxNum = Math.pow(10, gameState.digits) - 1;
    const minNum = gameState.digits === 1 ? 0 : Math.pow(10, gameState.digits - 1);

    if (gameState.operation === 'addition') {
        gameState.num1 = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
        gameState.num2 = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
    } else {
        // For subtraction, ensure num1 >= num2 to avoid negative results
        gameState.num1 = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
        gameState.num2 = Math.floor(Math.random() * (gameState.num1 + 1));
    }

    // Update display
    document.getElementById('num1').textContent = gameState.num1;
    document.getElementById('num2').textContent = gameState.num2;

    // Update operator
    const operator = gameState.operation === 'addition' ? '+' : '−';
    document.querySelector('.operator').textContent = operator;

    // Clear input and feedback
    document.getElementById('answerInput').value = '';
    document.getElementById('feedback').classList.add('hidden');
    document.getElementById('celebrationModal').classList.add('hidden');
    document.getElementById('incorrectModal').classList.add('hidden');

    // Re-animate numbers
    const num1Elem = document.getElementById('num1');
    const num2Elem = document.getElementById('num2');
    num1Elem.style.animation = 'none';
    num2Elem.style.animation = 'none';
    setTimeout(() => {
        num1Elem.style.animation = '';
        num2Elem.style.animation = '';
    }, 10);

    // Focus on input
    document.getElementById('answerInput').focus();
}

// Check the answer
function checkAnswer() {
    const userAnswer = parseInt(document.getElementById('answerInput').value);
    const correctAnswer = gameState.operation === 'addition'
        ? gameState.num1 + gameState.num2
        : gameState.num1 - gameState.num2;
    const feedbackElem = document.getElementById('feedback');

    if (isNaN(userAnswer)) {
        feedbackElem.textContent = '⚠️ Please enter a number!';
        feedbackElem.className = 'feedback incorrect';
        feedbackElem.classList.remove('hidden');
        return;
    }

    if (userAnswer === correctAnswer) {
        // Correct answer!
        gameState.score++;
        document.getElementById('scoreValue').textContent = gameState.score;

        feedbackElem.textContent = '✅ Correct! Amazing!';
        feedbackElem.className = 'feedback correct';
        feedbackElem.classList.remove('hidden');

        // Show celebration
        showCelebration();

        // Trigger confetti
        createConfetti();
    } else {
        // Wrong answer - show incorrect modal
        showIncorrectAnswer();
    }
}

// Show celebration modal
function showCelebration() {
    const modal = document.getElementById('celebrationModal');
    modal.classList.remove('hidden');

    // Random celebration messages with user's name
    const messages = [
        `🌟 ${gameState.userName}, you got it right!`,
        `🎯 Perfect answer, ${gameState.userName}!`,
        `🚀 ${gameState.userName}, keep up the great work!`,
        `💪 ${gameState.userName}, you're amazing!`,
        `🏆 Excellent job, ${gameState.userName}!`,
        `👏 Way to go, ${gameState.userName}!`,
        `💡 ${gameState.userName}, you're a math star!`,
        `🎊 Fantastic, ${gameState.userName}!`
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    document.querySelector('.celebration-message').textContent = randomMessage;
}

// Create confetti effect
function createConfetti() {
    const container = document.getElementById('confetti-container');
    const confettiCount = 50;

    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#FFD700', '#FF69B4'];

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');

        const color = colors[Math.floor(Math.random() * colors.length)];
        const left = Math.random() * 100;
        const delay = Math.random() * 0.2;
        const duration = 2 + Math.random() * 1;

        confetti.style.left = left + '%';
        confetti.style.backgroundColor = color;
        confetti.style.animation = `confettiFall ${duration}s ease-in forwards`;
        confetti.style.animationDelay = delay + 's';

        container.appendChild(confetti);

        // Remove confetti after animation
        setTimeout(() => {
            confetti.remove();
        }, (duration + delay) * 1000);
    }
}

// Handle Enter key press
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        checkAnswer();
    }
}

// Show incorrect answer modal
function showIncorrectAnswer() {
    const modal = document.getElementById('incorrectModal');
    document.getElementById('incorrectUserName').textContent = gameState.userName;
    document.getElementById('correctAnswerDisplay').classList.add('hidden');
    document.getElementById('correctAnswerDisplay').textContent = '';
    document.querySelector('.show-answer-btn').style.display = 'block';
    modal.classList.remove('hidden');
}

// Retry the problem
function retryProblem() {
    document.getElementById('incorrectModal').classList.add('hidden');
    document.getElementById('answerInput').value = '';
    document.getElementById('answerInput').focus();
}

// Show the correct answer
function showCorrectAnswer() {
    const correctAnswer = gameState.operation === 'addition'
        ? gameState.num1 + gameState.num2
        : gameState.num1 - gameState.num2;
    const operator = gameState.operation === 'addition' ? '+' : '−';
    const answerDisplay = document.getElementById('correctAnswerDisplay');
    answerDisplay.textContent = `The answer is: ${gameState.num1} ${operator} ${gameState.num2} = ${correctAnswer}`;
    answerDisplay.classList.remove('hidden');
    document.querySelector('.show-answer-btn').style.display = 'none';
}

// Reset game
// Reset game
function resetGame() {
    // Show setup section, hide game section
    document.getElementById('setupSection').classList.remove('hidden');
    document.getElementById('gameSection').classList.add('hidden');
    document.getElementById('celebrationModal').classList.add('hidden');
    document.getElementById('incorrectModal').classList.add('hidden');

    // Clear name input
    document.getElementById('userName').value = '';

    // Hide difficulty options
    document.getElementById('difficultyLabel').style.display = 'none';
    document.getElementById('digitOptions').style.display = 'none';

    // Reset operation button visibility
    const buttons = document.querySelectorAll('.operation-btn');
    buttons.forEach(btn => btn.style.opacity = '1');

    // Reset subtitle
    document.getElementById('subtitleText').textContent = 'Math Quest';

    // Reset game state
    gameState = {
        digits: 0,
        num1: 0,
        num2: 0,
        score: 0,
        gameActive: false,
        userName: '',
        operation: ''
    };

    document.getElementById('userName').focus();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('answerInput').addEventListener('focus', function () {
        this.select();
    });
});

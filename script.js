let gameState = {
    digits: 0,
    num1: 0,
    num2: 0,
    score: 0,
    gameActive: false,
    userName: '',
    operation: '' // 'addition' or 'subtraction'
};

// Sound effects using Web Audio API
function playSound(type) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        if (type === 'correct') {
            // Clap/celebration sound - three ascending tones
            playCorrectSound(audioContext);
        } else if (type === 'incorrect') {
            // Buzzer/wrong sound
            playIncorrectSound(audioContext);
        }
    } catch (e) {
        console.log('Audio context not available');
    }
}

function playCorrectSound(audioContext) {
    const now = audioContext.currentTime;
    const tempo = 0.1;

    // Create three cheerful tones
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 (C major chord)

    frequencies.forEach((freq, index) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.frequency.value = freq;
        osc.type = 'sine';

        const startTime = now + (index * tempo);
        const endTime = startTime + (tempo * 1.5);

        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, endTime);

        osc.start(startTime);
        osc.stop(endTime);
    });
}

function playIncorrectSound(audioContext) {
    const now = audioContext.currentTime;

    // Create buzzer sound - two low tones
    const frequencies = [200, 150];

    frequencies.forEach((freq, index) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.frequency.value = freq;
        osc.type = 'square';

        const startTime = now + (index * 0.15);
        const endTime = startTime + 0.15;

        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, endTime);

        osc.start(startTime);
        osc.stop(endTime);
    });
}

// Text-to-Speech functionality
const synth = window.speechSynthesis;
let isSpeaking = false;

// Speak the problem aloud
function speakProblem() {
    // Cancel any ongoing speech
    if (synth.speaking) {
        synth.cancel();
        isSpeaking = false;
        return;
    }

    const num1 = gameState.num1;
    const num2 = gameState.num2;
    const operationWord = gameState.operation === 'addition' ? 'plus' : 'minus';

    const text = `${num1} ${operationWord} ${num2}`;

    const utterance = new SpeechSynthesisUtterance(text);

    // Get volume from slider
    const volume = document.getElementById('volumeSlider').value / 100;
    utterance.volume = volume;

    // Speech properties
    utterance.rate = 0.9; // Slower speech for clarity
    utterance.pitch = 1;
    utterance.lang = 'en-US';

    // Update button visual feedback
    utterance.onstart = () => {
        isSpeaking = true;
        const speakBtn = document.querySelector('.speak-btn');
        speakBtn.style.background = 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)';
    };

    utterance.onend = () => {
        isSpeaking = false;
        const speakBtn = document.querySelector('.speak-btn');
        speakBtn.style.background = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
    };

    utterance.onerror = () => {
        isSpeaking = false;
    };

    synth.speak(utterance);
}

// Update volume when slider changes
document.addEventListener('DOMContentLoaded', () => {
    const volumeSlider = document.getElementById('volumeSlider');
    if (volumeSlider) {
        volumeSlider.addEventListener('change', (e) => {
            // Update volume for current or next speech
            if (synth.speaking) {
                // Cancel current speech so next one uses new volume
                synth.cancel();
                isSpeaking = false;
            }
        });
    }
});

// Select player
function selectPlayer(playerName) {
    gameState.userName = playerName;

    // Highlight selected player button
    const buttons = document.querySelectorAll('.player-btn');
    buttons.forEach(btn => {
        if (btn.textContent.includes(playerName)) {
            btn.style.opacity = '1';
            btn.style.transform = 'scale(1.1)';
        } else {
            btn.style.opacity = '0.5';
        }
    });
}

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
function setupGame(digits) {
    // Validate that player is selected
    if (!gameState.userName) {
        alert('Please select a player first!');
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

    // Update visual representation if enabled
    updateVisualRepresentation();
}

// Toggle visual representation
function toggleVisualRepresentation() {
    const visualTile = document.getElementById('visualTile');
    const isChecked = document.getElementById('visualToggle').checked;

    if (isChecked && gameState.digits === 1 && gameState.operation === 'addition') {
        visualTile.classList.remove('hidden');
        updateVisualRepresentation();
    } else {
        visualTile.classList.add('hidden');
    }
}

// Update visual representation with lines
function updateVisualRepresentation() {
    const visualTile = document.getElementById('visualTile');
    const isChecked = document.getElementById('visualToggle').checked;

    // Only show for 1-digit addition
    if (!isChecked || gameState.digits !== 1 || gameState.operation !== 'addition') {
        visualTile.classList.add('hidden');
        return;
    }

    visualTile.classList.remove('hidden');

    const lineSize = document.getElementById('lineSizeSlider').value;
    const linesDisplay = document.getElementById('linesDisplay');
    linesDisplay.innerHTML = '';

    // Create lines for first number
    const group1 = document.createElement('div');
    group1.className = 'line-group group-1';

    for (let i = 0; i < gameState.num1; i++) {
        const line = document.createElement('div');
        line.className = 'vertical-line';
        line.style.width = '3px';
        line.style.height = lineSize + 'px';
        group1.appendChild(line);
    }

    const label1 = document.createElement('div');
    label1.className = 'line-group-label';
    label1.textContent = gameState.num1;
    group1.appendChild(label1);

    // Create lines for second number
    const group2 = document.createElement('div');
    group2.className = 'line-group group-2';

    for (let i = 0; i < gameState.num2; i++) {
        const line = document.createElement('div');
        line.className = 'vertical-line';
        line.style.width = '3px';
        line.style.height = lineSize + 'px';
        group2.appendChild(line);
    }

    const label2 = document.createElement('div');
    label2.className = 'line-group-label';
    label2.textContent = gameState.num2;
    group2.appendChild(label2);

    linesDisplay.appendChild(group1);
    linesDisplay.appendChild(group2);
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

        // Play correct sound
        playSound('correct');

        // Show celebration
        showCelebration();

        // Trigger confetti
        createConfetti();
    } else {
        // Wrong answer - show incorrect modal
        playSound('incorrect');
        showIncorrectAnswer();
    }
}

// Show celebration modal
function showCelebration() {
    const modal = document.getElementById('celebrationModal');
    modal.classList.remove('hidden');

    // Set player image
    const playerImage = document.getElementById('celebrationPlayerImage');
    const imagePath = gameState.userName === 'NILAN'
        ? './Picture/Nilan.jpeg'
        : './Picture/Mithula.jpeg';
    playerImage.src = imagePath;

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

    // Set player image
    const playerImage = document.getElementById('incorrectPlayerImage');
    const imagePath = gameState.userName === 'NILAN'
        ? './Picture/Nilan.jpeg'
        : './Picture/Mithula.jpeg';
    playerImage.src = imagePath;

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

    // Reset player button visibility
    const playerButtons = document.querySelectorAll('.player-btn');
    playerButtons.forEach(btn => {
        btn.style.opacity = '1';
        btn.style.transform = 'scale(1)';
    });

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
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('answerInput').addEventListener('focus', function () {
        this.select();
    });
});

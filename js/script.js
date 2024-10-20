const quizApp = (() => {
    const state = {
        currentQuestionIndex: 0,
        score: 0,
        timer: 120, // 2 minutes
        draftedQuestions: [],
        draftScores: [],
        currentQuestion: null,
        timeOver: false,
        quizQuestions: [],
    };

    let timerInterval; // Declare timerInterval outside the function for global access within the module

    // Fetch questions from external JSON file
    const fetchQuestions = async (type) => {
        try {
            const response = await fetch('./json/questions.json');
            const data = await response.json();

            // Filter questions based on the type (easy, intermediate, difficult)

            //##########<< Chemistry >>###########
            if (type === 'easyQuestionsChemistry') {
                state.quizQuestions = shuffleQuestions(data.easyQuestionsChemistry);
            } else if (type === 'intermediateQuestionsChemistry') {
                state.quizQuestions = shuffleQuestions(data.intermediateQuestionsChemistry);
            } else if (type === 'difficultQuestionsChemistry') {
                state.quizQuestions = shuffleQuestions(data.difficultQuestionsChemistry);

            //##########<< Physics >>###########
            } else if (type === 'easyQuestionsPhysics') {
                state.quizQuestions = shuffleQuestions(data.easyQuestionsPhysics);
            } else if (type === 'intermediateQuestionsPhysics') {
                state.quizQuestions = shuffleQuestions(data.intermediateQuestionsPhysics);
            } else if (type === 'difficultQuestionsPhysics') {
                state.quizQuestions = shuffleQuestions(data.difficultQuestionsPhysics);

            //##########<< Math >>###########
            } else if (type === 'easyQuestionsMath') {
                state.quizQuestions = shuffleQuestions(data.easyQuestionsMath);
            } else if (type === 'intermediateQuestionsMath') {
                state.quizQuestions = shuffleQuestions(data.intermediateQuestionsMath);
            } else if (type === 'difficultQuestionsMath') {
                state.quizQuestions = shuffleQuestions(data.difficultQuestionsMath);
            }

            startQuiz();
        } catch (error) {
            console.error("Failed to load questions:", error);
        }
    };

    const shuffleQuestions = (questions) => questions.sort(() => Math.random() - 0.5);

    const startQuiz = () => {
        state.currentQuestionIndex = 0;
        state.score = 0;
        state.timer = 120;
        state.draftedQuestions = [];
        state.draftScores = [];
        state.timeOver = false;
        displayNextQuestion();
        startTimer();
    };

    const startTimer = () => {
        // Clear any existing timer
        if (timerInterval) {
            clearInterval(timerInterval);
        }

        timerInterval = setInterval(() => {
            if (state.timer <= 0) {
                clearInterval(timerInterval);
                endQuiz("Time is Over");
                return;
            }
            if (state.timeOver) {
                clearInterval(timerInterval);
                return; // Added return here for clarity
            }
            state.timer -= 1;  // Decrement the timer by 1
            document.getElementById('time').innerText = state.timer; // Update the displayed time
        }, 1000);  // 1000 milliseconds interval
    };

    const displayNextQuestion = () => {
        const questionContainer = document.getElementById('question-container');
        const questionData = state.quizQuestions[state.currentQuestionIndex];
        state.currentQuestion = questionData;

        questionContainer.innerHTML = `
            <p>Question ${state.currentQuestionIndex + 1}: ${questionData.question}</p>
            <ul style="list-style-type: none;">
                ${questionData.options.map((option, index) => `<li><label><input type="radio" name="answer" value="${index}"> ${option}</label></li>`).join('')}
            </ul>
        `;
    };

    const submitAnswer = () => {
        const selectedAnswer = document.querySelector('input[name="answer"]:checked');
        
        if (!selectedAnswer) {
            alert("Please select an answer before submitting.");
            return; // Stop further execution if no answer is selected
        }

        const questionData = state.currentQuestion;
        const isCorrect = parseInt(selectedAnswer.value) === questionData.answer;
        const points = 1; // Now all questions are easy, assign 1 point

        if (isCorrect) {
            state.score += points;
        }

        // Move to the next question if an answer was selected
        nextQuestion();
    };

    const draftAnswer = () => {
        // Add the current question to draftedQuestions if not already drafted
        if (!state.draftedQuestions.includes(state.currentQuestion)) {
            state.draftedQuestions.push(state.currentQuestion);
        }
        nextQuestion();
    };

    const nextQuestion = () => {
        if (state.currentQuestionIndex + 1 < state.quizQuestions.length) {
            state.currentQuestionIndex += 1;
            displayNextQuestion();
        } else {
            endQuiz();
        }
    };

    const endQuiz = (message = null) => {
        state.timeOver = true; // Stop the timer
        clearInterval(timerInterval); // Clear the timer interval
        const resultContainer = document.getElementById('result-container');
        const resultText = document.getElementById('result-text');
        const quizContainer = document.getElementById('quiz-container');
        quizContainer.classList.add('hidden');

        if (message) {
            resultText.innerText = message;
        } else {
            const finalScore = state.score;
            if (finalScore <= 7) {
                resultText.innerText = `Bad. Your score is ${finalScore}`;
            } else if (finalScore <= 14) {
                resultText.innerText = `Fair. Your score is ${finalScore}`;
            } else {
                resultText.innerText = `Good. Your score is ${finalScore}`;
            }
        }

        resultContainer.classList.remove('hidden');
    };

    const viewDraftedQuestions = () => {
        if (state.draftedQuestions.length === 0) {
            alert("No drafted questions to answer.");
            return;
        }

        const draftContainer = document.getElementById('draft-container');
        const draftQuestionsContainer = document.getElementById('draft-questions-container');
        const resultContainer = document.getElementById('result-container');
        resultContainer.classList.add('hidden');

        draftQuestionsContainer.innerHTML = state.draftedQuestions.map((question, index) => `
            <div class="draft-question">
                <p>Drafted Question ${index + 1}: ${question.question}</p>
                <ul>
                    ${question.options.map((option, optIndex) => `<li><label><input type="radio" name="draft-answer-${index}" value="${optIndex}"> ${option}</label></li>`).join('')}
                </ul>
            </div>
        `).join('');

        // Change buttons to submit drafts
        draftQuestionsContainer.innerHTML += `<button id="submit-drafts">Submit Drafts</button>`;

        draftContainer.classList.remove('hidden');

        // Attach event listener for submitting drafts
        document.getElementById('submit-drafts').addEventListener('click', submitDrafts);
    };

    const submitDrafts = () => {
        const draftQuestionsContainer = document.getElementById('draft-questions-container');
        const draftAnswers = draftQuestionsContainer.querySelectorAll('.draft-question');

        draftAnswers.forEach((draftQuestion, index) => {
            const selected = draftQuestion.querySelector(`input[name="draft-answer-${index}"]:checked`);
            if (selected) {
                const answer = parseInt(selected.value);
                const question = state.draftedQuestions[index];
                const isCorrect = answer === question.answer;
                const points = question.level === 'easy' ? 1 : 3;
                if (isCorrect) {
                    state.score += points;
                }
            }
        });

        const draftContainer = document.getElementById('draft-container');
        draftContainer.classList.add('hidden');

        // Clear drafted questions after submission
        state.draftedQuestions = [];

        // Show final results
        endQuiz();
    };

    const attachEventListeners = () => {
        document.getElementById('submit-answer').addEventListener('click', submitAnswer);
        document.getElementById('draft-answer').addEventListener('click', draftAnswer);
        document.getElementById('view-drafts').addEventListener('click', viewDraftedQuestions);
        document.getElementById('finish-drafts').addEventListener('click', () => {
            // Optional: Handle if needed
            // Currently, drafts are handled via 'Submit Drafts' button
        });
    };

    return {
        init: (type) => {
            attachEventListeners();
            fetchQuestions(type);  // Pass either 'easy' or 'hard' to load corresponding questions
        }
    };
})();

// after completing questions  [button [try again with random question] - end the app[login app again]]
function tryAgain() {
    window.location.href = `index.html`;
}

window.onload = quizApp.init;

"use strict";

/* =========================================================
   1) إعدادات اللعبة — الأسئلة والنتيجة والهدية
   ========================================================= */

// اللعبة 12 سؤال، والهدية تتفتح بعد 10 إجابات صحيحة.
const TOTAL_QUESTIONS = 12;
const PASS_SCORE = 10;

/*
  كل سؤال يحتوي على:
  - question: نص السؤال.
  - emoji: شكل صغير يظهر بجانب السؤال.
  - choices: الاختيارات كما هي، سواء كانت اختيارين أو ثلاثة.
  - correctAnswer: نص الإجابة الصحيحة الموجود داخل choices.

  الاختيارات تُخلط أثناء اللعب من غير تغيير كلامها أو إضافة اختيارات جديدة.
*/
const questions = [
  {
    id: 1,
    question: "مشروبك المفضل ايه؟",
    emoji: "🧋",
    choices: ["قهوة", "ايس كوفي", "كولا"],
    correctAnswer: "ايس كوفي"
  },
  {
    id: 2,
    question: "اكتر مغنى بتحبيه؟",
    emoji: "🎤",
    choices: ["عمر دياب", "اليسا", "فيروز"],
    correctAnswer: "فيروز"
  },
  {
    id: 3,
    question: "اكتر فاكهة بتحبيها من دول؟",
    emoji: "🍉",
    choices: ["عنب", "بطيخ", "بلح"],
    correctAnswer: "بطيخ"
  },
  {
    id: 4,
    question: "اكتر أكلة بتحبيها؟",
    emoji: "🍽️",
    choices: ["شاورما", "طواجن", "كفته"],
    correctAnswer: "شاورما"
  },
  {
    id: 5,
    question: "اكتر شوكولاته بتحبي تاكليها؟",
    emoji: "🍫",
    choices: ["الدارك", "بالبندق", "كوكو نات"],
    correctAnswer: "كوكو نات"
  },
  {
    id: 6,
    question: "بتحبي تشتري ايه اكتر؟",
    emoji: "🛍️",
    choices: ["برفيوم", "هدوم", "ميكب"],
    correctAnswer: "برفيوم"
  },
  {
    id: 7,
    question: "بتحبى تاكلى ايه اكتر فى الفرخه؟",
    emoji: "🍗",
    choices: ["الصدر", "الورك"],
    correctAnswer: "الصدر"
  },
  {
    id: 8,
    question: "بتفضلى أنهى استيل شعر؟",
    emoji: "💇‍♀️",
    choices: ["استريت", "كيرلى"],
    correctAnswer: "كيرلى"
  },
  {
    id: 9,
    question: "تحبي تعملي ايه لو عندك وقت فراغ؟",
    emoji: "🎨",
    choices: ["رسم و تلوين", "تشوفي فيلم", "تخرجي"],
    correctAnswer: "رسم و تلوين"
  },
  {
    id: 10,
    question: "الاكل تحبيه؟",
    emoji: "🥗",
    choices: [ "سمنة بلدي","هيلثي"],
    correctAnswer: "هيلثي"
  },
  {
    id: 11,
    question: "لما بتدخلي سوبر ماركت اول حاجه بتدوري عليها؟",
    emoji: "🛒",
    choices: ["سيڤن", "عصاير", "فيروز"],
    correctAnswer: "فيروز"
  },
  {
    id: 12,
    question: "تحبي الصور تكون؟",
    emoji: "📸",
    choices: ["عشوائية و تلقائية", "مرتبة و مهندمة", "مبحبش الصور أصلا"],
    correctAnswer: "عشوائية و تلقائية"
  }
];

// غيّر مكان الهدية أو رسالة الكشف من هنا فقط.
const GIFT_CONFIG = {
  locationMessage: " كسبتى اطلعى برا خدى الجائزه 🎁✨",
  revealMessage: "المفاجأة لسه مستخبية، والباقي هتعرفيه لما توصلي للعربية 😂🎁"
};

// ردود خفيفة ومتنوعة بعد الإجابات الصحيحة وغير الصحيحة.
const REACTION_MESSAGES = {
  correct: [
    "برافو! كملى  👏✨",
    "تمام! كملى  👏✨",
    "صح! كملى  👏✨",
   
  ],
  wrong: [
    "لا مش دي 😂 ركّزي في السؤال اللي بعده",
    " ركزى فى الجى",
    "مش مشكلة! السؤال الجاي ممكن يكون نصيبك ✨"
  ]
};

/* =========================================================
   2) عناصر الصفحة والحالة المتغيرة أثناء اللعب
   ========================================================= */

const $ = (id) => document.getElementById(id);

const screens = document.querySelectorAll(".screen");
const floatingLayer = $("floating-layer");
const effectsLayer = $("effects-layer");
const answerForm = $("answer-form");
const choicesContainer = $("choices-container");
const confirmAnswerButton = $("confirm-answer");
const nextQuestionButton = $("next-question");
const giftButton = $("gift-button");
const revealGiftButton = $("reveal-gift");
const giftSecret = $("gift-secret");

// النتيجة تتغير حسب الإجابات الفعلية فقط، ولا توجد نتيجة ثابتة.
const state = {
  currentQuestionIndex: 0,
  score: 0,
  selectedAnswer: null,
  isAnswerLocked: false,
  answers: [],
  quizFinished: false,
  giftUnlocked: false
};

/* =========================================================
   3) أدوات عامة للعرض والحركة
   ========================================================= */

function showScreen(screenId) {
  screens.forEach((screen) => {
    const isActive = screen.id === screenId;
    screen.hidden = !isActive;
    screen.classList.toggle("is-active", isActive);
  });

  // الرجوع لأعلى الصفحة مهم خصوصًا على شاشة الموبايل.
  window.scrollTo(0, 0);
}

function shuffle(items) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function createFloatingBackground() {
  const symbols = ["✦", "✧", "★", "✦", "·", "✧", "★", "✦", "✧", "·", "★", "✦"];
  const colors = ["#ff9dbd", "#c6b0ff", "#ff7faa", "#e6d7ff"];

  symbols.forEach((symbol, index) => {
    const item = document.createElement("span");
    const isSparkle = symbol !== "·";

    item.className = `float-item${isSparkle ? " sparkle" : ""}`;
    item.textContent = symbol;
    item.style.setProperty("--left", `${4 + ((index * 17) % 92)}%`);
    item.style.setProperty("--size", `${isSparkle ? 12 + (index % 3) * 5 : 18}px`);
    item.style.setProperty("--duration", `${15 + (index % 5) * 3}s`);
    item.style.setProperty("--delay", `${-(index * 2.7)}s`);
    item.style.setProperty("--drift", `${index % 2 === 0 ? "" : "-"}${20 + (index % 4) * 14}px`);
    item.style.setProperty("--item-color", colors[index % colors.length]);
    floatingLayer.appendChild(item);
  });
}

function launchCelebration(amount = 28) {
  const colors = ["#ff6f9f", "#ffb1ca", "#a78bfa", "#fff0f7", "#d9c8ff"];

  for (let index = 0; index < amount; index += 1) {
    const piece = document.createElement("span");
    const isStar = index % 5 === 0;

    piece.className = isStar ? "heart-piece" : "confetti-piece";
    piece.style.setProperty("--left", `${Math.random() * 100}%`);
    piece.style.setProperty("--color", randomItem(colors));
    piece.style.setProperty("--fall-duration", `${1.8 + Math.random() * 1.3}s`);
    piece.style.setProperty("--fall-delay", `${Math.random() * 0.25}s`);
    piece.style.setProperty("--drift", `${-110 + Math.random() * 220}px`);

    if (isStar) {
      piece.textContent = "★";
      piece.style.setProperty("--size", `${11 + Math.random() * 13}px`);
    } else {
      piece.style.setProperty("--width", `${5 + Math.random() * 6}px`);
      piece.style.setProperty("--height", `${8 + Math.random() * 9}px`);
      piece.style.setProperty("--radius", index % 2 === 0 ? "50%" : "2px");
      piece.style.setProperty("--rotation", `${360 + Math.random() * 720}deg`);
    }

    effectsLayer.appendChild(piece);
    window.setTimeout(() => piece.remove(), 3600);
  }
}

function resetGiftView() {
  giftSecret.hidden = true;
  revealGiftButton.hidden = false;
  revealGiftButton.disabled = false;
}

function resetState() {
  state.currentQuestionIndex = 0;
  state.score = 0;
  state.selectedAnswer = null;
  state.isAnswerLocked = false;
  state.answers = [];
  state.quizFinished = false;
  state.giftUnlocked = false;
  effectsLayer.innerHTML = "";
  resetGiftView();
}

/* =========================================================
   4) بدء اللعبة ورسم السؤال الحالي
   ========================================================= */

function isQuizDataValid() {
  return questions.length === TOTAL_QUESTIONS && questions.every((question) => {
    const hasValidChoices = Array.isArray(question.choices)
      && (question.choices.length === 2 || question.choices.length === 3)
      && new Set(question.choices).size === question.choices.length;

    return hasValidChoices && question.choices.includes(question.correctAnswer);
  });
}

function startQuiz() {
  resetState();

  if (!isQuizDataValid()) {
    showIncompleteScreen();
    return;
  }

  showScreen("quiz-screen");
  renderQuestion();
}

function goHome() {
  resetState();
  showScreen("welcome-screen");
}

function renderQuestion() {
  if (state.currentQuestionIndex >= TOTAL_QUESTIONS) {
    finishQuiz();
    return;
  }

  if (state.currentQuestionIndex >= questions.length) {
    showIncompleteScreen();
    return;
  }

  const currentQuestion = questions[state.currentQuestionIndex];
  const questionNumber = state.currentQuestionIndex + 1;
  const progress = Math.round((questionNumber / TOTAL_QUESTIONS) * 100);

  state.selectedAnswer = null;
  state.isAnswerLocked = false;

  $("question-counter").textContent = `السؤال ${questionNumber} من ${TOTAL_QUESTIONS}`;
  $("progress-percent").textContent = `${progress}%`;
  $("progress-bar").style.width = `${progress}%`;
  $("progress-track").setAttribute("aria-valuenow", questionNumber);
  $("live-score").textContent = state.score;
  $("question-emoji").textContent = currentQuestion.emoji || "💭";
  $("question-title").textContent = currentQuestion.question;
  $("selection-hint").textContent = "خدي وقتك واختاري براحتك ✨";
  confirmAnswerButton.disabled = true;
  confirmAnswerButton.textContent = "تأكيد الإجابة ✔️";
  choicesContainer.innerHTML = "";

  // نسخ الاختيارات قبل خلطها حتى تبقى البيانات الأصلية كما هي.
  const mixedChoices = shuffle(currentQuestion.choices);
  const choiceLetters = ["أ", "ب", "ج"];

  mixedChoices.forEach((choice, index) => {
    const label = document.createElement("label");
    label.className = "choice-card";

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "answer";
    radio.value = choice;
    radio.setAttribute("aria-label", choice);

    const choiceIndex = document.createElement("span");
    choiceIndex.className = "choice-index";
    choiceIndex.textContent = choiceLetters[index];

    const choiceText = document.createElement("span");
    choiceText.className = "choice-text";
    choiceText.textContent = choice;

    const choiceMark = document.createElement("span");
    choiceMark.className = "choice-mark";
    choiceMark.setAttribute("aria-hidden", "true");
    choiceMark.textContent = "✓";

    radio.addEventListener("change", () => {
      if (state.isAnswerLocked) return;

      state.selectedAnswer = choice;
      document.querySelectorAll(".choice-card").forEach((card) => card.classList.remove("selected"));
      label.classList.add("selected");
      confirmAnswerButton.disabled = false;
      $("selection-hint").textContent = "تمام! دوسي تأكيد الإجابة 😄";
    });

    label.append(radio, choiceIndex, choiceText, choiceMark);
    choicesContainer.appendChild(label);
  });
}

/* =========================================================
   5) التحقق من الإجابة ورد الفعل
   ========================================================= */

function confirmAnswer() {
  // لا إرسال بدون اختيار، ولا إرسال مرتين أثناء رد الفعل.
  if (state.isAnswerLocked || !state.selectedAnswer) return;

  const currentQuestion = questions[state.currentQuestionIndex];
  if (!currentQuestion) return;

  state.isAnswerLocked = true;
  confirmAnswerButton.disabled = true;
  document.querySelectorAll(".choice-card").forEach((card) => {
    card.classList.add("locked");
    const radio = card.querySelector("input");
    if (radio) radio.disabled = true;
  });

  // المقارنة تتم بالنص المخزن في correctAnswer، وليس بترتيب الاختيار.
  const isCorrect = state.selectedAnswer === currentQuestion.correctAnswer;

  if (isCorrect) {
    state.score += 1;
  }

  state.answers.push({
    questionId: currentQuestion.id,
    selectedAnswer: state.selectedAnswer,
    isCorrect
  });

  $("live-score").textContent = state.score;
  showReaction(isCorrect);
}

function showReaction(isCorrect) {
  const reactionArt = $("reaction-art");
  const messages = isCorrect ? REACTION_MESSAGES.correct : REACTION_MESSAGES.wrong;

  reactionArt.classList.toggle("correct", isCorrect);
  reactionArt.classList.toggle("wrong", !isCorrect);
  $("reaction-emoji").textContent = isCorrect ? "🥳" : "🙈";
  $("reaction-kicker").textContent = isCorrect ? "إجابة صحيحة ✦" : "ولا يهمك ✦";
  $("reaction-title").textContent = randomItem(messages);
  $("reaction-subtitle").textContent = isCorrect
    ? "نقطة جديدة اتضافت لرصيدك… كمّلي ✨"
    : "مش هنكشف الإجابة الصحيحة دلوقتي… كمّلي وجربي في الباقي 😄";
  $("reaction-score-value").textContent = state.score;
  nextQuestionButton.disabled = false;

  showScreen("reaction-screen");
  launchCelebration(isCorrect ? 25 : 8);
}

function goToNextQuestion() {
  // الزر لا يعمل إلا بعد تأكيد إجابة حقيقية.
  if (!state.isAnswerLocked) return;

  state.currentQuestionIndex += 1;

  if (state.currentQuestionIndex >= TOTAL_QUESTIONS) {
    finishQuiz();
    return;
  }

  if (state.currentQuestionIndex >= questions.length) {
    showIncompleteScreen();
    return;
  }

  showScreen("quiz-screen");
  renderQuestion();
}

/* =========================================================
   6) النتيجة النهائية وفتح الهدية
   ========================================================= */

function finishQuiz() {
  // لا نتيجة ولا هدية إلا بعد 12 إجابة فعلية.
  if (!isQuizDataValid() || state.answers.length < TOTAL_QUESTIONS) {
    showIncompleteScreen();
    return;
  }

  state.quizFinished = true;
  state.giftUnlocked = state.score >= PASS_SCORE;

  const didPass = state.giftUnlocked;
  const incorrectAnswers = TOTAL_QUESTIONS - state.score;
  const scorePercent = (state.score / TOTAL_QUESTIONS) * 100;

  $("final-score").textContent = state.score;
  $("correct-count").textContent = state.score;
  $("incorrect-count").textContent = incorrectAnswers;
  $("score-ring").style.setProperty("--score-percent", scorePercent);
  $("score-ring").setAttribute("aria-label", `نتيجتك ${state.score} من ${TOTAL_QUESTIONS}`);
  $("result-icon").textContent = didPass ? "🏆" : "🎯";
  $("result-title").textContent = didPass
    ? "مبروك! كسبتي التحدي 🎉"
    : "وصلتي لنهاية اللعبة! 🎯";
  $("result-message").textContent = didPass
    ? `جبتِ ${state.score} من ${TOTAL_QUESTIONS} وفتحتي الهدية! 🎁`
    : `جبتِ ${state.score} من ${TOTAL_QUESTIONS}. محتاجة ${PASS_SCORE} إجابات صح علشان الهدية تتفتح. جربي تاني! ✨`;
  $("result-note").textContent = didPass
    ? "دوسي على الزر وشوفي رسالة المفاجأة 🎁"
    : "ممكن تغيّري النتيجة في المحاولة الجاية 🔁";

  // زر الهدية يظهر فقط عند الوصول إلى 10 إجابات صحيحة أو أكثر.
  giftButton.hidden = !didPass;
  showScreen("results-screen");
  launchCelebration(didPass ? 48 : 18);
}

function showIncompleteScreen() {
  state.quizFinished = false;
  state.giftUnlocked = false;
  giftButton.hidden = true;
  showScreen("incomplete-screen");
}

function openGift() {
  // حارس الأمان يمنع فتح الهدية قبل تحقيق النتيجة المطلوبة.
  if (!state.quizFinished || !state.giftUnlocked || state.score < PASS_SCORE) return;

  resetGiftView();
  $("gift-location-message").textContent = GIFT_CONFIG.locationMessage;
  $("gift-reveal-message").textContent = GIFT_CONFIG.revealMessage;
  showScreen("gift-screen");
  launchCelebration(35);
}

function revealGift() {
  if (!state.quizFinished || !state.giftUnlocked || state.score < PASS_SCORE) return;

  giftSecret.hidden = false;
  revealGiftButton.hidden = true;
  revealGiftButton.disabled = true;
  launchCelebration(20);
}

/* =========================================================
   7) ربط الأزرار بالأحداث
   ========================================================= */

$("start-button").addEventListener("click", startQuiz);
$("brand-home").addEventListener("click", goHome);
answerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  confirmAnswer();
});
nextQuestionButton.addEventListener("click", goToNextQuestion);
$("retry-button").addEventListener("click", startQuiz);
$("incomplete-restart").addEventListener("click", startQuiz);
$("incomplete-home").addEventListener("click", goHome);
giftButton.addEventListener("click", openGift);
revealGiftButton.addEventListener("click", revealGift);
$("gift-replay").addEventListener("click", startQuiz);

// تشغيل الديكور مرة واحدة فقط عند فتح الصفحة.
createFloatingBackground();

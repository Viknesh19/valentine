let current = 0;
const screens = document.querySelectorAll(".screen");
const music = document.getElementById("bgMusic");
const noModal = document.getElementById("noModal");
const loveCanvas = document.getElementById("loveCanvas");
const qaForm = document.getElementById("qaForm");
const scoreSummary = document.getElementById("scoreSummary");
const yesBtn = document.getElementById("yesBtn");
const yesPrompt = document.getElementById("yesPrompt");
const loveMeterFill = document.getElementById("loveMeterFill");
const loveMeterText = document.getElementById("loveMeterText");
const loveMeterSparkle = document.getElementById("loveMeterSparkle");
const openLetterBtn = document.getElementById("openLetterBtn");
const closeLetterBtn = document.getElementById("closeLetterBtn");
const letterModal = document.getElementById("letterModal");
const letterEnvelope = document.getElementById("letterEnvelope");
const envelopeTrigger = document.getElementById("envelopeTrigger");
let yesStage = 0;
let noMoveEnabled = false;
let replayCleanup = null;
const yesStages = [
  { label: "Yes ❤️", prompt: "Ready for a forever kind of yes?" },
  { label: "Really yes? 💞", prompt: "Like, really yes?" },
  { label: "Very sure yes? 💓", prompt: "Are you very sure?" },
  { label: "100% yes! 💘", prompt: "Okay, lock it in!" }
];

document.addEventListener("click", function () {
    const music = document.getElementById("bgMusic");
    music.play();
}, { once: true });

function closeLetter() {
  if (!letterModal) return;
  letterModal.classList.remove("show");
  letterModal.setAttribute("aria-hidden", "true");
  if (letterEnvelope) {
    letterEnvelope.classList.remove("opening");
  }
}

function openLetter() {
  if (!letterModal) return;
  letterModal.classList.add("show");
  letterModal.setAttribute("aria-hidden", "false");
  if (letterEnvelope) {
    letterEnvelope.classList.remove("opening");
  }
}

function revealLetter() {
  if (!letterEnvelope) return;
  if (letterEnvelope.classList.contains("opening")) return;
  letterEnvelope.classList.remove("opening");
  void letterEnvelope.offsetWidth;
  letterEnvelope.classList.add("opening");
}

function nextScreen() {
  screens[current].classList.remove("active");
  current++;
  screens[current].classList.add("active");
}

function noClicked() {
  if (noModal) {
    noModal.classList.add("show");
    noModal.setAttribute("aria-hidden", "false");
  }
  enableNoMove();
}

function yesClicked() {
  document.body.innerHTML = `
    <div class="screen active yes-screen">
      <canvas class="celebration-hearts" id="celebrationHearts" aria-hidden="true"></canvas>
      <h1>💍 She said YES 💍</h1>
      <p>Forever starts here.</p>
      <img src="assets/ring.png" class="ring" alt="Ring illustration">
      <button class="soft-button replay-button" id="replayBtn">Replay our love video 💞</button>
      <canvas id="confetti"></canvas>
    </div>
    <div class="replay-modal" id="replayModal" aria-hidden="true" role="dialog" aria-modal="true">
      <div class="replay-card">
        <div class="replay-header">
          <h2>Our love on repeat</h2>
          <button class="soft-button" id="closeReplay">Close</button>
        </div>
        <div class="replay-video-wrap">
          <canvas id="replayHearts" aria-hidden="true"></canvas>
          <video id="replayVideo" controls>
            <source src="assets/video/love.mp4" type="video/mp4" />
          </video>
        </div>
      </div>
    </div>
  `;
  startConfetti();
  const celebrationHearts = document.getElementById("celebrationHearts");
  startHeartsCanvas(celebrationHearts);
  const replayBtn = document.getElementById("replayBtn");
  const replayModal = document.getElementById("replayModal");
  const closeReplay = document.getElementById("closeReplay");
  const replayVideo = document.getElementById("replayVideo");
  const replayHearts = document.getElementById("replayHearts");

  const closeReplayModal = () => {
    if (!replayModal) return;
    replayModal.classList.remove("show");
    replayModal.setAttribute("aria-hidden", "true");
    if (replayVideo) {
      replayVideo.pause();
      replayVideo.currentTime = 0;
    }
    if (replayCleanup) {
      replayCleanup();
      replayCleanup = null;
    }
  };

  if (replayBtn) {
    replayBtn.addEventListener("click", () => {
      if (!replayModal) return;
      replayModal.classList.add("show");
      replayModal.setAttribute("aria-hidden", "false");
      if (replayVideo) replayVideo.play();
      if (replayHearts) {
        if (replayCleanup) replayCleanup();
        replayCleanup = startHeartsCanvas(replayHearts);
      }
    });
  }

  if (closeReplay) {
    closeReplay.addEventListener("click", closeReplayModal);
  }

  if (replayModal) {
    replayModal.addEventListener("click", event => {
      if (event.target === replayModal) {
        closeReplayModal();
      }
    });
  }
}

function handleYesClick() {
  if (!yesBtn) return;

  yesStage += 1;
  if (yesStage >= yesStages.length) {
    yesClicked();
    return;
  }

  const nextStage = yesStages[yesStage];
  yesBtn.textContent = nextStage.label;
  if (yesPrompt) {
    yesPrompt.textContent = nextStage.prompt;
  }
  const scale = 1 + yesStage * 0.18;
  yesBtn.style.setProperty("--yes-scale", scale);
  yesBtn.style.boxShadow = "0 18px 32px rgba(255, 77, 109, 0.45)";
  yesBtn.classList.remove("pulse");
  void yesBtn.offsetWidth;
  yesBtn.classList.add("pulse");
  playYesPulseSound();
}


function startExperience(event) {
  if (event) event.preventDefault();
  if (!qaForm || !qaForm.reportValidity()) return;

  const summary = buildAnswerSummary();
  if (scoreSummary) {
    scoreSummary.textContent = summary.scoreLine;
  }

  music.volume = 0.4;
  music.play();
  nextScreen();
  downloadAnswers(summary.fileText);
}

function closeModal() {
  if (!noModal) return;
  noModal.classList.remove("show");
  noModal.setAttribute("aria-hidden", "true");
}

function buildAnswerSummary() {
  const fieldsets = qaForm.querySelectorAll(".qa-block");
  const answers = [];
  let totalScore = 0;
  let maxScore = 0;

  fieldsets.forEach(fieldset => {
    const legend = fieldset.querySelector("legend");
    const checked = fieldset.querySelector("input[type='radio']:checked");
    const options = Array.from(fieldset.querySelectorAll("input[type='radio']"));
    const optionScores = options.map(option => Number(option.dataset.score || 0));
    const fieldMax = optionScores.length ? Math.max(...optionScores) : 0;
    maxScore += fieldMax;

    if (checked) {
      totalScore += Number(checked.dataset.score || 0);
      answers.push(`${legend.textContent} ${checked.value}`);
    }
  });

  const paragraphs = qaForm.querySelectorAll("textarea");
  paragraphs.forEach(textarea => {
    const label = textarea.closest("label");
    const title = label ? label.childNodes[0].textContent.trim() : "Memory";
    answers.push(`${title} ${textarea.value.trim()}`);
  });

  const percent = maxScore ? Math.round((totalScore / maxScore) * 100) : 0;
  const scoreLine = `Score: ${totalScore}/${maxScore} — she got ${percent}% of the sweet answers.`;

  const now = new Date().toLocaleString();
  const fileText = [
    "Valentine Q&A Memories",
    `Saved on: ${now}`,
    scoreLine,
    "",
    "Answers:",
    ...answers.map(answer => `- ${answer}`)
  ].join("\n");

  return { scoreLine, fileText };
}

function updateLoveMeter() {
  if (!qaForm || !loveMeterFill || !loveMeterText || !loveMeterSparkle) return;
  const fieldsets = qaForm.querySelectorAll(".qa-block");
  const textareas = qaForm.querySelectorAll("textarea");
  const total = fieldsets.length + textareas.length;
  let answered = 0;

  fieldsets.forEach(fieldset => {
    if (fieldset.querySelector("input[type='radio']:checked")) {
      answered += 1;
    }
  });

  textareas.forEach(textarea => {
    if (textarea.value.trim()) {
      answered += 1;
    }
  });

  const percent = total ? Math.round((answered / total) * 100) : 0;
  loveMeterFill.style.width = `${percent}%`;
  loveMeterText.textContent = `${percent}% us`;

  if (percent >= 100) {
    loveMeterSparkle.classList.add("show");
    loveMeterText.textContent = "100% us";
  } else {
    loveMeterSparkle.classList.remove("show");
  }
}

function downloadAnswers(text) {
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "valentine-qa.txt";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

if (noModal) {
  noModal.addEventListener("click", event => {
    if (event.target === noModal) {
      closeModal();
    }
  });
}


if (openLetterBtn) {
  openLetterBtn.addEventListener("click", openLetter);
}

if (closeLetterBtn) {
  closeLetterBtn.addEventListener("click", closeLetter);
}

if (envelopeTrigger) {
  envelopeTrigger.addEventListener("click", revealLetter);
}

if (letterModal) {
  letterModal.addEventListener("click", event => {
    if (event.target === letterModal) {
      closeLetter();
    }
  });
}

function startConfetti() {
  const canvas = document.getElementById("confetti");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const confetti = Array.from({ length: 150 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 6 + 2,
    d: Math.random() * 10,
    color: `hsl(${Math.random() * 360},100%,70%)`
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confetti.forEach(c => {
      ctx.beginPath();
      ctx.fillStyle = c.color;
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
    });
    update();
  }

  function update() {
    confetti.forEach(c => {
      c.y += Math.cos(c.d) + 2;
      if (c.y > canvas.height) c.y = 0;
    });
  }

  setInterval(draw, 20);
}

function moveNo() {
  if (!noMoveEnabled) return;
  const btn = document.getElementById("noBtn");
  if (!btn) return;
  const padding = 16;

  const vw = window.visualViewport?.width || window.innerWidth;
  const vh = window.visualViewport?.height || window.innerHeight;

  const maxX = vw - btn.offsetWidth - padding;
  const maxY = vh - btn.offsetHeight - padding;
  const x = padding + Math.random() * maxX;
  const y = padding + Math.random() * maxY;
  btn.style.position = "fixed";
  btn.style.left = `${x}px`;
  btn.style.top = `${y}px`;
}

function enableNoMove() {
  if (noMoveEnabled) return;
  const noBtn = document.getElementById("noBtn");
  if (!noBtn) return;
  noMoveEnabled = true;
  noBtn.addEventListener("mouseover", moveNo);
  noBtn.addEventListener("touchstart", moveNo);
}

function setupTouchGestures() {
  let touchStartX = 0;
  let touchStartY = 0;

  document.addEventListener("touchstart", event => {
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  });

  document.addEventListener("touchend", event => {
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    const isSwipe = Math.abs(deltaX) > 60 && Math.abs(deltaY) < 80;

    if (isSwipe && deltaX < 0 && current < screens.length - 1) {
      nextScreen();
    }
  });

  updateLoveMeter();
}

function startHeartsCanvas(canvas) {
  if (!canvas) return null;
  const ctx = canvas.getContext("2d");
  const hearts = Array.from({ length: 40 }, () => ({
    x: Math.random() * (canvas.width || window.innerWidth),
    y: Math.random() * (canvas.height || window.innerHeight),
    size: Math.random() * 10 + 6,
    speed: Math.random() * 0.8 + 0.4,
    alpha: Math.random() * 0.6 + 0.3
  }));

  const resize = () => {
    const bounds = canvas.parentElement?.getBoundingClientRect();
    const width = bounds?.width || window.innerWidth;
    const height = bounds?.height || window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  };

  const drawHeart = (x, y, size, alpha) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size / 10, size / 10);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(0, -3, -5, -3, -5, 1);
    ctx.bezierCurveTo(-5, 6, 0, 8, 0, 10);
    ctx.bezierCurveTo(0, 8, 5, 6, 5, 1);
    ctx.bezierCurveTo(5, -3, 0, -3, 0, 0);
    ctx.closePath();
    ctx.fillStyle = `rgba(255, 120, 170, ${alpha})`;
    ctx.fill();
    ctx.restore();
  };

  let animationId;
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hearts.forEach(heart => {
      drawHeart(heart.x, heart.y, heart.size, heart.alpha);
      heart.y -= heart.speed;
      if (heart.y < -20) {
        heart.y = canvas.height + 20;
        heart.x = Math.random() * canvas.width;
      }
    });
    animationId = requestAnimationFrame(animate);
  };

  resize();
  window.addEventListener("resize", resize);
  animate();

  return () => {
    cancelAnimationFrame(animationId);
    window.removeEventListener("resize", resize);
  };
}

if (qaForm) {
  qaForm.addEventListener("submit", startExperience);
  qaForm.addEventListener("input", updateLoveMeter);
}
setupTouchGestures();
startHeartsCanvas(loveCanvas);

function playYesPulseSound() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  const context = new AudioContextClass();
  const now = context.currentTime;

  const createBeat = (time, frequency) => {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gainNode.gain.value = 0;
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(0.18, time + 0.03);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
    oscillator.start(time);
    oscillator.stop(time + 0.25);
  };

  createBeat(now, 220);
  createBeat(now + 0.18, 200);

  setTimeout(() => {
    context.close();
  }, 500);
}

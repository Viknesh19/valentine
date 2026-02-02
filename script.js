let current = 0;
const screens = document.querySelectorAll(".screen");
const music = document.getElementById("bgMusic");
const noModal = document.getElementById("noModal");
const loveCanvas = document.getElementById("loveCanvas");
const ideaChips = document.querySelectorAll(".idea-chip");
const questionInput = document.querySelector(".option-row input");


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
}

function yesClicked() {
  document.body.innerHTML = `
    <div class="screen active">
      <h1>💍 She said YES 💍</h1>
      <p>Forever starts here.</p>
      <img src="assets/ring.png" class="ring">
      <canvas id="confetti"></canvas>
    </div>
  `;
  startConfetti();
}


function startExperience() {
  music.volume = 0.4;
  music.play();
  nextScreen();
}

function closeModal() {
  if (!noModal) return;
  noModal.classList.remove("show");
  noModal.setAttribute("aria-hidden", "true");
}

function setupIdeaChips() {
  if (!ideaChips.length || !questionInput) return;
  ideaChips.forEach(chip => {
    chip.addEventListener("click", () => {
      questionInput.value = chip.textContent;
      questionInput.focus();
    });
  });
}

if (noModal) {
  noModal.addEventListener("click", event => {
    if (event.target === noModal) {
      closeModal();
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
  const btn = document.getElementById("noBtn");
  const x = Math.random() * (window.innerWidth - btn.offsetWidth);
  const y = Math.random() * (window.innerHeight - btn.offsetHeight);
  btn.style.position = "absolute";
  btn.style.left = `${x}px`;
  btn.style.top = `${y}px`;
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

  const noBtn = document.getElementById("noBtn");
  if (noBtn) {
    noBtn.addEventListener("touchstart", moveNo);
  }
}

function startLoveCanvas() {
  if (!loveCanvas) return;
  const ctx = loveCanvas.getContext("2d");
  const hearts = Array.from({ length: 40 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size: Math.random() * 8 + 6,
    speed: Math.random() * 0.6 + 0.4,
    alpha: Math.random() * 0.6 + 0.2
  }));

  const resize = () => {
    loveCanvas.width = window.innerWidth;
    loveCanvas.height = window.innerHeight;
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

  const animate = () => {
    ctx.clearRect(0, 0, loveCanvas.width, loveCanvas.height);
    hearts.forEach(heart => {
      drawHeart(heart.x, heart.y, heart.size, heart.alpha);
      heart.y -= heart.speed;
      if (heart.y < -20) {
        heart.y = window.innerHeight + 20;
        heart.x = Math.random() * window.innerWidth;
      }
    });
    requestAnimationFrame(animate);
  };

  resize();
  window.addEventListener("resize", resize);
  animate();
}

setupIdeaChips();
setupTouchGestures();
startLoveCanvas();

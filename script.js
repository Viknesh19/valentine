let current = 0;
const screens = document.querySelectorAll(".screen");
const music = document.getElementById("bgMusic");


function nextScreen() {
  screens[current].classList.remove("active");
  current++;
  screens[current].classList.add("active");
}

function noClicked() {
  alert("🚫 Access Denied.\nNice try, but your heart says yes.");
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

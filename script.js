// Simple Pong game
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

// Game objects
const PADDLE_W = 12, PADDLE_H = 100;
const PADDLE_SPEED = 6;

const left = { x: 10, y: (H - PADDLE_H) / 2, w: PADDLE_W, h: PADDLE_H, score: 0 };
const right = { x: W - 10 - PADDLE_W, y: (H - PADDLE_H) / 2, w: PADDLE_W, h: PADDLE_H, score: 0 };

const ball = {
  x: W / 2,
  y: H / 2,
  r: 8,
  speed: 5,
  velX: 5,
  velY: 3
};

let keys = {};
let paused = false;
let servingTo = 0; // 0 = random, -1 left, 1 right

// Helpers
function randSign() { return Math.random() < 0.5 ? -1 : 1; }

function resetBall(direction = 0) {
  ball.x = W / 2;
  ball.y = H / 2;
  ball.speed = 5;
  const angle = (Math.random() * Math.PI / 4) - (Math.PI / 8); // -22.5deg..22.5deg
  const dir = direction === 0 ? randSign() : direction;
  ball.velX = dir * Math.cos(angle) * ball.speed;
  ball.velY = Math.sin(angle) * ball.speed;
  paused = false;
}

// Input
window.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
  if (e.code === 'Space') { paused = !paused; }
  if (e.key.toLowerCase() === 'r') {
    left.score = 0; right.score = 0;
    resetBall(0);
  }
});
window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

// Game logic
function update() {
  if (paused) return;

  // Move paddles
  if (keys['w']) left.y -= PADDLE_SPEED;
  if (keys['s']) left.y += PADDLE_SPEED;
  if (keys['arrowup']) right.y -= PADDLE_SPEED;
  if (keys['arrowdown']) right.y += PADDLE_SPEED;

  // Clamp paddles
  left.y = Math.max(0, Math.min(H - left.h, left.y));
  right.y = Math.max(0, Math.min(H - right.h, right.y));

  // Move ball
  ball.x += ball.velX;
  ball.y += ball.velY;

  // Wall collision (top/bottom)
  if (ball.y - ball.r < 0) {
    ball.y = ball.r;
    ball.velY *= -1;
  } else if (ball.y + ball.r > H) {
    ball.y = H - ball.r;
    ball.velY *= -1;
  }

  // Paddle collisions
  if (ball.x - ball.r < left.x + left.w) {
    if (ball.y > left.y && ball.y < left.y + left.h) {
      // hit left paddle
      const rel = (ball.y - (left.y + left.h / 2)) / (left.h / 2); // -1..1
      const bounceAngle = rel * (Math.PI / 4); // up to 45 degrees
      ball.speed *= 1.05;
      ball.velX = Math.abs(ball.speed * Math.cos(bounceAngle));
      ball.velY = ball.speed * Math.sin(bounceAngle);
      ball.x = left.x + left.w + ball.r; // prevent sticking
    }
  }
  if (ball.x + ball.r > right.x) {
    if (ball.y > right.y && ball.y < right.y + right.h) {
      // hit right paddle
      const rel = (ball.y - (right.y + right.h / 2)) / (right.h / 2);
      const bounceAngle = rel * (Math.PI / 4);
      ball.speed *= 1.05;
      ball.velX = -Math.abs(ball.speed * Math.cos(bounceAngle));
      ball.velY = ball.speed * Math.sin(bounceAngle);
      ball.x = right.x - ball.r; // prevent sticking
    }
  }

  // Score
  if (ball.x + ball.r < 0) {
    right.score += 1;
    resetBall(1); // serve to right
  } else if (ball.x - ball.r > W) {
    left.score += 1;
    resetBall(-1); // serve to left
  }
}

// Rendering
function drawNet() {
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  const step = 12, seg = 8;
  for (let y = 0; y < H; y += step) {
    ctx.fillRect(W/2 - 1, y, 2, seg);
  }
}

function draw() {
  // background
  ctx.fillStyle = '#000';
  ctx.fillRect(0,0,W,H);

  // net
  drawNet();

  // paddles
  ctx.fillStyle = '#fff';
  roundRect(ctx, left.x, left.y, left.w, left.h, 4, true);
  roundRect(ctx, right.x, right.y, right.w, right.h, 4, true);

  // ball
  ctx.beginPath();
  ctx.fillStyle = '#fff';
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fill();

  // scores
  ctx.fillStyle = 'rgba(230,230,230,0.95)';
  ctx.font = '48px system-ui, Arial';
  ctx.textAlign = 'center';
  ctx.fillText(left.score, W * 0.25, 60);
  ctx.fillText(right.score, W * 0.75, 60);

  // paused overlay
  if (paused) {
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, H/2 - 40, W, 80);
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.font = '28px system-ui, Arial';
    ctx.fillText('PAUSED — Press Space to resume', W/2, H/2 + 8);
  }
}

// rounded rectangle helper
function roundRect(ctx, x, y, w, h, r, fill) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  if (fill) ctx.fill();
  else ctx.stroke();
}

// Main loop
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// Start
resetBall(0);
loop();

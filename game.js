(() => {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  const ui = {
    score: document.getElementById("score"),
    level: document.getElementById("level"),
    lives: document.getElementById("lives"),
    coins: document.getElementById("coins"),
    bestScore: document.getElementById("bestScore"),
    bestLevel: document.getElementById("bestLevel"),
    totalCoins: document.getElementById("totalCoins"),
    finalScore: document.getElementById("finalScore"),
    finalLevel: document.getElementById("finalLevel"),
    menu: document.getElementById("menu"),
    pause: document.getElementById("pause"),
    gameOver: document.getElementById("gameOver"),
    startBtn: document.getElementById("startBtn"),
    resumeBtn: document.getElementById("resumeBtn"),
    restartBtn: document.getElementById("restartBtn"),
    pauseBtn: document.getElementById("pauseBtn"),
    soundBtn: document.getElementById("soundBtn"),
    musicBtn: document.getElementById("musicBtn")
  };

  const STORAGE_KEY = "cosmoPopSave_v1";

  const defaultSave = {
    bestScore: 0,
    bestLevel: 1,
    totalCoins: 0,
    achievements: {
      firstBlast: false,
      level5: false,
      score1000: false
    },
    soundOn: true,
    musicOn: true
  };

  const clone = (obj) => (typeof structuredClone === "function"`n    ? structuredClone(obj)`n    : JSON.parse(JSON.stringify(obj)));`n`n  function loadSave() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return clone(defaultSave);
    try {
      const parsed = JSON.parse(raw);
      return { ...clone(defaultSave), ...parsed };
    } catch {
      return clone(defaultSave);
    }
  }

  function saveProgress() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
  }

  const save = loadSave();

  const state = {
    running: false,
    paused: false,
    time: 0,
    score: 0,
    level: 1,
    lives: 3,
    coins: 0,
    spawnTimer: 0,
    spawnInterval: 1.4,
    enemySpeed: 70,
    bullets: [],
    enemies: [],
    particles: [],
    pickups: [],
    stars: [],
    cameraShake: 0
  };

  const input = {
    keys: new Set(),
    shooting: false,
    aimX: canvas.width / 2,
    aimY: canvas.height / 2,
    moveTarget: null,
    pointerId: null,
    moveActive: false
  };

  const player = {
    x: canvas.width / 2,
    y: canvas.height * 0.7,
    radius: 18,
    speed: 240,
    fireRate: 0.18,
    fireCooldown: 0,
    invuln: 0
  };

  const blockedKeys = new Set([
    " ",
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "w",
    "a",
    "s",
    "d",
    "W",
    "A",
    "S",
    "D"
  ]);

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const scale = rect.width / canvas.width;
    canvas.style.height = `${canvas.height * scale}px`;
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  // Audio
  let audioCtx = null;
  let musicNode = null;

  function ensureAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  function playTone(freq, duration, type = "sine", volume = 0.15) {
    if (!save.soundOn) return;
    ensureAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  }

  function startMusic() {
    if (!save.musicOn) return;
    ensureAudio();
    if (musicNode) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "triangle";
    osc.frequency.value = 196;
    gain.gain.value = 0.05;
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    musicNode = { osc, gain, base: 196, step: 0 };
  }

  function stopMusic() {
    if (musicNode && audioCtx) {
      musicNode.gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
      musicNode.osc.stop(audioCtx.currentTime + 0.12);
    }
    musicNode = null;
  }

  function updateMusic(dt) {
    if (!musicNode) return;
    musicNode.step += dt;
    if (musicNode.step > 0.5) {
      musicNode.step = 0;
      musicNode.base = musicNode.base === 196 ? 247 : 196;
      musicNode.osc.frequency.setValueAtTime(musicNode.base, audioCtx.currentTime);
    }
  }

  // Input
  window.addEventListener("keydown", (event) => {
    if (blockedKeys.has(event.key)) {
      event.preventDefault();
    }
    input.keys.add(event.key);
    if (event.key === " ") input.shooting = true;
    if (event.key === "Escape") togglePause();`n    if (event.key === "p" || event.key === "P") togglePause();
  }, { passive: false });

  window.addEventListener("keyup", (event) => {
    if (blockedKeys.has(event.key)) {
      event.preventDefault();
    }
    input.keys.delete(event.key);
    if (event.key === " ") input.shooting = false;
  }, { passive: false });

  canvas.addEventListener("pointerdown", (event) => {
    ensureAudio();
    if (!state.running || state.paused) return;
    input.pointerId = event.pointerId;
    const pos = toCanvasPosition(event);
    input.aimX = pos.x;
    input.aimY = pos.y;

    if (event.pointerType === "mouse") {
      input.shooting = true;
    } else {
      const half = canvas.width * 0.5;
      if (pos.x < half) {
        input.moveActive = true;
        input.moveTarget = { x: pos.x, y: pos.y };
      } else {
        input.shooting = true;
      }
    }
  });

  canvas.addEventListener("pointermove", (event) => {
    if (input.pointerId !== event.pointerId) return;
    const pos = toCanvasPosition(event);
    input.aimX = pos.x;
    input.aimY = pos.y;
    if (input.moveActive) {
      input.moveTarget = { x: pos.x, y: pos.y };
    }
  });

  canvas.addEventListener("pointerup", (event) => {
    if (input.pointerId !== event.pointerId) return;
    input.pointerId = null;
    input.shooting = false;
    input.moveActive = false;
    input.moveTarget = null;
  });

  function toCanvasPosition(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  }

  // UI buttons
  ui.startBtn.addEventListener("click", () => {
    ensureAudio();
    startGame();
  });

  ui.resumeBtn.addEventListener("click", () => {
    togglePause(false);
  });

  ui.restartBtn.addEventListener("click", () => {
    startGame();
  });

  ui.pauseBtn.addEventListener("click", () => {
    togglePause();
  });

  ui.soundBtn.addEventListener("click", () => {
    save.soundOn = !save.soundOn;
    ui.soundBtn.textContent = `Звук: ${save.soundOn ? "Вкл" : "Выкл"}`;
    ui.soundBtn.setAttribute("aria-pressed", String(save.soundOn));
    saveProgress();
  });

  ui.musicBtn.addEventListener("click", () => {
    save.musicOn = !save.musicOn;
    ui.musicBtn.textContent = `Музыка: ${save.musicOn ? "Вкл" : "Выкл"}`;
    ui.musicBtn.setAttribute("aria-pressed", String(save.musicOn));
    if (save.musicOn) {
      startMusic();
    } else {
      stopMusic();
    }
    saveProgress();
  });

  function startGame() {
    state.running = true;
    state.paused = false;
    state.time = 0;
    state.score = 0;
    state.level = 1;
    state.lives = 3;
    state.coins = 0;
    state.spawnTimer = 0;
    state.spawnInterval = 1.4;
    state.enemySpeed = 70;
    state.bullets = [];
    state.enemies = [];
    state.particles = [];
    state.pickups = [];
    state.stars = createStars(80);
    state.cameraShake = 0;

    player.x = canvas.width / 2;
    player.y = canvas.height * 0.7;
    player.fireCooldown = 0;
    player.invuln = 1.2;

    ui.menu.classList.remove("active");
    ui.gameOver.classList.remove("active");
    ui.pause.classList.remove("active");
    updateHUD();

    if (save.musicOn) startMusic();
  }

  function togglePause(force) {
    if (!state.running) return;
    state.paused = typeof force === "boolean" ? force : !state.paused;
    ui.pause.classList.toggle("active", state.paused);
  }

  function gameOver() {
    state.running = false;
    ui.gameOver.classList.add("active");
    ui.finalScore.textContent = state.score;
    ui.finalLevel.textContent = state.level;
    save.bestScore = Math.max(save.bestScore, state.score);
    save.bestLevel = Math.max(save.bestLevel, state.level);
    save.totalCoins += state.coins;
    saveProgress();
    updateMenuStats();
    stopMusic();
  }

  function updateHUD() {
    ui.score.textContent = state.score;
    ui.level.textContent = state.level;
    ui.lives.textContent = state.lives;
    ui.coins.textContent = state.coins;
  }

  function updateMenuStats() {
    ui.bestScore.textContent = save.bestScore;
    ui.bestLevel.textContent = save.bestLevel;
    ui.totalCoins.textContent = save.totalCoins;
    ui.soundBtn.textContent = `Звук: ${save.soundOn ? "Вкл" : "Выкл"}`;
    ui.musicBtn.textContent = `Музыка: ${save.musicOn ? "Вкл" : "Выкл"}`;
  }

  function levelUp() {
    state.level += 1;
    state.spawnInterval = Math.max(0.45, state.spawnInterval - 0.08);
    state.enemySpeed += 10;
    playTone(520, 0.2, "triangle", 0.12);

    if (state.level >= 5) save.achievements.level5 = true;
    save.bestLevel = Math.max(save.bestLevel, state.level);
  }

  function spawnEnemy() {
    const edge = Math.floor(Math.random() * 4);
    let x = 0;
    let y = 0;
    if (edge === 0) { x = -20; y = Math.random() * canvas.height; }
    if (edge === 1) { x = canvas.width + 20; y = Math.random() * canvas.height; }
    if (edge === 2) { x = Math.random() * canvas.width; y = -20; }
    if (edge === 3) { x = Math.random() * canvas.width; y = canvas.height + 20; }

    state.enemies.push({
      x,
      y,
      radius: 18 + Math.random() * 8,
      wobble: Math.random() * Math.PI * 2,
      speed: state.enemySpeed + Math.random() * 40,
      hp: 2 + Math.floor(state.level / 2)
    });
  }

  function spawnPickup(x, y) {
    state.pickups.push({ x, y, radius: 10, pulse: 0 });
  }

  function shoot() {
    if (player.fireCooldown > 0) return;
    player.fireCooldown = player.fireRate;

    const dx = input.aimX - player.x;
    const dy = input.aimY - player.y;
    const len = Math.hypot(dx, dy) || 1;
    const speed = 420;

    state.bullets.push({
      x: player.x,
      y: player.y,
      vx: (dx / len) * speed,
      vy: (dy / len) * speed,
      radius: 4,
      life: 1.2
    });

    playTone(680, 0.08, "square", 0.08);
    save.achievements.firstBlast = true;
  }

  function updatePlayer(dt) {
    const dir = { x: 0, y: 0 };
    if (input.keys.has("ArrowUp") || input.keys.has("w") || input.keys.has("W")) dir.y -= 1;
    if (input.keys.has("ArrowDown") || input.keys.has("s") || input.keys.has("S")) dir.y += 1;
    if (input.keys.has("ArrowLeft") || input.keys.has("a") || input.keys.has("A")) dir.x -= 1;
    if (input.keys.has("ArrowRight") || input.keys.has("d") || input.keys.has("D")) dir.x += 1;

    if (input.moveActive && input.moveTarget) {
      dir.x = input.moveTarget.x - player.x;
      dir.y = input.moveTarget.y - player.y;
    }

    const len = Math.hypot(dir.x, dir.y) || 1;
    const speed = player.speed * dt;
    if (len > 0.1) {
      player.x += (dir.x / len) * speed;
      player.y += (dir.y / len) * speed;
    }

    player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));

    player.fireCooldown = Math.max(0, player.fireCooldown - dt);
    player.invuln = Math.max(0, player.invuln - dt);

    if (input.shooting) shoot();
  }

  function updateBullets(dt) {
    state.bullets = state.bullets.filter((bullet) => {
      bullet.x += bullet.vx * dt;
      bullet.y += bullet.vy * dt;
      bullet.life -= dt;
      return bullet.life > 0 && bullet.x > -20 && bullet.x < canvas.width + 20 && bullet.y > -20 && bullet.y < canvas.height + 20;
    });
  }

  function updateEnemies(dt) {
    state.enemies.forEach((enemy) => {
      const dx = player.x - enemy.x;
      const dy = player.y - enemy.y;
      const len = Math.hypot(dx, dy) || 1;
      enemy.x += (dx / len) * enemy.speed * dt;
      enemy.y += (dy / len) * enemy.speed * dt;
      enemy.wobble += dt * 4;
    });
  }

  function updatePickups(dt) {
    state.pickups.forEach((pickup) => {
      pickup.pulse += dt * 6;
    });
  }

  function updateParticles(dt) {
    state.particles = state.particles.filter((p) => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      return p.life > 0;
    });
  }

  function handleCollisions() {
    // Bullet-enemy
    state.enemies.forEach((enemy) => {
      state.bullets.forEach((bullet) => {
        const dist = Math.hypot(enemy.x - bullet.x, enemy.y - bullet.y);
        if (dist < enemy.radius + bullet.radius) {
          bullet.life = 0;
          enemy.hp -= 1;
          explode(enemy.x, enemy.y, "#ffb347");
          if (enemy.hp <= 0) {
            enemy.dead = true;
            state.score += 50;
            if (Math.random() < 0.35) spawnPickup(enemy.x, enemy.y);
          } else {
            state.score += 10;
          }
        }
      });
    });

    state.enemies = state.enemies.filter((enemy) => !enemy.dead);

    // Player-enemy
    state.enemies.forEach((enemy) => {
      const dist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
      if (dist < enemy.radius + player.radius && player.invuln <= 0) {
        state.lives -= 1;
        player.invuln = 1.2;
        state.cameraShake = 0.4;
        explode(player.x, player.y, "#ff5c8a");
        playTone(180, 0.2, "sawtooth", 0.2);
        if (state.lives <= 0) gameOver();
      }
    });

    // Player-pickup
    state.pickups = state.pickups.filter((pickup) => {
      const dist = Math.hypot(pickup.x - player.x, pickup.y - player.y);
      if (dist < pickup.radius + player.radius) {
        state.coins += 1;
        state.score += 20;
        playTone(920, 0.1, "triangle", 0.12);
        return false;
      }
      return true;
    });
  }

  function explode(x, y, color) {
    for (let i = 0; i < 12; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 140;
      state.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.5 + Math.random() * 0.4,
        color
      });
    }
  }

  function createStars(count) {
    return Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 1 + Math.random() * 2,
      speed: 10 + Math.random() * 30
    }));
  }

  function updateStars(dt) {
    state.stars.forEach((star) => {
      star.y += star.speed * dt;
      if (star.y > canvas.height) {
        star.y = -5;
        star.x = Math.random() * canvas.width;
      }
    });
  }

  function render() {
    ctx.save();

    if (state.cameraShake > 0) {
      const shake = state.cameraShake * 10;
      ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
      state.cameraShake = Math.max(0, state.cameraShake - 0.02);
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#1f2937");
    gradient.addColorStop(1, "#0f172a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stars
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    state.stars.forEach((star) => {
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Pickups
    state.pickups.forEach((pickup) => {
      const pulse = 1 + Math.sin(pickup.pulse) * 0.2;
      ctx.fillStyle = "#3dd6f5";
      ctx.beginPath();
      ctx.arc(pickup.x, pickup.y, pickup.radius * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.stroke();
    });

    // Bullets
    ctx.fillStyle = "#ffe66d";
    state.bullets.forEach((bullet) => {
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Enemies
    state.enemies.forEach((enemy) => {
      const wobble = 1 + Math.sin(enemy.wobble) * 0.1;
      ctx.fillStyle = "#ff7a8a";
      ctx.beginPath();
      ctx.ellipse(enemy.x, enemy.y, enemy.radius * wobble, enemy.radius, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1f2937";
      ctx.beginPath();
      ctx.arc(enemy.x - 5, enemy.y - 4, 3, 0, Math.PI * 2);
      ctx.arc(enemy.x + 5, enemy.y - 4, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Player
    if (player.invuln <= 0 || Math.floor(player.invuln * 10) % 2 === 0) {
      ctx.fillStyle = "#3dd6f5";
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.arc(player.x - 5, player.y - 4, 3, 0, Math.PI * 2);
      ctx.arc(player.x + 5, player.y - 4, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffb347";
      ctx.beginPath();
      ctx.arc(player.x, player.y + 10, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Particles
    state.particles.forEach((p) => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.life / 0.8);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    ctx.restore();
  }

  let lastTime = performance.now();
  function loop(now) {
    const dt = Math.min(0.033, (now - lastTime) / 1000);
    lastTime = now;

    if (state.running && !state.paused) {
      state.time += dt;
      updateStars(dt);
      updatePlayer(dt);
      updateBullets(dt);
      updateEnemies(dt);
      updatePickups(dt);
      updateParticles(dt);

      state.spawnTimer += dt;
      if (state.spawnTimer >= state.spawnInterval) {
        state.spawnTimer = 0;
        spawnEnemy();
      }

      handleCollisions();
      if (state.score >= state.level * 500) levelUp();
      updateHUD();
      updateMusic(dt);
    }

    render();
    requestAnimationFrame(loop);
  }

  updateMenuStats();
  requestAnimationFrame(loop);
})();


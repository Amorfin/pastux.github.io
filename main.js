
/* Clouds & Sheep Meadow - main.js */
(() => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  const ui = {
    sheepCount: document.getElementById('sheepCount'),
    level: document.getElementById('level'),
    wool: document.getElementById('wool'),
    coins: document.getElementById('coins'),
    shopCoins: document.getElementById('shopCoins'),
    care: document.getElementById('care'),
    seasonLabel: document.getElementById('seasonLabel'),
    weatherLabel: document.getElementById('weatherLabel'),
    mode: document.getElementById('mode'),
    toast: document.getElementById('toast'),
    menu: document.getElementById('menu'),
    pause: document.getElementById('pause'),
    help: document.getElementById('help'),
    helpClose: document.getElementById('helpClose'),
    gameOver: document.getElementById('gameOver'),
    gameOverRestart: document.getElementById('gameOverRestart'),
    gameOverMenu: document.getElementById('gameOverMenu'),
    bestInfo: document.getElementById('bestInfo'),
    questList: document.getElementById('questList'),
    startBtn: document.getElementById('startBtn'),
    buildFence: document.getElementById('buildFence'),
    rotateFence: document.getElementById('rotateFence'),
    buildFeeder: document.getElementById('buildFeeder'),
    whistleBtn: document.getElementById('whistleBtn'),
    adBtn: document.getElementById('adBtn'),
    helpBtn: document.getElementById('helpBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    restartBtn: document.getElementById('restartBtn'),
    menuBtn: document.getElementById('menuBtn'),
    resumeBtn: document.getElementById('resumeBtn'),
    exchangeBtn: document.getElementById('exchangeBtn'),
    landMeadow: document.getElementById('landMeadow'),
    landLavender: document.getElementById('landLavender'),
    landSunset: document.getElementById('landSunset'),
    landWinter: document.getElementById('landWinter'),
    skinNatural: document.getElementById('skinNatural'),
    skinSky: document.getElementById('skinSky'),
    skinRose: document.getElementById('skinRose'),
    skinCaramel: document.getElementById('skinCaramel'),
    upgWool: document.getElementById('upgWool'),
    upgWoolCost: document.getElementById('upgWoolCost'),
    upgWoolLevel: document.getElementById('upgWoolLevel'),
    upgCalm: document.getElementById('upgCalm'),
    upgCalmCost: document.getElementById('upgCalmCost'),
    upgCalmLevel: document.getElementById('upgCalmLevel'),
    upgHerd: document.getElementById('upgHerd'),
    upgHerdCost: document.getElementById('upgHerdCost'),
    upgHerdLevel: document.getElementById('upgHerdLevel'),
    upgInfra: document.getElementById('upgInfra'),
    upgInfraCost: document.getElementById('upgInfraCost'),
    upgInfraLevel: document.getElementById('upgInfraLevel')
  };

  const SAVE_KEY = 'cloudsSheepSave';
  const UI_STATE_KEY = 'cloudsSheepUI';
  const TAU = Math.PI * 2;
  const BASE_SHEEP = 6;
  const FENCE_SPACING = 60;
  const DRAG_THRESHOLD = 6;
  const MAX_TIER = 4;
  const TIER_LABELS = ['I', 'II', 'III', 'IV'];
  const FENCE_COST = 1;
  const FEEDER_COST = 4;
  const BASE_MAX_FENCES = 22;
  const BASE_MAX_FEEDERS = 6;
  const INFRA_FENCE_ADD = 4;
  const INFRA_FEEDER_ADD = 1;
  const EXCHANGE_RATE = 5;
  const AD_COOLDOWN = 60;

  let state = 'menu';
  let buildMode = 'none';
  let fenceOrientation = 'h';
  let score = 0;
  let coins = 0;
  let level = 1;
  let lastTime = 0;
  let saveTimer = 0;
  let sheepIdCounter = 1;
  let careWarningTimer = 0;
  let adTimer = 0;
  let questIdCounter = 1;
  let uiState = {
    collapsedSections: {}
  };

  const world = {
    width: 0,
    height: 0,
    grassY: 0
  };

  const pointer = {
    x: 0,
    y: 0,
    active: false
  };

  const drag = {
    active: false,
    sheep: null,
    offsetX: 0,
    offsetY: 0,
    startX: 0,
    startY: 0,
    wasDragged: false
  };

  const fenceBrush = {
    active: false,
    x: 0,
    y: 0
  };

  const lure = {
    active: false,
    x: 0,
    y: 0,
    time: 0
  };

  const goldenEvent = {
    active: false,
    sheepId: null,
    timer: 0,
    cooldown: 18
  };

  const weather = {
    type: 'sunny',
    timer: 20
  };

  const weatherConfig = {
    sunny: {
      label: 'Солнечно',
      skyTop: '#c8f0ff',
      skyMid: '#8ad7ff',
      skyBottom: '#7ac5ff',
      grassTop: '#8ee56f',
      grassBottom: '#67cc5a',
      cloud: 1,
      hunger: 1,
      wool: 1.05
    },
    windy: {
      label: 'Ветрено',
      skyTop: '#cfeaff',
      skyMid: '#9ddcff',
      skyBottom: '#7bc6ff',
      grassTop: '#88df66',
      grassBottom: '#5db74f',
      cloud: 1.6,
      hunger: 1.05,
      wool: 0.95
    },
    rainy: {
      label: 'Дождь',
      skyTop: '#b3c7e5',
      skyMid: '#94b4dd',
      skyBottom: '#6e9ccf',
      grassTop: '#7fcf68',
      grassBottom: '#4f9f50',
      cloud: 1.1,
      hunger: 1.2,
      wool: 0.85,
      rain: true
    },
    dusk: {
      label: 'Сумерки',
      skyTop: '#ffcfb8',
      skyMid: '#f5a6c8',
      skyBottom: '#6d7cc7',
      grassTop: '#8ed18f',
      grassBottom: '#5aa86c',
      cloud: 0.75,
      hunger: 0.95,
      wool: 1.1,
      dusk: true
    }
  };

  const season = {
    type: 'spring',
    timer: 40
  };

  const seasonConfig = {
    spring: { label: 'Весна', wool: 1.1, hunger: 0.95, care: 1.05, tint: [20, 40, 10], leaves: false, snow: false },
    summer: { label: 'Лето', wool: 1.05, hunger: 1, care: 1, tint: [10, 30, 0], leaves: false, snow: false },
    autumn: { label: 'Осень', wool: 1.15, hunger: 1.05, care: 0.98, tint: [40, 20, -10], leaves: true, snow: false },
    winter: { label: 'Зима', wool: 0.9, hunger: 1.2, care: 0.9, tint: [-30, -20, 30], leaves: false, snow: true }
  };

  const landscapeConfig = {
    meadow: {
      label: 'Луг',
      skyTop: [200, 240, 255],
      skyMid: [138, 215, 255],
      skyBottom: [122, 197, 255],
      grassTop: [142, 229, 111],
      grassBottom: [103, 204, 90]
    },
    lavender: {
      label: 'Лавандовый луг',
      skyTop: [214, 208, 255],
      skyMid: [178, 161, 238],
      skyBottom: [120, 110, 190],
      grassTop: [170, 210, 190],
      grassBottom: [120, 170, 150]
    },
    sunset: {
      label: 'Закатное поле',
      skyTop: [255, 212, 170],
      skyMid: [255, 168, 150],
      skyBottom: [200, 130, 180],
      grassTop: [170, 200, 120],
      grassBottom: [120, 160, 110]
    },
    winter: {
      label: 'Снежный луг',
      skyTop: [210, 230, 245],
      skyMid: [170, 210, 235],
      skyBottom: [120, 170, 210],
      grassTop: [210, 230, 235],
      grassBottom: [170, 200, 215]
    }
  };

  const shop = {
    landscapes: [
      { id: 'meadow', cost: 0 },
      { id: 'lavender', cost: 8 },
      { id: 'sunset', cost: 10 },
      { id: 'winter', cost: 12 }
    ],
    skins: [
      { id: 'natural', cost: 0, tint: null },
      { id: 'sky', cost: 4, tint: [170, 210, 255] },
      { id: 'rose', cost: 4, tint: [255, 200, 220] },
      { id: 'caramel', cost: 5, tint: [255, 220, 180] }
    ]
  };

  const subtypeConfig = {
    swift: { label: 'Шустрая', color: '#5c7cff', speed: 1.18, hunger: 1.05, wool: 0.92, care: 1 },
    fluffy: { label: 'Пушистая', color: '#ff8a5c', speed: 0.95, hunger: 1, wool: 1.2, care: 1 },
    sleepy: { label: 'Соня', color: '#7c5cff', speed: 0.9, hunger: 0.92, wool: 1.1, care: 1.1 },
    sturdy: { label: 'Крепыш', color: '#2dd4bf', speed: 1.02, hunger: 0.98, wool: 1, care: 1.2 },
    playful: { label: 'Прыгун', color: '#ffd166', speed: 1.12, hunger: 1.08, wool: 0.98, care: 1 }
  };

  const questTemplates = [
    { type: 'collect', label: 'Соберите шерсть', min: 8, max: 16, rewardCoins: [1, 2], rewardWool: [2, 4] },
    { type: 'merge', label: 'Скрестите овец', min: 2, max: 5, rewardCoins: [2, 4], rewardWool: [0, 2] },
    { type: 'feed', label: 'Покормите овец', min: 6, max: 12, rewardCoins: [1, 2], rewardWool: [2, 3] },
    { type: 'build_fence', label: 'Поставьте заборы', min: 4, max: 10, rewardCoins: [1, 2], rewardWool: [1, 3] },
    { type: 'build_feeder', label: 'Поставьте кормушки', min: 2, max: 4, rewardCoins: [2, 3], rewardWool: [2, 4] },
    { type: 'legendary', label: 'Соберите шерсть легендарной овцы', min: 1, max: 1, rewardCoins: [3, 5], rewardWool: [2, 4] }
  ];

  let ownedLandscapes = { meadow: true };
  let ownedSkins = { natural: true };
  let selectedLandscape = 'meadow';
  let selectedSkin = 'natural';
  let quests = [];

  const rainDrops = Array.from({ length: 90 }).map(() => ({
    x: Math.random() * 800,
    y: Math.random() * 600,
    speed: 200 + Math.random() * 200
  }));

  const leafParticles = Array.from({ length: 60 }).map(() => ({
    x: Math.random() * 800,
    y: Math.random() * 600,
    speed: 30 + Math.random() * 40,
    drift: 20 + Math.random() * 40
  }));

  const snowParticles = Array.from({ length: 90 }).map(() => ({
    x: Math.random() * 800,
    y: Math.random() * 600,
    speed: 20 + Math.random() * 50
  }));

  const upgradeConfig = {
    wool: { name: 'Шерстяной бонус', baseCost: 6, mult: 1.6, max: 6 },
    calm: { name: 'Спокойные овцы', baseCost: 5, mult: 1.5, max: 6 },
    herd: { name: 'Больше овец', baseCost: 8, mult: 1.7, max: 4 },
    infra: { name: 'Инфраструктура', baseCost: 7, mult: 1.7, max: 5 }
  };

  let upgrades = {
    wool: 0,
    calm: 0,
    herd: 0,
    infra: 0
  };

  let sheep = [];
  let fences = [];
  let feeders = [];
  let clouds = [];
  let floatTexts = [];

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function mixColor(a, b, t) {
    return [
      Math.round(a[0] + (b[0] - a[0]) * t),
      Math.round(a[1] + (b[1] - a[1]) * t),
      Math.round(a[2] + (b[2] - a[2]) * t)
    ];
  }

  function toRgb(color) {
    return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
  }

  function applyTint(base, tint, amount) {
    if (!tint) return base;
    return mixColor(base, tint, amount);
  }

  function hexToRgb(hex) {
    const value = hex.replace('#', '');
    const r = parseInt(value.slice(0, 2), 16);
    const g = parseInt(value.slice(2, 4), 16);
    const b = parseInt(value.slice(4, 6), 16);
    return [r, g, b];
  }

  function applySeasonTint(color, tint) {
    return [
      clamp(color[0] + tint[0], 0, 255),
      clamp(color[1] + tint[1], 0, 255),
      clamp(color[2] + tint[2], 0, 255)
    ];
  }

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    world.width = rect.width;
    world.height = rect.height;
    world.grassY = rect.height * 0.55;
  }

  function createClouds() {
    clouds = [];
    const count = 7;
    for (let i = 0; i < count; i++) {
      clouds.push({
        x: rand(0, world.width),
        y: rand(40, world.grassY - 120),
        speed: rand(8, 20),
        size: rand(50, 110)
      });
    }
  }

  function pickMood(s) {
    const roll = Math.random();
    if (s.hunger > 1.2 && roll < 0.55) return 'seek';
    if (roll < 0.25) return 'graze';
    if (roll < 0.45) return 'rest';
    if (roll < 0.6) return 'hop';
    return 'wander';
  }

  function randomSubtype() {
    const list = Object.keys(subtypeConfig);
    return list[Math.floor(Math.random() * list.length)];
  }

  function mergeSubtype(a, b) {
    if (Math.random() < 0.6) return Math.random() < 0.5 ? a : b;
    return randomSubtype();
  }

  function randomGenes() {
    const basePalette = [
      [255, 255, 255],
      [246, 234, 210],
      [232, 242, 255],
      [255, 220, 235],
      [224, 242, 224]
    ];
    const accentPalette = [
      [210, 180, 160],
      [200, 200, 210],
      [190, 150, 110],
      [170, 160, 190]
    ];
    const base = basePalette[Math.floor(Math.random() * basePalette.length)];
    const accent = accentPalette[Math.floor(Math.random() * accentPalette.length)];
    const patternRoll = Math.random();
    let pattern = 'none';
    if (patternRoll < 0.35) pattern = 'spots';
    else if (patternRoll < 0.55) pattern = 'stripes';
    else if (patternRoll < 0.6) pattern = 'stars';
    const legendary = Math.random() < 0.015;
    return { base, accent, pattern, legendary };
  }

  function mergeGenes(a, b) {
    const base = mixColor(a.base, b.base, 0.5);
    const accent = mixColor(a.accent, b.accent, 0.5);
    const pattern = Math.random() < 0.5 ? a.pattern : b.pattern;
    const mutation = Math.random();
    let finalPattern = pattern;
    if (mutation < 0.08) finalPattern = 'stars';
    else if (mutation < 0.14) finalPattern = 'stripes';
    const legendary = (a.legendary && b.legendary) || (a.legendary || b.legendary ? Math.random() < 0.45 : Math.random() < 0.02);
    return { base, accent, pattern: finalPattern, legendary };
  }

  function makeSheep(data) {
    const genes = data?.genes ?? randomGenes();
    return {
      id: data?.id ?? sheepIdCounter++,
      x: data?.x ?? rand(80, world.width - 80),
      y: data?.y ?? rand(world.grassY + 20, world.height - 60),
      vx: 0,
      vy: 0,
      targetX: rand(80, world.width - 80),
      targetY: rand(world.grassY + 20, world.height - 60),
      targetTimer: rand(1, 3),
      speedBase: rand(18, 28),
      hunger: data?.hunger ?? rand(0.1, 0.7),
      wool: data?.wool ?? rand(0.2, 0.8),
      bob: rand(0, TAU),
      dir: 1,
      size: data?.size ?? rand(18, 22),
      mood: data?.mood ?? 'wander',
      moodTimer: rand(1.2, 3.6),
      care: data?.care ?? rand(0.7, 1),
      tier: data?.tier ?? 1,
      subtype: data?.subtype ?? randomSubtype(),
      genes,
      golden: data?.golden ?? false
    };
  }

  function spawnSheep(count) {
    sheep = [];
    for (let i = 0; i < count; i++) sheep.push(makeSheep());
  }

  function ensureSheepCount() {
    const target = BASE_SHEEP + upgrades.herd;
    while (sheep.length < target) sheep.push(makeSheep());
  }

  function showToast(text) {
    ui.toast.textContent = text;
    ui.toast.classList.add('show');
    setTimeout(() => ui.toast.classList.remove('show'), 900);
  }

  function addFloatText(text, x, y, color) {
    floatTexts.push({ text, x, y, color, life: 1.4 });
  }

  function updateLevel() {
    const newLevel = Math.max(1, Math.floor(score / 10) + 1);
    if (newLevel !== level) {
      level = newLevel;
      showToast(`Уровень ${level}!`);
    }
  }

  function getUpgradeCost(key) {
    const cfg = upgradeConfig[key];
    return Math.ceil(cfg.baseCost * Math.pow(cfg.mult, upgrades[key]));
  }

  function buyUpgrade(key) {
    const cfg = upgradeConfig[key];
    if (upgrades[key] >= cfg.max) {
      showToast('Улучшение уже максимальное');
      return;
    }
    const cost = getUpgradeCost(key);
    if (score < cost) {
      showToast('Недостаточно шерсти');
      return;
    }
    score = Math.max(0, score - cost);
    upgrades[key] += 1;
    if (key === 'herd') ensureSheepCount();
    showToast(`${upgradeConfig[key].name} улучшено!`);
  }

  function updateUpgradeUI() {
    ui.upgWoolLevel.textContent = upgrades.wool;
    ui.upgCalmLevel.textContent = upgrades.calm;
    ui.upgHerdLevel.textContent = upgrades.herd;
    ui.upgInfraLevel.textContent = upgrades.infra;

    const woolCost = getUpgradeCost('wool');
    const calmCost = getUpgradeCost('calm');
    const herdCost = getUpgradeCost('herd');
    const infraCost = getUpgradeCost('infra');

    ui.upgWoolCost.textContent = upgrades.wool >= upgradeConfig.wool.max ? 'MAX' : `-${woolCost}`;
    ui.upgCalmCost.textContent = upgrades.calm >= upgradeConfig.calm.max ? 'MAX' : `-${calmCost}`;
    ui.upgHerdCost.textContent = upgrades.herd >= upgradeConfig.herd.max ? 'MAX' : `-${herdCost}`;
    ui.upgInfraCost.textContent = upgrades.infra >= upgradeConfig.infra.max ? 'MAX' : `-${infraCost}`;

    ui.upgWool.disabled = upgrades.wool >= upgradeConfig.wool.max || score < woolCost;
    ui.upgCalm.disabled = upgrades.calm >= upgradeConfig.calm.max || score < calmCost;
    ui.upgHerd.disabled = upgrades.herd >= upgradeConfig.herd.max || score < herdCost;
    ui.upgInfra.disabled = upgrades.infra >= upgradeConfig.infra.max || score < infraCost;
  }

  function getMaxFences() {
    return BASE_MAX_FENCES + upgrades.infra * INFRA_FENCE_ADD;
  }

  function getMaxFeeders() {
    return BASE_MAX_FEEDERS + upgrades.infra * INFRA_FEEDER_ADD;
  }

  function createQuest() {
    const template = questTemplates[Math.floor(Math.random() * questTemplates.length)];
    const target = Math.floor(rand(template.min, template.max + 1));
    const rewardCoins = Math.floor(rand(template.rewardCoins[0], template.rewardCoins[1] + 1));
    const rewardWool = Math.floor(rand(template.rewardWool[0], template.rewardWool[1] + 1));
    return {
      id: questIdCounter++,
      type: template.type,
      label: template.label,
      target,
      progress: 0,
      rewardCoins,
      rewardWool
    };
  }

  function ensureQuests() {
    while (quests.length < 3) {
      quests.push(createQuest());
    }
  }

  function addQuestProgress(type, amount) {
    for (const quest of quests) {
      if (quest.type !== type) continue;
      quest.progress += amount;
      if (quest.progress >= quest.target) {
        quest.progress = quest.target;
        coins += quest.rewardCoins;
        score += quest.rewardWool;
        showToast(`Задание выполнено: +${quest.rewardCoins} мон., +${quest.rewardWool} шерсти`);
        quests = quests.filter(item => item.id !== quest.id);
        quests.push(createQuest());
      }
    }
  }

  function renderQuests() {
    if (!ui.questList) return;
    ui.questList.innerHTML = quests.map(q => {
      const pct = Math.min(100, Math.round((q.progress / q.target) * 100));
      return `
        <div class="quest">
          <div class="quest-title">${q.label}</div>
          <div class="quest-meta">${q.progress}/${q.target} • +${q.rewardCoins} мон., +${q.rewardWool} шерсти</div>
          <div class="quest-bar"><div class="quest-fill" style="width:${pct}%"></div></div>
        </div>
      `;
    }).join('');
  }

  function applySave(save) {
    if (!save) return;
    score = save.score ?? 0;
    coins = save.coins ?? 0;
    level = save.level ?? 1;
    fences = save.fences ?? [];
    feeders = save.feeders ?? [];
    upgrades = {
      wool: save.upgrades?.wool ?? 0,
      calm: save.upgrades?.calm ?? 0,
      herd: save.upgrades?.herd ?? 0,
      infra: save.upgrades?.infra ?? 0
    };
    ownedLandscapes = save.ownedLandscapes ?? { meadow: true };
    ownedSkins = save.ownedSkins ?? { natural: true };
    selectedLandscape = save.selectedLandscape ?? 'meadow';
    selectedSkin = save.selectedSkin ?? 'natural';
    quests = save.quests ?? [];
    questIdCounter = save.questIdCounter ?? questIdCounter;
    if (save.weather?.type && weatherConfig[save.weather.type]) {
      weather.type = save.weather.type;
      weather.timer = save.weather.timer ?? 20;
    }
    if (save.season?.type && seasonConfig[save.season.type]) {
      season.type = save.season.type;
      season.timer = save.season.timer ?? 40;
    }
    sheep = (save.sheep ?? []).map(item => makeSheep(item));
    if (!sheep.length) spawnSheep(BASE_SHEEP);
    ensureSheepCount();
    ensureQuests();
  }

  function loadSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
  function loadUiState() {
    try {
      const raw = localStorage.getItem(UI_STATE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function saveProgress() {
    const payload = {
      score,
      coins,
      level,
      upgrades,
      weather: {
        type: weather.type,
        timer: weather.timer
      },
      season: {
        type: season.type,
        timer: season.timer
      },
      ownedLandscapes,
      ownedSkins,
      selectedLandscape,
      selectedSkin,
      quests,
      questIdCounter,
      sheep: sheep.map(s => ({
        id: s.id,
        x: s.x,
        y: s.y,
        hunger: s.hunger,
        wool: s.wool,
        size: s.size,
        mood: s.mood,
        care: s.care,
        tier: s.tier,
        subtype: s.subtype,
        genes: s.genes,
        golden: s.golden
      })),
      fences,
      feeders
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
  }
  function saveUiState() {
    try {
      localStorage.setItem(UI_STATE_KEY, JSON.stringify(uiState));
    } catch {
      // noop
    }
  }

  function setCardCollapsed(card, collapsed) {
    if (!card) return;
    card.classList.toggle('collapsed', collapsed);
    const toggle = card.querySelector('.collapse-toggle');
    if (toggle) toggle.setAttribute('aria-expanded', String(!collapsed));
  }

  function initCollapsibles() {
    const saved = loadUiState();
    if (saved?.collapsedSections) {
      uiState.collapsedSections = { ...saved.collapsedSections };
    }

    const cards = Array.from(document.querySelectorAll('.card.collapsible'));
    cards.forEach((card, index) => {
      const key = card.dataset.section || `section-${index}`;
      const toggle = card.querySelector('.collapse-toggle');
      if (!toggle) return;
      const initialCollapsed = !!uiState.collapsedSections[key];
      setCardCollapsed(card, initialCollapsed);
      toggle.addEventListener('click', () => {
        const nextCollapsed = !card.classList.contains('collapsed');
        setCardCollapsed(card, nextCollapsed);
        uiState.collapsedSections[key] = nextCollapsed;
        saveUiState();
      });
    });
  }

  function resetGame(useSave) {
    score = 0;
    coins = 0;
    level = 1;
    fences = [];
    feeders = [];
    upgrades = { wool: 0, calm: 0, herd: 0, infra: 0 };
    ownedLandscapes = { meadow: true };
    ownedSkins = { natural: true };
    selectedLandscape = 'meadow';
    selectedSkin = 'natural';
    quests = [];
    spawnSheep(BASE_SHEEP);
    goldenEvent.active = false;
    goldenEvent.cooldown = rand(14, 22);
    weather.type = 'sunny';
    weather.timer = rand(18, 26);
    season.type = 'spring';
    season.timer = rand(35, 45);
    adTimer = 0;
    if (useSave) applySave(loadSave());
    ensureQuests();
  }

  function enterMenu() {
    state = 'menu';
    ui.menu.classList.add('active');
    ui.pause.classList.remove('active');
    ui.help.classList.remove('active');
    ui.gameOver.classList.remove('active');
    buildMode = 'none';
    updateModeLabel();
  }

  function startGame() {
    if (state === 'running') return;
    ui.menu.classList.remove('active');
    ui.pause.classList.remove('active');
    ui.help.classList.remove('active');
    ui.gameOver.classList.remove('active');
    state = 'running';
  }

  function pauseGame() {
    if (state !== 'running') return;
    state = 'paused';
    ui.pause.classList.add('active');
  }

  function resumeGame() {
    if (state !== 'paused') return;
    state = 'running';
    ui.pause.classList.remove('active');
  }

  function toggleHelp(show) {
    ui.help.classList.toggle('active', show);
  }

  function endGame() {
    state = 'over';
    ui.gameOver.classList.add('active');
  }

  function updateModeLabel() {
    const orientation = fenceOrientation === 'h' ? 'гор.' : 'верт.';
    const map = {
      none: 'Свободно',
      fence: `Ставим забор (${orientation})`,
      feeder: 'Ставим кормушку'
    };
    ui.mode.textContent = map[buildMode] || 'Свободно';
  }

  function toggleFenceOrientation() {
    fenceOrientation = fenceOrientation === 'h' ? 'v' : 'h';
    showToast(fenceOrientation === 'h' ? 'Забор: горизонтально' : 'Забор: вертикально');
    updateModeLabel();
  }

  function placeFence(x, y) {
    if (score < FENCE_COST) {
      showToast('Нужна шерсть для забора');
      return;
    }
    if (fences.length >= getMaxFences()) {
      showToast(`Лимит заборов: ${getMaxFences()}`);
      return;
    }
    score -= FENCE_COST;
    const isHorizontal = fenceOrientation === 'h';
    const w = isHorizontal ? 80 : 16;
    const h = isHorizontal ? 16 : 80;
    fences.push({
      x: clamp(x - w / 2, 20, world.width - w - 20),
      y: clamp(y - h / 2, world.grassY + 10, world.height - h - 20),
      w,
      h
    });
    addQuestProgress('build_fence', 1);
  }

  function placeFenceBrush(x, y) {
    if (!fenceBrush.active || Math.hypot(x - fenceBrush.x, y - fenceBrush.y) >= FENCE_SPACING) {
      placeFence(x, y);
      fenceBrush.active = true;
      fenceBrush.x = x;
      fenceBrush.y = y;
    }
  }

  function placeFeeder(x, y) {
    if (score < FEEDER_COST) {
      showToast('Нужна шерсть для кормушки');
      return;
    }
    if (feeders.length >= getMaxFeeders()) {
      showToast(`Лимит кормушек: ${getMaxFeeders()}`);
      return;
    }
    score -= FEEDER_COST;
    feeders.push({
      x: clamp(x, 60, world.width - 60),
      y: clamp(y, world.grassY + 10, world.height - 50),
      r: 30
    });
    showToast('Кормушка готова');
    addQuestProgress('build_feeder', 1);
  }

  function tierBonus(tier) {
    return 1 + (tier - 1) * 0.7;
  }

  function handleSheepInteract(s) {
    const legendaryBonus = s.genes.legendary ? 1.8 : 1;
    if (s.golden) {
      const reward = Math.round((5 + upgrades.wool) * tierBonus(s.tier) * legendaryBonus);
      score += reward;
      s.golden = false;
      goldenEvent.active = false;
      goldenEvent.cooldown = rand(18, 28);
      addFloatText(`+${reward} золотой шерсти`, s.x, s.y - 20, '#ffd166');
      showToast('Золотая шерсть!');
      updateLevel();
      s.care = clamp(s.care + 0.25, 0, 1);
      addQuestProgress('collect', reward);
      if (s.genes.legendary) addQuestProgress('legendary', 1);
      return;
    }

    if (s.wool >= 1) {
      const reward = Math.round((1 + upgrades.wool) * tierBonus(s.tier) * legendaryBonus);
      score += reward;
      s.wool = 0;
      s.care = clamp(s.care + 0.1, 0, 1);
      addFloatText(`+${reward} шерсть`, s.x, s.y - 20, '#ff8a5c');
      showToast('Шерсть собрана!');
      updateLevel();
      addQuestProgress('collect', reward);
      if (s.genes.legendary) addQuestProgress('legendary', 1);
    } else {
      s.hunger = 0;
      s.care = clamp(s.care + 0.2, 0, 1);
      s.wool = clamp(s.wool + 0.15, 0, 1.2);
      addFloatText('Ням!', s.x, s.y - 20, '#5c7cff');
      addQuestProgress('feed', 1);
    }
  }

  function findSheepAt(x, y) {
    for (const s of sheep) {
      if (Math.hypot(s.x - x, s.y - y) < s.size + 12) return s;
    }
    return null;
  }

  function startDragSheep(s, x, y) {
    drag.active = true;
    drag.sheep = s;
    drag.offsetX = s.x - x;
    drag.offsetY = s.y - y;
    drag.startX = x;
    drag.startY = y;
    drag.wasDragged = false;
  }

  function updateDragSheep(x, y) {
    if (!drag.active || !drag.sheep) return;
    const dx = x - drag.startX;
    const dy = y - drag.startY;
    if (!drag.wasDragged && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
      drag.wasDragged = true;
    }
    if (drag.wasDragged) {
      drag.sheep.x = clamp(x + drag.offsetX, 50, world.width - 50);
      drag.sheep.y = clamp(y + drag.offsetY, world.grassY + 10, world.height - 40);
      drag.sheep.vx = 0;
      drag.sheep.vy = 0;
      drag.sheep.targetTimer = 0;
    }
  }

  function tryMergeSheep(dragged, target) {
    if (!dragged || !target || dragged === target) return false;
    if (dragged.tier !== target.tier) {
      showToast('Нужен одинаковый уровень');
      return false;
    }
    if (dragged.tier >= MAX_TIER) {
      showToast('Максимальная эволюция');
      return false;
    }

    target.tier += 1;
    target.size += 3.5;
    target.care = clamp(target.care + 0.2, 0, 1);
    target.wool = clamp(target.wool + 0.4, 0, 1.3);
    target.genes = mergeGenes(dragged.genes, target.genes);
    target.subtype = mergeSubtype(dragged.subtype, target.subtype);

    addFloatText('Эволюция!', target.x, target.y - 24, '#7c5cff');
    showToast('Овцы объединились!');
    addQuestProgress('merge', 1);

    sheep = sheep.filter(s => s !== dragged);
    return true;
  }

  function endDragSheep() {
    if (!drag.active) return;
    const s = drag.sheep;
    if (s && drag.wasDragged) {
      const target = sheep.find(other => other !== s && Math.hypot(other.x - s.x, other.y - s.y) < other.size + s.size);
      if (!tryMergeSheep(s, target)) {
        addFloatText('Бее!', s.x, s.y - 20, '#ffd166');
      }
    } else if (s && !drag.wasDragged) {
      handleSheepInteract(s);
    }
    drag.active = false;
    drag.sheep = null;
  }

  function handlePointerDown(x, y) {
    if (state !== 'running') return;

    if (buildMode === 'fence') {
      placeFenceBrush(x, y);
      return;
    }
    if (buildMode === 'feeder') {
      placeFeeder(x, y);
      buildMode = 'none';
      updateModeLabel();
      return;
    }

    const found = findSheepAt(x, y);
    if (found) {
      startDragSheep(found, x, y);
    }
  }

  function triggerWhistle() {
    if (state !== 'running') return;
    lure.active = true;
    lure.time = 3.5;
    lure.x = pointer.x || world.width * 0.5;
    lure.y = clamp(pointer.y || world.grassY + 30, world.grassY + 20, world.height - 50);
    showToast('Свисток!');
  }

  function claimAdReward() {
    if (adTimer > 0) return;
    coins += 2;
    score += 3;
    adTimer = AD_COOLDOWN;
    showToast('Бонус за рекламу! +2 мон., +3 шерсти');
  }

  function updateGoldenEvent(dt) {
    if (!sheep.length) return;
    if (!goldenEvent.active) {
      goldenEvent.cooldown -= dt;
      if (goldenEvent.cooldown <= 0) {
        const candidate = sheep[Math.floor(Math.random() * sheep.length)];
        candidate.golden = true;
        goldenEvent.active = true;
        goldenEvent.sheepId = candidate.id;
        goldenEvent.timer = 6;
        showToast('Золотая овца на лугу!');
      }
      return;
    }

    goldenEvent.timer -= dt;
    if (goldenEvent.timer <= 0) {
      const target = sheep.find(s => s.id === goldenEvent.sheepId);
      if (target) target.golden = false;
      goldenEvent.active = false;
      goldenEvent.cooldown = rand(18, 28);
    }
  }

  function updateWeather(dt) {
    weather.timer -= dt;
    if (weather.timer <= 0) {
      const options = Object.keys(weatherConfig).filter(key => key !== weather.type);
      weather.type = options[Math.floor(Math.random() * options.length)];
      weather.timer = rand(18, 28);
      showToast(`Погода: ${weatherConfig[weather.type].label}`);
    }
  }

  function updateSeason(dt) {
    season.timer -= dt;
    if (season.timer <= 0) {
      const options = Object.keys(seasonConfig).filter(key => key !== season.type);
      season.type = options[Math.floor(Math.random() * options.length)];
      season.timer = rand(35, 45);
      showToast(`Сезон: ${seasonConfig[season.type].label}`);
    }
  }

  function updateClouds(dt) {
    const cloudSpeed = weatherConfig[weather.type].cloud || 1;
    for (const c of clouds) {
      c.x += c.speed * dt * cloudSpeed;
      if (c.x - c.size > world.width + 60) {
        c.x = -c.size - 60;
        c.y = rand(40, world.grassY - 120);
      }
    }
  }

  function updateSheep(dt) {
    const hungerMultiplier = Math.max(0.4, 1 - upgrades.calm * 0.08) * (weatherConfig[weather.type].hunger || 1) * (seasonConfig[season.type].hunger || 1);
    const woolMultiplier = (1 + upgrades.wool * 0.08) * (weatherConfig[weather.type].wool || 1) * (seasonConfig[season.type].wool || 1);
    const careMultiplier = seasonConfig[season.type].care || 1;

    for (const s of sheep) {
      const subtype = subtypeConfig[s.subtype];
      if (drag.active && drag.sheep === s && drag.wasDragged) {
        s.bob += dt * 2;
        continue;
      }

      s.moodTimer -= dt;
      if (s.moodTimer <= 0) {
        s.mood = pickMood(s);
        s.moodTimer = rand(1.4, 3.6);
      }

      s.targetTimer -= dt;
      if (s.targetTimer <= 0 || Math.hypot(s.x - s.targetX, s.y - s.targetY) < 12) {
        s.targetX = rand(60, world.width - 60);
        s.targetY = rand(world.grassY + 20, world.height - 60);
        s.targetTimer = rand(1.6, 3.2);
      }

      let targetX = s.targetX;
      let targetY = s.targetY;
      let moodSpeed = 1;

      if (s.mood === 'rest') moodSpeed = 0.2;
      if (s.mood === 'graze') moodSpeed = 0.5;
      if (s.mood === 'hop') moodSpeed = 1.6;
      if (s.mood === 'seek') moodSpeed = 1.1;

      if (s.hunger > 1 && feeders.length) {
        let nearest = feeders[0];
        let best = Infinity;
        for (const feeder of feeders) {
          const d = Math.hypot(s.x - feeder.x, s.y - feeder.y);
          if (d < best) {
            best = d;
            nearest = feeder;
          }
        }
        targetX = nearest.x;
        targetY = nearest.y;
        moodSpeed = Math.max(moodSpeed, 1.1);
      }

      if (lure.active) {
        const dxL = lure.x - s.x;
        const dyL = lure.y - s.y;
        const distL = Math.hypot(dxL, dyL);
        if (distL < 260) {
          targetX = lure.x;
          targetY = lure.y;
          moodSpeed = Math.max(moodSpeed, 1.2);
        }
      }

      let steerX = 0;
      let steerY = 0;
      for (const other of sheep) {
        if (other === s) continue;
        const d = Math.hypot(s.x - other.x, s.y - other.y);
        if (d < 48) {
          steerX += (s.x - other.x) / (d || 1);
          steerY += (s.y - other.y) / (d || 1);
        }
      }

      const dx = targetX - s.x + steerX * 12;
      const dy = targetY - s.y + steerY * 12;
      const dist = Math.hypot(dx, dy) || 1;

      const hungerBoost = s.hunger > 1 ? 1.25 : 1;
      const legendarySpeed = s.genes.legendary ? 1.1 : 1;
      const speed = s.speedBase * (1 + level * 0.08) * hungerBoost * moodSpeed * legendarySpeed * subtype.speed;
      s.vx = (dx / dist) * speed;
      s.vy = (dy / dist) * speed;
      s.dir = s.vx >= 0 ? 1 : -1;

      s.x += s.vx * dt;
      s.y += s.vy * dt;

      s.x = clamp(s.x, 50, world.width - 50);
      s.y = clamp(s.y, world.grassY + 10, world.height - 40);

      for (const f of fences) {
        if (s.x + s.size > f.x && s.x - s.size < f.x + f.w && s.y + s.size > f.y && s.y - s.size < f.y + f.h) {
          s.vx *= -0.6;
          s.vy *= -0.6;
          s.x += s.vx * dt * 6;
          s.y += s.vy * dt * 6;
        }
      }

      let feederNearby = false;
      for (const feeder of feeders) {
        if (Math.hypot(s.x - feeder.x, s.y - feeder.y) < feeder.r + 10) {
          s.hunger = clamp(s.hunger - dt * 0.35 * (1 + upgrades.calm * 0.05), 0, 2);
          feederNearby = true;
        }
      }

      s.hunger = clamp(s.hunger + dt * 0.03 * (1 + level * 0.04) * hungerMultiplier * subtype.hunger, 0, 2);
      const woolBoost = s.hunger < 1 ? 1.3 : 0.7;
      const restBonus = s.mood === 'rest' ? 1.2 : 1;
      const tierBoost = 1 + (s.tier - 1) * 0.35;
      const legendaryWool = s.genes.legendary ? 1.4 : 1;
      s.wool = clamp(s.wool + dt * 0.012 * woolBoost * woolMultiplier * restBonus * tierBoost * legendaryWool * subtype.wool, 0, 1.3);

      const badWeather = weather.type === 'rainy' ? 0.02 : 0;
      const stress = s.hunger > 1.4 ? 0.05 : 0.015;
      const careDelta = feederNearby ? 0.03 : (s.hunger > 1 ? -stress - badWeather : 0.01);
      s.care = clamp(s.care + careDelta * dt * careMultiplier * subtype.care, 0, 1);

      s.bob += dt * (s.mood === 'hop' || s.subtype === 'playful' ? 7 : 4.2);
    }

    for (const s of [...sheep]) {
      if (s.care <= 0) {
        sheep = sheep.filter(item => item !== s);
        addFloatText('Овца ушла', s.x, s.y - 24, '#ff5c8a');
        showToast('Овца ушла из-за голода');
      }
    }

    if (sheep.length === 0 && state === 'running') {
      endGame();
    }
  }

  function updateFloatTexts(dt) {
    floatTexts = floatTexts.filter(t => {
      t.life -= dt;
      t.y -= dt * 18;
      return t.life > 0;
    });
  }

  function updateLure(dt) {
    if (!lure.active) return;
    lure.time -= dt;
    if (lure.time <= 0) lure.active = false;
  }

  function updateRain(dt) {
    if (!weatherConfig[weather.type].rain) return;
    for (const drop of rainDrops) {
      drop.y += drop.speed * dt;
      drop.x += 30 * dt;
      if (drop.y > world.height) {
        drop.y = -20;
        drop.x = Math.random() * world.width;
      }
    }
  }

  function updateLeaves(dt) {
    if (!seasonConfig[season.type].leaves) return;
    for (const leaf of leafParticles) {
      leaf.y += leaf.speed * dt;
      leaf.x += Math.sin(leaf.y * 0.02) * leaf.drift * dt;
      if (leaf.y > world.height) {
        leaf.y = -20;
        leaf.x = Math.random() * world.width;
      }
    }
  }

  function updateSnow(dt) {
    if (!seasonConfig[season.type].snow) return;
    for (const snow of snowParticles) {
      snow.y += snow.speed * dt;
      snow.x += Math.sin(snow.y * 0.03) * 12 * dt;
      if (snow.y > world.height) {
        snow.y = -20;
        snow.x = Math.random() * world.width;
      }
    }
  }

  function updateAdTimer(dt) {
    if (adTimer > 0) adTimer = Math.max(0, adTimer - dt);
  }

  function drawBackground() {
    const landscape = landscapeConfig[selectedLandscape] || landscapeConfig.meadow;
    const weatherPalette = weatherConfig[weather.type];
    const seasonTint = seasonConfig[season.type].tint;

    let skyTop = mixColor(landscape.skyTop, hexToRgb(weatherPalette.skyTop), 0.35);
    let skyMid = mixColor(landscape.skyMid, hexToRgb(weatherPalette.skyMid), 0.35);
    let skyBottom = mixColor(landscape.skyBottom, hexToRgb(weatherPalette.skyBottom), 0.35);
    let grassTop = mixColor(landscape.grassTop, hexToRgb(weatherPalette.grassTop), 0.35);
    let grassBottom = mixColor(landscape.grassBottom, hexToRgb(weatherPalette.grassBottom), 0.35);

    skyTop = applySeasonTint(skyTop, seasonTint);
    skyMid = applySeasonTint(skyMid, seasonTint);
    skyBottom = applySeasonTint(skyBottom, seasonTint);
    grassTop = applySeasonTint(grassTop, seasonTint);
    grassBottom = applySeasonTint(grassBottom, seasonTint);

    const skyGradient = ctx.createLinearGradient(0, 0, 0, world.height);
    skyGradient.addColorStop(0, toRgb(skyTop));
    skyGradient.addColorStop(0.6, toRgb(skyMid));
    skyGradient.addColorStop(1, toRgb(skyBottom));
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, world.width, world.height);

    for (const c of clouds) drawCloud(c);

    const grassGradient = ctx.createLinearGradient(0, world.grassY, 0, world.height);
    grassGradient.addColorStop(0, toRgb(grassTop));
    grassGradient.addColorStop(1, toRgb(grassBottom));
    ctx.fillStyle = grassGradient;
    ctx.fillRect(0, world.grassY, world.width, world.height - world.grassY);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    for (let i = 0; i < 40; i++) {
      const x = (i * 97 + (world.width % 97)) % world.width;
      const y = world.grassY + 20 + (i * 37) % (world.height - world.grassY - 30);
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, TAU);
      ctx.fill();
    }

    if (lure.active) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 209, 102, 0.6)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(lure.x, lure.y, 22 + Math.sin(Date.now() * 0.008) * 4, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }

    if (weatherPalette.rain) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 2;
      for (const drop of rainDrops) {
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x + 6, drop.y + 12);
        ctx.stroke();
      }
      ctx.restore();
    }

    if (weatherPalette.dusk) {
      ctx.save();
      ctx.fillStyle = 'rgba(40, 50, 90, 0.18)';
      ctx.fillRect(0, 0, world.width, world.height);
      ctx.restore();
    }

    if (seasonConfig[season.type].leaves) {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 190, 90, 0.7)';
      for (const leaf of leafParticles) {
        ctx.beginPath();
        ctx.ellipse(leaf.x, leaf.y, 4, 2, leaf.y * 0.01, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }

    if (seasonConfig[season.type].snow) {
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      for (const snow of snowParticles) {
        ctx.beginPath();
        ctx.arc(snow.x, snow.y, 2.5, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function drawCloud(c) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, c.size * 0.5, c.size * 0.28, 0, 0, TAU);
    ctx.ellipse(c.x - c.size * 0.25, c.y + 5, c.size * 0.35, c.size * 0.22, 0, 0, TAU);
    ctx.ellipse(c.x + c.size * 0.25, c.y + 8, c.size * 0.4, c.size * 0.24, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  function drawFence(f) {
    ctx.save();
    ctx.fillStyle = '#d9a66f';
    ctx.fillRect(f.x, f.y, f.w, f.h);
    ctx.fillStyle = '#c78e58';
    if (f.w >= f.h) {
      ctx.fillRect(f.x + 8, f.y - 12, 8, f.h + 16);
      ctx.fillRect(f.x + f.w - 16, f.y - 12, 8, f.h + 16);
    } else {
      ctx.fillRect(f.x - 12, f.y + 8, f.w + 16, 8);
      ctx.fillRect(f.x - 12, f.y + f.h - 16, f.w + 16, 8);
    }
    ctx.restore();
  }

  function drawFeeder(feeder) {
    ctx.save();
    ctx.fillStyle = '#e2a86d';
    ctx.fillRect(feeder.x - 38, feeder.y - 14, 76, 28);
    ctx.fillStyle = '#c7834f';
    ctx.fillRect(feeder.x - 32, feeder.y - 10, 64, 20);

    ctx.fillStyle = '#b36b3f';
    ctx.fillRect(feeder.x - 32, feeder.y + 12, 10, 18);
    ctx.fillRect(feeder.x + 22, feeder.y + 12, 10, 18);

    ctx.fillStyle = '#ffd166';
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.arc(feeder.x - 24 + i * 7, feeder.y - 4 + Math.sin(i) * 2, 3.2, 0, TAU);
      ctx.fill();
    }

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(feeder.x - 38, feeder.y - 14, 76, 28);
    ctx.restore();
  }

  function drawSheep(s) {
    const bob = Math.sin(s.bob) * 2;
    const woolReady = s.wool >= 1;
    const skin = shop.skins.find(item => item.id === selectedSkin);
    const tint = skin?.tint || null;
    const baseColor = applyTint(s.genes.base, tint, 0.25);
    const accentColor = applyTint(s.genes.accent, tint, 0.2);
    const subtype = subtypeConfig[s.subtype];

    ctx.save();
    ctx.translate(s.x, s.y + bob);
    ctx.scale(s.dir, 1);

    if (s.golden || s.genes.legendary) {
      ctx.fillStyle = 'rgba(255, 209, 102, 0.35)';
      ctx.beginPath();
      ctx.arc(0, 0, s.size * 1.6, 0, TAU);
      ctx.fill();
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.beginPath();
    ctx.ellipse(0, s.size + 8, s.size * 0.9, s.size * 0.35, 0, 0, TAU);
    ctx.fill();

    ctx.fillStyle = s.genes.legendary ? '#fff2c2' : toRgb(baseColor);
    ctx.beginPath();
    ctx.arc(0, 0, s.size, 0, TAU);
    ctx.fill();

    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * TAU;
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * s.size * 0.9, Math.sin(angle) * s.size * 0.6, s.size * 0.5, 0, TAU);
      ctx.fill();
    }

    drawPattern(s, accentColor);

    ctx.fillStyle = '#2f2f35';
    ctx.beginPath();
    ctx.ellipse(s.size * 0.9, 4, s.size * 0.55, s.size * 0.4, 0, 0, TAU);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(s.size * 0.95, -2, 3, 0, TAU);
    ctx.arc(s.size * 1.1, -2, 3, 0, TAU);
    ctx.fill();

    ctx.fillStyle = '#2f2f35';
    ctx.beginPath();
    ctx.arc(s.size * 0.95, -2, 1.2, 0, TAU);
    ctx.arc(s.size * 1.1, -2, 1.2, 0, TAU);
    ctx.fill();

    ctx.strokeStyle = '#2f2f35';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const mouthY = s.hunger > 1 ? 8 : 6;
    ctx.moveTo(s.size * 0.95, mouthY);
    ctx.lineTo(s.size * 1.1, mouthY);
    ctx.stroke();

    ctx.strokeStyle = '#4b4b55';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-8, s.size * 0.8);
    ctx.lineTo(-8, s.size * 1.4);
    ctx.moveTo(4, s.size * 0.8);
    ctx.lineTo(4, s.size * 1.4);
    ctx.stroke();

    if (woolReady) {
      ctx.fillStyle = '#ffd166';
      ctx.beginPath();
      ctx.arc(-s.size * 0.3, -s.size * 0.9, 4, 0, TAU);
      ctx.arc(s.size * 0.2, -s.size * 0.85, 3, 0, TAU);
      ctx.fill();
    }

    if (s.tier > 1) {
      ctx.fillStyle = '#7c5cff';
      ctx.font = 'bold 11px Trebuchet MS';
      ctx.fillText(TIER_LABELS[s.tier - 1], -s.size * 0.6, -s.size * 1.25);
    }

    if (subtype) {
      ctx.fillStyle = subtype.color;
      ctx.beginPath();
      ctx.arc(-s.size * 0.7, -s.size * 0.1, 4, 0, TAU);
      ctx.fill();
    }

    if (s.mood === 'rest') {
      ctx.fillStyle = '#5c7cff';
      ctx.font = 'bold 12px Trebuchet MS';
      ctx.fillText('Z', -s.size * 0.8, -s.size * 1.4);
    }

    ctx.restore();
  }

  function drawPattern(s, accentColor) {
    const pattern = s.genes.pattern;
    if (pattern === 'none') return;
    ctx.save();
    ctx.fillStyle = toRgb(accentColor);
    if (pattern === 'spots') {
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(-s.size * 0.4 + i * 6, -s.size * 0.2 + (i % 2) * 6, 3.5, 0, TAU);
        ctx.fill();
      }
    } else if (pattern === 'stripes') {
      ctx.globalAlpha = 0.7;
      ctx.fillRect(-s.size * 0.6, -s.size * 0.2, s.size * 1.2, 3);
      ctx.fillRect(-s.size * 0.6, 0, s.size * 1.2, 3);
      ctx.fillRect(-s.size * 0.6, s.size * 0.2, s.size * 1.2, 3);
    } else if (pattern === 'stars') {
      ctx.fillStyle = '#ffd166';
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(-s.size * 0.4 + i * 6, -s.size * 0.35 + i * 4, 3.2, 0, TAU);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function drawFloatTexts() {
    for (const t of floatTexts) {
      ctx.save();
      ctx.globalAlpha = clamp(t.life / 1.2, 0, 1);
      ctx.fillStyle = t.color;
      ctx.font = 'bold 16px Trebuchet MS';
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    }
  }

  function drawBuildPreview() {
    if (state !== 'running') return;
    if (buildMode === 'none') return;
    ctx.save();
    ctx.globalAlpha = 0.55;
    if (buildMode === 'fence') {
      const isHorizontal = fenceOrientation === 'h';
      const w = isHorizontal ? 80 : 16;
      const h = isHorizontal ? 16 : 80;
      drawFence({ x: pointer.x - w / 2, y: pointer.y - h / 2, w, h });
    }
    if (buildMode === 'feeder') {
      drawFeeder({ x: pointer.x, y: pointer.y, r: 30 });
    }
    ctx.restore();
  }

  function render() {
    drawBackground();

    for (const f of fences) drawFence(f);
    for (const feeder of feeders) drawFeeder(feeder);
    for (const s of sheep) drawSheep(s);
    drawFloatTexts();
    drawBuildPreview();
  }

  function update(dt) {
    if (state !== 'running') return;

    updateSeason(dt);
    updateWeather(dt);
    updateClouds(dt);
    updateSheep(dt);
    updateFloatTexts(dt);
    updateLure(dt);
    updateGoldenEvent(dt);
    updateRain(dt);
    updateLeaves(dt);
    updateSnow(dt);
    updateAdTimer(dt);

    saveTimer += dt;
    if (saveTimer > 5) {
      saveTimer = 0;
      saveProgress();
    }
  }

  function loop(ts) {
    const dt = Math.min(0.033, (ts - lastTime) / 1000 || 0);
    lastTime = ts;
    update(dt);
    render();

    ui.sheepCount.textContent = sheep.length;
    ui.level.textContent = level;
    ui.wool.textContent = score;
    ui.coins.textContent = coins;
    ui.shopCoins.textContent = coins;
    ui.weatherLabel.textContent = weatherConfig[weather.type].label;
    ui.seasonLabel.textContent = seasonConfig[season.type].label;
    updateUpgradeUI();
    updateShopUI();
    renderQuests();

    const avgCare = sheep.length
      ? sheep.reduce((sum, s) => sum + s.care, 0) / sheep.length
      : 0;
    ui.care.textContent = `${Math.round(avgCare * 100)}%`;

    if (avgCare < 0.35 && state === 'running') {
      careWarningTimer -= dt;
      if (careWarningTimer <= 0) {
        showToast('Овцы грустят, им нужна забота');
        careWarningTimer = 6;
      }
    }

    if (ui.adBtn) {
      if (adTimer > 0) {
        ui.adBtn.disabled = true;
        ui.adBtn.textContent = `Реклама (${Math.ceil(adTimer)}с)`;
      } else {
        ui.adBtn.disabled = false;
        ui.adBtn.textContent = 'Реклама + бонус';
      }
    }

    requestAnimationFrame(loop);
  }

  function updateShopUI() {
    ui.exchangeBtn.disabled = score < EXCHANGE_RATE;
    updateShopItem(ui.landMeadow, 'landscape', 'meadow');
    updateShopItem(ui.landLavender, 'landscape', 'lavender');
    updateShopItem(ui.landSunset, 'landscape', 'sunset');
    updateShopItem(ui.landWinter, 'landscape', 'winter');
    updateShopItem(ui.skinNatural, 'skin', 'natural');
    updateShopItem(ui.skinSky, 'skin', 'sky');
    updateShopItem(ui.skinRose, 'skin', 'rose');
    updateShopItem(ui.skinCaramel, 'skin', 'caramel');
  }

  function updateShopItem(button, type, id) {
    const config = type === 'landscape'
      ? shop.landscapes.find(item => item.id === id)
      : shop.skins.find(item => item.id === id);
    const owned = type === 'landscape' ? ownedLandscapes[id] : ownedSkins[id];
    const selected = type === 'landscape' ? selectedLandscape === id : selectedSkin === id;

    button.classList.toggle('active', selected);
    if (owned) {
      button.disabled = selected;
      button.textContent = selected ? `${configLabel(type, id)} (выбрано)` : `${configLabel(type, id)} (выбрать)`;
    } else {
      button.disabled = coins < config.cost;
      button.textContent = `${configLabel(type, id)} (${config.cost})`;
    }
  }

  function configLabel(type, id) {
    if (type === 'landscape') return landscapeConfig[id]?.label || id;
    const names = {
      natural: 'Натуральный',
      sky: 'Небесный',
      rose: 'Розовый',
      caramel: 'Карамельный'
    };
    return names[id] || id;
  }

  function buyLandscape(id) {
    const item = shop.landscapes.find(entry => entry.id === id);
    if (!item) return;
    if (!ownedLandscapes[id]) {
      if (coins < item.cost) {
        showToast('Недостаточно монет');
        return;
      }
      coins -= item.cost;
      ownedLandscapes[id] = true;
      showToast('Ландшафт куплен!');
    }
    selectedLandscape = id;
  }

  function buySkin(id) {
    const item = shop.skins.find(entry => entry.id === id);
    if (!item) return;
    if (!ownedSkins[id]) {
      if (coins < item.cost) {
        showToast('Недостаточно монет');
        return;
      }
      coins -= item.cost;
      ownedSkins[id] = true;
      showToast('Скин куплен!');
    }
    selectedSkin = id;
  }

  function exchangeWool() {
    if (score < EXCHANGE_RATE) return;
    score -= EXCHANGE_RATE;
    coins += 1;
    showToast('+1 монета');
  }

  function bindEvents() {
    window.addEventListener('resize', () => {
      resize();
      createClouds();
    });

    canvas.addEventListener('pointerdown', (event) => {
      pointer.active = true;
      pointer.x = event.offsetX;
      pointer.y = event.offsetY;
      fenceBrush.active = false;
      handlePointerDown(pointer.x, pointer.y);
    });

    canvas.addEventListener('pointermove', (event) => {
      pointer.x = event.offsetX;
      pointer.y = event.offsetY;
      if (pointer.active && buildMode === 'fence') {
        placeFenceBrush(pointer.x, pointer.y);
      }
      updateDragSheep(pointer.x, pointer.y);
    });

    canvas.addEventListener('pointerup', () => {
      pointer.active = false;
      fenceBrush.active = false;
      endDragSheep();
    });

    canvas.addEventListener('pointerleave', () => {
      pointer.active = false;
      fenceBrush.active = false;
      endDragSheep();
    });

    ui.startBtn.addEventListener('click', () => {
      resetGame(true);
      startGame();
    });

    ui.resumeBtn.addEventListener('click', resumeGame);
    ui.pauseBtn.addEventListener('click', () => (state === 'running' ? pauseGame() : resumeGame()));

    ui.restartBtn.addEventListener('click', () => {
      resetGame(false);
      startGame();
    });

    ui.gameOverRestart.addEventListener('click', () => {
      resetGame(false);
      startGame();
    });

    ui.gameOverMenu.addEventListener('click', () => {
      saveProgress();
      enterMenu();
    });

    ui.menuBtn.addEventListener('click', () => {
      saveProgress();
      enterMenu();
    });

    ui.buildFence.addEventListener('click', () => {
      buildMode = buildMode === 'fence' ? 'none' : 'fence';
      updateModeLabel();
    });

    ui.rotateFence.addEventListener('click', toggleFenceOrientation);

    ui.buildFeeder.addEventListener('click', () => {
      buildMode = buildMode === 'feeder' ? 'none' : 'feeder';
      updateModeLabel();
    });

    ui.whistleBtn.addEventListener('click', triggerWhistle);
    ui.adBtn.addEventListener('click', claimAdReward);
    ui.helpBtn.addEventListener('click', () => toggleHelp(true));
    ui.helpClose.addEventListener('click', () => toggleHelp(false));

    ui.upgWool.addEventListener('click', () => buyUpgrade('wool'));
    ui.upgCalm.addEventListener('click', () => buyUpgrade('calm'));
    ui.upgHerd.addEventListener('click', () => buyUpgrade('herd'));
    ui.upgInfra.addEventListener('click', () => buyUpgrade('infra'));

    ui.exchangeBtn.addEventListener('click', exchangeWool);
    ui.landMeadow.addEventListener('click', () => buyLandscape('meadow'));
    ui.landLavender.addEventListener('click', () => buyLandscape('lavender'));
    ui.landSunset.addEventListener('click', () => buyLandscape('sunset'));
    ui.landWinter.addEventListener('click', () => buyLandscape('winter'));

    ui.skinNatural.addEventListener('click', () => buySkin('natural'));
    ui.skinSky.addEventListener('click', () => buySkin('sky'));
    ui.skinRose.addEventListener('click', () => buySkin('rose'));
    ui.skinCaramel.addEventListener('click', () => buySkin('caramel'));

    window.addEventListener('keydown', (event) => {
      if (event.code === 'KeyP') {
        state === 'running' ? pauseGame() : resumeGame();
      }
      if (event.code === 'Escape') {
        enterMenu();
      }
      if (event.code === 'KeyR') {
        toggleFenceOrientation();
      }
      if (event.code === 'KeyC') {
        triggerWhistle();
      }
      if (event.code === 'Slash') {
        toggleHelp(true);
      }
    });

    window.addEventListener('beforeunload', saveProgress);
  }

  function showSavedInfo() {
    const save = loadSave();
    if (!save) {
      ui.bestInfo.textContent = 'Прогресса пока нет. Начните новую игру!';
      return;
    }
    const savedUpgrades = save.upgrades ?? { wool: 0, calm: 0, herd: 0, infra: 0 };
    ui.bestInfo.textContent = `Сохранено: шерсть ${save.score ?? 0}, уровень ${save.level ?? 1}, улучшения ${savedUpgrades.wool + savedUpgrades.calm + savedUpgrades.herd + savedUpgrades.infra}, монеты ${save.coins ?? 0}.`;
  }

  function init() {
    resize();
    createClouds();
    spawnSheep(BASE_SHEEP);
    ensureQuests();
    showSavedInfo();
    updateModeLabel();
    bindEvents();
    initCollapsibles();
    requestAnimationFrame(loop);
  }

  init();
})();





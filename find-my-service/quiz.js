/* FIND MY SERVICE — Quiz Logic (deferred) */

const SERVICES = {
  wifi: {
    name: 'Wi-Fi & Network Setup',
    bookingValue: 'Wi-Fi & Network',
    priceRange: '$39 – $120',
    icon: 'wifi',
    duration: 'Usually 1–2 hours',
    summary: "We'll figure out what's going on with your internet or Wi-Fi, fix the issue, and make sure every device in the house connects reliably before we leave.",
    includes: [
      'Test current speeds and signal strength',
      'Identify the source of the problem',
      'Fix or recommend the right solution',
      'Confirm everything works on your devices',
      'Walk you through how to handle common issues yourself'
    ]
  },
  computer: {
    name: 'Computer Setup & Cleanup',
    bookingValue: 'Computer Setup or Cleanup',
    priceRange: '$49 – $89',
    icon: 'computer',
    duration: 'Usually 1–2 hours',
    summary: "We'll get your computer running the way it should — whether it's a brand-new machine that needs setting up or an old one that's slowed down.",
    includes: [
      'Full diagnostic of your computer',
      'Clean up startup, junk files, and bloatware',
      'Install updates and important software',
      'Transfer files from old to new (if needed)',
      'Show you how to keep it running smoothly'
    ]
  },
  smarthome: {
    name: 'Smart Home Device Setup',
    bookingValue: 'Smart Home Devices (Alexa, Google Home, etc.)',
    priceRange: '$49 – $99',
    icon: 'smarthome',
    duration: 'Usually 30 min – 1 hour',
    summary: "We'll set up your smart devices, link them to your phone or voice assistant, and make sure they actually work the way they're supposed to.",
    includes: [
      'Pair device(s) to your Wi-Fi',
      'Link to your Amazon, Google, or Apple account',
      'Configure app, schedules, and notifications',
      'Test voice commands and routines',
      'Show you how to add more devices later'
    ]
  },
  tv: {
    name: 'Smart TV & Streaming Setup',
    bookingValue: 'Smart TV or Streaming',
    priceRange: '$39 – $79',
    icon: 'tv',
    duration: 'Usually 45 min – 1 hour',
    summary: "We'll get your TV, streaming device, or cord-cutting setup configured properly — apps installed, accounts logged in, everything working from the remote.",
    includes: [
      'Connect TV or streaming device to Wi-Fi',
      'Install and log into your streaming apps',
      'Set up remote, inputs, and on-screen menus',
      'Walk you through how to use everything',
      'Cord-cutting consult if you want to drop cable'
    ]
  },
  printer: {
    name: 'Printer Setup & Troubleshooting',
    bookingValue: 'Printer Troubleshooting & Repair',
    priceRange: '$59',
    icon: 'printer',
    duration: 'Usually 30 min – 1 hour',
    summary: "We'll get your printer working — whether it's a setup, a stubborn connection issue, or print quality problems, we'll diagnose and fix it.",
    includes: [
      'Connect printer to Wi-Fi or computer',
      'Install drivers and apps',
      'Fix offline errors, connection drops, or quality issues',
      'Run test prints from your phone and computer',
      'Show you how to troubleshoot common issues'
    ]
  },
  camera: {
    name: 'Security Camera & Doorbell Setup',
    bookingValue: 'Security Camera / Doorbells',
    priceRange: '$69 – $179',
    icon: 'camera',
    duration: 'Usually 1–2 hours',
    summary: "We'll mount and configure your cameras or doorbell — connected to your Wi-Fi, sending alerts to your phone, and ready to go from day one.",
    includes: [
      'Mount cameras securely with proper placement',
      'Connect each camera to your Wi-Fi',
      'Configure motion zones and phone alerts',
      'Set up app access and recording',
      'Show you how to view footage and manage settings'
    ]
  },
  newsetup: {
    name: 'New Tech Setup',
    bookingValue: 'Other',
    priceRange: 'Depends on what you got',
    icon: 'newsetup',
    duration: 'Usually 1–2 hours',
    summary: "Brand-new device? We'll handle the full setup — out of the box, through configuration, and ready to use. Tell us what you've got and we'll quote it before we come out.",
    includes: [
      'Unbox and inspect the device',
      'Complete initial setup and configuration',
      'Connect to Wi-Fi and your accounts',
      'Install any apps or software you need',
      'Walk you through how to use it'
    ]
  },
  unsure: {
    name: "Let's figure it out together",
    bookingValue: 'Other',
    priceRange: "We'll quote it before we come out",
    icon: 'unsure',
    duration: 'Phone consult $15 (credited toward booking)',
    summary: "Not sure exactly what you need? That's okay — book a quick phone consultation and we'll figure out the right service and price together before scheduling anything.",
    includes: [
      "15–30 minute phone consultation",
      "We'll review what's going on with your tech",
      "Confirm which service fits best",
      "Give you a flat-rate quote before we come out",
      "Consultation fee credited toward your booking if you proceed"
    ]
  }
};

const QUIZ = {
  q1: {
    title: "What's going on?",
    sub: "Pick whichever sounds closest to what you're dealing with.",
    options: [
      { label: "My Wi-Fi or internet isn't working right", desc: "Slow, drops, won't connect", icon: 'wifi', next: 'q2_wifi' },
      { label: "My computer is having issues", desc: "Slow, frozen, popups, or new setup", icon: 'computer', next: 'q2_computer' },
      { label: "I need help with a smart home device", desc: "Alexa, Google Home, smart bulbs, thermostat", icon: 'smarthome', next: 'q2_smarthome' },
      { label: "My TV or streaming isn't working", desc: "Apps, Roku, Fire TV, cord-cutting", icon: 'tv', next: 'q2_tv' },
      { label: "My printer won't work", desc: "Won't print, offline, setup issues", icon: 'printer', result: 'printer' },
      { label: "I want security cameras or a doorbell", desc: "Ring, Blink, Nest, Wyze, Eufy", icon: 'camera', next: 'q2_camera' },
      { label: "I bought something new and need it set up", desc: "Out-of-the-box setup for any tech", icon: 'newsetup', result: 'newsetup' },
      { label: "Not sure — I just need help", desc: "We'll figure it out together", icon: 'unsure', result: 'unsure' }
    ]
  },
  q2_wifi: {
    title: "What's the Wi-Fi situation?",
    sub: "Pick the closest match — we'll handle the rest.",
    options: [
      { label: "Internet keeps dropping or disconnecting", desc: "Cuts out, devices lose connection", icon: 'wifi', result: 'wifi' },
      { label: "Wi-Fi is slow everywhere", desc: "Across the whole house", icon: 'wifi', result: 'wifi' },
      { label: "Wi-Fi doesn't reach certain rooms", desc: "Dead zones, weak signal in some areas", icon: 'wifi', result: 'wifi' },
      { label: "I need to set up a new router or modem", desc: "Just bought new equipment", icon: 'wifi', result: 'wifi' },
      { label: "I want better whole-home coverage", desc: "Mesh network or extenders", icon: 'wifi', result: 'wifi' },
      { label: "Something else with Wi-Fi", desc: "Not sure exactly what's wrong", icon: 'wifi', result: 'wifi' }
    ]
  },
  q2_computer: {
    title: "What's going on with the computer?",
    sub: "Pick whatever sounds closest.",
    options: [
      { label: "It's running really slow", desc: "Takes forever to load anything", icon: 'computer', result: 'computer' },
      { label: "I just bought a new computer", desc: "Need everything set up", icon: 'computer', result: 'computer' },
      { label: "I think there's a virus or popups", desc: "Strange behavior, ads, warnings", icon: 'computer', result: 'computer' },
      { label: "I need files moved to a new computer", desc: "Transfer photos, docs, settings", icon: 'computer', result: 'computer' },
      { label: "Email or passwords aren't working", desc: "Can't log in, account issues", icon: 'computer', result: 'computer' },
      { label: "Something else with the computer", desc: "Not sure exactly what's wrong", icon: 'computer', result: 'computer' }
    ]
  },
  q2_smarthome: {
    title: "Which smart home device?",
    sub: "Doesn't matter the brand — we can help with any of them.",
    options: [
      { label: "Alexa or Echo device", desc: "Amazon smart speaker or display", icon: 'smarthome', result: 'smarthome' },
      { label: "Google Home or Nest Hub", desc: "Google smart speaker or display", icon: 'smarthome', result: 'smarthome' },
      { label: "Smart bulbs or plugs", desc: "Philips Hue, smart outlets, etc.", icon: 'smarthome', result: 'smarthome' },
      { label: "Smart thermostat", desc: "Nest, Ecobee, Honeywell, etc.", icon: 'smarthome', result: 'smarthome' },
      { label: "Multiple devices at once", desc: "Setting up a full smart home", icon: 'smarthome', result: 'smarthome' },
      { label: "Something else", desc: "Other smart device", icon: 'smarthome', result: 'smarthome' }
    ]
  },
  q2_tv: {
    title: "What's the TV situation?",
    sub: "We'll get whatever you've got working properly.",
    options: [
      { label: "I just got a new smart TV and need it set up", desc: "Apps, Wi-Fi, streaming accounts", icon: 'tv', result: 'tv' },
      { label: "I have a Roku, Fire TV, Apple TV, or Chromecast", desc: "Streaming device setup or fix", icon: 'tv', result: 'tv' },
      { label: "My streaming apps are crashing or not loading", desc: "Netflix, Hulu, YouTube not working", icon: 'tv', result: 'tv' },
      { label: "I want to drop cable and switch to streaming", desc: "Cord-cutting consultation and setup", icon: 'tv', result: 'tv' },
      { label: "Something else with the TV", desc: "Other TV or streaming issue", icon: 'tv', result: 'tv' }
    ]
  },
  q2_camera: {
    title: "How many cameras do you have or want?",
    sub: "This helps us give you a more accurate estimate.",
    options: [
      { label: "Just a video doorbell", desc: "Ring, Nest, Eufy doorbell", icon: 'camera', result: 'camera' },
      { label: "One camera", desc: "Single indoor or outdoor camera", icon: 'camera', result: 'camera' },
      { label: "Two cameras", desc: "Front and back, or two spots", icon: 'camera', result: 'camera' },
      { label: "Three or more cameras", desc: "Full coverage system", icon: 'camera', result: 'camera' },
      { label: "Not sure yet — I want to talk through it", desc: "We'll help you figure out what's right", icon: 'camera', result: 'camera' }
    ]
  }
};

const ICONS = {
  wifi: '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="currentColor"/></svg>',
  computer: '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
  smarthome: '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  tv: '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M23 7 16 12 23 17V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>',
  printer: '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>',
  camera: '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
  newsetup: '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
  unsure: '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  arrow: '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
  check: '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>',
  calendar: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  back: '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
  restart: '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',
  award: '<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>'
};

let currentStep = 'intro';
let history = [];

const STEP_NUMBERS = { 'q1': 1, 'q2_wifi': 2, 'q2_computer': 2, 'q2_smarthome': 2, 'q2_tv': 2, 'q2_camera': 2, 'result': 3 };
const TOTAL_STEPS = 3;

const intro = document.getElementById('intro-screen');
const progressWrap = document.getElementById('progress-wrap');
const progressFill = document.getElementById('progress-fill');
const progressLabel = document.getElementById('progress-label');
const quizContent = document.getElementById('quiz-content');

function renderStartButton() {
  quizContent.innerHTML = `
    <div style="text-align:center;margin-top:0.5rem;">
      <button class="btn-book" id="start-btn" style="display:inline-flex;width:auto;padding-left:2.2rem;padding-right:2.2rem;">
        ${ICONS.arrow}
        Start the Quiz
      </button>
    </div>
  `;
  document.getElementById('start-btn').addEventListener('click', () => {
    intro.style.display = 'none';
    goTo('q1');
  });
}

function renderQuestion(stepKey) {
  const step = QUIZ[stepKey];
  if (!step) return;
  const optionsHTML = step.options.map((opt, i) => `
    <button class="opt-btn" data-idx="${i}" type="button">
      <div class="opt-icon">${ICONS[opt.icon] || ICONS.unsure}</div>
      <div class="opt-text">
        <div class="opt-label">${opt.label}</div>
        ${opt.desc ? `<div class="opt-desc">${opt.desc}</div>` : ''}
      </div>
      <div class="opt-arrow">${ICONS.arrow}</div>
    </button>
  `).join('');
  const showBack = history.length > 0;
  quizContent.innerHTML = `
    <div class="q-card">
      <div class="q-header">
        <div class="q-eyebrow"><div class="q-eyebrow-line"></div>Step ${STEP_NUMBERS[stepKey] || 1} of ${TOTAL_STEPS}</div>
        <h2 class="q-title">${step.title}</h2>
        <p class="q-sub">${step.sub}</p>
      </div>
      <div class="q-body">
        <div class="options" id="opt-list">${optionsHTML}</div>
      </div>
    </div>
    <div class="q-nav">
      ${showBack ? `<button class="q-back" id="back-btn" type="button">${ICONS.back} Back</button>` : '<div></div>'}
      <div></div>
    </div>
  `;
  quizContent.querySelectorAll('.opt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const opt = step.options[parseInt(btn.dataset.idx)];
      if (opt.result) showResult(opt.result);
      else if (opt.next) goTo(opt.next);
    });
  });
  if (showBack) {
    document.getElementById('back-btn').addEventListener('click', goBack);
  }
  updateProgress(stepKey);
}

function renderResult(resultKey) {
  const svc = SERVICES[resultKey];
  if (!svc) return;
  const includesHTML = svc.includes.map(item => `<li>${ICONS.check} ${item}</li>`).join('');
  const bookingURL = `/?service=${encodeURIComponent(svc.bookingValue)}#booking`;
  quizContent.innerHTML = `
    <div class="result-card">
      <div class="result-header">
        <div class="result-icon">${ICONS[svc.icon] || ICONS.award}</div>
        <div class="result-eyebrow">Recommended Service</div>
        <h2 class="result-name">${svc.name}</h2>
        <div class="result-price">${svc.priceRange} · ${svc.duration}</div>
      </div>
      <div class="result-body">
        <div class="result-section"><div class="result-summary">${svc.summary}</div></div>
        <div class="result-section">
          <div class="result-section-title">What's Included</div>
          <ul class="result-list">${includesHTML}</ul>
        </div>
      </div>
      <div class="result-actions">
        <a href="${bookingURL}" class="btn-book">${ICONS.calendar} Book This Service</a>
        <a href="/#booking" class="btn-secondary">See All Booking Options</a>
      </div>
    </div>
    <div class="restart-row">
      <button class="restart-btn" id="restart-btn" type="button">${ICONS.restart} Start over with different answers</button>
    </div>
  `;
  document.getElementById('restart-btn').addEventListener('click', restartQuiz);
  updateProgress('result');
}

function updateProgress(stepKey) {
  if (stepKey === 'intro') { progressWrap.style.display = 'none'; return; }
  progressWrap.style.display = 'flex';
  const stepNum = STEP_NUMBERS[stepKey] || 1;
  progressFill.style.width = (stepNum / TOTAL_STEPS * 100) + '%';
  progressLabel.textContent = stepKey === 'result' ? 'Done!' : `Step ${stepNum} of ${TOTAL_STEPS}`;
}

function goTo(stepKey) {
  history.push(currentStep);
  currentStep = stepKey;
  renderQuestion(stepKey);
  scrollIntoQuiz();
}

function goBack() {
  if (!history.length) return;
  const prev = history.pop();
  currentStep = prev;
  if (prev === 'intro') {
    intro.style.display = 'block';
    renderStartButton();
    progressWrap.style.display = 'none';
  } else {
    renderQuestion(prev);
  }
  scrollIntoQuiz();
}

function showResult(resultKey) {
  history.push(currentStep);
  currentStep = 'result';
  renderResult(resultKey);
  scrollIntoQuiz();
}

function restartQuiz() {
  history = [];
  currentStep = 'intro';
  intro.style.display = 'block';
  progressWrap.style.display = 'none';
  renderStartButton();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function scrollIntoQuiz() {
  document.getElementById('quiz-wrap').scrollIntoView({ behavior: 'smooth' });
}

renderStartButton();

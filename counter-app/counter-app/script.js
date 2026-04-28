let count = 0;
const history = [];

const cardEl   = document.getElementById('card');
const countEl  = document.getElementById('count');
const statusEl = document.getElementById('status');
const histEl   = document.getElementById('history');

function update() {
  // Update displayed number
  countEl.textContent = count;

  // Determine state class
  const cls   = count > 0 ? 'positive' : count < 0 ? 'negative' : 'zero';
  const label = count > 0 ? 'positive' : count < 0 ? 'negative' : 'neutral';

  // Apply conditional styling
  cardEl.className   = 'display-card '  + cls;
  countEl.className  = 'count-number '  + cls;
  statusEl.className = 'status-label '  + cls;
  statusEl.textContent = label;

  // Track history (last 20 values)
  history.push(count);
  if (history.length > 20) history.shift();

  // Render history dots
  histEl.innerHTML = history.map(v => {
    const color = v > 0 ? '#97C459' : v < 0 ? '#F09595' : '#B4B2A9';
    return `<div class="hist-dot" style="background:${color}"></div>`;
  }).join('');
}

// Button listeners
document.getElementById('inc').addEventListener('click', () => { count++; update(); });
document.getElementById('dec').addEventListener('click', () => { count--; update(); });
document.getElementById('reset').addEventListener('click', () => { count = 0; update(); });

// Initialize
update();

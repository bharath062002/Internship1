// ── State ──
let transactions = JSON.parse(localStorage.getItem('xpense_txns') || '[]');
let currentType = 'expense';

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  // Set default date to today
  const dateInput = document.getElementById('date');
  dateInput.value = new Date().toISOString().split('T')[0];

  // Set month label
  const now = new Date();
  document.getElementById('current-month').textContent =
    now.toLocaleString('default', { month: 'long', year: 'numeric' });

  renderAll();
});

// ── Type Toggle ──
function setType(type) {
  currentType = type;
  document.getElementById('btn-expense').classList.toggle('active', type === 'expense');
  document.getElementById('btn-income').classList.toggle('active', type === 'income');
}

// ── Add Transaction ──
function addTransaction() {
  const desc = document.getElementById('desc').value.trim();
  const amount = parseFloat(document.getElementById('amount').value);
  const category = document.getElementById('category').value;
  const date = document.getElementById('date').value;
  const errEl = document.getElementById('error-msg');

  if (!desc) { errEl.textContent = 'Please enter a description.'; return; }
  if (!amount || amount <= 0) { errEl.textContent = 'Please enter a valid amount.'; return; }
  if (!date) { errEl.textContent = 'Please select a date.'; return; }
  errEl.textContent = '';

  const txn = {
    id: Date.now(),
    desc,
    amount,
    category,
    date,
    type: currentType
  };

  transactions.unshift(txn);
  save();
  renderAll();

  // Reset form
  document.getElementById('desc').value = '';
  document.getElementById('amount').value = '';
  document.getElementById('date').value = new Date().toISOString().split('T')[0];
}

// ── Delete ──
function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  save();
  renderAll();
}

// ── Clear All ──
function clearAll() {
  if (!transactions.length) return;
  if (!confirm('Clear all transactions? This cannot be undone.')) return;
  transactions = [];
  save();
  renderAll();
}

// ── Save ──
function save() {
  localStorage.setItem('xpense_txns', JSON.stringify(transactions));
}

// ── Render All ──
function renderAll() {
  renderSummary();
  renderList();
  renderBreakdown();
}

// ── Summary ──
function renderSummary() {
  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;

  document.getElementById('total-income').textContent = formatCurrency(income);
  document.getElementById('total-expense').textContent = formatCurrency(expense);
  document.getElementById('net-balance').textContent = formatCurrency(balance);

  const statusEl = document.getElementById('balance-status');
  if (balance > 0) { statusEl.textContent = '↑ Positive balance'; statusEl.style.color = 'var(--income)'; }
  else if (balance < 0) { statusEl.textContent = '↓ Over budget'; statusEl.style.color = 'var(--expense)'; }
  else { statusEl.textContent = 'Break even'; statusEl.style.color = 'var(--muted)'; }

  const max = Math.max(income, expense, 1);
  document.getElementById('income-bar').style.width = (income / max * 100) + '%';
  document.getElementById('expense-bar').style.width = (expense / max * 100) + '%';
}

// ── List ──
function renderList() {
  const filterType = document.getElementById('filter-type').value;
  const filterCat = document.getElementById('filter-cat').value;

  let filtered = transactions;
  if (filterType !== 'all') filtered = filtered.filter(t => t.type === filterType);
  if (filterCat !== 'all') filtered = filtered.filter(t => t.category === filterCat);

  const listEl = document.getElementById('transaction-list');

  if (!filtered.length) {
    listEl.innerHTML = '<div class="empty-state">No transactions found.</div>';
    return;
  }

  listEl.innerHTML = filtered.map(t => `
    <div class="txn-item" id="txn-${t.id}">
      <div class="txn-dot txn-dot--${t.type}"></div>
      <div class="txn-desc">
        <div class="txn-desc-text">${escapeHtml(t.desc)}</div>
        <div class="txn-meta">${formatDate(t.date)}</div>
      </div>
      <div class="txn-cat">${t.category}</div>
      <div class="txn-amount txn-amount--${t.type}">
        ${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}
      </div>
      <button class="txn-delete" onclick="deleteTransaction(${t.id})" title="Delete">×</button>
    </div>
  `).join('');
}

// ── Breakdown ──
function renderBreakdown() {
  const expenses = transactions.filter(t => t.type === 'expense');
  const total = expenses.reduce((s, t) => s + t.amount, 0);
  const byCategory = {};

  expenses.forEach(t => {
    byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
  });

  const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const listEl = document.getElementById('breakdown-list');

  if (!sorted.length) {
    listEl.innerHTML = '<div class="empty-state" style="padding:30px">No expense data yet.</div>';
    return;
  }

  const emojis = {
    Food:'🍛', Transport:'🚌', Shopping:'🛍', Bills:'💡',
    Health:'💊', Entertainment:'🎬', Salary:'💼', Other:'📦'
  };

  listEl.innerHTML = sorted.map(([cat, amt]) => `
    <div class="breakdown-item">
      <div class="breakdown-label">${emojis[cat] || '📦'} ${cat}</div>
      <div class="breakdown-bar-wrap">
        <div class="breakdown-bar-fill" style="width:${total ? (amt/total*100) : 0}%"></div>
      </div>
      <div class="breakdown-amount">${formatCurrency(amt)}</div>
    </div>
  `).join('');
}

// ── Export CSV ──
function exportCSV() {
  if (!transactions.length) { alert('No transactions to export.'); return; }

  const rows = [
    ['Date', 'Description', 'Category', 'Type', 'Amount']
  ];
  transactions.forEach(t => {
    rows.push([t.date, t.desc, t.category, t.type, t.amount.toFixed(2)]);
  });

  const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `xpense-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Helpers ──
function formatCurrency(n) {
  return '₹' + Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Keyboard shortcut: Enter to submit ──
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && (e.target.id === 'desc' || e.target.id === 'amount')) {
    addTransaction();
  }
});

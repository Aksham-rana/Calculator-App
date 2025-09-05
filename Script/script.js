(function () {
  const prevEl = document.getElementById('prev');
  const currEl = document.getElementById('curr');

  let current = '0';
  let previous = '';
  let operator = null;
  let justEvaluated = false;

  function updateDisplay() {
    prevEl.textContent = previous && operator ? `${previous} ${operator}` : '';
    currEl.textContent = current || '0';
  }

  function clearAll() {
    current = '0';
    previous = '';
    operator = null;
    justEvaluated = false;
    updateDisplay();
  }

  function deleteOne() {
    if (justEvaluated) return; // don't backspace result directly
    if (current.length <= 1 || (current.length === 2 && current.startsWith('-'))) {
      current = '0';
    } else {
      current = current.slice(0, -1);
    }
    updateDisplay();
  }

  function appendNumber(num) {
    if (justEvaluated) {
      // start new entry after equals
      current = '0';
      justEvaluated = false;
    }
    if (current === '0' && num !== '.') current = '';
    current += num;
    updateDisplay();
  }

  function addDot() {
    if (justEvaluated) {
      current = '0';
      justEvaluated = false;
    }
    if (!current.includes('.')) {
      current += (current === '' ? '0' : '') + '.';
      updateDisplay();
    }
  }

  function chooseOperator(op) {
    if (current === '' && previous) {
      operator = op;
      updateDisplay();
      return;
    }
    if (previous && operator && current !== '') {
      compute();
    }
    previous = current || previous || '0';
    current = '';
    operator = op;
    justEvaluated = false;
    updateDisplay();
  }

  function compute() {
    if (!operator || previous === '' || current === '') return;
    const a = parseFloat(previous);
    const b = parseFloat(current);
    let result;

    switch (operator) {
      case '+': result = a + b; break;
      case '−': result = a - b; break;
      case '×': result = a * b; break;
      case '÷':
        if (b === 0) {
          current = 'Error';
          previous = '';
          operator = null;
          justEvaluated = true;
          updateDisplay();
          return;
        }
        result = a / b; break;
      default: return;
    }

    // Format result to avoid long floating tails
    const rounded = Math.round((result + Number.EPSILON) * 1e12) / 1e12;
    current = String(rounded);
    previous = '';
    operator = null;
    justEvaluated = true;
    updateDisplay();
  }

  function toggleSign() {
    if (current === '0' || current === '' || current === 'Error') return;
    current = current.startsWith('-') ? current.slice(1) : '-' + current;
    updateDisplay();
  }

  function toPercent() {
    if (current === '' || current === 'Error') return;
    const value = parseFloat(current);
    current = String(value / 100);
    updateDisplay();
  }

  // Click handlers
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const num = btn.getAttribute('data-num');
      const op = btn.getAttribute('data-op');
      const action = btn.getAttribute('data-action');

      if (num !== null) return appendNumber(num);
      if (btn.hasAttribute('data-dot')) return addDot();
      if (op) return chooseOperator(op);

      switch (action) {
        case 'clear': return clearAll();
        case 'delete': return deleteOne();
        case 'percent': return toPercent();
        case 'equal': return compute();
        case 'sign': return toggleSign();
      }
    });
  });

  // Keyboard support
  window.addEventListener('keydown', (e) => {
    const k = e.key;

    if ((k >= '0' && k <= '9')) return appendNumber(k);
    if (k === '.') return addDot();

    if (k === '+' || k === '-') {
      return chooseOperator(k === '+' ? '+' : '−');
    }
    if (k === '*' || k.toLowerCase() === 'x') return chooseOperator('×');
    if (k === '/') return chooseOperator('÷');

    if (k === 'Enter' || k === '=') { e.preventDefault(); return compute(); }
    if (k === 'Backspace') return deleteOne();
    if (k.toLowerCase() === 'c' || k === 'Escape') return clearAll();
    if (k === '%') return toPercent();
  });

  updateDisplay();
})();

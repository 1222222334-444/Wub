document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const mainDisplay = document.getElementById('main-display');
    const expressionDisplay = document.getElementById('expression-display');
    const sciPanel = document.getElementById('sci-panel');
    const toggleSciBtn = document.getElementById('toggle-sci-btn');
    const historyDrawer = document.getElementById('history-drawer');
    const toggleHistoryBtn = document.getElementById('toggle-history-btn');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    const historyList = document.getElementById('history-list');

    // Calculator State
    let currentInput = '0';
    let expression = '';
    let isCalculated = false;
    let history = [];

    // Format Number with Commas
    function formatNumber(val) {
        if (val === '' || val === 'Error') return val;
        const parts = val.toString().split('.');
        parts[0] = Number(parts[0]).toLocaleString('en-US');
        return parts.join('.');
    }

    // Update Display UI
    function updateDisplay() {
        mainDisplay.textContent = formatNumber(currentInput);
        expressionDisplay.textContent = expression;
    }

    // Append Digit
    function appendNumber(num) {
        if (isCalculated) {
            currentInput = num;
            expression = '';
            isCalculated = false;
        } else {
            if (currentInput === '0') {
                currentInput = num;
            } else {
                currentInput += num;
            }
        }
        updateDisplay();
    }

    // Add Decimal
    function addDecimal() {
        if (isCalculated) {
            currentInput = '0.';
            expression = '';
            isCalculated = false;
        } else if (!currentInput.includes('.')) {
            currentInput += '.';
        }
        updateDisplay();
    }

    // Handle Operators (+, -, ×, ÷)
    function handleOperator(op) {
        if (isCalculated) isCalculated = false;
        expression += ` ${currentInput} ${op}`;
        currentInput = '0';
        updateDisplay();
    }

    // Calculate Final Result
    function calculate() {
        if (!expression && !isCalculated) return;
        
        let fullExpression = expression + ' ' + currentInput;
        let evalExpression = fullExpression
            .replace(/×/g, '*')
            .replace(/÷/g, '/');

        try {
            // Evaluate safely
            let result = eval(evalExpression);
            
            if (!isFinite(result) || isNaN(result)) {
                throw new Error('Invalid');
            }

            // Rounding to prevent floating point issues
            result = Math.round(result * 1e10) / 1e10;

            // Save History
            addHistory(fullExpression, result);

            expression = fullExpression + ' =';
            currentInput = result.toString();
            isCalculated = true;
        } catch (e) {
            currentInput = 'Error';
            isCalculated = true;
        }
        updateDisplay();
    }

    // Handle Scientific Functions
    function handleScientific(action) {
        let val = parseFloat(currentInput);
        let res = 0;

        switch (action) {
            case 'sin': res = Math.sin(val); break;
            case 'cos': res = Math.cos(val); break;
            case 'tan': res = Math.tan(val); break;
            case 'log': res = Math.log10(val); break;
            case 'ln': res = Math.log(val); break;
            case 'sqrt': res = Math.sqrt(val); break;
            case 'pow': res = Math.pow(val, 2); break;
            case 'pi': res = Math.PI; break;
            case 'e': res = Math.E; break;
            case 'fact':
                if (val < 0) res = NaN;
                else {
                    res = 1;
                    for (let i = 2; i <= val; i++) res *= i;
                }
                break;
        }

        if (isNaN(res) || !isFinite(res)) {
            currentInput = 'Error';
        } else {
            currentInput = (Math.round(res * 1e10) / 1e10).toString();
        }
        isCalculated = true;
        updateDisplay();
    }

    // Actions (Clear, Delete, Toggle Sign, Percent)
    function clearAll() {
        currentInput = '0';
        expression = '';
        isCalculated = false;
        updateDisplay();
    }

    function deleteLast() {
        if (isCalculated) {
            clearAll();
            return;
        }
        if (currentInput.length > 1) {
            currentInput = currentInput.slice(0, -1);
        } else {
            currentInput = '0';
        }
        updateDisplay();
    }

    function toggleSign() {
        currentInput = (parseFloat(currentInput) * -1).toString();
        updateDisplay();
    }

    function handlePercent() {
        currentInput = (parseFloat(currentInput) / 100).toString();
        updateDisplay();
    }

    // History Functions
    function addHistory(exp, res) {
        history.unshift({ exp, res });
        renderHistory();
    }

    function renderHistory() {
        if (history.length === 0) {
            historyList.innerHTML = '<p class="empty-history">No history yet</p>';
            return;
        }
        historyList.innerHTML = history.map(item => `
            <div class="history-item" data-res="${item.res}">
                <div class="h-exp">${item.exp}</div>
                <div class="h-res">${formatNumber(item.res)}</div>
            </div>
        `).join('');

        document.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                currentInput = item.getAttribute('data-res');
                historyDrawer.classList.add('hidden');
                toggleHistoryBtn.classList.remove('active');
                updateDisplay();
            });
        });
    }

    // Button Click Listener
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const num = btn.getAttribute('data-num');
            const op = btn.getAttribute('data-operator');
            const action = btn.getAttribute('data-action');

            if (num !== null) appendNumber(num);
            if (op !== null) handleOperator(op);
            if (action !== null) {
                switch (action) {
                    case 'clear': clearAll(); break;
                    case 'delete': deleteLast(); break;
                    case 'decimal': addDecimal(); break;
                    case 'calculate': calculate(); break;
                    case 'toggle-sign': toggleSign(); break;
                    case 'percent': handlePercent(); break;
                    default: handleScientific(action); break;
                }
            }
        });
    });

    // Toggle Panels
    toggleSciBtn.addEventListener('click', () => {
        sciPanel.classList.toggle('hidden');
        toggleSciBtn.classList.toggle('active');
    });

    toggleHistoryBtn.addEventListener('click', () => {
        historyDrawer.classList.toggle('hidden');
        toggleHistoryBtn.classList.toggle('active');
    });

    clearHistoryBtn.addEventListener('click', () => {
        history = [];
        renderHistory();
    });

    // Keyboard Shortcuts Support
    window.addEventListener('keydown', (e) => {
        if (e.key >= '0' && e.key <= '9') appendNumber(e.key);
        if (e.key === '.') addDecimal();
        if (e.key === '+') handleOperator('+');
        if (e.key === '-') handleOperator('-');
        if (e.key === '*') handleOperator('×');
        if (e.key === '/') handleOperator('÷');
        if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); calculate(); }
        if (e.key === 'Backspace') deleteLast();
        if (e.key === 'Escape') clearAll();
    });
});

// MATH FUNCTIONS
// ============================================
function add(a, b)      { return a + b; }
function subtract(a, b) { return a - b; }
function multiply(a, b) { return a * b; }
function divide(a, b) {
  if (b === 0) return "Can't divide by zero!";
  return a / b;
}
 
function operate(operator, a, b) {
  a = parseFloat(a);
  b = parseFloat(b);
  if (operator === '+') return add(a, b);
  if (operator === '−') return subtract(a, b);
  if (operator === '×') return multiply(a, b);
  if (operator === '÷') return divide(a, b);
}
 
// ============================================
// STATE — the calculator's memory
// ============================================
let firstNumber    = null;   // number entered before operator
let operator       = null;   // selected operator
let secondNumber   = null;   // number entered after operator
let currentInput   = '0';    // what's currently shown on display
let justCalculated = false;  // flag: did we just press equals?
 
// ============================================
// DOM REFS
// ============================================
const displayValue = document.getElementById('displayValue');
const expression   = document.getElementById('expression');
const clearBtn     = document.getElementById('clearBtn');
const backBtn      = document.getElementById('backBtn');
const equalsBtn    = document.getElementById('equalsBtn');
const decimalBtn   = document.getElementById('decimalBtn');
const digitBtns    = document.querySelectorAll('.digit');
const operatorBtns = document.querySelectorAll('.operator');
 
// ============================================
// UPDATE DISPLAY
// ============================================
function updateDisplay(value) {
  let str = String(value);
 
  // Reset classes then apply the right size based on length
  displayValue.className = 'display-value';
  if (str.includes("divide") || str.includes("zero")) {
    displayValue.classList.add('error');
  } else if (str.length > 12) {
    displayValue.classList.add('xsmall');
  } else if (str.length > 8) {
    displayValue.classList.add('small');
  }
 
  displayValue.textContent = str;
}
 
// ============================================
// HANDLE DIGIT CLICKS
// ============================================
function handleDigit(digit) {
  // If we just calculated, start a fresh number
  if (justCalculated) {
    currentInput   = digit;
    justCalculated = false;
  } else {
    // Don't let the display start with multiple zeros
    if (currentInput === '0') {
      currentInput = digit;
    } else {
      // Limit input length to prevent overflow
      if (currentInput.length >= 12) return;
      currentInput += digit;
    }
  }
  updateDisplay(currentInput);
}
 
// ============================================
// HANDLE DECIMAL
// ============================================
function handleDecimal() {
  if (justCalculated) {
    currentInput   = '0.';
    justCalculated = false;
  } else if (!currentInput.includes('.')) {
    // Only add a decimal if there isn't one already
    currentInput += '.';
  }
  updateDisplay(currentInput);
}
 
// ============================================
// HANDLE OPERATOR
// ============================================
function handleOperator(op) {
  // If we already have two numbers, calculate first (chaining)
  if (firstNumber !== null && operator !== null && !justCalculated) {
    secondNumber = currentInput;
    let result   = operate(operator, firstNumber, secondNumber);
 
    // Handle divide by zero
    if (typeof result === 'string') {
      updateDisplay(result);
      displayValue.classList.add('error');
      expression.textContent = '';
      clearState();
      return;
    }
 
    // Round long decimals
    result       = parseFloat(result.toFixed(10));
    firstNumber  = result;
    currentInput = String(result);
    updateDisplay(result);
  } else {
    firstNumber = currentInput;
  }
 
  operator       = op;
  justCalculated = false;
  secondNumber   = null;
 
  // Update the expression shown at the top of the display
  expression.textContent = `${firstNumber} ${operator}`;
 
  // Highlight the active operator button
  operatorBtns.forEach(function(btn) { btn.classList.remove('active-op'); });
  document.querySelector(`[data-op="${op}"]`).classList.add('active-op');
 
  // Ready to accept the second number
  currentInput = '0';
}
 
// ============================================
// HANDLE EQUALS
// ============================================
function handleEquals() {
  // Do nothing if we don't have a first number and operator yet
  if (firstNumber === null || operator === null) return;
 
  secondNumber = currentInput;
  let result   = operate(operator, firstNumber, secondNumber);
 
  // Handle divide by zero
  if (typeof result === 'string') {
    updateDisplay(result);
    displayValue.classList.add('error');
    expression.textContent = '';
    clearState();
    return;
  }
 
  // Round long decimals
  result = parseFloat(result.toFixed(10));
 
  // Show the full equation at the top of the display
  expression.textContent = `${firstNumber} ${operator} ${secondNumber} =`;
 
  updateDisplay(result);
 
  // Store result as firstNumber so user can chain operations
  firstNumber    = result;
  currentInput   = String(result);
  operator       = null;
  secondNumber   = null;
  justCalculated = true;
 
  // Remove operator highlight
  operatorBtns.forEach(function(btn) { btn.classList.remove('active-op'); });
}
 
// ============================================
// HANDLE BACKSPACE
// ============================================
function handleBack() {
  if (justCalculated) return; // can't backspace a finished result
  if (currentInput.length <= 1) {
    currentInput = '0';
  } else {
    currentInput = currentInput.slice(0, -1);
  }
  updateDisplay(currentInput);
}
 
// ============================================
// CLEAR
// ============================================
function clearState() {
  firstNumber    = null;
  operator       = null;
  secondNumber   = null;
  justCalculated = false;
}
 
function handleClear() {
  clearState();
  currentInput = '0';
  expression.textContent = '';
  updateDisplay('0');
  operatorBtns.forEach(function(btn) { btn.classList.remove('active-op'); });
}
 
// ============================================
// EVENT LISTENERS
// ============================================
 
// Digit buttons
digitBtns.forEach(function(btn) {
  btn.addEventListener('click', function() {
    handleDigit(btn.dataset.digit);
  });
});
 
// Operator buttons
operatorBtns.forEach(function(btn) {
  btn.addEventListener('click', function() {
    handleOperator(btn.dataset.op);
  });
});
 
// Special buttons
equalsBtn.addEventListener('click', handleEquals);
clearBtn.addEventListener('click', handleClear);
backBtn.addEventListener('click', handleBack);
decimalBtn.addEventListener('click', handleDecimal);
 
// ============================================
// KEYBOARD SUPPORT
// ============================================
document.addEventListener('keydown', function(e) {
  if (e.key >= '0' && e.key <= '9') handleDigit(e.key);
  if (e.key === '.')                      handleDecimal();
  if (e.key === '+')                      handleOperator('+');
  if (e.key === '-')                      handleOperator('−');
  if (e.key === '*')                      handleOperator('×');
  if (e.key === '/') { e.preventDefault(); handleOperator('÷'); }
  if (e.key === 'Enter' || e.key === '=') handleEquals();
  if (e.key === 'Backspace')              handleBack();
  if (e.key === 'Escape')                 handleClear();
});
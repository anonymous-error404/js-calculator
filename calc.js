let display = document.getElementById('result');
        let operationDisplay = document.getElementById('operation');
        let currentNumber = '0';
        let previousNumber = null;
        let operator = null;
        let waitingForNewNumber = false;
        let operationString = '';
        let isShowingResult = false;
        let fullExpression = '';

        function updateDisplay() {
            operationDisplay.textContent = fullExpression;
            
            // Show current number or preview calculation
            if (canCalculatePreview() && !isShowingResult) {
                let preview = calculateCurrentExpression();
                if (preview !== null && preview !== 'Error') {
                    display.textContent = preview;
                    display.classList.add('preview');
                    display.classList.remove('final');
                } else {
                    display.textContent = currentNumber;
                    display.classList.remove('preview');
                    display.classList.add('final');
                }
            } else {
                display.textContent = currentNumber;
                display.classList.remove('preview');
                display.classList.add('final');
            }
        }

        function canCalculatePreview() {
            // Check if we have at least one complete operation (number operator number)
            let parts = fullExpression.trim().split(' ');
            return parts.length >= 3 && parts.length % 2 === 1 && parts[parts.length - 1] !== '';
        }

        function calculateCurrentExpression() {
            if (!fullExpression.trim()) return null;
            
            try {
                // Convert display operators back to JS operators for calculation
                let expr = fullExpression
                    .replace(/×/g, '*')
                    .replace(/÷/g, '/')
                    .replace(/–/g, '-');
                
                // Simple left-to-right evaluation
                let parts = expr.trim().split(' ');
                if (parts.length < 3) return null;
                
                let result = parseFloat(parts[0]);
                
                for (let i = 1; i < parts.length; i += 2) {
                    let op = parts[i];
                    let num = parseFloat(parts[i + 1]);
                    
                    if (isNaN(num)) break;
                    
                    switch (op) {
                        case '+':
                            result += num;
                            break;
                        case '-':
                            result -= num;
                            break;
                        case '*':
                            result *= num;
                            break;
                        case '/':
                            if (num === 0) return 'Error';
                            result /= num;
                            break;
                    }
                }
                
                // Format result to avoid floating point precision issues
                result = Math.round((result + Number.EPSILON) * 100000000) / 100000000;
                return result.toString();
            } catch (e) {
                return null;
            }
        }

        function getOperatorSymbol(op) {
            switch(op) {
                case '+': return '+';
                case '-': return '–';
                case '*': return '×';
                case '/': return '÷';
                default: return op;
            }
        }

        function inputNumber(num) {
            if (waitingForNewNumber) {
                currentNumber = num;
                waitingForNewNumber = false;
                isShowingResult = false;
            } else {
                if (currentNumber === '0' && num !== '.') {
                    currentNumber = num;
                } else {
                    // Prevent multiple decimal points
                    if (num === '.' && currentNumber.includes('.')) {
                        return;
                    }
                    currentNumber += num;
                }
            }
            
            // Update the full expression
            if (fullExpression === '' || isShowingResult) {
                fullExpression = currentNumber;
                isShowingResult = false;
            } else {
                // Replace the last number in the expression with current number
                let parts = fullExpression.split(' ');
                if (parts.length % 2 === 1) {
                    // Last part should be a number, replace it
                    parts[parts.length - 1] = currentNumber;
                    fullExpression = parts.join(' ');
                } else {
                    // Add the number after an operator
                    fullExpression += currentNumber;
                }
            }
            
            updateDisplay();
        }

        function inputOperator(op) {
            // Clear previous operator highlighting
            document.querySelectorAll('.operator').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Highlight current operator
            document.querySelector(`[data-op="${op}"]`).classList.add('active');

            // Add operator to the full expression
            if (fullExpression === '') {
                fullExpression = currentNumber + ' ' + getOperatorSymbol(op) + ' ';
            } else if (fullExpression.endsWith(' ')) {
                // Replace the last operator if we're changing it
                let parts = fullExpression.trim().split(' ');
                parts[parts.length - 1] = getOperatorSymbol(op);
                fullExpression = parts.join(' ') + ' ';
            } else {
                fullExpression += ' ' + getOperatorSymbol(op) + ' ';
            }

            operator = op;
            previousNumber = parseFloat(currentNumber);
            waitingForNewNumber = true;
            isShowingResult = false;
            updateDisplay();
        }

        function calculate() {
            if (fullExpression === '' || fullExpression.endsWith(' ')) {
                return;
            }

            let result = calculateCurrentExpression();
            if (result === null) {
                return;
            }
            
            if (result === 'Error') {
                alert('Cannot divide by zero!');
                clearDisplay();
                return;
            }

            // Show the complete expression with equals
            fullExpression += ' =';
            currentNumber = result;
            operator = null;
            previousNumber = null;
            waitingForNewNumber = true;
            isShowingResult = true;

            // Clear operator highlighting
            document.querySelectorAll('.operator').forEach(btn => {
                btn.classList.remove('active');
            });

            updateDisplay();
        }

        function clearDisplay() {
            currentNumber = '0';
            previousNumber = null;
            operator = null;
            waitingForNewNumber = false;
            fullExpression = '';
            isShowingResult = false;
            
            // Clear operator highlighting
            document.querySelectorAll('.operator').forEach(btn => {
                btn.classList.remove('active');
            });
            
            updateDisplay();
        }

        function deleteLast() {
            if (waitingForNewNumber || isShowingResult) {
                return;
            }
            
            if (currentNumber.length > 1) {
                currentNumber = currentNumber.slice(0, -1);
            } else {
                currentNumber = '0';
            }
            
            // Update the full expression
            let parts = fullExpression.split(' ');
            if (parts.length % 2 === 1) {
                // Last part is a number, update it
                parts[parts.length - 1] = currentNumber;
                fullExpression = parts.join(' ');
            }
            
            updateDisplay();
        }

        // Keyboard support
        document.addEventListener('keydown', function(event) {
            const key = event.key;
            
            if (key >= '0' && key <= '9' || key === '.') {
                inputNumber(key);
            } else if (key === '+' || key === '-' || key === '*' || key === '/') {
                inputOperator(key);
            } else if (key === 'Enter' || key === '=') {
                event.preventDefault();
                calculate();
            } else if (key === 'Escape' || key === 'c' || key === 'C') {
                clearDisplay();
            } else if (key === 'Backspace') {
                event.preventDefault();
                deleteLast();
            }
        });

        // Initialize display
        updateDisplay();
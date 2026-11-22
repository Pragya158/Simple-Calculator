let input = document.getElementById("display");

let buttons = document.querySelectorAll(".buttons button");

let justCalculated = false;

// Check Operators
function isOperator(value) {
  return ["+", "-", "×", "÷"].includes(value);
}

// Safe Calculator Function
function calculate(expression) {
  expression = expression.replaceAll("×", "*");
  expression = expression.replaceAll("÷", "/");

  let position = 0;

  // Read Numbers
  function parseNumber() {
    let sign = 1;

    if (expression[position] === "-") {
      sign = -1;
      position++;
    } else if (expression[position] === "+") {
      position++;
    }

    let start = position;

    while (
      position < expression.length &&
      /[0-9.]/.test(expression[position])
    ) {
      position++;
    }

    let number = expression.slice(start, position);

    if (
      number === "" ||
      number === "." ||
      (number.match(/\./g) || []).length > 1
    ) {
      throw new Error("Invalid Number");
    }

    let value = Number(number) * sign;

    if (!Number.isFinite(value)) {
      throw new Error("Invalid Number");
    }

    // Percentage
    let percentage = false;

    if (expression[position] === "%") {
      value = value / 100;
      position++;
      percentage = true;
    }

    return {
      value: value,
      percentage: percentage,
    };
  }

  // Multiplication and Division
  function parseTerm() {
    let first = parseNumber();

    let result = first.value;
    let previousPercentage = first.percentage;

    while (true) {
      let operator = expression[position];

      // Percentage multiplication
      let implicitMultiply =
        previousPercentage && /[0-9.]/.test(operator || "");

      if (operator !== "*" && operator !== "/" && !implicitMultiply) {
        break;
      }

      if (!implicitMultiply) {
        position++;
      }

      let next = parseNumber();

      if (operator === "/") {
        if (next.value === 0) {
          throw new Error("Cannot divide by zero");
        }

        result = result / next.value;
      } else {
        result = result * next.value;
      }

      previousPercentage = next.percentage;
    }

    return result;
  }

  // Addition and Subtraction
  function parseExpression() {
    let result = parseTerm();

    while (true) {
      let operator = expression[position];

      if (operator !== "+" && operator !== "-") {
        break;
      }

      position++;

      let next = parseTerm();

      if (operator === "+") {
        result = result + next;
      } else {
        result = result - next;
      }
    }

    return result;
  }

  let answer = parseExpression();

  if (position !== expression.length) {
    throw new Error("Invalid Expression");
  }

  if (!Number.isFinite(answer)) {
    throw new Error("Invalid Result");
  }

  return Number(answer.toPrecision(12));
}

// All Button Click Events
buttons.forEach(function (button) {
  button.addEventListener("click", function () {
    let text = button.textContent;

    // CLEAR BUTTON
    if (text === "C") {
      input.value = "";
      justCalculated = false;
    }

    // DELETE BUTTON
    else if (text === "DEL") {
      if (input.value === "Error") {
        input.value = "";
      } else {
        input.value = input.value.slice(0, -1);
      }

      justCalculated = false;
    }

    // EQUAL BUTTON
    else if (text === "=") {
      if (input.value === "" || input.value === "-") {
        return;
      }

      try {
        let answer = calculate(input.value);

        input.value = answer;

        justCalculated = true;
      } catch {
        input.value = "Error";

        justCalculated = true;
      }
    }

    // DECIMAL BUTTON
    else if (text === ".") {
      if (input.value === "Error" || justCalculated) {
        input.value = "";
        justCalculated = false;
      }

      let parts = input.value.split(/[+\-×÷]/);

      let currentNumber = parts[parts.length - 1];

      if (!currentNumber.includes(".")) {
        if (currentNumber === "" || currentNumber.endsWith("%")) {
          input.value += "0";
        }

        input.value += ".";
      }
    }

    // PERCENTAGE BUTTON
    else if (text === "%") {
      if (justCalculated) {
        justCalculated = false;
      }

      if (
        input.value !== "" &&
        input.value !== "Error" &&
        /[0-9]$/.test(input.value)
      ) {
        input.value += "%";
      }
    }

    // NUMBERS AND OPERATORS
    else {
      if (input.value === "Error") {
        input.value = "";
        justCalculated = false;
      }

      // Start a new calculation after result
      if (justCalculated && !isOperator(text)) {
        input.value = "";
      }

      justCalculated = false;

      let lastChar = input.value.slice(-1);

      // Operators
      if (isOperator(text)) {
        if (input.value === "") {
          if (text === "-") {
            input.value = "-";
          }

          return;
        }

        // Replace previous operator
        if (isOperator(lastChar)) {
          input.value = input.value.slice(0, -1);
        }

        // Complete decimal number
        if (input.value.endsWith(".")) {
          input.value += "0";
        }
      }

      input.value += text;
    }
  });
});

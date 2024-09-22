function generateMatrix() {
  const rows = parseInt(document.getElementById("rows").value);
  const cols = parseInt(document.getElementById("cols").value);

  if (rows < 2 || cols < 3) {
    alert("Rows minimal 2 dan Columns minimal 3");
    return;
  }

  const matrixContainer = document.getElementById("matrix-input-container");
  matrixContainer.innerHTML = "";

  const table = document.createElement("table");

  for (let i = 0; i < rows; i++) {
    const row = document.createElement("tr");
    for (let j = 0; j < cols; j++) {
      const cell = document.createElement("td");
      const input = document.createElement("input");
      input.type = "number";
      input.value = 0;
      input.style.width = "60px";
      cell.appendChild(input);
      row.appendChild(cell);
    }
    table.appendChild(row);
  }
  matrixContainer.appendChild(table);
}

function getMatrixValues() {
  const matrixContainer = document.getElementById("matrix-input-container");
  const rows = matrixContainer.getElementsByTagName("tr");
  const matrix = [];

  for (let i = 0; i < rows.length; i++) {
    const cols = rows[i].getElementsByTagName("input");
    const row = [];
    for (let j = 0; j < cols.length; j++) {
      row.push(parseFloat(cols[j].value));
    }
    matrix.push(row);
  }
  return matrix;
}

function gaussJordan(matrix) {
  const rowCount = matrix.length;
  const colCount = matrix[0].length;
  const history = [];

  for (let i = 0; i < rowCount; i++) {
    if (matrix[i][i] === 0) {
      let swapped = false;
      for (let k = i + 1; k < rowCount; k++) {
        if (matrix[k][i] !== 0) {
          [matrix[i], matrix[k]] = [matrix[k], matrix[i]];
          history.push({
            type: "swap",
            rows: [i, k],
            matrix: JSON.parse(JSON.stringify(matrix)),
          });
          swapped = true;
          break;
        }
      }
      if (!swapped) {
        alert("Tidak ada penyelesaian karena matriks singular.");
        return;
      }
    }

    const diag = matrix[i][i];
    for (let j = 0; j < colCount; j++) {
      matrix[i][j] /= diag;
    }
    history.push({
      type: "divide",
      row: i,
      value: diag,
      matrix: JSON.parse(JSON.stringify(matrix)),
    });

    for (let k = 0; k < rowCount; k++) {
      if (k !== i) {
        const factor = matrix[k][i];
        for (let j = 0; j < colCount; j++) {
          matrix[k][j] -= factor * matrix[i][j];
        }
        history.push({
          type: "eliminate",
          row: k,
          factor: factor,
          pivotRow: i,
          matrix: JSON.parse(JSON.stringify(matrix)),
        });
      }
    }
  }
  return { matrix, history };
}

function getStepDescription(step) {
  if (step.type === "swap") {
    return `Menukar Row ${step.rows[0] + 1} dengan Row ${step.rows[1] + 1}`;
  } else if (step.type === "divide") {
    return `Membagi Row ${step.row + 1} dengan ${step.value.toFixed(2)}`;
  } else if (step.type === "eliminate") {
    return `Row ${step.row + 1} - (${step.factor.toFixed(2)}) x Row ${
      step.pivotRow + 1
    }`;
  }
  return "";
}

function displayMatrix(matrix, tableId) {
  const table = document.getElementById(tableId);
  table.innerHTML = "";

  matrix.forEach((row) => {
    const tr = document.createElement("tr");
    row.forEach((value) => {
      const td = document.createElement("td");
      td.textContent = value.toFixed(2);
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });
}

function displaySolutionSet(matrix) {
  const solutionSetContainer = document.createElement("div");
  const solutionSetTitle = document.createElement("h2");
  solutionSetTitle.textContent = "Solution Set:";
  solutionSetContainer.appendChild(solutionSetTitle);

  matrix.forEach((row, rowIndex) => {
    const equation = document.createElement("p");
    let equationText = "";
    let terms = [];

    row.slice(0, -1).forEach((coefficient, i) => {
      const roundedCoefficient = coefficient.toFixed(2);

      if (Math.abs(coefficient) >= 0.01) {
        const sign = coefficient > 0 && terms.length > 0 ? " + " : "";
        terms.push(
          `${sign}${roundedCoefficient != 1 ? roundedCoefficient : ""}x${i + 1}`
        );
      }
    });
    equationText = terms.join("");
    const result = row[row.length - 1].toFixed(2);
    equationText += ` = ${result}`;

    equation.textContent = equationText;
    solutionSetContainer.appendChild(equation);
  });

  document
    .getElementById("solution-set-container")
    .appendChild(solutionSetContainer);
}

function displayHistory(history) {
  const historyTable = document.getElementById("history-table");
  historyTable.innerHTML = "";

  history.forEach((step, index) => {
    const trStep = document.createElement("tr");
    const tdStep = document.createElement("td");
    tdStep.colSpan = step.matrix[0].length;
    tdStep.textContent = `Step ${index + 1}: ${getStepDescription(step)}`;
    trStep.appendChild(tdStep);
    historyTable.appendChild(trStep);

    step.matrix.forEach((row) => {
      const tr = document.createElement("tr");
      row.forEach((value) => {
        const td = document.createElement("td");
        td.textContent = value.toFixed(2);
        tr.appendChild(td);
      });
      historyTable.appendChild(tr);
    });
  });
}

function solve() {
  const matrix = getMatrixValues();
  const { matrix: solution, history } = gaussJordan(matrix);

  displayMatrix(solution, "solution-table");
  displayHistory(history);

  displaySolutionSet(matrix);

  document.getElementById("solution-container").style.display = "block";
  document.getElementById("history-container").style.display = "block";
  document.getElementById("solution-set-container").style.display = "block";
}

const monthSelect = document.getElementById("month-select");
const currencyLabel = document.getElementById("currency-label");
const transactionsList = document.getElementById("list");
const totalSpan = document.getElementById("total");
const chartCanvas = document.getElementById("monthlyChart");
const budgetInput = document.getElementById("monthly-budget");

let currentMonth = new Date().getMonth();
let currency = localStorage.getItem("currency") || "₹";
document.getElementById("currency").value = currency;

let budgets = JSON.parse(localStorage.getItem("budgets") || "{}");
let transactions = JSON.parse(localStorage.getItem("transactions") || "{}");

function populateMonthDropdown() {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  monthSelect.innerHTML = "";
  months.forEach((month, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = month;
    if (index === currentMonth) option.selected = true;
    monthSelect.appendChild(option);
  });
}

function getCurrentKey() {
  return String(monthSelect.value); // ensure it's always string
}


function render() {
  const key = getCurrentKey();
  const txs = transactions[key] || [];
  const budget = budgets[key] || "";
  let total = 0;

  budgetInput.value = budget;

  transactionsList.innerHTML = "";
  txs.forEach((t, index) => {
    const li = document.createElement("li");
    li.className = t.amount < 0 ? "expense" : "income";
    const tagsText = t.tags && t.tags.length ? ` | [${t.tags.join(", ")}]` : "";
    const timeText = t.timestamp ? ` @ ${t.timestamp}` : "";
    li.innerHTML = `
    <strong>${t.desc}</strong>: ${currency}${t.amount} 
    <span style="font-size: 0.85em; color: gray;">
      ${t.tags && t.tags.length ? ` | [${t.tags.join(", ")}]` : ""} 
      ${t.timestamp ? ` | ${t.timestamp}` : ""}
    </span>
  `;
  
  
    
    li.onclick = () => removeTransaction(index);
    transactionsList.appendChild(li);
    total += t.amount;
  });

  totalSpan.textContent = total.toFixed(2);
  currencyLabel.textContent = currency;

  drawChart(budget, total);
}


function addTransaction() {
  const desc = document.getElementById("desc").value.trim();
  const amount = parseFloat(document.getElementById("amount").value);
  currency = document.getElementById("currency").value;
  localStorage.setItem("currency", currency);
  

  if (!desc || isNaN(amount)) {
    alert("Please enter valid inputs.");
    return;
  }

  currency = document.getElementById("currency").value;
  localStorage.setItem("currency", currency);

  const key = getCurrentKey();
  if (!transactions[key]) transactions[key] = [];
  const date = new Date();
  const timestamp = date.toLocaleString();
  
  const selectedTags = [];
  ["paid-section", "app-section", "loan-section"].forEach(id => {
    const activeBtn = document.querySelector(`#${id} .active`);
    if (activeBtn) selectedTags.push(activeBtn.textContent.trim());
  });
  
  transactions[key].push({ desc, amount, timestamp, tags: selectedTags });
  

  localStorage.setItem("transactions", JSON.stringify(transactions));

  document.getElementById("desc").value = "";
  document.getElementById("amount").value = "";
  render();
}

function removeTransaction(index) {
  const key = getCurrentKey();
  if (confirm("Remove this transaction?")) {
    transactions[key].splice(index, 1);
    localStorage.setItem("transactions", JSON.stringify(transactions));
    render();
  }
}

function setBudget() {
  const key = getCurrentKey();
  const budget = parseFloat(budgetInput.value);
  if (isNaN(budget)) {
    alert("Please enter a valid budget.");
    return;
  }
  if (budgets[key] && budgets[key] !== budget) {
    if (!confirm("Budget already exists. Update it?")) return;
  }
  budgets[key] = budget;
  localStorage.setItem("budgets", JSON.stringify(budgets));
  render();
}

let chart;
function drawChart(budget, spent) {
  if (chart) chart.destroy();
  if (!budget || isNaN(budget)) return;
  chart = new Chart(chartCanvas, {
    type: "doughnut",
    data: {
      labels: ["Spent", "Remaining"],
      datasets: [{
        data: [spent, Math.max(0, budget - spent)],
        backgroundColor: ["#f44336", "#4caf50"]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom"
        },
        tooltip: {
          callbacks: {
            label: function(ctx) {
              return `${ctx.label}: ${currency}${ctx.raw}`;
            }
          }
        }
      }
    }
  });
}

function highlightButton(btn) {
  const section = btn.parentElement;
  const buttons = section.querySelectorAll("button");
  buttons.forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
}


function addCustomOption() {
  const value = document.getElementById("custom-text").value.trim();
  const category = document.getElementById("custom-category").value;

  if (!value) {
    alert("Please enter a label.");
    return;
  }

  const section = document.getElementById(`${category}-section`);
  const button = document.createElement("button");
  button.textContent = value;
  button.onclick = function () { highlightButton(this); };
  section.appendChild(button);

  document.getElementById("custom-text").value = "";
  document.getElementById("custom-category").value = "paid";
}

populateMonthDropdown();
render();
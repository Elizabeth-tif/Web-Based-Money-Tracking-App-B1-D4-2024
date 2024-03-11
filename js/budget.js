let username = localStorage.getItem("loggedInUser").toString();

// Define the transactionArray variable
const transactionArray = JSON.parse(localStorage.getItem("transaction"+username)) || [];

// Function to update progress bar width
function updateProgressBarWidth(category, widthPercentage) {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes progress-bar-${category} {
      from {
        width: 0%;
      }
      to {
        width: ${widthPercentage}%;
      }
    }
  `;
  document.head.appendChild(style);
}

// Function to calculate percentage
function calculatePercentage(data1, data2) {
  return (data1 / data2) * 100;
}

// Function to change data value
function changeDataValue(category, value) {
  const progressBar = document.querySelector(
    `.progress[data-name="${category}"]`
  );
  if (progressBar) {
    progressBar.style.setProperty("--progress-width", `${value}%`);
  } else {
    console.error(`Progress bar element for category '${category}' not found.`);
  }
}

// Function to update budget value (numbers )
function changeBudgetValue(category, outcome, budget) {
  const progressItem = document.querySelector(
    `.progressItem[data-name="${category}"]`
  );
  if (progressItem) {
    progressItem.querySelector(".budget").textContent = `Rp. ${budget}`;
    progressItem.querySelector(".outcome").textContent = `Rp. ${outcome}`;
  } else {
    console.error(`Progress item for category '${category}' not found.`);
  }
}

// Function to calculate total outcome per category and update progress bars
function calculateTotalOutcomeAndPercentages() {
  setCategoryOutcomes();

  const gadgetOutcome = JSON.parse(localStorage.getItem("gadgetOutcome"+username)) || 0;
  const kebutuhanPokokOutcome =
    JSON.parse(localStorage.getItem("kebutuhanOutcome"+username)) || 0;
  const hiburanOutcome =
    JSON.parse(localStorage.getItem("hiburanOutcome"+username)) || 0;
  const kesehatanOutcome =
    JSON.parse(localStorage.getItem("kesehatanOutcome"+username)) || 0;
  const makananMinumanOutcome =
    JSON.parse(localStorage.getItem("makananOutcome"+username)) || 0;
  const pendidikanOutcome =
    JSON.parse(localStorage.getItem("pendidikanOutcome"+username)) || 0;
  const transportasiOutcome =
    JSON.parse(localStorage.getItem("transportasiOutcome"+username)) || 0;

  const gadgetBudget = JSON.parse(localStorage.getItem("gadgetBudget"+username)) || 0;
  const kebutuhanPokokBudget =
    JSON.parse(localStorage.getItem("kebutuhanBudget"+username)) || 0;
  const hiburanBudget = JSON.parse(localStorage.getItem("hiburanBudget"+username)) || 0;
  const kesehatanBudget =
    JSON.parse(localStorage.getItem("kesehatanBudget"+username)) || 0;
  const makananMinumanBudget =
    JSON.parse(localStorage.getItem("makananBudget"+username)) || 0;
  const pendidikanBudget =
    JSON.parse(localStorage.getItem("pendidikanBudget"+username)) || 0;
  const transportasiBudget =
    JSON.parse(localStorage.getItem("transportasiBudget"+username)) || 0;

  const gadgetPercentage = calculatePercentage(gadgetOutcome, gadgetBudget);
  const kebutuhanPokokPercentage = calculatePercentage(
    kebutuhanPokokOutcome,
    kebutuhanPokokBudget
  );
  const hiburanPercentage = calculatePercentage(hiburanOutcome, hiburanBudget);
  const kesehatanPercentage = calculatePercentage(
    kesehatanOutcome,
    kesehatanBudget
  );
  const makananMinumanPercentage = calculatePercentage(
    makananMinumanOutcome,
    makananMinumanBudget
  );
  const pendidikanPercentage = calculatePercentage(
    pendidikanOutcome,
    pendidikanBudget
  );
  const transportasiPercentage = calculatePercentage(
    transportasiOutcome,
    transportasiBudget
  );

  changeBudgetValue("Gadget", gadgetOutcome, gadgetBudget);
  changeBudgetValue(
    "Kebutuhan Pokok",
    kebutuhanPokokOutcome,
    kebutuhanPokokBudget
  );
  changeBudgetValue("Hiburan", hiburanOutcome, hiburanBudget);
  changeBudgetValue("Kesehatan", kesehatanOutcome, kesehatanBudget);
  changeBudgetValue(
    "Makanan & Minuman",
    makananMinumanOutcome,
    makananMinumanBudget
  );
  changeBudgetValue("Pendidikan", pendidikanOutcome, pendidikanBudget);
  changeBudgetValue("Transportasi", transportasiOutcome, transportasiBudget);

  changeDataValue("Gadget", gadgetPercentage);
  changeDataValue("Kebutuhan Pokok", kebutuhanPokokPercentage);
  changeDataValue("Hiburan", hiburanPercentage);
  changeDataValue("Kesehatan", kesehatanPercentage);
  changeDataValue("Makanan & Minuman", makananMinumanPercentage);
  changeDataValue("Pendidikan", pendidikanPercentage);
  changeDataValue("Transportasi", transportasiPercentage);

  // Target Calculation
  const monthlyOutcome = calculateMonthlyOutcome();
  const yearlyOutcome = calculateYearlyOutcome();

  const yearlyTarget = JSON.parse(localStorage.getItem("yearlyTarget"+username)) || 0;

  const monthlyPercentage = calculatePercentage(
    monthlyOutcome,
    yearlyTarget / 12
  );
  const yearlyPercentage = calculatePercentage(yearlyOutcome, yearlyTarget);

  if (monthlyOutcome <= 0) {
    // Set progress bars to 0 if total income and outcome is negative or 0
    changeDataValue("monthlyTarget", 0);
  } else if (yearlyOutcome <= 0) {
    changeDataValue("yearlyTarget", 0);
    if (monthlyOutcome > 0) {
      changeDataValue("monthlyTarget", monthlyPercentage);
    }
  } else {
    changeDataValue("monthlyTarget", monthlyPercentage);
    changeDataValue("yearlyTarget", yearlyPercentage);
  }

  // Display the actual total amount and target
  const monthlyTotal = document.querySelector('.progressItem[data-name="monthlyTarget"]');
  const yearlyTotal = document.querySelector('.progressItem[data-name="yearlyTarget"]');

  monthlyTotal.querySelector('.outcome').textContent =
    formatCurrency(monthlyOutcome) + ` / ${formatCurrency(yearlyTarget / 12)}`;
  yearlyTotal.querySelector('.outcome').textContent =
    formatCurrency(yearlyOutcome) + ` / ${formatCurrency(yearlyTarget)}`;
}

// Function to format currency in Rp. (Rupiah) format
function formatCurrency(amount) {
  return "Rp. " + amount.toLocaleString("id-ID");
}

// Function to retrieve budget for a specific category from local storage and update progress bars
function store() {
  const vCategory = document.getElementById("category").value;
  const vNumber = document.getElementById("budget").value;

  switch (vCategory) {
    case "Gadget":
      localStorage.setItem("gadgetBudget"+username, vNumber);
      break;
    case "Kebutuhan Pokok":
      localStorage.setItem("kebutuhanBudget"+username, vNumber);
      break;
    case "Hiburan":
      localStorage.setItem("hiburanBudget"+username, vNumber);
      break;
    case "Makanan & Minuman":
      localStorage.setItem("makananBudget"+username, vNumber);
      break;
    case "Pendidikan":
      localStorage.setItem("pendidikanBudget"+username, vNumber);
      break;
    case "Transportasi":
      localStorage.setItem("transportasiBudget"+username, vNumber);
      break;
    case "Kesehatan":
      localStorage.setItem("kesehatanBudget"+username, vNumber);
    default:
      console.error(`Invalid category: ${vCategory}`);
      break;
  }

  // Update progress bar
  calculateTotalOutcomeAndPercentages();
}

function storeTarget() {
  const vNumber = document.getElementById("target").value;
  localStorage.setItem("yearlyTarget"+username, vNumber);

  // Update progress bar
  calculateTotalOutcomeAndPercentages();
}

// Function to calculate total outcome per category and store in local storage
function setCategoryOutcomes() {
  let gadgetOutcome = 0;
  let kebutuhanPokokOutcome = 0;
  let hiburanOutcome = 0;
  let kesehatanOutcome = 0;
  let makananMinumanOutcome = 0;
  let pendidikanOutcome = 0;
  let transportasiOutcome = 0;

  // Get the current month and year
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Traverse through each transaction
  transactionArray.forEach((transaction) => {
    const transactionDate = new Date(transaction.date);
    const transactionMonth = transactionDate.getMonth();
    const transactionYear = transactionDate.getFullYear();

    // Check if the transaction's month and year match the current month and year
    if (
      transaction.type === "outcome" &&
      transactionMonth === currentMonth &&
      transactionYear === currentYear
    ) {
      const vCategory = transaction.category;
      switch (vCategory) {
        case "Gadget":
          gadgetOutcome += transaction.amount;
          break;
        case "Kebutuhan Pokok":
          kebutuhanPokokOutcome += transaction.amount;
          break;
        case "Hiburan":
          hiburanOutcome += transaction.amount;
          break;
        case "Kesehatan":
          kesehatanOutcome += transaction.amount;
          break;
        case "Makanan & Minuman":
          makananMinumanOutcome += transaction.amount;
          break;
        case "Pendidikan":
          pendidikanOutcome += transaction.amount;
          break;
        case "Transportasi":
          transportasiOutcome += transaction.amount;
          break;
        default:
          break;
      }
    }
  });

  // Store the outcome for each category in local storage
  localStorage.setItem("gadgetOutcome"+username, gadgetOutcome);
  localStorage.setItem("kebutuhanOutcome"+username, kebutuhanPokokOutcome);
  localStorage.setItem("hiburanOutcome"+username, hiburanOutcome);
  localStorage.setItem("kesehatanOutcome"+username, kesehatanOutcome);
  localStorage.setItem("makananOutcome"+username, makananMinumanOutcome);
  localStorage.setItem("pendidikanOutcome"+username, pendidikanOutcome);
  localStorage.setItem("transportasiOutcome"+username, transportasiOutcome);
}

// Function to calculate total monthly outcome
function calculateMonthlyOutcome() {
  let monthlyOutcome = 0;
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  transactionArray.forEach((transaction) => {
    const transactionDate = new Date(transaction.date);
    const transactionMonth = transactionDate.getMonth();
    const transactionYear = transactionDate.getFullYear();

    if (transactionYear === currentYear && transactionMonth === currentMonth) {
      if (transaction.type === "outcome") {
        monthlyOutcome -= transaction.amount; // Subtract the outcome amount
      } else if (transaction.type === "income") {
        monthlyOutcome += transaction.amount; // Add the income amount
      }
    }
  });

  return monthlyOutcome;
}

// Function to calculate total yearly outcome
function calculateYearlyOutcome() {
  let yearlyOutcome = 0;
  const currentYear = new Date().getFullYear();

  transactionArray.forEach((transaction) => {
    const transactionYear = new Date(transaction.date).getFullYear();

    if (transactionYear === currentYear) {
      if (transaction.type === "outcome") {
        yearlyOutcome -= transaction.amount; // Subtract the outcome amount
      } else if (transaction.type === "income") {
        yearlyOutcome += transaction.amount; // Add the income amount
      }
    }
  });

  return yearlyOutcome;
}

// Initial calculation
calculateTotalOutcomeAndPercentages();

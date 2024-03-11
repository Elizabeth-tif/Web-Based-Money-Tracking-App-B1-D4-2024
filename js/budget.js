// Define the transactionArray variable
const transactionArray = JSON.parse(localStorage.getItem('transaction')) || [];

// Function to update progress bar width
function updateProgressBarWidth(category, widthPercentage) {
  const style = document.createElement('style');
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
  const progressBar = document.querySelector(`.progress[data-name="${category}"]`);
  if (progressBar) {
    progressBar.style.setProperty('--progress-width', `${value}%`);
  } else {
    console.error(`Progress bar element for category '${category}' not found.`);
  }
}

// Function to update budget value (numbers )
function changeBudgetValue(category, outcome, budget) {
  const progressItem = document.querySelector(`.progressItem[data-name="${category}"]`);
  if(progressItem) {
    progressItem.querySelector('.budget').textContent = `Rp. ${budget}`;
    progressItem.querySelector('.outcome').textContent = `Rp. ${outcome}`;
  } else {
    console.error(`Progress item for category '${category}' not found.`);
  }
}

// Function to calculate total outcome per category and update progress bars
function calculateTotalOutcomeAndPercentages() {
  setCategoryOutcomes();

  const gadgetOutcome = JSON.parse(localStorage.getItem('gadgetOutcome')) || 0;
  const kebutuhanPokokOutcome = JSON.parse(localStorage.getItem('kebutuhanOutcome')) || 0;
  const hiburanOutcome = JSON.parse(localStorage.getItem('hiburanOutcome')) || 0;
  const kesehatanOutcome = JSON.parse(localStorage.getItem('kesehatanOutcome')) || 0;
  const makananMinumanOutcome = JSON.parse(localStorage.getItem('makananOutcome')) || 0;
  const pendidikanOutcome = JSON.parse(localStorage.getItem('pendidikanOutcome')) || 0;
  const transportasiOutcome = JSON.parse(localStorage.getItem('transportasiOutcome')) || 0;

  const gadgetBudget = JSON.parse(localStorage.getItem('gadgetBudget')) || 0;
  const kebutuhanPokokBudget = JSON.parse(localStorage.getItem('kebutuhanBudget')) || 0;
  const hiburanBudget = JSON.parse(localStorage.getItem('hiburanBudget')) || 0;
  const kesehatanBudget = JSON.parse(localStorage.getItem('kesehatanBudget')) || 0;
  const makananMinumanBudget = JSON.parse(localStorage.getItem('makananBudget')) || 0;
  const pendidikanBudget = JSON.parse(localStorage.getItem('pendidikanBudget')) || 0;
  const transportasiBudget = JSON.parse(localStorage.getItem('transportasiBudget')) || 0;

  const gadgetPercentage = calculatePercentage(gadgetOutcome, gadgetBudget);
  const kebutuhanPokokPercentage = calculatePercentage(kebutuhanPokokOutcome, kebutuhanPokokBudget);
  const hiburanPercentage = calculatePercentage(hiburanOutcome, hiburanBudget);
  const kesehatanPercentage = calculatePercentage(kesehatanOutcome, kesehatanBudget);
  const makananMinumanPercentage = calculatePercentage(makananMinumanOutcome, makananMinumanBudget);
  const pendidikanPercentage = calculatePercentage(pendidikanOutcome, pendidikanBudget);
  const transportasiPercentage = calculatePercentage(transportasiOutcome, transportasiBudget);

  changeBudgetValue('Gadget', gadgetOutcome, gadgetBudget);
  changeBudgetValue('Kebutuhan Pokok', kebutuhanPokokOutcome, kebutuhanPokokBudget);
  changeBudgetValue('Hiburan', hiburanOutcome, hiburanBudget);
  changeBudgetValue('Kesehatan', kesehatanOutcome, kesehatanBudget);
  changeBudgetValue('Makanan & Minuman', makananMinumanOutcome, makananMinumanBudget);
  changeBudgetValue('Pendidikan', pendidikanOutcome, pendidikanBudget);
  changeBudgetValue('Transportasi', transportasiOutcome, transportasiBudget);

  changeDataValue('Gadget', gadgetPercentage);
  changeDataValue('Kebutuhan Pokok', kebutuhanPokokPercentage);
  changeDataValue('Hiburan', hiburanPercentage);
  changeDataValue('Kesehatan', kesehatanPercentage);
  changeDataValue('Makanan & Minuman', makananMinumanPercentage);
  changeDataValue('Pendidikan', pendidikanPercentage);
  changeDataValue('Transportasi', transportasiPercentage);
}

// Function to retrieve budget for a specific category from local storage and update progress bars
function store() {
  const vCategory = document.getElementById('category').value;
  const vNumber = document.getElementById('budget').value;

  switch (vCategory) {
    case 'Gadget':
      localStorage.setItem('gadgetBudget', vNumber);
      break;
    case 'Kebutuhan Pokok':
      localStorage.setItem('kebutuhanBudget', vNumber);
      break;
    case 'Hiburan':
      localStorage.setItem('hiburanBudget', vNumber);
      break;
    case 'Makanan & Minuman':
      localStorage.setItem('makananBudget', vNumber);
      break;
    case 'Pendidikan':
      localStorage.setItem('pendidikanBudget', vNumber);
      break;
    case 'Transportasi':
      localStorage.setItem('transportasiBudget', vNumber);
      break;
    case 'Kesehatan':
      localStorage.setItem('kesehatanBudget', vNumber);
    default:
      console.error(`Invalid category: ${vCategory}`);
      break;
  }

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
  transactionArray.forEach(transaction => {
    const transactionDate = new Date(transaction.date);
    const transactionMonth = transactionDate.getMonth();
    const transactionYear = transactionDate.getFullYear();

    // Check if the transaction's month and year match the current month and year
    if (transaction.type === 'outcome' && transactionMonth === currentMonth && transactionYear === currentYear) {
      const vCategory = transaction.category;
      switch (vCategory) {
        case 'Gadget':
          gadgetOutcome += transaction.amount;
          break;
        case 'Kebutuhan Pokok':
          kebutuhanPokokOutcome += transaction.amount;
          break;
        case 'Hiburan':
          hiburanOutcome += transaction.amount;
          break;
        case 'Kesehatan':
          kesehatanOutcome += transaction.amount;
          break;
        case 'Makanan & Minuman':
          makananMinumanOutcome += transaction.amount;
          break;
        case 'Pendidikan':
          pendidikanOutcome += transaction.amount;
          break;
        case 'Transportasi':
          transportasiOutcome += transaction.amount;
          break;
        default:
          break;
      }
    }
  });

  // Store the outcome for each category in local storage
  localStorage.setItem('gadgetOutcome', gadgetOutcome);
  localStorage.setItem('kebutuhanOutcome', kebutuhanPokokOutcome);
  localStorage.setItem('hiburanOutcome', hiburanOutcome);
  localStorage.setItem('kesehatanOutcome', kesehatanOutcome);
  localStorage.setItem('makananOutcome', makananMinumanOutcome);
  localStorage.setItem('pendidikanOutcome', pendidikanOutcome);
  localStorage.setItem('transportasiOutcome', transportasiOutcome);
}


// Initial calculation
calculateTotalOutcomeAndPercentages();
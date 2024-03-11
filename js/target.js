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
        console.error(`Progress element for category '${category}' not found.`);
    }
}

// Function to calculate total outcome per category and update progress bars
// Function to calculate total outcome per category and update progress bars
function calculateTotalOutcomeAndPercentages() {
    const monthlyOutcome = calculateMonthlyOutcome();
    const yearlyOutcome = calculateYearlyOutcome();

    const yearlyTarget = JSON.parse(localStorage.getItem('yearlyTarget')) || 0;

    const monthlyPercentage = calculatePercentage(monthlyOutcome, yearlyTarget / 12);
    const yearlyPercentage = calculatePercentage(yearlyOutcome, yearlyTarget);

    if (monthlyOutcome <= 0) {
        // Set progress bars to 0 if total income and outcome is negative or 0
        changeDataValue('Monthly', 0);
    } else if (yearlyOutcome <= 0) {
        changeDataValue('Yearly', 0);
        if (monthlyOutcome > 0) {
            changeDataValue('Monthly', monthlyPercentage);
        }
    } else {
        changeDataValue('Monthly', monthlyPercentage);
        changeDataValue('Yearly', yearlyPercentage);
    }

    // Display the actual total amount and target
    const monthlyTotal = document.getElementById('monthlyTotal');
    const yearlyTotal = document.getElementById('yearlyTotal');

    monthlyTotal.textContent = formatCurrency(monthlyOutcome) + ` / ${formatCurrency(yearlyTarget / 12)}`;
    yearlyTotal.textContent = formatCurrency(yearlyOutcome) + ` / ${formatCurrency(yearlyTarget)}`;
}

// Function to format currency in Rp. (Rupiah) format
function formatCurrency(amount) {
    return 'Rp. ' + amount.toLocaleString('id-ID');
}

// Function to store the yearly target and update progress bars
function store() {
    const vNumber = document.getElementById('target').value;
    localStorage.setItem('yearlyTarget', vNumber);

    // Update progress bar
    calculateTotalOutcomeAndPercentages();
}

// Function to calculate total monthly outcome
// Function to calculate total monthly outcome
function calculateMonthlyOutcome() {
    let monthlyOutcome = 0;
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    transactionArray.forEach(transaction => {
        const transactionDate = new Date(transaction.date);
        const transactionMonth = transactionDate.getMonth();
        const transactionYear = transactionDate.getFullYear();

        if (transactionYear === currentYear && transactionMonth === currentMonth) {
            if (transaction.type === 'outcome') {
                monthlyOutcome -= transaction.amount; // Subtract the outcome amount
            } else if (transaction.type === 'income') {
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

    transactionArray.forEach(transaction => {
        const transactionYear = new Date(transaction.date).getFullYear();

        if (transactionYear === currentYear) {
            if (transaction.type === 'outcome') {
                yearlyOutcome -= transaction.amount; // Subtract the outcome amount
            } else if (transaction.type === 'income') {
                yearlyOutcome += transaction.amount; // Add the income amount
            }
        }
    });

    return yearlyOutcome;
}


// Initial calculation
calculateTotalOutcomeAndPercentages();

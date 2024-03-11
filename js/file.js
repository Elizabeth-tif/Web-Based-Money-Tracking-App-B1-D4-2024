// Function to save transaction data to local storage
function saveTransactionToLocalStorage(newTransaction) {
    var incomeArray = [];
    var outcomeArray = [];

    var transactionArray = JSON.parse(localStorage.getItem('transaction')) || [];

    // Convert amount to number
    newTransaction.amount = parseFloat(newTransaction.amount);

    // Check if there's an existing transaction with the same date
    var existingTransaction = transactionArray.find(function(transaction) {
        return transaction.type === newTransaction.type && transaction.date === newTransaction.date;
    });

    if (existingTransaction) {
        // If a transaction with the same date exists, add the amount to it
        existingTransaction.amount += newTransaction.amount;
    } else {
        // If no transaction with the same date exists, push the new transaction
        transactionArray.push(newTransaction);
    }

    // Separate income and outcome transactions
    transactionArray.forEach(function(transaction) {
        if (transaction.type === 'income') {
            incomeArray.push({ date: transaction.date, income: transaction.amount });
        } else {
            outcomeArray.push({ date: transaction.date, outcome: transaction.amount });
        }
    });

    // Update local storage with the updated arrays
    localStorage.setItem('transaction', JSON.stringify(transactionArray));
    localStorage.setItem('income', JSON.stringify(incomeArray));
    localStorage.setItem('outcome', JSON.stringify(outcomeArray));
}


// Function to convert transaction data to CSV string
function convertToCSV(transaction) {
    var csv = '';
    transaction.forEach(function(transaction) {
        csv += `${transaction.type},${transaction.date},${transaction.amount},${transaction.category},${transaction.notes}\n`;
    });
    return csv;
}

// Function to download CSV file
function downloadCSV(csv, filename) {
    var csvFile;
    var downloadLink;

    // Create CSV file
    csvFile = new Blob([csv], {type: 'text/csv'});
    downloadLink = document.createElement('a');
    downloadLink.download = filename;
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);

    // Trigger download
    downloadLink.click();

    // Clean up
    document.body.removeChild(downloadLink);
}

// Function to display saved transaction data
function displaySavedTransaction() {
    var savedTransactionDiv = document.getElementById('savedTransaction');
    var transaction = JSON.parse(localStorage.getItem('transaction')) || [];

    savedTransactionDiv.innerHTML = ''; // Clear previous content

    if (transaction.length === 0) {
        savedTransactionDiv.textContent = 'No transaction saved.';
    } else {
        transaction.forEach(function(transaction, index) {
            var transactionString = `Transaction ${index + 1}: Type - ${transaction.type}, Date - ${transaction.date}, Amount - ${transaction.amount}, Category - ${transaction.category}, Notes - ${transaction.notes}`;
            var p = document.createElement('p');
            p.textContent = transactionString;
            savedTransactionDiv.appendChild(p);
        });
    }
}

// Function to save transaction data from CSV to local storage
function saveTransactionsFromCSV(csvContent) {
    // Split CSV content into rows
    var rows = csvContent.split('\n');

    // Extract transaction data from each row
    rows.forEach(function(row) {
        var columns = row.split(',').map(column => column.trim()); // Trim whitespace from each column
        if (columns.length === 5) { // Ensure there are five columns in the row
            var transaction = {
                type: columns[0],
                date: columns[1],
                amount: parseFloat(columns[2]), // Convert amount to number
                category: columns[3],
                notes: columns[4]
            };
            // Save transaction to local storage
            saveTransactionToLocalStorage(transaction);
        }
    });

    // Update UI to display loaded transaction
    displaySavedTransaction();
}

// Function to read CSV file
function readCSVFile(file) {
    var reader = new FileReader();
    reader.onload = function(event) {
        var csvContent = event.target.result;
        // Save transaction from CSV to local storage
        saveTransactionsFromCSV(csvContent);
    };
    reader.readAsText(file);
}

// Event listener for form submission
document.getElementById('transactionForm').addEventListener('submit', function(event) {
    event.preventDefault();
    var formData = new FormData(this);
    var transaction = {};
    formData.forEach(function(value, key){
        transaction[key] = value;
    });
    // Save transaction to local storage
    saveTransactionToLocalStorage(transaction);
    // Update UI to display saved transaction
    displaySavedTransaction();
});

// Event listener for exporting CSV
document.getElementById('exportCSV').addEventListener('click', function() {
    var transaction = JSON.parse(localStorage.getItem('transaction')) || [];
    var csv = convertToCSV(transaction);
    downloadCSV(csv, 'transaction.csv');
});

// Event listener for file input change
document.getElementById('fileInput').addEventListener('change', function(event) {
    var file = event.target.files[0];
    if (file) {
        // Read CSV file
        readCSVFile(file);
    }
});

// Display saved transaction when the page loads
window.addEventListener('load', function () {
    displaySavedTransaction();
});

// Function to add new income
function newIncome(arrayIncome, arrayAllTransaction, ls) {
    // Get values from input form
    var vIncome = document.forms["incomeForm"]["income"].value;
    var vDate = document.forms["incomeForm"]["date"].value;
    var vNotes = document.forms["incomeForm"]["incomeNotes"].value;

    // Parse values to appropriate data types
    vIncome = parseInt(vIncome);
    vDate = new Date(vDate);

    // Check if there's an object with the same date
    var found = arrayIncome.find(function(element) {
        return new Date(element.date).toDateString() === vDate.toDateString();
    });

    if (found) {
        // If there's a matching date, add the income amount to the existing entry
        found.income += vIncome;
    } else {
        // If there's no matching date, create a new object and push it to the array
        const obj = {date: vDate, income: vIncome};
        arrayIncome.push(obj);
    }

    // Create transaction object and push it to the allTransaction array
    const transaction = {type: 'income', date: vDate, amount: vIncome, category: 'Income', notes: vNotes};
    arrayAllTransaction.push(transaction);

    // Update local storage with the updated arrays
    ls.setItem('income', JSON.stringify(arrayIncome));
    ls.setItem('transaction', JSON.stringify(arrayAllTransaction));

    // Call the function to update the graph
    dailyGraph();

    // Prevent the page from refreshing after submission
    return false;
}

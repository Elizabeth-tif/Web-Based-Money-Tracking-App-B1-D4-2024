const addOutcomeBtn1 = document.getElementsByClassName("addOutcome")[0];
const addOutcomeBtn2 = document.getElementsByClassName("addOutcome")[1];
const addIncomeBtn1 = document.getElementsByClassName("addIncome")[0];
const addIncomeBtn2 = document.getElementsByClassName("addIncome")[1];
const outcomeForm = document.querySelector("#outcomeForm");
const incomeForm = document.querySelector("#incomeForm");
let outcomeToggle = false;
let incomeToggle = false;

addOutcomeBtn1.addEventListener("click", function () {
  if (!incomeToggle) {
    outcomeForm.classList.toggle("slide");
    outcomeToggle = !outcomeToggle;
  }
});

addOutcomeBtn2.addEventListener("click", function () {
  if (!incomeToggle) {
    outcomeForm.classList.toggle("slide");
    outcomeToggle = !outcomeToggle;
  }
});

addIncomeBtn1.addEventListener("click", function () {
  if (!outcomeToggle) {
    incomeForm.classList.toggle("slide");
    incomeToggle = !incomeToggle;
  }
});

addIncomeBtn2.addEventListener("click", function () {
  if (!outcomeToggle) {
    incomeForm.classList.toggle("slide");
    incomeToggle = !incomeToggle;
  }
});

let ls = window.localStorage;
var myChart;

//memasukkan data dari local storage ke array
var arrayIncome = ls.getItem("income"); //array data income (untuk rekap)
var arrayOutcome = ls.getItem("outcome"); //array data outcome (untuk rekap)
var arrayAllTransaction = ls.getItem("transaction"); //array seluruh transaksi (untuk transaction)

//set min dan max tanggal yang bisa diinput
let minDate = new Date(2020, 0, 1); //min date = 01-01-2023
let minDateString = minDate.toLocaleDateString("en-CA"); //agar formatnya jadi YYYY-MM-DD
let maxDate = new Date(); //max date = hari ini
let maxDateString = maxDate.toLocaleDateString("en-CA"); //agar formatnya jadi YYYY-MM-DD
document.forms["incomeForm"]["date"].setAttribute("min", minDateString);
document.forms["incomeForm"]["date"].setAttribute("max", maxDateString);
document.forms["outcomeForm"]["date"].setAttribute("min", minDateString);
document.forms["outcomeForm"]["date"].setAttribute("max", maxDateString);

//parsing data dari local storage, yang asalnya array jadi bertype, jika key local storage masih kosong, diisi array kosong
if (arrayIncome && arrayIncome.length > 0) {
  arrayIncome = JSON.parse(arrayIncome);
} else {
  arrayIncome = [];
}
if (arrayOutcome && arrayOutcome.length > 0) {
  arrayOutcome = JSON.parse(arrayOutcome);
} else {
  arrayOutcome = [];
}
if (arrayAllTransaction && arrayAllTransaction.length > 0) {
  arrayAllTransaction = JSON.parse(arrayAllTransaction);
} else {
  arrayAllTransaction = [];
}

//sort array berdasarkan date (ascending)
arrayIncome.sort(function (a, b) {
  return new Date(a.date) - new Date(b.date);
});
arrayOutcome.sort(function (a, b) {
  return new Date(a.date) - new Date(b.date);
});
arrayAllTransaction.sort(function (a, b) {
  return new Date(a.date) - new Date(b.date);
});

/*=============================== BEGIN LOGIN USER =================================*/
// let user = JSON.parse(ls.getItem("users"))[ls.getItem("loggedInUser")];

// if (!user) {
//   window.location.href = "signin.html";
// }

// let span = document.getElementsByClassName("user");
// for (let i = 0; i < span.length; i++) {
//   span[i].innerHTML = user.username;
// }
/*=============================== END LOGIN USER =================================*/
expenseGraph();
summary();
currentSaldo();

//function untuk mengambil nilai dari local storage
function getLocalStorageData(sorted) {
  //ambil data array dari local storage yang fieldnya namanya income dan outcome
  var dailyArrayIncome = ls.getItem("income");
  var dailyArrayOutcome = ls.getItem("outcome");

  //parsing dari local storage, asalnya String jadi menjadi type
  if (dailyArrayIncome && dailyArrayIncome.length > 0) {
    dailyArrayIncome = JSON.parse(dailyArrayIncome);
  } else {
    dailyArrayIncome = [];
  }
  if (dailyArrayOutcome && dailyArrayOutcome.length > 0) {
    dailyArrayOutcome = JSON.parse(dailyArrayOutcome);
  } else {
    dailyArrayOutcome = [];
  }

  //jika parameternya true, maka akan di sort
  if (sorted == true) {
    //sorting array sesuai tanggal (ascending)
    dailyArrayIncome.sort(function (a, b) {
      return new Date(a.date) - new Date(b.date);
    });
    dailyArrayOutcome.sort(function (a, b) {
      return new Date(a.date) - new Date(b.date);
    });
  }

  return { dailyArrayIncome, dailyArrayOutcome };
}

//function dibawah ini untuk menampilkan chart pengeluaran berdasarkan category per bulan, dibuat menjadi pie chart
function expenseGraph() {
  //mengambil value bulan dan tahun yang dipilih dari input type dropdown
  var selectedMonth = maxDate.getMonth() + 1;
  var selectedYear = maxDate.getFullYear();
  //array dengan isi setiap bulan
  const month = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  //array pengeluaran per hari
  const expenseDaily = [];
  //nilai untuk sumbu x di chart nanti, sumbu x ini adalah keterangan dari per bagian pie chartnya
  const xValues = [
    "Gadget",
    "Hiburan",
    "Kesehatan",
    "Makanan & Minuman",
    "Pendidikan",
    "Transportasi",
  ];
  //array nilai untuk total per kategori dalam 1 bulan
  const yValues = [];
  //array untuk warna masing masing category
  var barColors = [
    "#b91d47",
    "#00aba9",
    "#2b5797",
    "#e8c3b9",
    "#1e7145",
    "orange",
  ];
  const totalExpenseCat = new Array(6).fill(0); // Pembuatan array total income per bulan dengan size 12 dan isi dengan 0

  // Menghapus chart sebelumnya apabila sudah ada (untuk prevent duplikasi chart)
  if (myChart) {
    myChart.destroy();
  }

  //pengambilan value dari local storage dengan key transaction untuk mengambil semua transaksi
  var transactionArray = ls.getItem("transaction");

  //parsing dari local storage, asalnya String jadi menjadi type
  if (transactionArray && transactionArray.length > 0) {
    transactionArray = JSON.parse(transactionArray);
  } else {
    transactionArray = [];
  }

  //sortir array berdasarkan kategori
  transactionArray.sort(function (a, b) {
    return a.category.localeCompare(b.category);
  });

  //filter isi array berdasarkan type outcome saja, lalu diinput ke array baru
  for (let index = 0; index < transactionArray.length; index++) {
    if (transactionArray[index].type == "outcome") {
      expenseDaily.push(transactionArray[index]);
    }
  }

  //index untuk pengecekan array xValues
  let idx = 0;
  //for loop untuk penambahan jumlah pengeluaran per kategori dalam 1 bulan
  for (let index = 0; index < expenseDaily.length; index++) {
    let date = new Date(expenseDaily[index].date); //pembuatan objek date dari field array

    //kondisi penambahan ke array dengan index idx apabila bulan dan kategori sama
    if (
      date.getMonth() + 1 == selectedMonth &&
      expenseDaily[index].category == xValues[idx] &&
      selectedYear == date.getFullYear()
    ) {
      totalExpenseCat[idx] += expenseDaily[index].amount;
    } else if (selectedYear == date.getFullYear()) {
      //kondisi apabila kategori / bulan sudah berbeda
      idx = xValues.indexOf(expenseDaily[index].category);
      if (idx !== -1 && date.getMonth() + 1 == selectedMonth) {
        totalExpenseCat[idx] += expenseDaily[index].amount;
      }
    }
  }

  //memasukkan value hasil penambahan tadi ke yValue
  for (let index = 0; index < totalExpenseCat.length; index++) {
    yValues.push(totalExpenseCat[index]);
  }

  //pembuatan pieChart untuk menampilkan pengeluaran per kategori dalam 1 bulan
  myChart = new Chart("pieChart", {
    type: "pie", //jenis chart
    data: {
      labels: xValues, //informasi per kategori
      datasets: [
        {
          backgroundColor: barColors, //warna tiap kategori
          data: yValues, //jumlah pengeluaran tiap kategori
        },
      ],
    },
    options: {
      title: {
        display: true,
        text:
          "Pengeluaran Berdasarkan Kategori di Bulan " +
          month[selectedMonth - 1] +
          " Tahun " +
          selectedYear,
      },
    },
  });
}

//function Income baru untuk memasukkan pemasukan baru
function newIncome() {
  //untuk dapat value dari input form
  var vIncome = document.forms["incomeForm"]["income"].value;
  var vDate = document.forms["incomeForm"]["date"].value;
  var vNotes = document.forms["incomeForm"]["incomeNotes"].value;

  //merubah type agar sesuai tipe data (parsing)
  vIncome = parseInt(vIncome);
  vDate = new Date(vDate);

  // Mengecek apabila ada objek dengan tanggal yang sama
  var found = arrayIncome.find(function (element) {
    return new Date(element.date).toDateString() === vDate.toDateString();
  });

  if (found) {
    // Apabila ada tanggal yang sama, maka hanya perlu menambahkan income (agar tidak ada duplikasi date)
    found.income += vIncome;
  } else {
    // Jika tidak ada tanggal yang sama, buat menjadi objek, lalu push ke array
    const obj = { date: vDate, income: vIncome };
    arrayIncome.push(obj);
  }

  //append ke array alltransaction agar pemasukan masuk ke transaction, dibuat juga objeknya
  const transaction = {
    type: "income",
    date: vDate,
    amount: vIncome,
    category: "",
    notes: vNotes,
  };
  arrayAllTransaction.push(transaction);

  //masukin data hasil array ke local storage
  ls.setItem("income", JSON.stringify(arrayIncome));
  ls.setItem("transaction", JSON.stringify(arrayAllTransaction));
}

//function untuk mencatat pengeluaran baru
function newOutcome() {
  //untuk dapat value dari input form
  var vOutcome = document.forms["outcomeForm"]["outcome"].value;
  var vDate = document.forms["outcomeForm"]["date"].value;
  var vNotes = document.forms["outcomeForm"]["outcomeNotes"].value;
  var Category = document.getElementById("outcomeCategory").value;

  //merubah type agar sesuai tipe data (parsing)
  vOutcome = parseInt(vOutcome);
  vDate = new Date(vDate);

  // Mengecek apabila ada objek dengan tanggal yang sama
  var found = arrayOutcome.find(function (element) {
    return new Date(element.date).toDateString() === vDate.toDateString();
  });

  if (found) {
    // Apabila ada tanggal yang sama, maka hanya perlu menambahkan income (agar tidak ada duplikasi date)
    found.outcome += vOutcome;
  } else {
    // If it doesn't, push a new object to the array
    const obj = { date: vDate, outcome: vOutcome };
    arrayOutcome.push(obj);
  }

  //append ke array alltransaction agar pengeluaran ini masuk ke transaksi
  const transaction = {
    type: "outcome",
    date: vDate,
    amount: vOutcome,
    category: Category,
    notes: vNotes,
  };
  arrayAllTransaction.push(transaction);

  //masukin data hasil array ke local storage
  ls.setItem("outcome", JSON.stringify(arrayOutcome));
  ls.setItem("transaction", JSON.stringify(arrayAllTransaction));
}

//fungsi untuk menampilkan summary total expenses dan total incomes di homepage
function summary() {
  //memanggil function getLocalStorageData untuk mendapatkan data dari local storage
  var { dailyArrayIncome, dailyArrayOutcome } = getLocalStorageData(true);
  const totalPerBulanIncome = new Array(2).fill(0); // Pembuatan array total income per bulan dengan size 2 dan isi dengan 0
  const totalPerBulanOutcome = new Array(2).fill(0); // Pembuatan array total outcome per bulan dengan size 2 dan isi dengan 0

  var nowDate = new Date();
  var currentMonth = nowDate.getMonth();
  var lastMonth = nowDate.getMonth() - 1;

  for (let index = 0; index < dailyArrayIncome.length; index++) {
    let date = new Date(dailyArrayIncome[index].date);

    if (
      date.getMonth() == currentMonth &&
      date.getFullYear() == nowDate.getFullYear()
    ) {
      totalPerBulanIncome[0] =
        totalPerBulanIncome[0] + dailyArrayIncome[index].income;
    } else if (
      date.getMonth() == lastMonth &&
      date.getFullYear() == nowDate.getFullYear()
    ) {
      totalPerBulanIncome[1] =
        totalPerBulanIncome[1] + dailyArrayIncome[index].income;
    }
  }
  for (let index = 0; index < dailyArrayOutcome.length; index++) {
    let date = new Date(dailyArrayOutcome[index].date);

    if (
      date.getMonth() == currentMonth &&
      date.getFullYear() == nowDate.getFullYear()
    ) {
      totalPerBulanOutcome[0] =
        totalPerBulanOutcome[0] + dailyArrayOutcome[index].outcome;
    } else if (
      date.getMonth() == lastMonth &&
      date.getFullYear() == nowDate.getFullYear()
    ) {
      totalPerBulanOutcome[1] =
        totalPerBulanOutcome[1] + dailyArrayOutcome[index].outcome;
    }
  }

  //merubah isi dari summary
  document.getElementById("lastMonthOutcome").innerHTML =
    "- Rp. " + new Intl.NumberFormat('en-US').format(totalPerBulanOutcome[1])+".00";
  document.getElementById("thisMonthOutcome").innerHTML =
    "- Rp. " + new Intl.NumberFormat('en-US').format(totalPerBulanOutcome[0])+".00";
  document.getElementById("lastMonthIncome").innerHTML =
    "+ Rp. " + new Intl.NumberFormat('en-US').format(totalPerBulanIncome[1])+".00";
  document.getElementById("thisMonthIncome").innerHTML =
    "+ Rp. " + new Intl.NumberFormat('en-US').format(totalPerBulanIncome[0])+".00";
}

//function untuk menampilkan saldo saat ini, dihitung dari awal tahun
function currentSaldo(){
  //memanggil function getLocalStorageData untuk mendapatkan data dari local storage
  var{dailyArrayIncome, dailyArrayOutcome} = getLocalStorageData(true)

  //penampung totalIncome, totalOutcome, dan total
  var totalIncome = 0;
  let showIncome = 0;
  var totalOutcome = 0;
  let showOutcome = 0;
  var total = 0;
  let showTotal = 0;
  //menampung total income
  for (let index = 0; index < dailyArrayIncome.length; index++) {
      totalIncome = totalIncome + dailyArrayIncome[index].income;
  }

  //menampung total outcome
  for (let index = 0; index < dailyArrayOutcome.length; index++) {
      totalOutcome = totalOutcome + dailyArrayOutcome[index].outcome;
  }
  //total = total income - total outcome
  total = totalIncome-totalOutcome;
  showIncome = new Intl.NumberFormat('en-US').format(totalIncome)+".00"
  showOutcome = new Intl.NumberFormat('en-US').format(totalOutcome)+".00"
  showTotal = new Intl.NumberFormat('en-US').format(total)+".00"
  //agar dapat terlihat di web
  document.getElementById('currentBalance1').innerHTML=showTotal
  document.getElementById('currentBalance2').innerHTML="Rp. "+ showTotal
  // document.getElementById('totalIncome').innerHTML=showIncome
  // document.getElementById('totalOutcome').innerHTML=showOutcome
  return 0
}
currentSaldo()
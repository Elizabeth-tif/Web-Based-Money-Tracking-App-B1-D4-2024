//max date = hari ini
let maxDate = new Date();
//set min dan max tahun yang bisa diinput
document.getElementById("recapYear").value = maxDate.getFullYear();
document.getElementById("recapYear").setAttribute("min", 2020);
document.getElementById("recapYear").setAttribute("max", maxDate.getFullYear());

let ls = window.localStorage;
let username = ls.getItem("loggedInUser").toString()

// $(document).ready( function () {
//     $('#incometable').DataTable({
//         'ajax' : "/data/income.json",
//         'columns' :[
//             {'data' : 'day'},
//             {'data' : 'month'},
//             {'data' : 'year'},
//             {'data' : 'income'},
//         ]
//     });
// } );

// Inisialisasi
window.onload = function () {
    dailyRecap();
    weeklyRecap();
    monthlyRecap();
}

//function untuk mengambil nilai dari local storage
function getLocalStorageData(sorted) {
  //ambil data array dari local storage yang fieldnya namanya income dan outcome
  var dailyArrayIncome = ls.getItem("income"+username);
  var dailyArrayOutcome = ls.getItem("outcome"+username);

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

//function untuk menampilkan chart setiap hari dalam 1 bulan
function dailyRecap() {
  
  const namaBulan = [
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
  //deklarasi array sebagai value dari sumbu x dan y dari graph nya
  const xValues = [];
  const yValuesIncome = [];
  const yValuesOutcome = [];

  var tableDaily = $("#dailyTable").DataTable({
    search:{
    return : true
  },});

  tableDaily.clear();

  //ambil value dari input
  var selectedMonth = document.getElementById("recapMonth").value;
  var selectedYear = document.getElementById("recapYear").value;

  //memanggil function getLocalStorageData untuk mendapatkan data dari local storage
  var { dailyArrayIncome, dailyArrayOutcome } = getLocalStorageData(true);

  // mengkombinasikan array income dan outcome menjadi 1 array, lalu kemudian di sort berdasarkan date
  var combinedArray = [...dailyArrayIncome, ...dailyArrayOutcome];
  combinedArray.sort(function (a, b) {
    return new Date(a.date) - new Date(b.date);
  });

  // Membuat sebuah array yang merupakan unique dates, sehingga tidak ada duplikasi date dari income dan outcome
  var uniqueDates = [];
  combinedArray.forEach(function (item) {
    var dateStr = new Date(item.date).toDateString();
    //pengecekan apakah date per item sudah ada di array uniqueDates, jika belum maka masukkan date tersebut
    if (!uniqueDates.includes(dateStr)) {
      uniqueDates.push(dateStr);
    }
  });

  //memasukkan data ke array xValues dan yValues untuk graph
  for (let index = 0; index < uniqueDates.length; index++) {
    var date = new Date(uniqueDates[index]);

    // hanya memproses apabila date month nya ini sama dengan month yang dipilih di dropdown
    if (
      date.getMonth() + 1 == selectedMonth &&
      date.getFullYear() == selectedYear
    ) {
      //push tanggal ke array untuk value di sumbu x
      xValues.push(
        date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear()
      );

      // mencari income dari date ini, dilakukan pengecekan
      let incomeObj = dailyArrayIncome.find(function (element) {
        return new Date(element.date).toDateString() === date.toDateString();
      });
      //apabila income dengan date ini ditemukan, maka dipush ke array yValuesIncome, kalau tidak ada, push value 0
      yValuesIncome.push(incomeObj ? incomeObj.income : 0);

      // mencari outcome dari date ini, dilakukan pengecekan
      let outcomeObj = dailyArrayOutcome.find(function (element) {
        return new Date(element.date).toDateString() === date.toDateString();
      });
      //apabila income dengan date ini ditemukan, maka dipush ke array yValuesIncome, kalau tidak ada, push value 0
      yValuesOutcome.push(outcomeObj ? outcomeObj.outcome : 0);

      //var total = income - outcome
      let total =
        yValuesIncome[yValuesIncome.length - 1] -
        yValuesOutcome[yValuesOutcome.length - 1];

      var dateComponent = xValues[xValues.length - 1];
      dateComponent = dateComponent.split("/");
      var row = [
        parseInt(dateComponent[0]), //date
        yValuesIncome[yValuesIncome.length - 1],
        yValuesOutcome[yValuesOutcome.length - 1],
        total,
      ];

      // Add the new row to the DatatableTrans
      tableDaily.row.add(row);
    }
  }
  tableDaily.draw();

  //pembuatan chart sesuai dengan data yang sudah ada
  //   myChart = new Chart("dailyChart", {
  //     type: "line", //tipe chartnya
  //     data: {
  //       labels: xValues, //array buat nilai x berupa date
  //       datasets: [
  //         {
  //           label: "Income Per Hari",
  //           borderColor: "green",
  //           data: yValuesIncome, //array buat nilai y  untuk income
  //         },
  //         {
  //           label: "Outcome Per Hari",
  //           borderColor: "red",
  //           data: yValuesOutcome, //array buat nilai y untuk outcome
  //         },
  //       ],
  //     },
  //     options: {
  //       title: {
  //         display: true,
  //         text:
  //           "Income and Outcome Per Hari Di Bulan " +
  //           namaBulan[selectedMonth - 1] +
  //           " Di Tahun " +
  //           selectedYear,
  //         fontSize: 16,
  //         fontColor: "black",
  //       },
  //     },
  //   });
}

//function untuk menampilkan table dan chart setiap minggu dalam 1 bulan
var tableWeekly = $("#weeklyTable").DataTable({
  search:{
    return : true
  },
  columnDefs: [{ targets: [1], orderable: false }],
});
function weeklyRecap() {
  //mengambil year dari form weekly
  var selectedYear = document.getElementById("recapYear").value;

  //deklarasi array untuk value y graphic nya, dan untuk table juga
  const yValuesIncome = [];
  const yValuesOutcome = [];
  const xValues = [];

  const totalPerMingguIncome = new Array().fill(0);
  const totalPerMingguOutcome = new Array().fill(0);

  tableWeekly.clear();

  //memanggil function getLocalStorageData untuk mendapatkan data dari local storage
  var { dailyArrayIncome, dailyArrayOutcome } = getLocalStorageData(true);

  //membuat array baru untuk menampung data yang tahunnya sama
  var incomeArrayThisYear = [];
  var outcomeArrayThisYear = [];

  //memasukkan data ke array baru agar tahunnya sama dengan yang dipilih
  for (let index = 0; index < dailyArrayIncome.length; index++) {
    let date = new Date(dailyArrayIncome[index].date);
    if (date.getFullYear() == selectedYear) {
      incomeArrayThisYear.push(dailyArrayIncome[index]);
    }
  }

  //memasukkan data ke array baru agar tahunnya sama dengan yang dipilih
  for (let index = 0; index < dailyArrayOutcome.length; index++) {
    let date = new Date(dailyArrayOutcome[index].date);
    if (date.getFullYear() == selectedYear) {
      outcomeArrayThisYear.push(dailyArrayOutcome[index]);
    }
  }

  var mingguKe = 1;
  var incomeIdx = 0;
  var outcomeIdx = 0;
  var weeklyIncome = 0;
  var weeklyOutcome = 0;

  var date = new Date(selectedYear, 0, 1);
  var firstDay =
    date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
  var lastDay;

  if (
    incomeArrayThisYear &&
    incomeIdx < incomeArrayThisYear.length &&
    outcomeArrayThisYear &&
    outcomeIdx < outcomeArrayThisYear.length
  ) {
    while (date.getFullYear() == selectedYear) {
      if (incomeArrayThisYear && incomeIdx < incomeArrayThisYear.length) {
        var incomeDate = new Date(incomeArrayThisYear[incomeIdx].date);
      }
      if (outcomeArrayThisYear && outcomeIdx < outcomeArrayThisYear.length) {
        var outcomeDate = new Date(outcomeArrayThisYear[outcomeIdx].date);
      }

      // Initialize weeklyIncome and weeklyOutcome to 0 at the start of each week
      if (date.getDay() == 1) {
        weeklyIncome = 0;
        weeklyOutcome = 0;
        var firstDay =
          date.getDate() +
          "/" +
          (date.getMonth() + 1) +
          "/" +
          date.getFullYear();
      }

      if (
        date.getDate() == incomeDate.getDate() &&
        date.getMonth() == incomeDate.getMonth()
      ) {
        weeklyIncome = incomeArrayThisYear[incomeIdx].income;
        if (incomeIdx < incomeArrayThisYear.length - 1) {
          incomeIdx++;
        }
      }
      if (
        date.getDate() == outcomeDate.getDate() &&
        date.getMonth() == outcomeDate.getMonth()
      ) {
        weeklyOutcome = outcomeArrayThisYear[outcomeIdx].outcome;
        if (outcomeIdx < outcomeArrayThisYear.length - 1) {
          outcomeIdx++;
        }
      }

      if (date.getDay() == 0) {
        yValuesIncome.push(weeklyIncome);
        yValuesOutcome.push(weeklyOutcome);
        xValues.push(mingguKe);
        let total = weeklyIncome - weeklyOutcome;
        lastDay =
          date.getDate() +
          "/" +
          (date.getMonth() + 1) +
          "/" +
          date.getFullYear();

        var row = [
          mingguKe,
          firstDay + " - " + lastDay,
          weeklyIncome,
          weeklyOutcome,
          total,
        ];
        tableWeekly.row.add(row);
        mingguKe++;
        weeklyIncome = 0;
        weeklyOutcome = 0;
      }
      date.setDate(date.getDate() + 1);
    }
  }

  tableWeekly.draw();

  //pembuatan chart sesuai dengan data yang sudah ada
  //   myChart = new Chart("weeklyChart", {
  //     type: "line", //tipe chartnya
  //     data: {
  //       labels: xValues, //array buat nilai x berupa date
  //       datasets: [
  //         {
  //           label: "Income Per Week",
  //           borderColor: "green",
  //           data: yValuesIncome, //array buat nilai y  untuk income
  //         },
  //         {
  //           label: "Outcome Per Week",
  //           borderColor: "red",
  //           data: yValuesOutcome, //array buat nilai y untuk outcome
  //         },
  //       ],
  //     },
  //     options: {
  //       title: {
  //         display: true,
  //         text: "Income and Outcome Per Week in " + selectedYear,
  //         fontSize: 16,
  //         fontColor: "black",
  //       },
  //     },
  //   });
}

//function untuk menampilkan tabel berdasarkan 12 bulan dalam 1 tahun
var tableMonthly = $("#monthlyTable").DataTable({
  search:{
    return : true
  },
  columnDefs: [
    { targets: [0], orderable: false }, // replace 0 with the index of the column you want to disable sorting for
  ],
  order: [],
});
function monthlyRecap() {
  //deklarasi array untuk value y graphic nya, dan untuk table juga
  const yValuesIncome = [];
  const yValuesOutcome = [];
  //array untuk menampung jumlah per bulan
  const totalPerBulanIncome = new Array(12).fill(0); // Pembuatan array total income per bulan dengan size 12 dan isi dengan 0
  const totalPerBulanOutcome = new Array(12).fill(0); // Pembuatan array total outcome per bulan dengan size 12 dan isi dengan 0
  //deklarasi array dengan isi nama per bulan, untuk value dari sumbu x graph ini
  const xValues = [
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

  //mengambil tahun dari input
  var selectedYear = document.getElementById("recapYear").value;

  var tableMonthly = $("#monthlyTable").DataTable();

  tableMonthly.clear();

  //memanggil function getLocalStorageData untuk mendapatkan data dari local storage
  var { dailyArrayIncome, dailyArrayOutcome } = getLocalStorageData(true);

  //Pengisian array total income per bulan
  var idx = 0;
  for (let i = 0; i < dailyArrayIncome.length; i++) {
    let dateTemp = new Date(dailyArrayIncome[i].date);
    //pengecekan apakah bulan masih sama dengan idx atau tidak
    if (idx === dateTemp.getMonth() && selectedYear == dateTemp.getFullYear()) {
      totalPerBulanIncome[idx] =
        totalPerBulanIncome[idx] + dailyArrayIncome[i].income;
    } else if (selectedYear == dateTemp.getFullYear()) {
      //kondisi apabila bulan sudah berbeda tapi tahun sama
      idx = xValues.indexOf(xValues[dateTemp.getMonth()]);
      if (idx !== -1 && dateTemp.getMonth() + 1 === idx + 1) {
        totalPerBulanIncome[idx] =
          totalPerBulanIncome[idx] + dailyArrayIncome[i].income;
      }
    }
  }

  //Pengisian array total outcome per bulan
  idx = 0;
  for (let i = 0; i < dailyArrayOutcome.length; i++) {
    let dateTemp = new Date(dailyArrayOutcome[i].date);
    //pengecekan apakah bulan masih sama dengan idx atau tidak
    if (idx === dateTemp.getMonth() && selectedYear == dateTemp.getFullYear()) {
      totalPerBulanOutcome[idx] =
        totalPerBulanOutcome[idx] + dailyArrayOutcome[i].outcome;
    } else if (selectedYear == dateTemp.getFullYear()) {
      //kalau tidak, nambah index dan assign bulan baru
      //kondisi apabila bulan sudah berbeda tapi tahun sama
      idx = xValues.indexOf(xValues[dateTemp.getMonth()]);
      if (idx !== -1 && dateTemp.getMonth() + 1 === idx + 1) {
        totalPerBulanOutcome[idx] =
          totalPerBulanOutcome[idx] + dailyArrayOutcome[i].outcome;
      }
    }
  }
  //pembuatan chart dan table sesuai data total income dan outcome per bulan
  for (let index = 0; index < totalPerBulanIncome.length; index++) {
    yValuesIncome[index] = totalPerBulanIncome[index];
    yValuesOutcome[index] = totalPerBulanOutcome[index];

    //deklarasi var total = total income - total outcome
    let total = yValuesIncome[index] - yValuesOutcome[index];

    var row = [
      xValues[index],
      yValuesIncome[index],
      yValuesOutcome[index],
      total,
    ];
    tableMonthly.row.add(row);
  }
  tableMonthly.draw();

  //pembuatan chart
  //   myChart = new Chart("monthlyChart", {
  //     type: "bar", //tipe chartnya
  //     data: {
  //       labels: xValues, //array buat nilai x
  //       datasets: [
  //         {
  //           label: "Income Per Bulan",
  //           backgroundColor: "green",
  //           data: yValuesIncome, //array buat nilai y income
  //         },
  //         {
  //           label: "Outcome Per Bulan",
  //           backgroundColor: "red",
  //           data: yValuesOutcome, //array buat nilai y outcome
  //         },
  //       ],
  //     },
  //     options: {
  //       title: {
  //         display: true,
  //         text: "Income and Outcome Per Bulan di Tahun " + selectedYear,
  //         fontSize: 16,
  //         fontColor: "black",
  //       },
  //     },
  //   });
}


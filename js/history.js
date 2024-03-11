//COPY HISTORY DEFAULT INCOME

//shortcut untuk akses local storage
let ls = window.localStorage;

// function untuk menampilkan tabel history transaksi
// inisialisasi DataTable agar tidak bisa dilakukan sort berdasarkan kolom pertama
var tableTrans = $("#transHistTable").DataTable({
  search:{
    return : true
  },
  columnDefs: [
    { targets: [0], orderable: false }, // replace 0 with the index of the column you want to disable sorting for
  ],
  order: [],
});

function transactionHistoryTable() {
  var type = "outcome";
  //mendapatkan value dropdown
  type = document.getElementById("transHistDrop").value;

  // pembersihan dataTable agar tidak append
  tableTrans.clear();

  //memasukkan data dari local storage dengan key "transaction" ke array
  var transactionArray = ls.getItem("transaction");

  // Parsing dari local storage, asalnya String jadi menjadi type
  if (transactionArray && transactionArray.length > 0) {
    transactionArray = JSON.parse(transactionArray);
  } else {
    transactionArray = [];
  }

  //sort berdasarkan date (ascending)
  transactionArray.sort(function (a, b) {
    return new Date(b.date) - new Date(a.date);
  });
  console.log(transactionArray);

  //apabila type yang dipilih di dropdown adalah outcome, maka menampilkan tabel outcome
  
  if (!type) {
    for (let index = 0; index < transactionArray.length; index++) {
      date = new Date(transactionArray[index].date);
      var row = [
        date.getDate() +
          "/" +
          (date.getMonth() + 1) +
          "/" +
          date.getFullYear(), //date
        transactionArray[index].amount,
        transactionArray[index].category ? transactionArray[index].category : "Income",
        transactionArray[index].notes,
            ];
      tableTrans.row.add(row);
    }
  }else if (type == "outcome") {
    //for loop untuk menampilkan tabel outcome
    for (let index = 0; index < transactionArray.length; index++) {
      date = new Date(transactionArray[index].date);
      //pengecekan apabila type nya adalah outcome
      if (transactionArray[index].type == "outcome") {
        // membuat row baru
        var row = [
          date.getDate() +
            "/" +
            (date.getMonth() + 1) +
            "/" +
            date.getFullYear(), //date
          transactionArray[index].amount,
          transactionArray[index].category,
          transactionArray[index].notes,
        ];
        // memasukkan row yang sudah dibuat ke dataTable
        tableTrans.row.add(row);
      }
    }
  } else {
    //for loop untuk menampilkan tabel transaksi type income
    for (let index = 0; index < transactionArray.length; index++) {
      date = new Date(transactionArray[index].date);
      //pengecekan tipe sama atau tidaknya dengan 'income
      if (transactionArray[index].type == "income") {
        // membuat row baru
        var row = [
          date.getDate() +
            "/" +
            (date.getMonth() + 1) +
            "/" +
            date.getFullYear(), //date
            transactionArray[index].amount,
            "Income",
            transactionArray[index].notes,
          ];
        // memasukkan row yang sudah dibuat ke dataTable
        tableTrans.row.add(row);
      }
    }
  }

  //membuat dataTable
  tableTrans.draw();
}

transactionHistoryTable();

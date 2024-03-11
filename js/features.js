//nyoba dataTable
document.addEventListener('DOMContentLoaded', function () {
    let table = new DataTable('#myTable');
});

//shortcut untuk akses local storage
let ls = window.localStorage;

//Variable untuk pembuatan chart nanti
var myChart;

//memasukkan data dari local storage ke array
var arrayIncome = ls.getItem('income');                 //array data income (untuk rekap)
var arrayOutcome = ls.getItem('outcome');               //array data outcome (untuk rekap)
var arrayAllTransaction = ls.getItem('transaction');    //array seluruh transaksi (untuk transaction)

//set min dan max tanggal yang bisa diinput
let minDate = new Date(2020,0,1)                            //min date = 01-01-2023
let minDateString = minDate.toLocaleDateString('en-CA');    //agar formatnya jadi YYYY-MM-DD
let maxDate = new Date();                                   //max date = hari ini   
let maxDateString = maxDate.toLocaleDateString('en-CA')     //agar formatnya jadi YYYY-MM-DD
document.forms["incomeForm"]["date"].setAttribute("min",minDateString);
document.forms["incomeForm"]["date"].setAttribute("max",maxDateString);
document.forms["outcomeForm"]["date"].setAttribute("min",minDateString);
document.forms["outcomeForm"]["date"].setAttribute("max",maxDateString);

//set min dan max tahun yang bisa diinput
document.getElementById('dailyGraphYear').value=maxDate.getFullYear();
document.getElementById('dailyGraphYear').setAttribute("min",2020);
document.getElementById('dailyGraphYear').setAttribute("max",maxDate.getFullYear());

document.getElementById('monthlyGraphYear').value=maxDate.getFullYear();
document.getElementById('monthlyGraphYear').setAttribute("min",2020);
document.getElementById('monthlyGraphYear').setAttribute("max",maxDate.getFullYear());

document.getElementById('pieGraphYear').value=maxDate.getFullYear();
document.getElementById('pieGraphYear').setAttribute("min",2020);
document.getElementById('pieGraphYear').setAttribute("max",maxDate.getFullYear());

//parsing data dari local storage, yang asalnya array jadi bertype, jika key local storage masih kosong, diisi array kosong
if(arrayIncome && arrayIncome.length > 0){
    arrayIncome = JSON.parse(arrayIncome);
} else {
    arrayIncome = [];
}
if(arrayOutcome && arrayOutcome.length > 0){
    arrayOutcome = JSON.parse(arrayOutcome);
} else {
    arrayOutcome = [];
}
if(arrayAllTransaction && arrayAllTransaction.length > 0){
    arrayAllTransaction = JSON.parse(arrayAllTransaction);
} else {
    arrayAllTransaction = [];
}

//sort array berdasarkan date (ascending)
arrayIncome.sort(function(a,b){
    return new Date(a.date) - new Date(b.date)
});
arrayOutcome.sort(function(a,b){
    return new Date(a.date) - new Date(b.date)
});
arrayAllTransaction.sort(function(a,b){
    return new Date(a.date) - new Date(b.date)
});

//function Income baru untuk memasukkan pemasukan baru
function newIncome(){
    //untuk dapat value dari input form
    var vIncome = document.forms["incomeForm"]["income"].value;
    var vDate = document.forms["incomeForm"]["date"].value;
    var vNotes = document.forms["incomeForm"]["incomeNotes"].value;

    //merubah type agar sesuai tipe data (parsing)
    vIncome = parseInt(vIncome);
    vDate = new Date(vDate);

    // Mengecek apabila ada objek dengan tanggal yang sama
    var found = arrayIncome.find(function(element) {
        return new Date(element.date).toDateString() === vDate.toDateString();
    });

    if (found) {
        // Apabila ada tanggal yang sama, maka hanya perlu menambahkan income (agar tidak ada duplikasi date)
        found.income += vIncome;
    } else {
        // Jika tidak ada tanggal yang sama, buat menjadi objek, lalu push ke array
        const obj = {date:vDate,income:vIncome}
        arrayIncome.push(obj);
    }

    //append ke array alltransaction agar pemasukan masuk ke transaction, dibuat juga objeknya
    const transaction = {type:'income',date:vDate,amount:vIncome,category:'Income',notes:vNotes};
    arrayAllTransaction.push(transaction);

    //masukin data hasil array ke local storage
    ls.setItem('income',JSON.stringify(arrayIncome));
    ls.setItem('transaction',JSON.stringify(arrayAllTransaction));

    //manggil function graph
    dailyGraph();

    //agar page tidak ter-refresh setelah submit
    return false;
}

//function untuk mencatat pengeluaran baru
function newOutcome(){
    //untuk dapat value dari input form
    var vOutcome = document.forms["outcomeForm"]["outcome"].value;
    var vDate = document.forms["outcomeForm"]["date"].value;
    var vNotes = document.forms["outcomeForm"]["outcomeNotes"].value;
    var Category = document.getElementById("outcomeCategory").value;

    //merubah type agar sesuai tipe data (parsing)
    vOutcome = parseInt(vOutcome);
    vDate = new Date(vDate);

    // Mengecek apabila ada objek dengan tanggal yang sama
    var found = arrayOutcome.find(function(element) {
        return new Date(element.date).toDateString() === vDate.toDateString();
    });

    if (found) {
        // Apabila ada tanggal yang sama, maka hanya perlu menambahkan income (agar tidak ada duplikasi date)
        found.outcome += vOutcome;
    } else {
        // If it doesn't, push a new object to the array
        const obj = {date:vDate,outcome:vOutcome}
        arrayOutcome.push(obj);
    }

    //append ke array alltransaction agar pengeluaran ini masuk ke transaksi
    const transaction = {type:'outcome',date:vDate,amount:vOutcome,category:Category,notes:vNotes};
    arrayAllTransaction.push(transaction);

    //masukin data hasil array ke local storage
    ls.setItem('outcome',JSON.stringify(arrayOutcome));
    ls.setItem('transaction',JSON.stringify(arrayAllTransaction));

    //memanggil function daily graph
    dailyGraph();

    return false;
}

//function untuk mengambil nilai dari local storage
function getLocalStorageData(sorted) {
    //ambil data array dari local storage yang fieldnya namanya income dan outcome
    var dailyArrayIncome = ls.getItem('income');
    var dailyArrayOutcome = ls.getItem('outcome');

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
    if(sorted==true){
        //sorting array sesuai tanggal (ascending)
        dailyArrayIncome.sort(function(a,b){
            return new Date(a.date) - new Date(b.date)
        });
        dailyArrayOutcome.sort(function(a,b){
            return new Date(a.date) - new Date(b.date)
        }); 
    }


    return { dailyArrayIncome, dailyArrayOutcome };
}

//function untuk menampilkan chart setiap hari dalam 1 bulan
function dailyGraph(){
    const namaBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    //deklarasi array sebagai value dari sumbu x dan y dari graph nya
    const xValues = [];
    const yValuesIncome = [];
    const yValuesOutcome = [];

    // Menghapus chart sebelumnya apabila sudah ada (untuk prevent duplikasi chart)
    if (myChart) {
        myChart.destroy();
    }

    //ambil value dari input
    var selectedMonth = document.getElementById("monthDropdown").value;
    var selectedYear = document.getElementById("dailyGraphYear").value;

    //memanggil function getLocalStorageData untuk mendapatkan data dari local storage
    var{dailyArrayIncome, dailyArrayOutcome} = getLocalStorageData(true)

    return { dailyArrayIncome, dailyArrayOutcome };
}

//function untuk menampilkan chart setiap hari dalam 1 bulan
function dailyGraph(){
    const namaBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    //deklarasi array sebagai value dari sumbu x dan y dari graph nya
    const xValues = [];
    const yValuesIncome = [];
    const yValuesOutcome = [];

    var tableDaily = $('#dailyTable').DataTable();

    tableDaily.clear();

    //ambil value dari input
    var selectedMonth = document.getElementById("monthDropdown").value;
    var selectedYear = document.getElementById("dailyGraphYear").value;

    //memanggil function getLocalStorageData untuk mendapatkan data dari local storage
    var{dailyArrayIncome, dailyArrayOutcome} = getLocalStorageData(true)

    // mengkombinasikan array income dan outcome menjadi 1 array, lalu kemudian di sort berdasarkan date
    var combinedArray = [...dailyArrayIncome, ...dailyArrayOutcome];
    combinedArray.sort(function(a,b){
        return new Date(a.date) - new Date(b.date)
    });

    // Membuat sebuah array yang merupakan unique dates, sehingga tidak ada duplikasi date dari income dan outcome
    var uniqueDates = [];
    combinedArray.forEach(function(item) {
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
        if (date.getMonth() + 1 == selectedMonth&&date.getFullYear()==selectedYear) {
            //push tanggal ke array untuk value di sumbu x
            xValues.push(date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear());

            // mencari income dari date ini, dilakukan pengecekan
            let incomeObj = dailyArrayIncome.find(function(element) {
                return new Date(element.date).toDateString() === date.toDateString();
            });
            //apabila income dengan date ini ditemukan, maka dipush ke array yValuesIncome, kalau tidak ada, push value 0
            yValuesIncome.push(incomeObj ? incomeObj.income : 0);

            // mencari outcome dari date ini, dilakukan pengecekan
            let outcomeObj = dailyArrayOutcome.find(function(element) {
                return new Date(element.date).toDateString() === date.toDateString();
            });
            //apabila income dengan date ini ditemukan, maka dipush ke array yValuesIncome, kalau tidak ada, push value 0
            yValuesOutcome.push(outcomeObj ? outcomeObj.outcome : 0);

            //var total = income - outcome
            let total = yValuesIncome[yValuesIncome.length - 1] - yValuesOutcome[yValuesOutcome.length - 1];
            
            var dateComponent = xValues[xValues.length - 1];
            dateComponent = dateComponent.split('/')
            var row = [
                parseInt(dateComponent[0]),     //date
                yValuesIncome[yValuesIncome.length - 1],
                yValuesOutcome[yValuesOutcome.length - 1],
                total
            ];
            
            // Add the new row to the DatatableTrans
            tableDaily.row.add(row);
        }
    }
    tableDaily.draw();

    //pembuatan chart sesuai dengan data yang sudah ada
    myChart = new Chart("dailyChart", {
        type: "line",       //tipe chartnya
        data: {
        labels: xValues,      //array buat nilai x berupa date
        datasets: [{
            label:'Income Per Hari',
            borderColor:"green",
            data: yValuesIncome       //array buat nilai y  untuk income
        },
        {
            label:'Outcome Per Hari',
            borderColor:"red",
            data: yValuesOutcome       //array buat nilai y untuk outcome
        }]
        },
        options: {
            title: {
                display: true,
                text: 'Income and Outcome Per Hari Di Bulan '+namaBulan[selectedMonth-1]+" Di Tahun "+selectedYear,
                fontSize: 16,
                fontColor: 'black'
            }
        }
    });
}


//function untuk menampilkan chart berdasarkan 12 bulan dalam 1 tahun
var tableMonthly = $('#monthlyTable').DataTable({
    columnDefs: [
        { targets: [0], orderable: false } // replace 0 with the index of the column you want to disable sorting for
    ],
    order: []
});
function monthlyGraph(){
    //deklarasi array untuk value y graphic nya, dan untuk table juga
    const yValuesIncome = [];
    const yValuesOutcome = [];
    //array untuk menampung jumlah per bulan
    const totalPerBulanIncome = new Array(12).fill(0); // Pembuatan array total income per bulan dengan size 12 dan isi dengan 0
    const totalPerBulanOutcome = new Array(12).fill(0); // Pembuatan array total outcome per bulan dengan size 12 dan isi dengan 0
    //deklarasi array dengan isi nama per bulan, untuk value dari sumbu x graph ini
    const xValues = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    
    //mengambil tahun dari input
    var selectedYear = document.getElementById("monthlyGraphYear").value;

    // Menghapus chart sebelumnya apabila sudah ada (untuk prevent duplikasi chart)
    if (myChart) {
        myChart.destroy();
    }

    var tableMonthly = $('#monthlyTable').DataTable();

    //memanggil function getLocalStorageData untuk mendapatkan data dari local storage
    var{dailyArrayIncome, dailyArrayOutcome} = getLocalStorageData(true)

    tableMonthly.clear();

    //memanggil function getLocalStorageData untuk mendapatkan data dari local storage
    var{dailyArrayIncome, dailyArrayOutcome} = getLocalStorageData(true)

    //Pengisian array total income per bulan
    var idx = 0;
    for (let i = 0; i < dailyArrayIncome.length; i++) {
        let dateTemp = new Date(dailyArrayIncome[i].date);
        //pengecekan apakah bulan masih sama dengan idx atau tidak
        if (idx === dateTemp.getMonth() && selectedYear == dateTemp.getFullYear()) {
            totalPerBulanIncome[idx] = totalPerBulanIncome[idx] + dailyArrayIncome[i].income;
        } else if (selectedYear == dateTemp.getFullYear()) {
            //kondisi apabila bulan sudah berbeda tapi tahun sama
            idx = xValues.indexOf(xValues[dateTemp.getMonth()]);
            if (idx !== -1 && dateTemp.getMonth() + 1 === idx + 1) {
                totalPerBulanIncome[idx] = totalPerBulanIncome[idx] + dailyArrayIncome[i].income;
            }
        }
    }

    //Pengisian array total outcome per bulan
    idx=0;
    for (let i = 0; i < dailyArrayOutcome.length; i++) {
        let dateTemp = new Date(dailyArrayOutcome[i].date);
        //pengecekan apakah bulan masih sama dengan idx atau tidak
        if(idx===(dateTemp.getMonth()) && selectedYear==dateTemp.getFullYear()){
            totalPerBulanOutcome[idx]=totalPerBulanOutcome[idx]+dailyArrayOutcome[i].outcome;
        }else if(selectedYear==dateTemp.getFullYear()){      //kalau tidak, nambah index dan assign bulan baru
            //kondisi apabila bulan sudah berbeda tapi tahun sama
            idx = xValues.indexOf(xValues[dateTemp.getMonth()]);
            if (idx !== -1 && dateTemp.getMonth() + 1 === idx + 1) {
                totalPerBulanOutcome[idx] = totalPerBulanOutcome[idx] + dailyArrayOutcome[i].outcome;
            }
        }
    }
    //pembuatan chart dan table sesuai data total income dan outcome per bulan
    for (let index = 0; index < totalPerBulanIncome.length; index++) {
        yValuesIncome[index]=totalPerBulanIncome[index];
        yValuesOutcome[index]=totalPerBulanOutcome[index];

        //deklarasi var total = total income - total outcome
        let total = yValuesIncome[index] - yValuesOutcome[index]; 

        var row = [
            xValues[index],
            yValuesIncome[index],
            yValuesOutcome[index],
            total
        ]
        tableMonthly.row.add(row)
    }
    tableMonthly.draw();

    //pembuatan chart
    myChart = new Chart("monthlyChart", {
        type: "bar",       //tipe chartnya
        data: {
        labels: xValues,      //array buat nilai x
        datasets: [{
            label:'Income Per Bulan',
            backgroundColor:"green",
            data: yValuesIncome       //array buat nilai y income
        },
        {
            label:'Outcome Per Bulan',
            backgroundColor:"red",
            data: yValuesOutcome       //array buat nilai y outcome
        }]
        },
        options: {
            title: {
                display: true,
                text: 'Income and Outcome Per Bulan di Tahun '+selectedYear,
                fontSize: 16,
                fontColor: 'black'
            }
        }
    });
}

//function dibawah ini untuk menampilkan chart pengeluaran berdasarkan category per bulan, dibuat menjadi pie chart
function expenseGraph(){
    //mengambil value bulan dan tahun yang dipilih dari input type dropdown
    var selectedMonth = document.forms["pieChartForm"]["monthDropdown"].value;
    var selectedYear = document.forms["pieChartForm"]["pieGraphYear"].value;
    //array dengan isi setiap bulan
    const month = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    //array pengeluaran per hari
    const expenseDaily = []
    //nilai untuk sumbu x di chart nanti, sumbu x ini adalah keterangan dari per bagian pie chartnya
    const xValues = ["Gadget","Hiburan","Kesehatan","Makanan & Minuman","Pendidikan","Transportasi"];
    //array nilai untuk total per kategori dalam 1 bulan
    const yValues = [];
    //array untuk warna masing masing category
    var barColors = [
        "#b91d47",
        "#00aba9",
        "#2b5797",
        "#e8c3b9",
        "#1e7145",
        "orange"
    ];
    const totalExpenseCat = new Array(6).fill(0); // Pembuatan array total income per bulan dengan size 12 dan isi dengan 0

    // Menghapus chart sebelumnya apabila sudah ada (untuk prevent duplikasi chart)
    if (myChart) {
        myChart.destroy();
    }

    //pengambilan value dari local storage dengan key transaction untuk mengambil semua transaksi
    var transactionArray = ls.getItem('transaction');

    //parsing dari local storage, asalnya String jadi menjadi type
    if(transactionArray && transactionArray.length > 0){
        transactionArray = JSON.parse(transactionArray);
    } else {
        transactionArray = [];
    }

    //sortir array berdasarkan kategori
    transactionArray.sort(function(a, b) {
        return (a.category).localeCompare(b.category)
    });

    //filter isi array berdasarkan type outcome saja, lalu diinput ke array baru
    for (let index = 0; index < transactionArray.length; index++) {
        if(transactionArray[index].type=='outcome'){
            expenseDaily.push(transactionArray[index]);
        }
    }

    //index untuk pengecekan array xValues
    let idx = 0;
    //for loop untuk penambahan jumlah pengeluaran per kategori dalam 1 bulan
    for (let index = 0; index < expenseDaily.length; index++) {
        let date = new Date(expenseDaily[index].date);      //pembuatan objek date dari field array

        //kondisi penambahan ke array dengan index idx apabila bulan dan kategori sama
        if((date.getMonth()+1)==selectedMonth&&expenseDaily[index].category==xValues[idx]&&selectedYear==date.getFullYear()){
            totalExpenseCat[idx]+=expenseDaily[index].amount;
        }else if(selectedYear==date.getFullYear()){
            //kondisi apabila kategori / bulan sudah berbeda
            idx = xValues.indexOf(expenseDaily[index].category);
            if (idx !== -1 && (date.getMonth() + 1) == selectedMonth) {
                totalExpenseCat[idx] += expenseDaily[index].amount;
            }
        }
    }
    
    //memasukkan value hasil penambahan tadi ke yValue
    for (let index = 0; index < totalExpenseCat.length; index++) {
        yValues.push(totalExpenseCat[index])
    }
    
    //pembuatan pieChart untuk menampilkan pengeluaran per kategori dalam 1 bulan
    myChart = new Chart("pieChart", {
        type: "pie",            //jenis chart
        data: {
          labels: xValues,      //informasi per kategori
          datasets: [{
            backgroundColor: barColors, //warna tiap kategori
            data: yValues               //jumlah pengeluaran tiap kategori
          }]
        },
        options: {
          title: {
            display: true,
            text: "Pengeluaran Berdasarkan Kategori di Bulan "+month[selectedMonth-1]+" Tahun "+selectedYear
          }
        }
    });
}

// Fungsi untuk membuat dan append element transaksi
function appendTransactionElements(containerId, transactions) {
    // ambil container dimana akan dilakukan append
    const container = document.getElementById(containerId);

    // melakukan clear ke container yang sudah ada
    container.innerHTML = '';

    // melimit atau membatasi transaksi yang muncul di home hanya 5 buah
    const limitedTransactions = transactions.slice(0, 5);

    // iterasi untuk setiap transaksi, setiap iterasi akan membuat div baru
    limitedTransactions.forEach(transaction => {
        const div = document.createElement('div');
        div.classList.add('transaction');

        // buat dan append image berdasarkan kategori
        const img = document.createElement('img');
        img.src = getCategoryIcon(transaction.category);        //memanggil fungsi getCategoryIcon
        img.classList.add('icon');
        div.appendChild(img);

        // buat dan append span element untuk kategori, notes, jumlah, dan tanggal
        const spanCategory = document.createElement('span');
        spanCategory.classList.add('category');
        spanCategory.textContent = transaction.category;
        div.appendChild(spanCategory);

        const spanDescription = document.createElement('span');
        spanDescription.classList.add('notes');
        spanDescription.textContent = transaction.notes;
        div.appendChild(spanDescription);

        const spanExpense = document.createElement('span');
        spanExpense.classList.add('expense');
        spanExpense.textContent = "Rp. " + transaction.amount;
        div.appendChild(spanExpense);

        const formattedDate = new Date(transaction.date).toLocaleDateString();
        const spanDate = document.createElement('span');
        spanDate.classList.add('date');
        spanDate.textContent = formattedDate;
        div.appendChild(spanDate);

        // append div transaction ke container
        container.appendChild(div);
    });
}

// function untuk mendapatkan icon sesuai kategori
function getCategoryIcon(category) {
    switch (category) {
        case 'Gadget':
            return 'icons/gamepad.svg'
        case 'Hiburan':
            return 'icons/gamepad.svg'
        case 'Income':
            return 'icons/wallet-dark.svg'
        case 'Kesehatan':
            return 'icons/medical.svg'
        case 'Makanan & Minuman':
            return 'icons/food.svg';
        case 'Pendidikan':
            return 'icons/education.svg'
        case 'Transportasi':
            return 'icons/transportation.svg';
        default:
            return 'icons/plus.svg'; // Default icon
    }
}

// Menampilkan transaction history pada home page dengan jumlah max 5 transaksi
function transactionHistory() {
    // Mendapatkan value dari dropdown
    var type = document.getElementById("transHistDrop").value;

    // mengambil nilai dari local storage
    var transactionArray = ls.getItem('transaction');

    // parsing data, dari string menjadi type
    if (transactionArray && transactionArray.length > 0) {
        transactionArray = JSON.parse(transactionArray);
    } else {
        transactionArray = [];
    }

    // Sort berdasarkan date (descending)
    transactionArray.sort(function(a, b) {
        return new Date(a.date) - new Date(b.date);
    });

    // memanggil function untuk append transaction element untuk semua transaction
    appendTransactionElements('transactionContainer', transactionArray);
}

//function untuk menampilkan tabel history transaksi
// inisialisasi DataTable agar tidak bisa dilakukan sort berdasarkan kolom pertama
var tableTrans = $('#transHistTable').DataTable({
    columnDefs: [
        { targets: [0], orderable: false } // replace 0 with the index of the column you want to disable sorting for
    ],
    order: []
});

function transactionHistoryTable() {
    //mendapatkan value dropdown
    var type = document.getElementById("transHistDrop").value;
    

    // pembersihan dataTable agar tidak append
    tableTrans.clear();

    //memasukkan data dari local storage dengan key "transaction" ke array
    var transactionArray = ls.getItem('transaction');

    // Parsing dari local storage, asalnya String jadi menjadi type
    if (transactionArray && transactionArray.length > 0) {
        transactionArray = JSON.parse(transactionArray);
    } else {
        transactionArray = [];
    }

    //sort berdasarkan date (ascending)
    transactionArray.sort(function(a, b) {
        return new Date(b.date) - new Date(a.date)
    });
    console.log(transactionArray)

    //apabila type yang dipilih di dropdown adalah outcome, maka menampilkan tabel outcome
    if (type == 'outcome') {
        //for loop untuk menampilkan tabel outcome
        for (let index = 0; index < transactionArray.length; index++) {
            date = new Date(transactionArray[index].date)
            //pengecekan apabila type nya adalah outcome
            if(transactionArray[index].type=='outcome'){
                // membuat row baru
                var row = [
                    date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear(),     //date
                    transactionArray[index].amount,
                    transactionArray[index].category,
                    transactionArray[index].notes
                ];
                // memasukkan row yang sudah dibuat ke dataTable
                tableTrans.row.add(row);
            }
        }
    } else{
        //for loop untuk menampilkan tabel transaksi type income
        for (let index = 0; index < transactionArray.length; index++) {
            date = new Date(transactionArray[index].date)
            //pengecekan tipe sama atau tidaknya dengan 'income
            if(transactionArray[index].type=='income'){
                // membuat row baru
                var row = [
                    date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear(),     //date
                    transactionArray[index].amount,
                    transactionArray[index].category,
                    transactionArray[index].notes
                ];
                // memasukkan row yang sudah dibuat ke dataTable
                tableTrans.row.add(row);
            }
        }
    }

    //membuat dataTable
    tableTrans.draw();
}

//function untuk menampilkan saldo saat ini, dihitung dari awal tahun
function currentSaldo(){
    //memanggil function getLocalStorageData untuk mendapatkan data dari local storage
    var{dailyArrayIncome, dailyArrayOutcome} = getLocalStorageData(true)

    //penampung totalIncome, totalOutcome, dan total
    var totalIncome = 0;
    var totalOutcome = 0;
    var total = 0;

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
    
    //agar dapat terlihat di web
    document.getElementById('saldo').innerHTML=total.toLocaleString();
    document.getElementById('totalIncome').innerHTML=totalIncome.toLocaleString();
    document.getElementById('totalOutcome').innerHTML=totalOutcome.toLocaleString();
}

//fungsi untuk menampilkan summary total expenses dan total incomes di homepage
function summary(){
    //memanggil function getLocalStorageData untuk mendapatkan data dari local storage
    var{dailyArrayIncome, dailyArrayOutcome} = getLocalStorageData(true)
    const totalPerBulanIncome = new Array(2).fill(0); // Pembuatan array total income per bulan dengan size 2 dan isi dengan 0
    const totalPerBulanOutcome = new Array(2).fill(0); // Pembuatan array total outcome per bulan dengan size 2 dan isi dengan 0
    
    var nowDate = new Date();
    var currentMonth = nowDate.getMonth();
    var lastMonth = (nowDate.getMonth()-1);

    for (let index = 0; index < dailyArrayIncome.length; index++) {
        let date = new Date(dailyArrayIncome[index].date);

        if(date.getMonth()==currentMonth&&date.getFullYear()==nowDate.getFullYear()){
            totalPerBulanIncome[0]=totalPerBulanIncome[0]+dailyArrayIncome[index].income;
        }else if(date.getMonth()==lastMonth&&date.getFullYear()==nowDate.getFullYear()){
            totalPerBulanIncome[1]=totalPerBulanIncome[1]+dailyArrayIncome[index].income;
        }
    }
    for (let index = 0; index < dailyArrayOutcome.length; index++) {
        let date = new Date(dailyArrayOutcome[index].date);

        if(date.getMonth()==currentMonth&&date.getFullYear()==nowDate.getFullYear()){
            totalPerBulanOutcome[0]=totalPerBulanOutcome[0]+dailyArrayOutcome[index].outcome;
        }else if(date.getMonth()==lastMonth&&date.getFullYear()==nowDate.getFullYear()){
            totalPerBulanOutcome[1]=totalPerBulanOutcome[1]+dailyArrayOutcome[index].outcome;
        }
    }

    //merubah isi dari summary
    document.getElementById('lastMonthOutcome').innerHTML="Last Month = Rp. "+totalPerBulanOutcome[1]
    document.getElementById('currentMonthOutcome').innerHTML="This Month = Rp. "+totalPerBulanOutcome[0]
    document.getElementById('lastMonthIncome').innerHTML="Last Month = Rp. "+totalPerBulanIncome[1]
    document.getElementById('currentMonthIncome').innerHTML="This Month = Rp. "+totalPerBulanIncome[0]
}
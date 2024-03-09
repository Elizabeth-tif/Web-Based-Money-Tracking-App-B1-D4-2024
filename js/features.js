//shortcut untuk akses local storage
let ls = window.localStorage;

//Variable untuk pembuatan chart nanti
var myChart;

//memasukkan data dari local storage ke array
var arrayIncome = ls.getItem('income');                 //array data income (untuk rekap)
var arrayOutcome = ls.getItem('outcome');               //array data outcome (untuk rekap)
var arrayAllTransaction = ls.getItem('transaction');    //array seluruh transaksi (untuk transaction)

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
    const transaction = {type:'income',date:vDate,amount:vIncome,category:'',notes:vNotes};
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

    //ambil value dari dropdown list
    var selectedMonth = document.getElementById("monthDropdown").value;

    //ambil data array dari local storage yang fieldnya namanya income
    var dailyArrayIncome = ls.getItem('income');
    var dailyArrayOutcome = ls.getItem('outcome');

    //parsing dari local storage, asalnya array jadi type
    if(dailyArrayIncome && dailyArrayIncome.length > 0){
        dailyArrayIncome = JSON.parse(dailyArrayIncome);
    } else {
        dailyArrayIncome = [];
    }
    if(dailyArrayOutcome && dailyArrayOutcome.length > 0){
        dailyArrayOutcome = JSON.parse(dailyArrayOutcome);
    } else {
        dailyArrayOutcome = [];
    }

    //sorting array sesuai date (ascending)
    dailyArrayIncome.sort(function(a,b){
        return new Date(a.date) - new Date(b.date)
    });
    dailyArrayOutcome.sort(function(a,b){
        return new Date(a.date) - new Date(b.date)
    }); 

    // Ambil objek incomeTable
    var table = document.getElementById("dailyTable");

    // menghapus table jika sudah ada agar tidak terjadi duplikasi / append
    for(let i = table.rows.length - 1; i > 0; i--){
        table.deleteRow(i);
    }

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
        if (date.getMonth() + 1 == selectedMonth) {
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

            // membuat baris baru di posisi paling akhir
            var row = table.insertRow(-1);

            // membuat column baru di row yang baru dibuat
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            var cell3 = row.insertCell(2);
            var cell4 = row.insertCell(3);

            // Memasukkan data ke table yang baru
            cell1.innerHTML = xValues[xValues.length - 1];  //date
            cell2.innerHTML = yValuesIncome[yValuesIncome.length - 1];  //income
            cell3.innerHTML = yValuesOutcome[yValuesOutcome.length - 1]; // outcome
            cell4.innerHTML = total; //data total (income-outcome)
            if(total<0){
                cell4.style.backgroundColor = "red";
            }else if(total>0){
                cell4.style.backgroundColor = "green";
            }
        }
    }

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
                text: 'Income and Outcome Per Hari Di Bulan '+namaBulan[selectedMonth-1],
                fontSize: 16,
                fontColor: 'black'
            }
        }
    });
}

//function untuk menampilkan chart berdasarkan 12 bulan dalam 1 tahun
function monthlyGraph(){
    //deklarasi array untuk value y graphic nya, dan untuk table juga
    const yValuesIncome = [];
    const yValuesOutcome = [];
    //array untuk menampung jumlah per bulan
    const totalPerBulanIncome = new Array(12).fill(0); // Pembuatan array total income per bulan dengan size 12 dan isi dengan 0
    const totalPerBulanOutcome = new Array(12).fill(0); // Pembuatan array total outcome per bulan dengan size 12 dan isi dengan 0
    //deklarasi array dengan isi nama per bulan, untuk value dari sumbu x graph ini
    const xValues = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    

    //ambil data array dari local storage yang fieldnya namanya income dan outcome
    var dailyArrayIncome = ls.getItem('income');
    var dailyArrayOutcome = ls.getItem('outcome');

    //parsing dari local storage, asalnya String jadi menjadi type
    if(dailyArrayIncome && dailyArrayIncome.length > 0){
        dailyArrayIncome = JSON.parse(dailyArrayIncome);
    } else {
        dailyArrayIncome = [];
    }
    if(dailyArrayOutcome && dailyArrayOutcome.length > 0){
        dailyArrayOutcome = JSON.parse(dailyArrayOutcome);
    } else {
        dailyArrayOutcome = [];
    }

    //sorting array sesuai tanggal (ascending)
    dailyArrayIncome.sort(function(a,b){
        return new Date(a.date) - new Date(b.date)
    });
    dailyArrayOutcome.sort(function(a,b){
        return new Date(a.date) - new Date(b.date)
    }); 

    //Ambil elemen table untuk table bulanan
    var table = document.getElementById("monthlyTable");

    // Pembersihan table agar tidak append
    for(let i = table.rows.length - 1; i > 0; i--){
        table.deleteRow(i);
    }

    //Pengisian array total income per bulan
    var idx=0;
    for (let i = 0; i < dailyArrayIncome.length; i++) {
        let dateTemp = new Date(dailyArrayIncome[i].date);
        //pengecekan apakah bulan masih sama dengan idx atau tidak
        if(idx===(dateTemp.getMonth())){
            totalPerBulanIncome[idx]=totalPerBulanIncome[idx]+dailyArrayIncome[i].income;
        }else{      //kalau tidak, nambah index dan assign bulan baru
            idx++;
            totalPerBulanIncome[idx]=totalPerBulanIncome[idx]+dailyArrayIncome[i].income;
        }
    }

    //Pengisian array total outcome per bulan
    idx=0;
    for (let i = 0; i < dailyArrayOutcome.length; i++) {
        let dateTemp = new Date(dailyArrayOutcome[i].date);
        //pengecekan apakah bulan masih sama dengan idx atau tidak
        if(idx===(dateTemp.getMonth())){
            totalPerBulanOutcome[idx]=totalPerBulanOutcome[idx]+dailyArrayOutcome[i].outcome;
        }else{      //kalau tidak, nambah index dan assign bulan baru
            idx++;
            totalPerBulanOutcome[idx]=totalPerBulanOutcome[idx]+dailyArrayOutcome[i].outcome;
        }
    }
    //pembuatan chart dan table sesuai data total income dan outcome per bulan
    for (let index = 0; index < totalPerBulanIncome.length; index++) {
        yValuesIncome[index]=totalPerBulanIncome[index];
        yValuesOutcome[index]=totalPerBulanOutcome[index];

        //deklarasi var total = total income - total outcome
        let total = yValuesIncome[index] - yValuesOutcome[index]; 

        // Membuat baris baru di posisi paling akhir
        var row = table.insertRow(-1);

        // membuat column baru di row yang baru dibuat
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);

        // Memasukkan data ke table
        cell1.innerHTML = xValues[index];           //data date
        cell2.innerHTML = yValuesIncome[index];     //data income
        cell3.innerHTML = yValuesOutcome[index];    //data outcome
        cell4.innerHTML = total;   //data total (income-outcome)
        if(total<0){
            cell4.style.backgroundColor = "red";
        }else if(total>0){
            cell4.style.backgroundColor = "green";
        }
    }

    //pembuatan chart
    new Chart("monthlyChart", {
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
                text: 'Income and Outcome Per Bulan di Tahun 2024',
                fontSize: 16,
                fontColor: 'black'
            }
        }
    });
}

//function dibawah ini untuk menampilkan chart pengeluaran berdasarkan category per bulan, dibuat menjadi pie chart
function expenseGraph(){
    //mengambil value bulan yang dipilih dari input type dropdown
    var selectedMonth = document.forms["pieChartForm"]["monthDropdown"].value;
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
        if((date.getMonth()+1)==selectedMonth&&expenseDaily[index].category==xValues[idx]){
            totalExpenseCat[idx]+=expenseDaily[index].amount;
        }else{
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
            text: "Expenses By Category in "+month[selectedMonth-1]
          }
        }
    });
}

//function untuk menampilkan tabel history transaksi
function transactionHistory() {
    //mendapatkan value dropdown
    var type = document.getElementById("transHistDrop").value;
    var table = document.getElementById("transHistTable");

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
        return new Date(a.date) - new Date(b.date)
    });

    // Pembersihan table agar tidak append
    for (let i = table.rows.length - 1; i > 0; i--) {
        table.deleteRow(i);
    }

    //apabila type yang dipilih di dropdown adalah outcome, maka menampilkan tabel outcome
    if (type == 'outcome') {
        // Menambahkan th baru bernama "Category" di samping th "amount"
        var categoryCell = table.rows[0].insertCell(2);
        categoryCell.innerHTML = "Category";

        //for loop untuk menampilkan tabel outcome
        for (let index = 0; index < transactionArray.length; index++) {
            //pengecekan apabila type nya adalah outcome
            if(transactionArray[index].type=='outcome'){
                // Membuat baris baru di posisi paling akhir
                var row = table.insertRow(-1);
                // membuat column baru di row yang baru dibuat
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                var cell3 = row.insertCell(2);
                var cell4 = row.insertCell(3);

                //mengisi column yang dibuat dengan data
                var date = new Date(transactionArray[index].date);
                cell1.innerHTML=date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear();
                cell2.innerHTML=transactionArray[index].amount;
                cell3.innerHTML=transactionArray[index].category;
                cell4.innerHTML=transactionArray[index].notes;
            }
            
        }

    } else {
        // Menghapus th "category" apabila type nya adalah "income"
        var categoryCellIndex = 2;
        var headerRow = table.rows[0];
        if (categoryCellIndex < headerRow.cells.length) {
            headerRow.deleteCell(categoryCellIndex);
        }

        //for loop untuk menampilkan tabel transaksi type income
        for (let index = 0; index < transactionArray.length; index++) {
            //pengecekan tipe sama atau tidaknya dengan 'income
            if(transactionArray[index].type=='income'){

                // Membuat baris baru di posisi paling akhir
                var row = table.insertRow(-1);
                // membuat column baru di row yang baru dibuat
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                var cell3 = row.insertCell(2);

                //mengisi column yang tadi dibuat dengan data yang sesuai field
                var date = new Date(transactionArray[index].date);
                cell1.innerHTML=date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear();
                cell2.innerHTML=transactionArray[index].amount;
                cell3.innerHTML=transactionArray[index].notes;
            }
        }
    }
}
$(document).ready( function () {
    $('#incometable').DataTable({
        'ajax' : "/data/income.json",
        'columns' :[
            {'data' : 'day'}, 
            {'data' : 'month'}, 
            {'data' : 'year'},  
            {'data' : 'income'},   
        ]
    });
} );

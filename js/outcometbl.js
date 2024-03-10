$(document).ready( function () {
    $('#outcometable').DataTable({
        'ajax' : "/data/outcome.json",
        'columns' :[
            {'data' : 'day'}, 
            {'data' : 'month'}, 
            {'data' : 'year'},  
            {'data' : 'outcome'},   
        ]
    });
} );

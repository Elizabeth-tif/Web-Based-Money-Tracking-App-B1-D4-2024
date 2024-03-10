const signUp = e => {
    let username = document.getElementById('username').value,
        pwd = document.getElementById('pwd').value;

    let users = JSON.parse(localStorage.getItem('users')) || [];

    let exist = users.length && 
        JSON.parse(localStorage.getItem('users')).some(data => 
            data.username.toLowerCase() == username.toLowerCase()
        );

    if(!exist){
        users.push({ username, pwd });
        localStorage.setItem('users', JSON.stringify(users));
        document.querySelector('form').reset();
        document.getElementById('username').focus();
        alert("Account Created");
    }
    else{
        alert("You have already signed up before");
    }
    e.preventDefault();
}

function signIn(e) {
    let username = document.getElementById('username').value, 
        pwd = document.getElementById('pwd').value;

    let users = JSON.parse(localStorage.getItem('users')) || [];

    // let exist = users.length && 
    //     JSON.parse(localStorage.getItem('users')).some(data => 
    //         data.username.toLowerCase() == username.toLowerCase() && data.pwd.toLowerCase() == pwd
    //     );

    let index = users.findIndex(data => 
        data.username.toLowerCase() == username.toLowerCase() && data.pwd.toLowerCase() == pwd
    );

    localStorage.setItem('loggedInUser', index);

    if(index === -1){
        alert("Incorrect login credentials");
    }
    else{
        location.href = "index.html";
    }
    e.preventDefault();
}

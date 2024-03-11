function confirmLogout() {
    var r = confirm("Are you sure you want to log out?");
    if (r == true) {
        logout();
    }
}
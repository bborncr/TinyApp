let logoutButton = document.getElementById('navLogout');
let loginButton = document.getElementById('navLogin');
let usernameButton = document.getElementById('navUsername');
let registerButton = document.getElementById('navRegister');

logoutButton.style.display = "block";
loginButton.style.display = "none";
usernameButton.style.display = "block";
registerButton.style.display = "none";

let firstInput = document.getElementsByClassName('wantFocus');
if (firstInput.length){
  firstInput[0].focus();
}

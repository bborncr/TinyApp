let logoutButton = document.getElementById('navLogout');
let loginButton = document.getElementById('navLogin');
let usernameButton = document.getElementById('navUsername');
let registerButton = document.getElementById('navRegister');

// turns off login and logout buttons
logoutButton.style.display = "block";
loginButton.style.display = "none";
usernameButton.style.display = "block";
registerButton.style.display = "none";

// sets the focus for the first form element for convenience
let firstInput = document.getElementsByClassName('wantFocus');
if (firstInput.length){
  firstInput[0].focus();
}

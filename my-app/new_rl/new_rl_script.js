const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');
const sqlite3 = require('sqlite3').verbose();
var goodRegisterEmail = false;
var goodRegisterPassword = false;

registerBtn.addEventListener('click', () =>{
    container.classList.add("active");
});

loginBtn.addEventListener('click', () =>{
    container.classList.remove("active");
});

document.getElementById('signupButton').addEventListener('click', function (event) {
    event.preventDefault();
        if (document.querySelector('.form-container.sign-up input[placeholder="Full name"]').value !== ''){
            if (goodRegisterEmail){
                if (goodRegisterPassword){
                    alert('User registered successfully !');
                }
                else {
                    alert('Password not strong enough, please introduce a valid password !');
                }
            }
            else {
                alert('Email not valid, please introduce a valid email !');
            }
        }else{
            alert('Please write your full name !');
        }
  });

  document.getElementById('signinButton').addEventListener('click', function (event) {
      event.preventDefault();
      authenticateUser();
  });

const eyeToggle = document.getElementById('togglePassword');
const eyeToggleLogin = document.getElementById('togglePasswordLogin');
const passwordInput = document.getElementById('passwordInput');
const passwordInputLogin = document.getElementById('passwordInputLogin');

eyeToggle.addEventListener('click', function(e){
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    if (type === 'password') {
        this.classList.remove('fa-eye-slash');
        this.classList.add('fa-eye');
    } else {
        this.classList.remove('fa-eye');
        this.classList.add('fa-eye-slash');
    }
});

eyeToggleLogin.addEventListener('click', function(e){
    const type = passwordInputLogin.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInputLogin.setAttribute('type', type);
    if (type === 'password') {
        this.classList.remove('fa-eye-slash');
        this.classList.add('fa-eye');
    } else {
        this.classList.remove('fa-eye');
        this.classList.add('fa-eye-slash');
    }
});

document.getElementById('lastNameInput').addEventListener('blur', capitalizeInput);

function capitalizeInput(event){
    const input = event.target;
    input.value = input.value.charAt(0).toUpperCase() + input.value.slice(1);
}

const emailInput = document.getElementById('emailInput');
const emailInputLogin = document.getElementById('emailInputLogin');

emailInput.addEventListener('input', checkEmail);
passwordInput.addEventListener('input', checkPassword);

emailInputLogin.addEventListener('click', function(){
    document.getElementById('incorrectCredentialsAlert').classList.remove('active');
});
passwordInputLogin.addEventListener('click', function(){
    document.getElementById('incorrectCredentialsAlert').classList.remove('active');
});

const passwordStrength = document.getElementById('passwordStrength');


function checkEmail(){
    const email = emailInput.value.trim();
    const isValid = validateEmailFormat(email);
    if (isValid){
        emailInput.classList.remove('input-error');
        emailInput.classList.add('input-success');
        goodRegisterEmail = true;
    }
    else{
        emailInput.classList.remove('input-success');
        emailInput.classList.add('input-error');
        goodRegisterEmail = false;
    }
}

function validateEmailFormat(email){
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function checkPassword(){
    const password = passwordInput.value;
    const strength = calculatePasswordStrength(password);
    passwordStrength.textContent = `Password Strength: ${strength}`;
}

function calculatePasswordStrength(password){
    const length = password.length;
    if (length < 6) {
        passwordInput.classList.remove('input-success');
        passwordInput.classList.remove('input-part-success');
        passwordInput.classList.add('input-error');
        goodRegisterPassword = false;
        return 'Weak';
    } else if (length < 10) {
        passwordInput.classList.remove('input-error');
        passwordInput.classList.add('input-part-success');
        goodRegisterPassword = true;
        return 'Moderate';
    } else {
        passwordInput.classList.remove('input-part-success');
        passwordInput.classList.add('input-success');
        goodRegisterPassword = true;
        return 'Strong';
    }
}

passwordInput.addEventListener('focus', () => {
    passwordStrength.classList.add('active');
});

passwordInput.addEventListener('blur', () => {
    passwordStrength.classList.remove('active');
});

function registerUser(username, password, role) {
    return new Promise((resolve, reject) => {

        const db = new sqlite3.Database('dataBase/data.db', (err) => {
            if (err) {
                console.error('Error opening database: ', err.message);
                reject(err.message);
            } else {
                console.log('Connected to the SQLite database.');
            }
        });

        let id = Math.floor(Math.random() * 1000000);

        // Insert user into the Users table
        db.run(`INSERT INTO Users (user_id, username, password, role) VALUES (?, ?, ?, ?)`, [id, username, password, role], function(err) {
            if (err) {
                console.error('Error inserting user: ', err.message);
                reject(err.message);
            } else {
                console.log('User inserted with ID: ', id);
                resolve(id);
            }
        });

        // Close the database connection
        db.close((err) => {
            if (err) {
                console.error('Error closing database: ', err.message);
            } else {
                console.log('Database connection closed.');
            }
        });
        
    });
}

function authenticateUser(username, password) {
    return new Promise((resolve, reject) => {

        const db = new sqlite3.Database('dataBase/data.db', (err) => {
            if (err) {
                console.error('Error opening database: ', err.message);
                reject(err.message);
            } else {
                console.log('Connected to the SQLite database.');
            }
        });

        // Find user in the Users table
        db.get(`SELECT * FROM Users WHERE username = ? AND password = ?`, [username, password], (err, row) => {
            if (err) {
                console.error('Error finding user: ', err.message);
                reject(err.message);
            } else {
                if (row) {
                    console.log('User found: ', row);
                    resolve(row);
                } else {
                    console.error('User not found.');
                    reject('User not found.');
                }
            }
        });

        // Close the database connection
        db.close((err) => {
            if (err) {
                console.error('Error closing database: ', err.message);
            } else {
                console.log('Database connection closed.');
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", function() {
    // Add event listener when DOM content is fully loaded
    document.getElementById("signupButton").addEventListener("click", function(event) {
        event.preventDefault(); // Prevent form submission

        console.log("Form submitted.");

        // Get form values
        var email = document.getElementById("emailInput").value;
        var password = document.getElementById("passwordInput").value;
        var role = document.getElementById("roleInput").value;

        // Call function to register user
        registerUser(email, password, role)
            .then((userId) => {
                // Registration successful
                customAlert('User registered with ID: ' + userId);
                // Redirect to login page
                goToLogin();
            })
            .catch((error) => {
                // Registration failed
                customAlert('Error registering user: ' + error);

            });
    });

    document.getElementById("signinButton").addEventListener("click", function(event) {

        event.preventDefault(); // Prevent form submission

        // Get form values
        var email = document.getElementById("emailInputLogin").value;
        var password = document.getElementById("passwordInputLogin").value;
        var role = document.getElementById("roleInputLogin").value;
        // Authenticate user
        authenticateUser(email, password)
            .then((user) => {
                console.log('User authenticated: ', user);
                console.log(email, password, role);
                if(user.role === "admin"){
                    window.location.href = "../adminPage/admin.html";
                } else if(user.role === "employee"){
                    window.location.href = "../employeePage/employee.html";
                }
                
            })
            .catch((err) => {
                console.error('Error authenticating user: ', err);

            });
    });
});

// log.js

const sqlite3 = require('sqlite3').verbose();

// Function to authenticate user
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
    document.getElementById("loginForm").addEventListener("submit", function(event) {

        event.preventDefault(); // Prevent form submission

        // Get form values
        var username = document.getElementById("username").value;
        var password = document.getElementById("password").value;
        var role = document.getElementById("role").value;
        // Authenticate user
        authenticateUser(username, password)
            .then((user) => {
                console.log('User authenticated: ', user);
                customAlert('User authenticated: ' + user.username + ' (' + user.role + ')');

                if(role == "admin"){
                    window.location.href = "../adminPage/admin.html";
                } else if(role == "employee"){
                    window.location.href = "../employeePage/employee.html";
                }
                
            })
            .catch((err) => {
                console.error('Error authenticating user: ', err);

                customAlert("Invalid username or password.");

            });
    });

    /// go to register page

    document.getElementById("registerButton").addEventListener("click", function() {
        window.location.href = "../registrationPage/registration.html";
    });

});


/// create custom alert
function customAlert(msg) {
    // Get the custom alert box and message elements
    let alertBox = document.getElementById('customAlertBox');
    let alertMsg = document.getElementById('customAlertMsg');

    // Set the alert message
    alertMsg.textContent = msg;

    // Show the custom alert box
    alertBox.style.display = 'block';
}

// Close the custom alert box when the close button is clicked
document.getElementById('customAlertClose').addEventListener('click', function() {
    document.getElementById('customAlertBox').style.display = 'none';
});
const sqlite3 = require('sqlite3').verbose();

// Function to register user
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

document.addEventListener("DOMContentLoaded", function() {
    // Add event listener when DOM content is fully loaded
    document.getElementById("registrationForm").addEventListener("submit", function(event) {
        event.preventDefault(); // Prevent form submission

        console.log("Form submitted.");

        // Get form values
        var username = document.getElementById("username").value;
        var password = document.getElementById("password").value;
        var role = document.getElementById("role").value;

        // Call function to register user
        registerUser(username, password, role)
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
});

function goToLogin() {
    window.location.href = "../loginPage/log.html";
}

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
const sqlite3 = require('sqlite3').verbose();

// Function to register user
function registerUser(username, password, role) {
    return new Promise((resolve, reject) => {
        // Connect to the SQLite database
        const db = new sqlite3.Database('../dataBase/data.db', sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
                console.error('Error opening database: ', err.message);
                reject(err);
            } else {
                console.log('Connected to the SQLite database.');

                // Prepare SQL query to insert user into Users table
                const sql = `INSERT INTO Users (username, password, role) VALUES (?, ?, ?)`;
                db.run(sql, [username, password, role], function(err) {
                    if (err) {
                        console.error('Error inserting user into database: ', err.message);
                        reject(err);
                    } else {
                        console.log('User inserted successfully with id: ', this.lastID);
                        resolve(this.lastID);
                    }
                });
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
                console.log("Registration successful. User ID:", userId);
                // Redirect to login page
                goToLogin();
            })
            .catch((error) => {
                // Registration failed
                console.error("Registration failed:", error);
                // Display error message to the user
                // You can update the UI to inform the user about the registration failure
            });
    });
});

function goToLogin() {
    window.location.href = "../loginPage/log.html";
}

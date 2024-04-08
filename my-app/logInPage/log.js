// log.js

const sqlite3 = require('sqlite3').verbose();

// Function to authenticate user
function authenticateUser(username, password, role) {
    return new Promise((resolve, reject) => {
        // Connect to the SQLite database
        const db = new sqlite3.Database('../dataBase/data.db', sqlite3.OPEN_READONLY, (err) => {
            if (err) {
                console.error('Error opening database: ', err.message);
                reject(err);
            } else {
                console.log('Connected to the SQLite database.');

                // Prepare SQL query to check user credentials
                const sql = `SELECT * FROM Users WHERE username = ? AND password = ? AND role = ?`;
                db.get(sql, [username, password, role], (err, row) => {
                    if (err) {
                        console.error('Error querying database: ', err.message);
                        reject(err);
                    } else {
                        if (row) {
                            resolve({ username: row.username, role: row.role }); // User authenticated successfully
                        } else {
                            reject('Invalid username, password, or role');
                        }
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
    document.getElementById("loginForm").addEventListener("submit", function(event) {

        console.log("Form submitted.");
        event.preventDefault(); // Prevent form submission

        console.log("Form submitted.");

        // Get form values
        var username = document.getElementById("username").value;
        var password = document.getElementById("password").value;
        var role = document.getElementById("role").value;

        // Authenticate user
        authenticateUser(username, password, role)
            .then((user) => {
                // User authenticated successfully
                console.log("Login successful. User:", user);
                // Redirect to dashboard or another page
            })
            .catch((error) => {
                // Authentication failed
                console.error("Login failed:", error);
                // Display error message to the user
            });
    });
    
    // Button click event to go to registration page
    document.getElementById("registerButton").addEventListener("click", function() {
        // Redirect to registration page
        window.location.href = "../registrationPage/registration.html";
    });
});

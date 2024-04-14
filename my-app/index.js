const { app, BrowserWindow } = require('electron');
const sqlite3 = require('sqlite3').verbose();

let mainWindow;
let db;

// Function to create the SQLite database and tables
function createDatabase() {
    // Connect to the SQLite database (or create if not exists)
    db = new sqlite3.Database('dataBase/data.db', (err) => {
        if (err) {
            console.error('Error opening database: ', err.message);
        } else {
            console.log('Connected to the SQLite database.');
        }
    });

    // Create Users table
    db.run(`CREATE TABLE IF NOT EXISTS Users (
        user_id INTEGER PRIMARY KEY,
        username TEXT,
        password TEXT,
        role TEXT
    )`);
    // Insert default admin user if not exists wirh user_id=1
    // db.run(`INSERT OR IGNORE INTO Users (user_id, username, password, role) VALUES (1, 'admin', 'admin', 'admin')`);

    // Create Products table
    db.run(`CREATE TABLE IF NOT EXISTS Products (
        product_id INTEGER PRIMARY KEY,
        name TEXT,
        description TEXT,
        quantity INTEGER,
        price REAL
    )`);

    // Create Orders table

    // db.run(`DROP TABLE IF EXISTS Orders`);

    db.run(`CREATE TABLE IF NOT EXISTS Orders (
        order_id INTEGER PRIMARY KEY,
        employee_id INTEGER,
        order_date TEXT,
        status TEXT,
        FOREIGN KEY (employee_id) REFERENCES Users(user_id)
    )`);

    // Create Order Details table
    db.run(`CREATE TABLE IF NOT EXISTS Order_Details (
        order_detail_id INTEGER PRIMARY KEY,
        order_id INTEGER,
        product_id INTEGER,
        quantity INTEGER,
        FOREIGN KEY (order_id) REFERENCES Orders(order_id),
        FOREIGN KEY (product_id) REFERENCES Products(product_id)
    )`);
}

// Create the main window
app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    mainWindow.loadFile('loginPage/log.html');

    // Create the SQLite database and tables
    createDatabase();
});

// Close the database connection when the application is quitting
app.on('will-quit', () => {
    if (db) {
        db.close((err) => {
            if (err) {
                console.error('Error closing database: ', err.message);
            } else {
                console.log('Database connection closed.');
            }
        });
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

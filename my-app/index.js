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

    // Add products to the Products table
    db.run(`INSERT OR IGNORE INTO Products (product_id, name, description, quantity, price) VALUES (1, 'Product 1', 'Description for Product 1', 10, 100.00)`);
    db.run(`INSERT OR IGNORE INTO Products (product_id, name, description, quantity, price) VALUES (2, 'Product 2', 'Description for Product 2', 20, 200.00)`);
    db.run(`INSERT OR IGNORE INTO Products (product_id, name, description, quantity, price) VALUES (3, 'Product 3', 'Description for Product 3', 30, 300.00)`);
    db.run(`INSERT OR IGNORE INTO Products (product_id, name, description, quantity, price) VALUES (4, 'Product 4', 'Description for Product 4', 40, 400.00)`);

    
    // Create Orders table

    // db.run(`DROP TABLE IF EXISTS Orders`);

    // Create Order Details table

    // db.run(`DROP TABLE IF EXISTS Order_Details`);

    db.run(`CREATE TABLE IF NOT EXISTS Order_Details (
        order_detail_id INTEGER PRIMARY KEY,
        product_id INTEGER,
        product_name TEXT,
        quantity INTEGER,
        total_price REAL,
        FOREIGN KEY (product_id) REFERENCES Products(product_id)
    )`);


    db.run(`CREATE TABLE IF NOT EXISTS Inventory(
        product_id INTEGER PRIMARY KEY,
        product_name TEXT,
        quantity INTEGER,
        price REAL,
        FOREIGN KEY (product_id) REFERENCES Products(product_id)
    )`);

    db.run(`INSERT OR IGNORE INTO Inventory (product_id, product_name, quantity, price) VALUES (1, 'Product 1', 10, 100.00)`);
    db.run(`INSERT OR IGNORE INTO Inventory (product_id, product_name, quantity, price) VALUES (2, 'Product 2', 20, 200.00)`);
    db.run(`INSERT OR IGNORE INTO Inventory (product_id, product_name, quantity, price) VALUES (3, 'Product 3', 30, 300.00)`);
    db.run(`INSERT OR IGNORE INTO Inventory (product_id, product_name, quantity, price) VALUES (4, 'Product 4', 40, 400.00)`);
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

    mainWindow.loadFile('new_rl/new_register_login.html');

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

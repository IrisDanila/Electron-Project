const sqlite3 = require('sqlite3').verbose();

function addProduct(productName, price) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database('dataBase/data.db', (err) => {
            if (err) {
                console.error('Error opening database: ', err.message);
                reject(err.message);
            } else {
                console.log('Connected to the SQLite database.');
            }
        });

        var id = Math.floor(Math.random() * 1000000);

        db.run(`INSERT INTO Products (product_id, name, price) VALUES (?, ?, ?)`, [id, productName, price], function(err) {
            if (err) {
                console.error('Error inserting product: ', err.message);
                reject(err.message);
            } else {
                console.log('Product inserted with ID: ', id);
                resolve(id);
            }
        });

        db.close((err) => {
            if (err) {
                console.error('Error closing database: ', err.message);
            } else {
                console.log('Database connection closed.');
            }
        });
    });
}

function showProducts() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database('dataBase/data.db', (err) => {
            if (err) {
                console.error('Error opening database: ', err.message);
                reject(err.message);
            } else {
                console.log('Connected to the SQLite database.');
            }
        });

        db.all(`SELECT * FROM Products`, [], (err, rows) => {
            if (err) {
                console.error('Error finding products: ', err.message);
                reject(err.message);
            } else {
                if (rows) {
                    console.log('Products found: ', rows);
                    resolve(rows);
                } else {
                    console.error('No products found.');
                    reject('No products found.');
                }
            }
        });

        db.close((err) => {
            if (err) {
                console.error('Error closing database: ', err.message);
            } else {
                console.log('Database connection closed.');
            }
        });
    });
}

function addToInventory(productName, quantity, price,product_id) 
{
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database('dataBase/data.db', (err) => {
            if (err) {
                console.error('Error opening database: ', err.message);
                reject(err.message);
            } else {
                console.log('Connected to the SQLite database.');
            }
        });

        db.get(`SELECT * FROM Inventory WHERE product_id = ?`, [product_id], (err, row) => {
            if (err) {
                console.error('Error finding product: ', err.message);
                reject(err.message);
            } else {
                if (row) {
                    // Product exists, update quantity
                    let newQuantity = Number(row.quantity) + Number(quantity);
                    let newPrice = price*newQuantity;
                
                    db.run(`UPDATE Inventory SET quantity = ?, price = ? WHERE product_id = ?`, [newQuantity, newPrice, product_id], function(err) {
                        if (err) {
                            console.error('Error updating inventory: ', err.message);
                            reject(err.message);
                        } else {
                            console.log('Inventory updated with Product ID: ', product_id);
                            resolve(product_id);
                        }
                    });
                } else {
                    // Product doesn't exist, insert new product

                    db.run(`INSERT INTO Inventory (product_id, product_name, quantity, price) VALUES (?, ?, ?, ?)`, [product_id, productName, quantity, price*quantity], function(err) {
                        if (err) {
                            console.error('Error inserting inventory: ', err.message);
                            reject(err.message);
                        } else {
                            console.log('Inventory inserted with ID: ', product_id);
                            resolve(product_id);
                        }
                    });
                }
            }
        });

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

    document.addEventListener("submit", function(event) {
            
            event.preventDefault(); // Prevent form submission
    
            // Get form values
            var productName = document.getElementById("productName").value;
            var price = document.getElementById("price").value;
    
            // Call function to add product
            addProduct(productName, price)
                .then((productId) => {
                    // Product added successfully
                    customAlert('Product added with ID: ' + productId);
                    
                })
                .catch((error) => {
                    customAlert('Error adding product: ' + error);
                });
        });

        document.getElementById("viewProducts").addEventListener("click", function(event) {
            event.preventDefault(); // Prevent form submission
        
            // Call function to show products
            showProducts()
                .then((products) => {
                    // Products found
                    var productTable = document.getElementById('productSummary').getElementsByTagName('tbody')[0];
                    productTable.innerHTML = '';
        
                    products.forEach((product) => {
                        var productRow = document.createElement('tr');
                        productRow.innerHTML = `<td>${product.name}</td><td>${product.price}</td>`;
                        productTable.appendChild(productRow);
                    });
                })
                .catch((error) => {
                    customAlert('Error finding products: ' + error);
                });
        });

   
    });


    const PDFDocument = require('pdfkit');
    const fs = require('fs');
    
    function placeOrder() {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database('dataBase/data.db', (err) => {
                if (err) {
                    console.error('Error opening database: ', err.message);
                    reject(err.message);
                } else {
                    console.log('Connected to the SQLite database.');
                }
            });
    
            db.all(`SELECT * FROM Order_Details`, [], (err, rows) => {
                if (err) {
                    console.error('Error finding orders: ', err.message);
                    reject(err.message);
                } else {
                    if (rows) {
                        console.log('Orders found: ', rows);
    
                        // Create a new PDF document
                        const doc = new PDFDocument();
    
                        // Pipe its output to a file
                        doc.pipe(fs.createWriteStream('order.pdf'));
    
                        // Add some content to the PDF
                        doc.text('Order Details:', 100, 100);
                        let y = 150;
                        rows.forEach((order) => {
                            doc.text(`Product Name: ${order.product_name}, Quantity: ${order.quantity}, Total Price: ${order.total_price}`, 100, y);
                            y += 50;
                        });
    
                        // Finalize the PDF and end the stream
                        doc.end();

                        // update inventory


                        rows.forEach((order) => {
                            db.get(`SELECT * FROM Inventory WHERE product_id = ?`, [order.product_id], (err, row) => {
                                if (err) {
                                    console.error('Error finding product: ', err.message);
                                    reject(err.message);
                                } else {
                                    if (row) {
                                        // Product exists, update quantity
                                        let newQuantity = Number(row.quantity) + Number(order.quantity);
                                        let newPrice = row.price * newQuantity;
                                    
                                        db.run(`UPDATE Inventory SET quantity = ?, price = ? WHERE product_id = ?`, [newQuantity, newPrice, order.product_id], function(err) {
                                            if (err) {
                                                console.error('Error updating inventory: ', err.message);
                                                reject(err.message);
                                            } else {
                                                console.log('Inventory updated with Product ID: ', order.product_id);
                                            }
                                        });
                                    } else {
                                        // Product doesn't exist in inventory table

                                        addToInventory(order.product_name, order.quantity, 
                                            order.total_price, order.product_id).then((productId) => {
                                                // Product added successfully
                                                console.log('Product added with ID: ' + productId);
                                                
                                            })
                                            
                                        
                                    }
                                }
                            });
                        });

                        
    
                        // Clear the order details
                        db.run(`DELETE FROM Order_Details`, [], function(err) {
                            if (err) {
                                console.error('Error placing order: ', err.message);
                                reject(err.message);
                            } else {
                                console.log('Order placed and new order started.');
                                resolve('Order placed and new order started.');
                            }
                        });
                    } else {
                        console.error('No orders found.');
                        reject('No orders found.');
                    }
                }
            });
    
            db.close((err) => {
                if (err) {
                    console.error('Error closing database: ', err.message);
                } else {
                    console.log('Database connection closed.');
                }
            });
        });
    }
    
    document.getElementById("placeOrder").addEventListener("click", function(event) {
        event.preventDefault(); // Prevent form submission
    
        // Call function to place order
        placeOrder()
            .then((message) => {
                // Order placed successfully

                customAlert(message);
            })
            .catch((error) => {
                customAlert('Error placing order: ' + error);
            });
    });


    document.getElementById("viewOrders").addEventListener("click", function(event) {
        event.preventDefault(); // Prevent form submission
    
        // Call function to show orders
        showOrders()
            .then((orders) => {
                // Orders found
                var orderTable = document.getElementById('orderSummary').getElementsByTagName('tbody')[0];
                orderTable.innerHTML = '';
    
                orders.forEach((order) => {
                    var orderRow = document.createElement('tr');
                    orderRow.innerHTML = `<td>${order.product_name}</td><td>${order.quantity}</td><td>${order.total_price}</td>`;
                    orderTable.appendChild(orderRow);
                });
            })
            .catch((error) => {
                customAlert('Error finding orders: ' + error);
            });
    });

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

    function showOrders() {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database('dataBase/data.db', (err) => {
                if (err) {
                    console.error('Error opening database: ', err.message);
                    customAlert('Error opening database: ' + err.message);
                    reject(err.message);
                } else {
                    console.log('Connected to the SQLite database.');
                }
            });
    
            db.all(`SELECT * FROM Order_Details`, [], (err, rows) => {
                if (err) {
                    console.error('Error finding orders: ', err.message);
                    reject(err.message);
                } else {
                    if (rows) {
                        console.log('Orders found: ', rows);
                        resolve(rows);
                    } else {
                        console.error('No orders found.');
                        reject('No orders found.');
                    }
                }
            });
    
            db.close((err) => {
                if (err) {
                    console.error('Error closing database: ', err.message);
                } else {
                    console.log('Database connection closed.');
                }
            });
        });
    }


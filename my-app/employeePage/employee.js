
const sqlite3 = require('sqlite3').verbose();

function addToOrder(quantity, productName) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database('dataBase/data.db', (err) => {
            if (err) {
                console.error('Error opening database: ', err.message);
                reject(err.message);
            } else {
                console.log('Connected to the SQLite database.');
            }
        });

        var price;
        var product_id;
        var total_price;
        var newQuantity;
        var newTotalPrice;

        db.get(`SELECT * FROM Products WHERE name = ?`, [productName], (err, row) => {
            if (err) {
                console.error('Error finding product: ', err.message);
                reject(err.message);
            } else {
                if (row) {
                    console.log('Product found: ', row);
                    var price = row.price;
                    var product_id = row.product_id;
                    var total_price = price * quantity;

                    db.get(`SELECT * FROM Order_Details WHERE product_id = ?`, [product_id], (err, orderRow) => {
                        if (err) {
                            console.error('Error finding order: ', err.message);
                            reject(err.message);
                        } else {
                            if (orderRow) {
                                // Order exists, update quantity and total price
                                let newQuantity = Number(orderRow.quantity) + Number(quantity);
                                let newTotalPrice = Number(orderRow.total_price) + total_price;
                            
                                db.run(`UPDATE Order_Details SET quantity = ?, total_price = ? WHERE product_id = ?`, [newQuantity, newTotalPrice, product_id], function(err) {
                                    if (err) {
                                        console.error('Error updating order: ', err.message);
                                        reject(err.message);
                                    } else {
                                        console.log('Order updated with Product ID: ', product_id);
                                        resolve(product_id);
                                    }
                                });
                            } else {
                                // Order doesn't exist, insert new order
                                var id = Math.floor(Math.random() * 1000000);

                                db.run(`INSERT INTO Order_Details (order_detail_id, product_id, product_name, quantity, total_price) VALUES (?, ?, ?, ?, ?)`, [id, product_id, productName, quantity, total_price], function(err) {
                                    if (err) {
                                        console.error('Error inserting order: ', err.message);
                                        reject(err.message);
                                    } else {
                                        console.log('Order inserted with ID: ', id);
                                        resolve(id);
                                    }
                                });
                            }
                        }
                    });
                } else {
                    console.error('Product not found.');
                    reject('Product not found.');
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


function populateProductDropdown() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database('dataBase/data.db', (err) => {
            if (err) {
                console.error('Error opening database: ', err.message);
                reject(err.message);
            } else {
                console.log('Connected to the SQLite database.');
            }
        });

        db.all(`SELECT name FROM Products`, [], (err, rows) => {
            if (err) {
                console.error('Error fetching products: ', err.message);
                reject(err.message);
            } else {
                resolve(rows);
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
    // Populate the dropdown menu with product names
    populateProductDropdown()
    .then((products) => {
        const dropdown = document.getElementById('productNameDropDown');
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.name;
            option.textContent = product.name;
            dropdown.appendChild(option);
        });
    })
    .catch((error) => {
        customAlert('Error fetching products: ' + error);
    });

document.getElementById("orderFormDropDown").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent form submission

    // Get form values
    var quantity = document.getElementById("quantityDropDown").value;
    var productName = document.getElementById("productNameDropDown").value;

    // Call function to add to order
    addToOrder(quantity, productName)
        .then((orderId) => {
            // Order successful
            customAlert('Order added with ID: ' + orderId);
        })
        .catch((error) => {
            customAlert('Error adding order: ' + error);
        });
    });


    // Close the custom alert box when the close button is clicked
    document.getElementById('customAlertClose').addEventListener('click', function() {
        document.getElementById('customAlertBox').style.display = 'none';
    });
});



function showOrders() {
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


function viewInventory() 
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

        db.all(`SELECT * FROM Inventory`, [], (err, rows) => {
            if (err) {
                console.error('Error finding inventory: ', err.message);
                reject(err.message);
            } else {
                if (rows) {
                    console.log('Inventory found: ', rows);
                    resolve(rows);
                } else {
                    console.error('No inventory found.');
                    reject('No inventory found.');
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

function customAlert(msg) {
    // Get the custom alert box and message elements
    let alertBox = document.getElementById('customAlertBox');
    let alertMsg = document.getElementById('customAlertMsg');

    // Set the alert message
    alertMsg.textContent = msg;

    // Show the custom alert box
    alertBox.style.display = 'block';
}


document.addEventListener("DOMContentLoaded", function() {

    document.addEventListener("submit", function(event) {
            
            event.preventDefault(); // Prevent form submission
    
            // Get form values
            var quantity = document.getElementById("quantity").value;
            var productName = document.getElementById("productName").value;
    
            // Call function to add to order
            addToOrder(quantity,productName)
                .then((orderId) => {
                    // Order successful
                    customAlert('Order added with ID: ' + orderId);
                    
                })
                .catch((error) => {
                    customAlert('Error adding order: ' + error);
                });
        });

        document.getElementById("viewOrder").addEventListener("click", function(event) {
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

        document.getElementById("viewInventory").addEventListener("click", function(event) {

            event.preventDefault(); // Prevent form submission
            // Call function to show inventory
            viewInventory()
                .then((inventory) => {
                    // Inventory found
                    var inventoryTable = document.getElementById('InventorySummary').getElementsByTagName('tbody')[0];
                    inventoryTable.innerHTML = '';

                    inventory.forEach((product) => {
                        var productRow = document.createElement('tr');
                        productRow.innerHTML = `<td>${product.product_name}</td><td>${product.quantity}</td><td>${product.price}</td>`;
                        inventoryTable.appendChild(productRow);
                    });

                })
                .catch((error) => {
                    customAlert('Error finding inventory: ' + error);
                });

        });

   
    });
    
    // Close the custom alert box when the close button is clicked
    document.getElementById('customAlertClose').addEventListener('click', function() {
        document.getElementById('customAlertBox').style.display = 'none';
    });




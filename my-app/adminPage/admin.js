const sqlite3 = require('sqlite3').verbose();

document.addEventListener("DOMContentLoaded", function() {

    function createModal(id, title, body) {
        let modal = document.createElement('div');
        modal.classList.add('modal');
        modal.setAttribute('id', id);

        let modalDialog = document.createElement('div');
        modalDialog.classList.add('modal-dialog');

        let modalContent = document.createElement('div');
        modalContent.classList.add('modal-content');

        let modalHeader = document.createElement('div');
        modalHeader.classList.add('modal-header');

        let modalTitle = document.createElement('h5');
        modalTitle.classList.add('modal-title');
        modalTitle.textContent = title;

        let closeButton = document.createElement('button');
        closeButton.classList.add('close');
        closeButton.innerHTML = '&times;';
        closeButton.onclick = function() {
            document.body.removeChild(modal);
        };

        let modalBody = document.createElement('div');
        modalBody.classList.add('modal-body');
        modalBody.innerHTML = body;

        modalHeader.appendChild(modalTitle);
        modalHeader.appendChild(closeButton);
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);
        modalDialog.appendChild(modalContent);
        modal.appendChild(modalDialog);

        document.body.appendChild(modal);
    }

    function addProduct(productName, price) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database('dataBase/data.db', (err) => {
                if (err) {
                    reject(err.message);
                }
            });

            var id = Math.floor(Math.random() * 1000000);

            db.run(`INSERT INTO Products (product_id, name, price) VALUES (?, ?, ?)`, [id, productName, price], function(err) {
                if (err) {
                    reject(err.message);
                } else {
                    resolve(id);
                }
            });

            db.close((err) => {
                if (err) {
                    console.error(err.message);
                }
            });
        });
    }

    function showProducts() {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database('dataBase/data.db', (err) => {
                if (err) {
                    reject(err.message);
                }
            });

            db.all(`SELECT * FROM Products`, [], (err, rows) => {
                if (err) {
                    reject(err.message);
                } else {
                    resolve(rows);
                }
            });

            db.close((err) => {
                if (err) {
                    console.error(err.message);
                }
            });
        });
    }

    function addToInventory(productName, quantity, price, product_id) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database('dataBase/data.db', (err) => {
                if (err) {
                    reject(err.message);
                }
            });

            db.get(`SELECT * FROM Inventory WHERE product_id = ?`, [product_id], (err, row) => {
                if (err) {
                    reject(err.message);
                } else {
                    if (row) {
                        let newQuantity = Number(row.quantity) + Number(quantity);
                        let newPrice = price * newQuantity;

                        db.run(`UPDATE Inventory SET quantity = ?, price = ? WHERE product_id = ?`, [newQuantity, newPrice, product_id], function(err) {
                            if (err) {
                                reject(err.message);
                            } else {
                                resolve(product_id);
                            }
                        });
                    } else {
                        db.run(`INSERT INTO Inventory (product_id, product_name, quantity, price) VALUES (?, ?, ?, ?)`, [product_id, productName, quantity, price * quantity], function(err) {
                            if (err) {
                                reject(err.message);
                            } else {
                                resolve(product_id);
                            }
                        });
                    }
                }
            });

            db.close((err) => {
                if (err) {
                    console.error(err.message);
                }
            });
        });
    }

    function customAlert(msg) {
        let alertBox = document.getElementById('customAlertBox');
        let alertMsg = document.getElementById('customAlertMsg');
        alertMsg.textContent = msg;
        alertBox.style.display = 'block';
    }

    document.getElementById('customAlertClose').addEventListener('click', function() {
        document.getElementById('customAlertBox').style.display = 'none';
    });

    document.getElementById("addProduct").addEventListener("click", function(event) {
        event.preventDefault();
        createModal('addProductModal', 'Add Product', `
            <form id="productForm">
                <input type="text" id="productName" placeholder="Product Name" required>
                <input type="number" id="price" placeholder="Price" required>
                <button type="submit">Add Product</button>
            </form>
        `);
        
        document.getElementById('productForm').addEventListener('submit', function(event) {
            event.preventDefault();
            var productName = document.getElementById("productName").value;
            var price = document.getElementById("price").value;
            addProduct(productName, price)
                .then((productId) => {
                    customAlert('Product added with ID: ' + productId);
                })
                .catch((error) => {
                    customAlert('Error adding product: ' + error);
                });
        });
    });

    document.getElementById("viewProducts").addEventListener("click", function(event) {
        event.preventDefault();
        showProducts()
            .then((products) => {
                let productTable = '<table><thead><tr><th>Product Name</th><th>Price</th></tr></thead><tbody>';
                products.forEach((product) => {
                    productTable += `<tr><td>${product.name}</td><td>${product.price}</td></tr>`;
                });
                productTable += '</tbody></table>';
                createModal('viewProductsModal', 'View Products', productTable);
            })
            .catch((error) => {
                customAlert('Error finding products: ' + error);
            });
    });

    document.getElementById("viewOrders").addEventListener("click", function(event) {
        event.preventDefault();
        showOrders()
            .then((orders) => {
                let orderTable = '<table><thead><tr><th>Product Name</th><th>Quantity</th></thead><tbody>';
                orders.forEach((order) => {
                    orderTable += `<tr><td>${order.product_name}</td><td>${order.quantity}</td></tr>`;
                });
                orderTable += '</tbody></table>';
                createModal('viewOrdersModal', 'View Orders', orderTable);
                
            })
            .catch((error) => {
                customAlert('Error finding orders: ' + error);
            });
    });

    document.getElementById("placeOrder").addEventListener("click", function(event) {
        event.preventDefault();
        placeOrder()
            .then((message) => {
                customAlert(message);
            })
            .catch((error) => {
                customAlert('Error placing order: ' + error);
            });
    });

    function showOrders() {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database('dataBase/data.db', (err) => {
                if (err) {
                    reject(err.message);
                }
            });

            db.all(`SELECT * FROM Order_Details`, [], (err, rows) => {
                if (err) {
                    reject(err.message);
                } else {
                    resolve(rows);
                }
            });

            db.close((err) => {
                if (err) {
                    console.error(err.message);
                }
            });
        });
    }

    // go back to the previous page
function goBack() {
    window.history.back();
}
    document.getElementById("Go Back").addEventListener("click", function(event) {
        event.preventDefault(); // Prevent form submission
    
        // Call function to go back
        goBack()
    });


    function placeOrder() {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database('dataBase/data.db', (err) => {
                if (err) {
                    reject(err.message);
                }
            });

            db.all(`SELECT * FROM Order_Details`, [], (err, rows) => {
                if (err) {
                    reject(err.message);
                } else {
                    if (rows) {
                        const PDFDocument = require('pdfkit');
                        const fs = require('fs');
                        const doc = new PDFDocument();
                        doc.pipe(fs.createWriteStream('order.pdf'));
                        doc.text('Order Details:', 100, 100);
                        let y = 150;
                        rows.forEach((order) => {
                            doc.text(`Product Name: ${order.product_name}, Quantity: ${order.quantity}, Total Price: ${order.total_price}`, 100, y);
                            y += 50;
                        });
                        doc.end();

                        rows.forEach((order) => {
                            db.get(`SELECT * FROM Inventory WHERE product_id = ?`, [order.product_id], (err, row) => {
                                if (err) {
                                    reject(err.message);
                                } else {
                                    if (row) {
                                        let newQuantity = Number(row.quantity) + Number(order.quantity);
                                        let newPrice = row.price * newQuantity;
                                        db.run(`UPDATE Inventory SET quantity = ?, price = ? WHERE product_id = ?`, [newQuantity, newPrice, order.product_id], function(err) {
                                            if (err) {
                                                reject(err.message);
                                            }
                                        });
                                    } else {
                                        addToInventory(order.product_name, order.quantity, order.total_price, order.product_id)
                                            .then((productId) => {
                                                console.log('Product added with ID: ' + productId);
                                            });
                                    }
                                }
                            });
                        });

                        db.run(`DELETE FROM Order_Details`, [], function(err) {
                            if (err) {
                                reject(err.message);
                            } else {
                                resolve('Order placed and new order started.');
                            }
                        });
                    } else {
                        reject('No orders found.');
                    }
                }
            });

            db.close((err) => {
                if (err) {
                    console.error(err.message);
                }
            });
        });
    }
});

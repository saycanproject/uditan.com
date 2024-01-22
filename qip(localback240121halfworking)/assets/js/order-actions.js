function attachOrderActionEventHandlers() {
    document.querySelectorAll('.sell-item-btn').forEach(button => {
        button.addEventListener('click', function() {
            const orderId = this.dataset.orderId;
            const itemName = this.dataset.itemName;
            const input = document.querySelector('.sell-quantity-input[data-order-id="' + orderId + '"]');
            const quantityToSell = input.value;
            if (quantityToSell) {
                sellItem(orderId, itemName, quantityToSell);
            }
        });
    });

    document.querySelectorAll('.return-item-btn').forEach(button => {
        button.addEventListener('click', function() {
            const orderId = this.dataset.orderId;
            const itemName = this.dataset.itemName;
            const input = document.querySelector('.return-quantity-input[data-order-id="' + orderId + '"]');
            const quantityToReturn = input.value;
            if (quantityToReturn) {
                returnItem(orderId, itemName, quantityToReturn);
            }
        });
    });
}

// Function to be called when the document is ready
function onDocumentReady() {
    attachOrderActionEventHandlers();

    // Other initialization code can go here if needed
}

// Attach handlers when the DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onDocumentReady);
} else {
    onDocumentReady(); // DOMContentLoaded has already fired
}

// Attach event handler for finalize deal button
const finalizeDealBtn = document.getElementById('finalize-deal-btn');
if (finalizeDealBtn) {
    finalizeDealBtn.addEventListener('click', finalizeDeal);
}
// Rest of your existing functions (sellItem, returnItem, finalizeDeal, etc.)

function sellItem(orderId, itemName, quantityToSell) {
    fetch('/index.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({action: 'sell', userId: userId, itemId: orderId, quantityToSell: quantityToSell })    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update the order row to reflect the new stock and sold quantities
            const row = document.querySelector('tr[data-order-id="' + orderId + '"]');
            row.querySelector('.sold').textContent = parseInt(row.querySelector('.sold').textContent) + parseInt(quantityToSell);
            row.querySelector('.stock').textContent = parseInt(row.querySelector('.stock').textContent) - parseInt(quantityToSell);
            // Reset the input field
            document.querySelector('.sell-quantity-input[data-order-id="' + orderId + '"]').value = '';
        } else {
            alert('Error selling items: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while selling the items.');
    });
}

function returnItem(orderId, itemName, quantityToReturn) {
    fetch('/index.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({action: 'return', orderId: orderId, itemName: itemName, quantityToReturn: quantityToReturn })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update the order row to reflect the new stock and returned quantities
            const row = document.querySelector('tr[data-order-id="' + orderId + '"]');
            row.querySelector('.returned').textContent = parseInt(row.querySelector('.returned').textContent) + parseInt(quantityToReturn);
            row.querySelector('.stock').textContent = parseInt(row.querySelector('.stock').textContent) + parseInt(quantityToReturn);
            // Reset the input field
            document.querySelector('.return-quantity-input[data-order-id="' + orderId + '"]').value = '';
        } else {
            alert('Error returning items: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while returning the items.');
    });
}

function finalizeDeal() {
    // Here you would collect the data you want to send to the server.
    // This could be a summary of all orders, or just the IDs and quantities sold/returned.
    // For demonstration, let's assume you send an array of order IDs.
    const orderIds = Array.from(document.querySelectorAll('#orders-table .order-row')).map(row => row.dataset.orderId);

    fetch('/index.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'finalize_deal', orderIds: orderIds })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Deal has been finalized successfully!');
            // Here you can redirect to another page or update the current view
        } else {
            alert('Error finalizing deal: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while finalizing the deal.');
    });
}

function handleOrderUpdate(response, itemId, newQuantity, unitPrice) {
    if (response.success) {
        const quantitySpan = document.querySelector(".quantity[data-id='" + itemId + "']");
        const totalSpan = document.querySelector(".total-price[data-id='" + itemId + "']");
        quantitySpan.textContent = newQuantity;
        totalSpan.textContent = (newQuantity * unitPrice).toFixed(2); // Update the total price
    } else {
        alert(response.message || 'An error occurred while updating the order.');
    }
}

function sendOrderUpdate(itemId, newQuantity, unitPrice) {
    fetch('/index.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: newQuantity > 0 ? 'update_order' : 'delete_item', itemId: itemId, quantity: newQuantity })
    })
    .then(response => response.json())
    .then(data => handleOrderUpdate(data, itemId, newQuantity, unitPrice))
    .catch(error => console.error('Error:', error));
}

document.addEventListener('click', function(event) {
    if (event.target.matches('.increase-quantity, .decrease-quantity')) {
        const itemId = event.target.dataset.id;
        const quantitySpan = document.querySelector(".quantity[data-id='" + itemId + "']");
        const unitPrice = parseFloat(document.querySelector(".unit-price[data-id='" + itemId + "']").textContent);
        let newQuantity = parseInt(quantitySpan.textContent);

        newQuantity += event.target.matches('.increase-quantity') ? 1 : -1;
        
        if (newQuantity >= 0) { // Prevent negative quantities
            sendOrderUpdate(itemId, newQuantity, unitPrice);
        }
    } else if (event.target.matches('.delete-item')) {
        const itemId = event.target.dataset.id;
        event.target.closest('tr').remove(); // Remove the row from the DOM
        sendOrderUpdate(itemId, 0, 0); // Send delete request to the server
    }else if (event.target.id === 'confirm-order-btn') {
    fetch('/index.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'confirm_order' })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.success ? 'Order confirmed!' : 'Error confirming order: ' + data.message);
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while confirming the order.');
    })
    .finally(() => {
        // Clear the orders table regardless of the result.
        document.querySelector('#orders-table tbody').innerHTML = '';
    });
    }

});
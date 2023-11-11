class Cart {
    constructor() {
        this.items = {};
    }

    addItem(id, name, price, quantity) {
        if (this.items[id]) {
            this.items[id].quantity += quantity;
        } else {
            this.items[id] = {name, price, quantity};
        }
    }

    displayCart() {
        let cartDiv = document.getElementById('cart');
        cartDiv.innerHTML = 'Cart: ';
        for (let id in this.items) {
            let item = this.items[id];
            cartDiv.innerHTML += `<br>${item.name} (${item.quantity})`;
        }
    }

    async checkout() {
        let params = new URLSearchParams();
        for (let id in this.items) {
            let item = this.items[id];
            for (let key in item) {
                params.append(`${id}[${key}]`, item[key]);
            }
        }

        let response = await fetch('/index.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cart: this.items }),
        });
        
        if (!response.ok) {
            console.error('Error:', response.status, await response.text());
            return;
        }

        let result = await response.json();

        if (result.success) {
            alert('Order placed successfully.');
            this.items = {};
            this.displayCart();
        } else {
            alert('There was an error placing the order.');
        }
    }
}

window.onload = function() {
    let cart = new Cart();

    const buttons = document.querySelectorAll('.add-to-cart');
    buttons.forEach((button) => {
        button.addEventListener('click', (event) => {
            const id = event.target.dataset.id;
            const name = event.target.dataset.name;
            const price = parseFloat(event.target.dataset.price);
            const quantity = parseInt(event.target.previousElementSibling.value);

            cart.addItem(id, name, price, quantity);
            cart.displayCart();
        });
    });

    const checkoutButton = document.getElementById('checkout');
    checkoutButton.addEventListener('click', () => cart.checkout());
};
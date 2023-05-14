//very important array
const cart = [];

//api get request to products
const getProducts = async () => {
    try {
        const products = await axios.get("https://fakestoreapi.com/products/");
        return products.data;
    } catch (err) {
        const products = await axios.get("https://deepblue.camosun.bc.ca/~c0180354/ics128/final/fakestoreapi.json");
        return products.data;
    }
};

//post request to send JSON object to server with completed purchse form
const submitOrder = async (purchase) => {
    try {
        const response = await axios.post("https://deepblue.camosun.bc.ca/~c0180354/ics128/final/", purchase);
        return true;
    } catch (error) {
        return false;
    }
};

//getting daily currency conversion 
const getCurrency = async (value) => {
    try {
        const currency = await axios.get(`https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/${value}/cad.json`);
        return (currency.data.cad);
    } catch (err) {
        return (err);
    }
};

//product card
const cardLayout = (product, exchange, symbol) =>
    `<div class="card col-4 m-2 p-3" style="width: 18rem;">
    <img src="${product.image}" class="card-img-top" alt="...">
    <div class="card-body d-flex flex-column">
        <h5 class="card-title">${product.title}</h5>
        <p class="card-text">${product.description}</p>
        <div class="mt-auto d-flex justify-content-between align-items-center">
            <h4 class="card-text">${symbol + (product.price * exchange).toFixed(2)}</h4>
            <button data-id="${product.id}" data-price="${product.price}" data-title="${product.title}" type="button" class="btn btn-primary add-to-cart" data-bs-toggle="offcanvas" data-bs-target="#offcanvasRight"
            aria-controls="offcanvasRight">Add to Cart</button>
        </div>
    </div>
</div>
`;

//item row in cart 
const cartItem = (item, currency, symbol) => {
    return (`
<tr>
    <td><button data-id="${item.id}" class="btn delete-from-cart"><i class="material-icons" style="color:red">delete</i></button></td>   
    <td style="width: 30%;">${item.title}</td>
    <td class="px-4">${item.quantity}</td>
    <td>${symbol + " " + (item.price * currency).toFixed(2)}</td>
    <td>${symbol + " " + (item.price * item.quantity * currency).toFixed(2)}</td>
</tr>
`)
};

//subtotal of cart - if there are no items it displays that 
const cartTotal = (total, currency, symbol) => {
    return (total === 0 ? `
    <tr>
        <td colspan="6">
            <hr>
        </td>
    </tr>
        <tr><td><b style="color: blue;">No Item In Cart</b><td><tr>    
    <tr>
        <td colspan="6">
            <hr>
        </td>
    </tr>
    ` : `
        <tr>
        <td colspan="6">
            <hr>
        </td>
    </tr>
        <tr>
            <td><b>Subtotal<b></td>
            <td></td>
            <td></td>
            <td></td>
            <td>${symbol + " " + (total * currency).toFixed(2)}</td>
        </tr>
        <tr>
        <td colspan="6">
            <hr>
        </td>
    </tr>
        `
    )
};

//if customer clicks add to cart then item is added, if item is already in cart quantity is increased by 1
const addToCart = (id, price, title) => {
    const itemIndex = cart.findIndex((item) => item.id == id);
    if (itemIndex != -1) {
        cart[itemIndex].quantity++;
    } else {
        cart.push({ id: id, price: price, title: title, quantity: 1 });
    }
    showCart();
};

//showing items and cost of cart depeneding on currency
const showCart = async () => {
    const currency = await getCurrency($("#currency-selection").val());
    const currencySymbol = getCurrencySymbol();
    const cartItems = cart.map((item) => cartItem(item, currency, currencySymbol));
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    $("#cart-items").html(cartItems);
    $("#cart-total").html(cartTotal(total, currency, currencySymbol));
};

//can add more curecny symbols here and everything should update (also need to add the 3 letter code in currency-selection)
const getCurrencySymbol = () => {
    if ($("#currency-selection").val() == "eur") {
        return "€";
    }
    else return "$";
};

$(document).ready(function () {
    //display products with updated currency
    const displayCard = async () => {
        const currency = await getCurrency($("#currency-selection").val());
        const products = await getProducts();
        const currencySymbol = getCurrencySymbol();
        const productCards = products.map((product) => cardLayout(product, currency, currencySymbol));
        $("#store-products").html(productCards);
    };
    displayCard();

    //add item to cart - used class instead of id cause items are dynamically rendered
    $(document).on("click", ".add-to-cart", function () {
        const id = $(this).data("id");
        const price = $(this).data("price");
        const title = $(this).data("title");
        addToCart(id, price, title);
    });

    //delete item from cart 
    $(document).on("click", ".delete-from-cart", function () {
        const id = $(this).data("id");
        const itemIndex = cart.findIndex((item) => item.id == id);
        if (itemIndex != -1) {
            cart.splice(itemIndex, 1);
            showCart();
        }
    });

    //delete all items from cart
    $("#delete-all-cart").on("click", function () {
        cart.length = 0;
        showCart();
    });

    //update currency on products and cart
    $("#currency-selection").on("change", function () {
        displayCard();
        showCart();
    });

    $("#show-cart").on("click", function () {
        showCart();
    });
});
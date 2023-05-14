//tax by province
const taxByProvince = {
    "bc": 0.12,
    "ab": 0.05,
    "sk": 0.11,
    "mb": 0.12,
    "qc": 0.14975,
    "on": 0.13,
    "ns": 0.15,
    "nb": 0.15,
    "nl": 0.15,
    "pei": 0.15,
    "nt": 0.05,
    "nu": 0.05,
    "yt": 0.05,
}

//object that will be passed when order is placed
const orderInfo = {
    amount: '',
    currency: '',
    card_number: '',
    expiry_month: '',
    expiry_year: '',
    security_code: '',
    billing: {
        first_name: '',
        last_name: '',
        address_1: '',
        address_2: '',
        city: '',
        province: '',
        country: '',
        postal: '',
        phone: '',
        email: ''
    },
    shipping: {
        first_name: '',
        last_name: '',
        address_1: '',
        address_2: '',
        city: '',
        province: '',
        country: '',
        postal: '',
    }
};

$(document).ready(function () {
    $("#checkout-pg-btn").hide();
    $("#back-pg-btn").hide();

    //setting orderInfo key/value to input id in html fields
    const mapCCInfo = {
        "cardNumber": "card_number",
        "ExpireDate": "expiry_month",
        "ExpireDateYear": "expiry_year",
        "securityCode": "security_code",
    };
    const mapBillingInfo = {
        "billFName": "first_name",
        "billLName": "last_name",
        "billAddress1": "address_1",
        "billAddress2": "address_2",
        "billCity": "city",
        "billProvince": "province",
        "billCountry": "country",
        "billPostal": "postal",
        "billPhoneNum": "phone",
        "billEmail": "email"
    };
    const mapShippingInfo = {
        "shipFName": "first_name",
        "shipLName": "last_name",
        "shipAddress1": "address_1",
        "shipAddress2": "address_2",
        "shipCity": "city",
        "shipProvince": "province",
        "shipCountry": "country",
        "shipPostal": "postal",
    };

    //settting shipping info to billing if checkbox stating they are the same is checked
    const updateShippingFromBilling = () => {
        orderInfo.shipping.first_name = orderInfo.billing.first_name;
        orderInfo.shipping.last_name = orderInfo.billing.last_name;
        orderInfo.shipping.address_1 = orderInfo.billing.address_1;
        orderInfo.shipping.address_2 = orderInfo.billing.address_2;
        orderInfo.shipping.city = orderInfo.billing.city;
        orderInfo.shipping.province = orderInfo.billing.province;
        orderInfo.shipping.country = orderInfo.billing.country;
        orderInfo.shipping.postal = orderInfo.billing.postal;
    };

    //setting shipping info to values in html if it is different from billing
    const updateShippingFromForm = () => {
        orderInfo.shipping.first_name = $("#shipFName").val();
        orderInfo.shipping.last_name = $("#shipLName").val();
        orderInfo.shipping.address_1 = $("#shipAddress1").val();
        orderInfo.shipping.address_2 = $("#shipAddress2").val();
        orderInfo.shipping.city = $("#shipCity").val();
        orderInfo.shipping.province = $("#shipProvince").val();
        orderInfo.shipping.country = $("#shipCountry").val();
        orderInfo.shipping.postal = $("#shipPostal").val();
    }

    //determining where to get shipping info from based on checkbox
    const toggleShippingForm = () => {
        if ($("#flexCheckDefault").is(":checked")) {
            $("#shipping-form").hide();
            updateShippingFromBilling();
        } else {
            updateShippingFromForm();
            $("#shipping-form").show();
        }
        mapInput(mapShippingInfo, orderInfo.shipping);
    };

    $("#flexCheckDefault").on("change", toggleShippingForm);

    //using jump tables above we map the data from each field to the corresponding html element
    const mapInput = (mapping, target) => {
        $.each(mapping, function (inputId, targetProp) {
            $("#" + inputId).on("input", function () {
                target[targetProp] = $(this).val();
            });
        });
    }
    mapInput(mapCCInfo, orderInfo);
    mapInput(mapBillingInfo, orderInfo.billing);
    toggleShippingForm();

    //displaying item in checkout modal
    const checkoutItem = (item, currency, symbol) => {
        return (`
    <tr> 
        <td>${item.title}</td>
        <td>${item.quantity}</td>
        <td>${symbol + (item.price * currency).toFixed(2)}</td>
        <td>${symbol + (item.price * item.quantity * currency).toFixed(2)}</td>
    </tr>
    `)
    };

    //setting the total and determining all the tax and shipping costs in the checkout 
    const checkoutTotal = async () => {
        const currency = await getCurrency($("#currency-selection").val());
        const symbol = getCurrencySymbol();
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const subTotal = parseFloat(total * currency);
        const taxRate = taxByProvince[orderInfo.shipping.province];
        const taxes = isNaN(subTotal * taxRate) ? 0.00 : parseFloat(subTotal * taxRate);
        const shipping = parseFloat(15.00);
        const totalCost = (subTotal + shipping + taxes);
        orderInfo.amount = totalCost.toFixed(2);
        orderInfo.currency = $("#currency-selection").val();
        // displaying total in table in checkout modal
        $("#checkout-total").html(`
    <tr>
        <td colspan="4">
            <hr>
        </td>
    </tr>
        <tr>
        <td><b>Subtotal</b></td>
        <td></td>
        <td></td>
        <td>${symbol + subTotal.toFixed(2)}</td>
    </tr>
    <tr>
        <td><b>Shipping (flat rate)</b></td>
        <td></td>
        <td></td>
        <td>${symbol + shipping.toFixed(2)}</td>
    </tr>
    <tr>
        <td><b>Tax</b></td>
        <td></td>
        <td></td>
        <td>${symbol + taxes.toFixed(2)}</td>
    </tr>
    <tr>
        <td><b>Total</b></td>
        <td></td>
        <td></td>
        <td>${symbol + totalCost.toFixed(2)}</td>
    </tr>   
    <tr>
        <td colspan="4">
            <hr>
        </td>
    </tr> 
        `);
    };

    //this is updating the items with the correct curency conversion and currency symbol
    const checkoutPage = async () => {
        const currency = await getCurrency($("#currency-selection").val());
        const symbol = getCurrencySymbol();
        const checkout = cart.map((item) => checkoutItem(item, currency, symbol));
        $("#checkout-items").html(checkout);
    };
    $("#checkout-btn").on("click", function () {
        checkoutPage();
    })

    //showing next/back/complete order buttons depending on which page customer is on
    const updateButtons = () => {
        const currentLink = $("#modalNav .nav-link.active");
        if (currentLink.is($("#page1-tab"))) {
            $("#back-pg-btn").hide();
        }
        else {
            $("#back-pg-btn").show();
        }
        if (currentLink.is($("#page4-tab"))) {
            $("#next-pg-btn").hide();
            $("#checkout-pg-btn").show();
        }
        else {
            $("#checkout-pg-btn").hide();
            $("#next-pg-btn").show();
        }
    };

    //this function navigates the current page setting it to active and setting the last one to not active 
    const updateCheckout = (currentPage, nextPage) => {
        var currentPane = $("#modalTabContent .tab-pane.active");
        var nextPane = nextPage.attr("href");
        currentPane.removeClass("show active");
        $(nextPane).addClass("show active");
        currentPage.removeClass("active");
        nextPage.addClass("active");
        updateButtons();
    };

    //back button goes to the previous page in the modal 
    $("#back-pg-btn").on("click", function () {
        const currentPage = $("#modalNav .nav-link.active");
        const nextPage = currentPage.parent().prev().children(".nav-link");
        updateCheckout(currentPage, nextPage);
    });

    //next button goes to the next page (note it only works once valid cc info is put in)
    $("#next-pg-btn").on("click", function () {
        let ccPage = cardHandler($("#cardNumber").val(), $("#ExpireDate").val(), $("#ExpireDateYear").val(), $("#securityCode").val());
        checkForErrors();
        if (ccPage) {
            toggleShippingForm();
            checkoutTotal();
            const currentPage = $("#modalNav .nav-link.active");
            const nextPage = currentPage.parent().next().children(".nav-link");
            updateCheckout(currentPage, nextPage);
            $("#valid-card").html(``)
        }
        else {
            $("#valid-card").html(`<p style="color: red">Please enter a valid card</p>`)
        }
    });

    //if the nav bar is clicked instead of the next/back button this makes sure the data is still added to orderInfo
    $("#modalNav .nav-link").on("click", function () {
        updateButtons();
        toggleShippingForm();
        checkoutTotal();
        checkForErrors();
    });

    //if the modal is closed we want to have the first page be the cc page again so this sets that 
    $("#close-modal").on("click", function () {
        $("#modalTabContent .tab-pane.active").removeClass("show active");
        $("#modalNav .nav-link.active").removeClass("active");
        $("#payment").addClass("show active")
        $("#page1-tab").addClass("active")
        $("#checkout-pg-btn").hide();
        $("#next-pg-btn").show();
        $("#back-pg-btn").hide();
    });

    //function to validate all the data 
    //Since the data is added to orderInfo we are using that to validate instead of the value in each text field 
    //I did it like this to ensure the data being passed to the server is correct 
    const validateOrderInfo = () => {
        $("#error-message").html(``);
        let ccPage = cardHandler($("#cardNumber").val(), $("#ExpireDate").val(), $("#ExpireDateYear").val(), $("#securityCode").val());
        let errors = [];
        if (!ccPage) {
            errors.push("Please enter a valid credit card")
        }
        if (!nameLength(orderInfo.billing.first_name)) {
            errors.push("Please provide a first name more than 2 characters in length");
        }
        if (!nameLength(orderInfo.billing.last_name)) {
            errors.push("Please provide a last name more than 2 characters in length");
        }
        if (orderInfo.billing.address_1.length < 5) {
            errors.push("Please provide a street address longer than 5 characters in length");
        }
        if (orderInfo.billing.country === "") {
            errors.push("Please select a billing country");
        }
        if (orderInfo.billing.province == "") {
            errors.push("Please select a billing province");
        }
        if (!postalCodeHandler(orderInfo.billing.postal)) {
            errors.push("Invalid billing postal code");
        }
        if (orderInfo.billing.city.length < 3) {
            errors.push("Please provide a city longer than 3 characters in length");
        }
        if (!emailHandler(orderInfo.billing.email)) {
            errors.push("Please provide a valid email address");
        }
        if (!phoneHandler(orderInfo.billing.phone)) {
            errors.push("Please provide a valid phone number");
        }
        if (!nameLength(orderInfo.shipping.first_name)) {
            errors.push("Please provide a first name more than 2 characters in length");
        }
        if (!nameLength(orderInfo.shipping.last_name)) {
            errors.push("Please provide a last name more than 2 characters in length");
        }
        if (orderInfo.shipping.city.length < 3) {
            errors.push("Please provide a city longer than 3 characters in length");
        }
        if (orderInfo.shipping.address_1.length < 5) {
            errors.push("Please provide a street address longer than 5 characters in length");
        }
        if (orderInfo.shipping.country === "") {
            errors.push("Please select a shipping country");
        }
        if (orderInfo.shipping.province == "") {
            errors.push("Please select a shipping province");
        }
        if (!postalCodeHandler(orderInfo.shipping.postal)) {
            errors.push("Invalid shipping postal code");
        }

        return errors;
    };

    // disables the checkout button if there are errors in the data
    $("#checkout-pg-btn").prop('disabled', true);

    //if errors display them if there are none allow customer to checkout
    const checkForErrors = () => {
        const errors = validateOrderInfo();
        if (errors.length > 0) {
            $("#error-message").html(errors.map(err => `${err} <br>`));
        }
        else if (errors.length == 0) {
            $("#checkout-pg-btn").prop('disabled', false);
        }
    };

    //if checkout worked let them know, if not explain there was an issue
    $("#checkout-pg-btn").on('click', async function () {
        const isSuccess = await submitOrder(JSON.stringify(orderInfo));
        if (isSuccess) {
            $('#checkout-modal-label').html('Thank you for your order!');
            $('#checkout-modal-body').html('Your order has been successfully processed. You will receive a confirmation email shortly.');
            $('#staticBackdrop').modal('hide');
            $('#checkout-modal').modal('show');
        } else {
            $('#checkout-modal-label').html('Sorry for the inconvenience');
            $('#checkout-modal-body').html('There was an error processing your order. Please try again later.');
            $('#staticBackdrop').modal('hide');
            $('#checkout-modal').modal('show');
        }
    });

    //this reloads the page (as there are no cookies all the data is reset) 
    $("#checkout-complete").on('click', function () {
        window.location.reload();
    });
    $("#checkout-complete-x").on('click', function () {
        window.location.reload();
    });
});

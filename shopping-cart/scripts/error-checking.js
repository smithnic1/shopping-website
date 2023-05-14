
// regex to test for valid cc (can be visa or mastercard)
const cardHandler = (card, month, year, csc) => {
    const validCC = new RegExp(/^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12}|(?:2131|1800|35\d{3})\d{11})$/);
    if (card == "" || !validCC.test(card) || month == "" || year == "" || !(csc >= 000 && csc <= 999)) {
        return false;
    }
    else return true;
}

//test to make sure email is valid
const emailHandler = (email) => {
    const validEmail = new RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/);
    if (email == "") {
        return false;
    }
    else if (!validEmail.test(email)) {
        return false;
    }
    else return true;
}
//test to make sure postal code is valid
const postalCodeHandler = (postalCode) => {
    const validPostal = new RegExp(/^[A-CEGHJ-NPR-TVXY]\d[A-CEGHJ-NPR-TV-Z][ ]?\d[A-CEGHJ-NPR-TV-Z]\d$/i);
    if (postalCode == "") {
        return false;
    }
    else if (!validPostal.test(postalCode)) {
        return false;
    }
    else return true;
}
//test for valid phone number
const phoneHandler = (phoneNum) => {
    const validPhoneNum = new RegExp(/^(\d{3}[ -]?\d{3}[ -]?\d{4})$/);
    if (phoneNum == "") {
        return false;
    }
    else if (!validPhoneNum.test(phoneNum)) {
        return false;
    }
    else return true;
}

//test that name is longer than 2 characters
const nameLength = (name) => {
    if (name.length < 3) {
        return false;
    }
    else return true;
}
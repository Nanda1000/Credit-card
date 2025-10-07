export const validationUtils = {
    isValidCardNumber(cardNumber) {
        let sum = 0;
        let shouldDouble = false;   

        for (let i = cardNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cardNumber.charAt(i));
            if (shouldDouble) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            sum += digit;
            shouldDouble = !shouldDouble;
        }
        return sum % 10 === 0;
    },

    maskCardNumber(cardNumber) {
        return cardNumber.slice(-4).padStart(cardNumber.length, '*');
    },

    isValidDate(validto) {
        const [month, year] = validto.split('/').map(Number);
        if (!month || !year || month < 1 || month > 12) return false;
        const expiry = new Date();
        const validyear = expiry.getFullYear();
        const validmonth = expiry.getMonth(); // zero-based
        return year > validyear || (year === validyear && month - 1 >= validmonth);
    },

    isPositiveNumber(value) {
        return typeof value === 'number' && value >= 0;
    },
    

};

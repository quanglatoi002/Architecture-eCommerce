class MomoPaymentAdapter {
    constructor(momoPayment) {
        this.momoPayment = momoPayment;
    }

    payWithVisa(visaPayment) {
        const convertedPayment = this.convertToVisaPayment(this.momoPayment);
        visaPayment.pay(convertedPayment);
    }

    convertToVisaPayment(momoPayment) {
        const conversionRate = 23000;
        const visaAmount = momoPayment.amount / conversionRate;
        const visaPayment = {
            cardNumber: momoPayment.cardNumber,
            expiryDate: momoPayment.expiryDate,
            cvv: momoPayment.cvv,
            amount: visaAmount,
        };
        return visaPayment;
    }
}

class VisaPayment {
    pay(payment) {
        console.log(
            `Paying ${payment.amount} USD with visa card ${payment.cardNumber}...`
        );
    }
}

class MomoPayment {
    constructor(cardNumber, expiryDate, cvv, visaAmount) {
        this.cardNumber = cardNumber;
        this.expiryDate = expiryDate;
        this.cvv = cvv;
        this.amount = visaAmount;
    }
}

// create a momo
const momoPayment = new MomoPayment("12345", "12/24", "124", 230000);

//create a momo-to-visa adapter
const momoAdapter = new MomoPaymentAdapter(momoPayment);

//create a visa
const visaPayment = new VisaPayment();

// register

momoPayment.payWithVisa(visaPayment);

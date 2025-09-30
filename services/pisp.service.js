import axios from 'axios';

export const pispService = { async createPayment({paymentId}) {
    const resp = await axios.post("https://api.truelayer-sandbox.com/v3/payments", {
        amount: {currency: "GBP", value: "10.00"},
        beneficiary: {type: "merchant_account", merchant_account_id: "your_merchant_account_id"},
        reference: `payment-${paymentId}`,

    }, {
        headers: {
            Authorization: `Bearer ${process.env.TRUE_LAYER_API_KEY}`,
        }
    });
    return resp.data;
}

};
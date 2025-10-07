import axios from "axios";


export const cardData = {
    // Every card of the user
    async cardInfo({ userId }) {
        // TrueLayer's /cards endpoint is usually a GET, not POST, and doesn't take a body
        const resp = await axios.get("https://api.truelayer.com/data/v1/cards", {
            headers: {
                Authorization: `Bearer ${process.env.TRUELAYER_ACCESS_TOKEN}`
            }
        });
        // Optionally filter by userId if needed
        return resp.data;
    },

    // specific card data
    async singleCard({ accountId }) {
        const resp = await axios.get(`https://api.truelayer.com/data/v1/cards/${accountId}`, {
            headers: {
                Authorization: `Bearer ${process.env.TRUELAYER_ACCESS_TOKEN}`
            }
        });
        return resp.data;
    },

    // balance of the card
    async balanceCard({ accountId }) {
        // During tests we don't want to call external TrueLayer. Return a mocked shape.
        if (process.env.NODE_ENV === 'test') {
            return {
                results: [
                    {
                        available: 1000,
                        currency: 'GBP',
                        credit_limit: 2000,
                        last_statement_balance: 1200,
                        last_statement_date: null,
                        payment_due: 100,
                        payment_due_date: null,
                    },
                ],
            };
        }

        const resp = await axios.get(`https://api.truelayer.com/data/v1/cards/${accountId}/balance`, {
            headers: {
                Authorization: `Bearer ${process.env.TRUELAYER_ACCESS_TOKEN}`
            }
        });
        return resp.data;
    },

    // get transaction data of the card for the user
    async transactionCard({ accountId, from, to }) {
        // from and to should be passed in as arguments
        const resp = await axios.get(`https://api.truelayer.com/data/v1/cards/${accountId}/transactions?from=${from}&to=${to}`, {
            headers: {
                Authorization: `Bearer ${process.env.TRUELAYER_ACCESS_TOKEN}`
            }
        });
        return resp.data;
    }
}
const express = require('express');
const cors = require('cors');
const {
    Client,
    PrivateKey,
    TopicMessageSubmitTransaction
} = require("@hashgraph/sdk");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// Initialize Hedera Client
const operatorId = process.env.HEDERA_ACCOUNT_ID;
const operatorKey = process.env.HEDERA_PRIVATE_KEY;
const topicId = process.env.HEDERA_TOPIC_ID; // We will set this after creating the topic

if (!operatorId || !operatorKey) {
    console.error("Missing HEDERA_ACCOUNT_ID or HEDERA_PRIVATE_KEY in .env");
    process.exit(1);
}

const client = Client.forTestnet();
client.setOperator(operatorId, PrivateKey.fromString(operatorKey));

// Endpoint to log a message to Hedera HCS
app.post('/api/log-impact', async (req, res) => {
    try {
        const payload = req.body;

        if (!topicId) {
            return res.status(500).json({ error: "HEDERA_TOPIC_ID not configured." });
        }

        const messageString = JSON.stringify(payload);

        // Create the transaction
        const transaction = new TopicMessageSubmitTransaction({
            topicId: topicId,
            message: messageString,
        });

        // Execute the transaction
        const txResponse = await transaction.execute(client);

        // Get the receipt to confirm success
        const receipt = await txResponse.getReceipt(client);

        // The consensus timestamp is often useful to store
        // We get it from the record, but for HCS, just knowing it succeeded is usually enough.
        // We'll return the transaction ID for the explorer link.

        res.json({
            success: true,
            transactionId: txResponse.transactionId.toString(),
            sequenceNumber: receipt.topicSequenceNumber.toString(),
            explorerUrl: `https://hashscan.io/testnet/transaction/${txResponse.transactionId.toString()}`
        });

    } catch (error) {
        console.error("Hedera Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Hedera Microservice running on port ${PORT}`);
    console.log(`Operator ID: ${operatorId}`);
});

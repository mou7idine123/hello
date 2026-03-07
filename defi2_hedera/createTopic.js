require("dotenv").config();
const {
    Client,
    PrivateKey,
    TopicCreateTransaction,
} = require("@hashgraph/sdk");

async function createTopic() {
    // 1. Initialize the Hedera client
    const operatorId = process.env.HEDERA_ACCOUNT_ID;
    const operatorKey = process.env.HEDERA_PRIVATE_KEY;

    if (!operatorId || !operatorKey) {
        throw new Error("Must set HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY in .env");
    }

    // Since you mentioned a testnet account, we use the testnet client
    const client = Client.forTestnet();
    client.setOperator(operatorId, PrivateKey.fromString(operatorKey));

    console.log("Creating new topic on Hedera Testnet...");

    try {
        // 2. Create the topic transaction
        const transaction = new TopicCreateTransaction()
            .setTopicMemo("IHSAN Transparency Log - defi2")
            // Optional: You could set an admin key here if you want to be able to delete/update the topic later
            // .setAdminKey(PrivateKey.fromString(operatorKey))
            // Optional: You could set a submit key so ONLY your backend can post to it
            // .setSubmitKey(PrivateKey.fromString(operatorKey))
            ;

        // 3. Execute and get the receipt
        const txResponse = await transaction.execute(client);
        const receipt = await txResponse.getReceipt(client);

        const newTopicId = receipt.topicId;
        console.log(`\n✅ Success! Topic created.`);
        console.log(`📌 Topic ID: ${newTopicId}`);
        console.log(`\nPlease save this Topic ID. You will need it in your PHP backend configuration.`);

    } catch (error) {
        console.error("Error creating topic:", error);
    }

    process.exit(0);
}

createTopic();

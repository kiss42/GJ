const { MongoClient } = require('mongodb');

// Replace the uri string with your MongoDB connection string.
const uri = `mongodb+srv://kisspierre42:Jamesdeanqwe@cluster0.xml9euk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        console.log("Connected successfully to MongoDB");
    } catch (err) {
        console.error("Failed to connect to MongoDB", err);
    } finally {
        await client.close();
    }
}

run();


const dns = require('node:dns');

dns.setServers(['1.1.1.1', '8.8.8.8']);

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/product')
const products = require('./data/products')

async function seedProducts() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('MongoDB Connected');

        const existingCount = await Product.countDocuments();

        if (existingCount > 0) {
            console.log(
                `Products collection already has ${existingCount} products.`
            );
            console.log('No products were inserted.');
            return;
        }

        const insertedProducts = await Product.insertMany(products);

        console.log(`${insertedProducts.length} products inserted successfully!`);
    } catch (error) {
        console.error('Seeding failed:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

seedProducts();

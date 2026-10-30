

require('dotenv').config();

const dns = require('node:dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);

const mongoose = require('mongoose');
const Product = require('./models/product');
const cloudinary = require('./config/cloudinary');

async function migrateImages() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('MongoDB connected');

        const products = await Product.find({
            image: { $type: 'string', $ne: '' }
        });

        console.log(`Total products found: ${products.length}`);

        let migrated = 0;
        let skipped = 0;
        let failed = 0;

        for (const product of products) {
            const oldUrl = product.image;

            // Already hosted on Cloudinary
            if (oldUrl.includes('res.cloudinary.com/')) {
                console.log(`SKIPPED: ${product.name}`);
                skipped++;
                continue;
            }

            // Check whether the URL is valid
            if (!/^https?:\/\//i.test(oldUrl)) {
                console.log(`INVALID URL: ${product.name}`);
                failed++;
                continue;
            }

            try {
                console.log(`Uploading: ${product.name}`);

                const result = await cloudinary.uploader.upload(oldUrl, {
                    folder: 'buy2basket/products',
                    resource_type: 'image'
                });

                // Update only if the original URL is unchanged
                const updated = await Product.updateOne(
                    { _id: product._id, image: oldUrl },
                    { $set: { image: result.secure_url } }
                );

                if (updated.modifiedCount === 1) {
                    console.log(`SUCCESS: ${product.name}`);
                    migrated++;
                } else {
                    console.log(`NOT UPDATED: ${product.name}`);
                    failed++;
                }
            } catch (error) {
                console.log(`FAILED: ${product.name} - ${error.message}`);
                failed++;
            }
        }

        console.log('\n--- MIGRATION SUMMARY ---');
        console.log('Total products:', products.length);
        console.log('Migrated:', migrated);
        console.log('Skipped:', skipped);
        console.log('Failed:', failed);

    } catch (error) {
        console.error('Migration error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

migrateImages();

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        category: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        originalPrice: {
            type: Number,
            required: true,
            min: 0
        },
        discount: {
            type: Number,
            default: 0
        },
        rating: {
            type: Number,
            default: 4
        },
        stock: {
            type: Number,
            default: 10,
            min: 0
        },
        image: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        brand: {
            type: String,
            default: 'Buy2Basket'
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Product', productSchema);
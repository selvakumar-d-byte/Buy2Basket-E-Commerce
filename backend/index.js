
const dns = require('node:dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const streamifier = require('streamifier');
require('dotenv').config();
const nodemailer = require("nodemailer");
const crypto = require("node:crypto");
const Razorpay = require("razorpay");

const cloudinary = require('./config/cloudinary');
const Product = require('./models/product');
const Cart = require('./models/CartAPI');
const Wishlist = require('./models/Wishlist');
const verifyToken = require('./middleware/verifyToken');
const Order = require('./models/Order');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const otpStore = new Map();

const mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Send email OTP
app.post("/send-signup-otp", async (req, res) => {
    try {
        const email = String(req.body.email || '').trim().toLowerCase();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Please enter a valid email address"
            });
        }

        const otp = crypto.randomInt(100000, 1000000).toString();

        await mailTransporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Buy2Basket - Email Verification OTP",
            text: `Your Buy2Basket verification OTP is ${otp}. It expires in 5 minutes. Do not share this code with anyone.`
        });

        otpStore.set(email, {
            otp,
            expiresAt: Date.now() + 5 * 60 * 1000,
            attempts: 0
        });

        res.json({
            message: "OTP sent successfully to your email"
        });
    } catch (error) {
        console.error("OTP email error:", error.message);

        res.status(500).json({
            message: "Failed to send OTP. Please try again."
        });
    }
});

// Verify email OTP
app.post("/verify-signup-otp", (req, res) => {
    const email = String(req.body.email || "").trim().toLowerCase();
    const enteredOtp = String(req.body.otp || "").trim();

    const record = otpStore.get(email);

    if (!record) {
        return res.status(400).json({
            message: "Please request a new OTP"
        });
    }

    if (Date.now() > record.expiresAt) {
        otpStore.delete(email);

        return res.status(400).json({
            message: "OTP expired. Please request a new OTP"
        });
    }

    if (record.attempts >= 5) {
        otpStore.delete(email);

        return res.status(429).json({
            message: "Too many attempts. Please request a new OTP"
        });
    }

    if (record.otp !== enteredOtp) {
        record.attempts += 1;

        return res.status(400).json({
            message: "Incorrect OTP"
        });
    }

    otpStore.delete(email);

    res.json({
        verified: true,
        message: "Email verified successfully"
    });
});

// CREATE RAZORPAY ORDER
app.post('/payments/create-order', verifyToken, async (req, res) => {
    try {
        const userId = req.user.uid;

        const cart = await Cart.findOne({ userId })
            .populate('items.productId');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                message: 'Your cart is empty'
            });
        }

        let subtotal = 0;

        for (const item of cart.items) {
            const product = item.productId;

            if (!product) {
                return res.status(400).json({
                    message: 'A product in your cart is unavailable'
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    message: `${product.name} has insufficient stock`
                });
            }

            subtotal += product.price * item.quantity;
        }

        const deliveryCharge = 0;
        const totalAmount = subtotal + deliveryCharge;
        const amountInPaise = Math.round(totalAmount * 100);

        if (!Number.isSafeInteger(amountInPaise) || amountInPaise < 100) {
            return res.status(400).json({
                message: 'Minimum payment amount is ₹1'
            });
        }

        const razorpayOrder = await razorpay.orders.create({
            amount: amountInPaise,
            currency: 'INR',
            receipt: `receipt_${Date.now()}`
        });

        res.status(201).json({
            message: 'Razorpay order created successfully',
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            keyId: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error('Razorpay create order error:', error);

        res.status(500).json({
            message: 'Unable to create payment order'
        });
    }
});

// VERIFY RAZORPAY PAYMENT
app.post('/payments/verify', verifyToken, async (req, res) => {
    try {
        const userId = req.user.uid;

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            deliveryAddress
        } = req.body;

        // Validate required fields
        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature ||
            !deliveryAddress
        ) {
            return res.status(400).json({
                message: 'Missing payment or delivery details'
            });
        }

        const {
            fullName,
            phone,
            email,
            address,
            city,
            state,
            pincode
        } = deliveryAddress;

        if (
            !fullName ||
            !phone ||
            !email ||
            !address ||
            !city ||
            !state ||
            !pincode
        ) {
            return res.status(400).json({
                message: 'Please fill all delivery address fields'
            });
        }

        // Generate expected signature
        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        // Compare signatures safely
        const expectedBuffer = Buffer.from(generatedSignature, 'hex');
        const receivedBuffer = Buffer.from(razorpay_signature, 'hex');

        if (
            !/^[a-f0-9]{64}$/i.test(razorpay_signature) ||
            !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
        ) {
            return res.status(400).json({
                message: 'Payment verification failed'
            });
        }

        const session = await mongoose.startSession();

        try {
            let savedOrder;

            await session.withTransaction(async () => {
                const cart = await Cart.findOne({ userId })
                    .populate('items.productId')
                    .session(session);

                if (!cart || cart.items.length === 0) {
                    throw new Error('Your cart is empty');
                }

                let subtotal = 0;
                const orderItems = [];

                for (const item of cart.items) {
                    const product = item.productId;

                    if (!product) {
                        throw new Error('A product in your cart is unavailable');
                    }

                    if (product.stock < item.quantity) {
                        throw new Error(`${product.name} has insufficient stock`);
                    }

                    subtotal += product.price * item.quantity;

                    orderItems.push({
                        productId: product._id,
                        name: product.name,
                        image: product.image,
                        price: product.price,
                        quantity: item.quantity
                    });
                }

                const deliveryCharge = 0;

                for (const item of cart.items) {
                    const result = await Product.updateOne(
                        {
                            _id: item.productId._id,
                            stock: { $gte: item.quantity }
                        },
                        {
                            $inc: { stock: -item.quantity }
                        },
                        { session }
                    );

                    if (result.modifiedCount !== 1) {
                        throw new Error('Product stock changed. Please try again');
                    }
                }

                const newOrder = await Order.create(
                    [{
                        userId,
                        items: orderItems,
                        deliveryAddress: {
                            fullName,
                            phone,
                            email,
                            address,
                            city,
                            state,
                            pincode
                        },
                        subtotal,
                        deliveryCharge,
                        totalAmount: subtotal + deliveryCharge,
                        paymentMethod: 'Razorpay',
                        paymentStatus: 'Paid',
                        orderStatus: 'Placed'
                    }],
                    { session }
                );

                savedOrder = newOrder[0];

                cart.items = [];
                await cart.save({ session });
            });

            return res.status(200).json({
                message: 'Payment verified and order placed successfully',
                order: savedOrder
            });

        } finally {
            await session.endSession();
        }

    } catch (error) {
        console.error('Payment verification error:', error.message);

        return res.status(400).json({
            message: error.message || 'Payment verification failed'
        });
    }
});

// Multer: receive images in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

// MongoDB connection
mongoose.connect(process.env.MONGODB_URL)
    .then(() => {
        console.log('DB Connected');

        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.log('DB failed:', error.message);
    });

// Home / API test
app.get('/', (req, res) => {
    res.json({
        message: 'Buy2Basket API is running'
    });
});

// Upload image to Cloudinary (testing API)
app.post('/upload-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: 'Please select an image'
            });
        }

        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'buy2basket/products'
                },
                (error, uploadResult) => {
                    if (error) {
                        return reject(error);
                    }

                    resolve(uploadResult);
                }
            );

            streamifier
                .createReadStream(req.file.buffer)
                .pipe(uploadStream);
        });

        res.status(200).json({
            message: 'Image uploaded successfully',
            imageUrl: result.secure_url,
            publicId: result.public_id
        });
    } catch (error) {
        res.status(500).json({
            message: 'Image upload failed',
            error: error.message
        });
    }
});

// Add product + image to MongoDB
app.post('/products', upload.single('image'), async (req, res) => {
    try {
        const {
            name,
            category,
            price,
            originalPrice,
            discount,
            rating,
            stock,
            description,
            brand
        } = req.body;

        // Validate required fields
        if (
            !name ||
            !category ||
            price === undefined ||
            price === '' ||
            originalPrice === undefined ||
            originalPrice === ''
        ) {
            return res.status(400).json({
                message: 'Name, category, price and originalPrice are required'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                message: 'Please select a product image'
            });
        }

        // Upload product image to Cloudinary
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'buy2basket/products'
                },
                (error, uploadResult) => {
                    if (error) {
                        return reject(error);
                    }

                    resolve(uploadResult);
                }
            );

            streamifier
                .createReadStream(req.file.buffer)
                .pipe(uploadStream);
        });

        // Create product document
        const product = new Product({
            name,
            category,
            price: Number(price),
            originalPrice: Number(originalPrice),
            discount: discount ? Number(discount) : 0,
            rating: rating ? Number(rating) : 4,
            stock: stock !== undefined && stock !== ''
                ? Number(stock)
                : 10,
            description: description || '',
            brand: brand || 'Buy2Basket',
            image: result.secure_url
        });

        // Save product in MongoDB
        const savedProduct = await product.save();

        res.status(201).json({
            message: 'Product added successfully',
            product: savedProduct
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to add product',
            error: error.message
        });
    }
});

// Get all products
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });

        res.status(200).json({
            count: products.length,
            products
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch products',
            error: error.message
        });
    }
});

// Get one product by ID
app.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(400).json({
            message: 'Invalid product ID or request failed',
            error: error.message
        });
    }
});

// ADD TO CART
app.post('/cart/add', verifyToken, async (req, res) => {
    try {
        const userId = req.user.uid;
        const { productId } = req.body;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.stock < 1) {
            return res.status(400).json({ message: 'Product is out of stock' });
        }

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        const existingItem = cart.items.find(
            item => item.productId.toString() === productId
        );

        if (existingItem) {
            if (existingItem.quantity >= product.stock) {
                return res.status(400).json({
                    message: 'Maximum available stock reached'
                });
            }

            existingItem.quantity += 1;
        } else {
            cart.items.push({
                productId,
                quantity: 1
            });
        }

        await cart.save();

        res.status(200).json({
            message: 'Product added to cart',
            cart
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// GET CART
app.get('/cart', verifyToken, async (req, res) => {
    try {
        const userId = req.user.uid;

        const cart = await Cart.findOne({ userId })
            .populate('items.productId');

        res.status(200).json({
            items: cart ? cart.items : []
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// UPDATE CART QUANTITY
app.put('/cart/update', verifyToken, async (req, res) => {
    try {
        const userId = req.user.uid;
        const { productId, quantity } = req.body;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({ message: 'Invalid quantity' });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (quantity > product.stock) {
            return res.status(400).json({
                message: 'Requested quantity exceeds available stock'
            });
        }

        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const item = cart.items.find(
            item => item.productId.toString() === productId
        );

        if (!item) {
            return res.status(404).json({ message: 'Product not found in cart' });
        }

        item.quantity = quantity;

        await cart.save();

        res.status(200).json({
            message: 'Cart quantity updated',
            cart
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// REMOVE FROM CART
app.delete('/cart/remove', verifyToken, async (req, res) => {
    try {
        const userId = req.user.uid;
        const { productId } = req.body;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }

        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = cart.items.filter(
            item => item.productId.toString() !== productId
        );

        await cart.save();

        res.status(200).json({
            message: 'Product removed from cart',
            cart
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// CLEAR CART
app.delete('/cart/clear', verifyToken, async (req, res) => {
    try {
        const userId = req.user.uid;

        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(200).json({ message: 'Cart is already empty' });
        }

        cart.items = [];

        await cart.save();

        res.status(200).json({ message: 'Cart cleared successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PLACE ORDER
app.post('/orders/place', verifyToken, async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const userId = req.user.uid;

        const {
            fullName,
            phone,
            email,
            address,
            city,
            state,
            pincode
        } = req.body;

        if (
            !fullName ||
            !phone ||
            !email ||
            !address ||
            !city ||
            !state ||
            !pincode
        ) {
            return res.status(400).json({
                message: 'Please fill all delivery address fields'
            });
        }

        await session.withTransaction(async () => {
            const cart = await Cart.findOne({ userId })
                .populate('items.productId')
                .session(session);

            if (!cart || cart.items.length === 0) {
                throw new Error('Your cart is empty');
            }

            let subtotal = 0;
            const orderItems = [];

            for (const item of cart.items) {
                const product = item.productId;

                if (!product) {
                    throw new Error('A product in your cart is unavailable');
                }

                if (product.stock < item.quantity) {
                    throw new Error(`${product.name} has insufficient stock`);
                }

                subtotal += product.price * item.quantity;

                orderItems.push({
                    productId: product._id,
                    name: product.name,
                    image: product.image,
                    price: product.price,
                    quantity: item.quantity
                });
            }

            for (const item of cart.items) {
                const result = await Product.updateOne(
                    {
                        _id: item.productId._id,
                        stock: { $gte: item.quantity }
                    },
                    {
                        $inc: { stock: -item.quantity }
                    },
                    { session }
                );

                if (result.modifiedCount !== 1) {
                    throw new Error('Product stock changed. Please try again');
                }
            }

            const deliveryCharge = 0;

            const newOrder = await Order.create(
                [{
                    userId,
                    items: orderItems,
                    deliveryAddress: {
                        fullName,
                        phone,
                        email,
                        address,
                        city,
                        state,
                        pincode
                    },
                    subtotal,
                    deliveryCharge,
                    totalAmount: subtotal + deliveryCharge,
                    paymentMethod: 'COD',
                    paymentStatus: 'Pending',
                    orderStatus: 'Placed'
                }],
                { session }
            );

            cart.items = [];
            await cart.save({ session });

            res.status(201).json({
                message: 'Order placed successfully',
                order: newOrder[0]
            });
        });

    } catch (error) {
        console.error('Place order error:', error.message);

        res.status(400).json({
            message: error.message || 'Failed to place order'
        });

    } finally {
        await session.endSession();
    }
});

// GET MY ORDERS
app.get('/orders/my-orders', verifyToken, async (req, res) => {
    try {
        const userId = req.user.uid;

        const orders = await Order.find({ userId })
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: orders.length,
            orders
        });

    } catch (error) {
        console.error('Fetch orders error:', error.message);

        res.status(500).json({
            message: 'Failed to fetch your orders'
        });
    }
});

// ADD TO WISHLIST
app.post('/wishlist/add', verifyToken, async (req, res) => {
    try {
        const userId = req.user.uid;
        const { productId } = req.body;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        let wishlist = await Wishlist.findOne({ userId });

        if (!wishlist) {
            wishlist = new Wishlist({ userId, productIds: [] });
        }

        const alreadyExists = wishlist.productIds.some(
            id => id.toString() === productId
        );

        if (alreadyExists) {
            return res.status(200).json({
                message: 'Product already in wishlist'
            });
        }

        wishlist.productIds.push(productId);

        await wishlist.save();

        res.status(200).json({
            message: 'Product added to wishlist',
            wishlist
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// GET WISHLIST
app.get('/wishlist', verifyToken, async (req, res) => {
    try {
        const userId = req.user.uid;

        const wishlist = await Wishlist.findOne({ userId })
            .populate('productIds');

        res.status(200).json({
            productIds: wishlist ? wishlist.productIds : []
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// REMOVE FROM WISHLIST
app.delete('/wishlist/remove', verifyToken, async (req, res) => {
    try {
        const userId = req.user.uid;
        const { productId } = req.body;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }

        const wishlist = await Wishlist.findOne({ userId });

        if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found' });
        }

        wishlist.productIds = wishlist.productIds.filter(
            id => id.toString() !== productId
        );

        await wishlist.save();

        res.status(200).json({
            message: 'Product removed from wishlist'
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
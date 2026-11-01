
const dns = require("node:dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const streamifier = require("streamifier");
const nodemailer = require("nodemailer");
const crypto = require("node:crypto");

const cloudinary = require("./config/cloudinary");
const Product = require("./models/product");
const Cart = require("./models/CartAPI");
const Wishlist = require("./models/Wishlist");
const verifyToken = require("./middleware/verifyToken");
const Order = require("./models/Order");

const app = express();
const PORT = process.env.PORT || 5000;

// --------------------------------------------------
// ENVIRONMENT VALIDATION
// --------------------------------------------------

if (!process.env.MONGODB_URL) {
    throw new Error("MONGODB_URL is missing");
}

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("Warning: Email environment variables are missing");
}

// --------------------------------------------------
// MIDDLEWARE
// --------------------------------------------------

const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:3000"
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    }
}));

app.use(express.json({ limit: "1mb" }));

// --------------------------------------------------
// EMAIL CONFIGURATION
// --------------------------------------------------

const otpStore = new Map();

const mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// --------------------------------------------------
// SEND SIGNUP OTP
// --------------------------------------------------

app.post("/send-signup-otp", async (req, res) => {
    try {
        const email = String(req.body.email || "")
            .trim()
            .toLowerCase();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Please enter a valid email address"
            });
        }

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            return res.status(503).json({
                message: "Email service is not configured"
            });
        }

        const existingRecord = otpStore.get(email);

        // Prevent frequent OTP requests
        if (
            existingRecord &&
            existingRecord.lastSentAt &&
            Date.now() - existingRecord.lastSentAt < 60 * 1000
        ) {
            return res.status(429).json({
                message: "Please wait before requesting another OTP"
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
            attempts: 0,
            lastSentAt: Date.now()
        });

        return res.status(200).json({
            message: "OTP sent successfully to your email"
        });

    } catch (error) {
        console.error("OTP email error:", error.message);

        return res.status(500).json({
            message: "Failed to send OTP. Please try again."
        });
    }
});

// --------------------------------------------------
// VERIFY SIGNUP OTP
// --------------------------------------------------

app.post("/verify-signup-otp", (req, res) => {
    const email = String(req.body.email || "")
        .trim()
        .toLowerCase();

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

    return res.status(200).json({
        verified: true,
        message: "Email verified successfully"
    });
});

// --------------------------------------------------
// MULTER IMAGE UPLOAD CONFIGURATION
// --------------------------------------------------

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/jpg"
        ];

        if (allowedTypes.includes(file.mimetype)) {
            return cb(null, true);
        }

        return cb(new Error("Only JPG, PNG and WEBP images are allowed"));
    }
});

// --------------------------------------------------
// CLOUDINARY UPLOAD HELPER
// --------------------------------------------------

const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "buy2basket/products"
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            }
        );

        streamifier
            .createReadStream(buffer)
            .pipe(uploadStream);
    });
};

// --------------------------------------------------
// HOME / API TEST
// --------------------------------------------------

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Buy2Basket API is running"
    });
});

// --------------------------------------------------
// UPLOAD IMAGE TO CLOUDINARY
// --------------------------------------------------

app.post("/upload-image", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Please select an image"
            });
        }

        const result = await uploadToCloudinary(req.file.buffer);

        return res.status(200).json({
            message: "Image uploaded successfully",
            imageUrl: result.secure_url,
            publicId: result.public_id
        });

    } catch (error) {
        console.error("Image upload error:", error.message);

        return res.status(500).json({
            message: "Image upload failed"
        });
    }
});

// --------------------------------------------------
// ADD PRODUCT
// --------------------------------------------------

app.post("/products", upload.single("image"), async (req, res) => {
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

        if (
            !name ||
            !category ||
            price === undefined ||
            price === "" ||
            originalPrice === undefined ||
            originalPrice === ""
        ) {
            return res.status(400).json({
                message: "Name, category, price and originalPrice are required"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                message: "Please select a product image"
            });
        }

        const productPrice = Number(price);
        const productOriginalPrice = Number(originalPrice);
        const productDiscount = discount === undefined || discount === ""
            ? 0
            : Number(discount);
        const productRating = rating === undefined || rating === ""
            ? 4
            : Number(rating);
        const productStock = stock === undefined || stock === ""
            ? 10
            : Number(stock);

        if (
            !Number.isFinite(productPrice) ||
            !Number.isFinite(productOriginalPrice) ||
            productPrice < 0 ||
            productOriginalPrice < 0
        ) {
            return res.status(400).json({
                message: "Please enter valid product prices"
            });
        }

        if (
            !Number.isFinite(productDiscount) ||
            productDiscount < 0 ||
            productDiscount > 100
        ) {
            return res.status(400).json({
                message: "Discount must be between 0 and 100"
            });
        }

        if (
            !Number.isFinite(productRating) ||
            productRating < 0 ||
            productRating > 5
        ) {
            return res.status(400).json({
                message: "Rating must be between 0 and 5"
            });
        }

        if (
            !Number.isInteger(productStock) ||
            productStock < 0
        ) {
            return res.status(400).json({
                message: "Stock must be a valid non-negative integer"
            });
        }

        const result = await uploadToCloudinary(req.file.buffer);

        const product = new Product({
            name: name.trim(),
            category: category.trim(),
            price: productPrice,
            originalPrice: productOriginalPrice,
            discount: productDiscount,
            rating: productRating,
            stock: productStock,
            description: description || "",
            brand: brand || "Buy2Basket",
            image: result.secure_url
        });

        const savedProduct = await product.save();

        return res.status(201).json({
            message: "Product added successfully",
            product: savedProduct
        });

    } catch (error) {
        console.error("Add product error:", error.message);

        return res.status(500).json({
            message: "Failed to add product"
        });
    }
});

// --------------------------------------------------
// GET ALL PRODUCTS
// --------------------------------------------------

app.get("/products", async (req, res) => {
    try {
        const products = await Product.find()
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: products.length,
            products
        });

    } catch (error) {
        console.error("Fetch products error:", error.message);

        return res.status(500).json({
            message: "Failed to fetch products"
        });
    }
});

// --------------------------------------------------
// GET PRODUCT BY ID
// --------------------------------------------------

app.get("/products/:id", async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        return res.status(200).json(product);

    } catch (error) {
        console.error("Get product error:", error.message);

        return res.status(500).json({
            message: "Failed to fetch product"
        });
    }
});

// --------------------------------------------------
// ADD TO CART
// --------------------------------------------------

app.post("/cart/add", verifyToken, async (req, res) => {
    try {
        const userId = req.user.uid;
        const { productId } = req.body;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        if (product.stock < 1) {
            return res.status(400).json({
                message: "Product is out of stock"
            });
        }

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = new Cart({
                userId,
                items: []
            });
        }

        const existingItem = cart.items.find(
            item => item.productId.toString() === productId
        );

        if (existingItem) {
            if (existingItem.quantity >= product.stock) {
                return res.status(400).json({
                    message: "Maximum available stock reached"
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

        return res.status(200).json({
            message: "Product added to cart",
            cart
        });

    } catch (error) {
        console.error("Add cart error:", error.message);

        return res.status(500).json({
            message: "Failed to add product to cart"
        });
    }
});

// --------------------------------------------------
// GET CART
// --------------------------------------------------

app.get("/cart", verifyToken, async (req, res) => {
    try {
        const userId = req.user.uid;

        const cart = await Cart.findOne({ userId })
            .populate("items.productId");

        return res.status(200).json({
            items: cart ? cart.items : []
        });

    } catch (error) {
        console.error("Get cart error:", error.message);

        return res.status(500).json({
            message: "Failed to fetch cart"
        });
    }
});

// --------------------------------------------------
// UPDATE CART QUANTITY
// --------------------------------------------------

app.put("/cart/update", verifyToken, async (req, res) => {
    try {
        const userId = req.user.uid;
        const { productId, quantity } = req.body;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({
                message: "Invalid quantity"
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        if (quantity > product.stock) {
            return res.status(400).json({
                message: "Requested quantity exceeds available stock"
            });
        }

        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({
                message: "Cart not found"
            });
        }

        const item = cart.items.find(
            item => item.productId.toString() === productId
        );

        if (!item) {
            return res.status(404).json({
                message: "Product not found in cart"
            });
        }

        item.quantity = quantity;

        await cart.save();

        return res.status(200).json({
            message: "Cart quantity updated",
            cart
        });

    } catch (error) {
        console.error("Update cart error:", error.message);

        return res.status(500).json({
            message: "Failed to update cart"
        });
    }
});

// --------------------------------------------------
// REMOVE FROM CART
// --------------------------------------------------

app.delete("/cart/remove", verifyToken, async (req, res) => {
    try {
        const userId = req.user.uid;
        const { productId } = req.body;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({
                message: "Cart not found"
            });
        }

        cart.items = cart.items.filter(
            item => item.productId.toString() !== productId
        );

        await cart.save();

        return res.status(200).json({
            message: "Product removed from cart",
            cart
        });

    } catch (error) {
        console.error("Remove cart error:", error.message);

        return res.status(500).json({
            message: "Failed to remove product from cart"
        });
    }
});

// --------------------------------------------------
// CLEAR CART
// --------------------------------------------------

app.delete("/cart/clear", verifyToken, async (req, res) => {
    try {
        const userId = req.user.uid;

        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(200).json({
                message: "Cart is already empty"
            });
        }

        cart.items = [];

        await cart.save();

        return res.status(200).json({
            message: "Cart cleared successfully"
        });

    } catch (error) {
        console.error("Clear cart error:", error.message);

        return res.status(500).json({
            message: "Failed to clear cart"
        });
    }
});

// --------------------------------------------------
// SHARED ORDER CREATION FUNCTION
// --------------------------------------------------

const createOrderFromCart = async (userId, address, paymentMethod, paymentStatus) => {
    const session = await mongoose.startSession();

    let savedOrder;

    try {
        await session.withTransaction(async () => {
            const cart = await Cart.findOne({ userId })
                .populate("items.productId")
                .session(session);

            if (!cart || cart.items.length === 0) {
                throw new Error("Your cart is empty");
            }

            let subtotal = 0;
            const orderItems = [];

            for (const item of cart.items) {
                const product = item.productId;

                if (!product) {
                    throw new Error("A product in your cart is unavailable");
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

            // Reduce product stock safely
            for (const item of cart.items) {
                const result = await Product.updateOne(
                    {
                        _id: item.productId._id,
                        stock: { $gte: item.quantity }
                    },
                    {
                        $inc: {
                            stock: -item.quantity
                        }
                    },
                    { session }
                );

                if (result.modifiedCount !== 1) {
                    throw new Error(
                        "Product stock changed. Please try again"
                    );
                }
            }

            const newOrder = await Order.create(
                [{
                    userId,
                    items: orderItems,
                    deliveryAddress: address,
                    subtotal,
                    deliveryCharge: 0,
                    totalAmount: subtotal,
                    paymentMethod,
                    paymentStatus,
                    orderStatus: "Placed"
                }],
                { session }
            );

            savedOrder = newOrder[0];

            cart.items = [];

            await cart.save({ session });
        });

        return savedOrder;

    } finally {
        await session.endSession();
    }
};

// --------------------------------------------------
// VALIDATE DELIVERY ADDRESS
// --------------------------------------------------

const validateDeliveryAddress = (body) => {
    const {
        fullName,
        phone,
        email,
        address,
        city,
        state,
        pincode
    } = body;

    if (
        !fullName ||
        !phone ||
        !email ||
        !address ||
        !city ||
        !state ||
        !pincode
    ) {
        return null;
    }

    return {
        fullName: String(fullName).trim(),
        phone: String(phone).trim(),
        email: String(email).trim(),
        address: String(address).trim(),
        city: String(city).trim(),
        state: String(state).trim(),
        pincode: String(pincode).trim()
    };
};

// --------------------------------------------------
// PLACE COD ORDER
// --------------------------------------------------

app.post("/orders/place", verifyToken, async (req, res) => {
    try {
        const userId = req.user.uid;

        const deliveryAddress = validateDeliveryAddress(req.body);

        if (!deliveryAddress) {
            return res.status(400).json({
                message: "Please fill all delivery address fields"
            });
        }

        const order = await createOrderFromCart(
            userId,
            deliveryAddress,
            "COD",
            "Pending"
        );

        return res.status(201).json({
            message: "Order placed successfully",
            order
        });

    } catch (error) {
        console.error("Place order error:", error.message);

        const clientErrors = [
            "Your cart is empty",
            "A product in your cart is unavailable",
            "Product stock changed. Please try again"
        ];

        const isClientError =
            clientErrors.includes(error.message) ||
            error.message.includes("has insufficient stock");

        return res.status(isClientError ? 400 : 500).json({
            message: error.message || "Failed to place order"
        });
    }
});

// --------------------------------------------------
// DEMO CARD PAYMENT (SIMULATION ONLY)
// --------------------------------------------------

app.post("/payments/demo-success", verifyToken, async (req, res) => {
    try {
        const userId = req.user.uid;

        const deliveryAddress = validateDeliveryAddress(req.body);

        if (!deliveryAddress) {
            return res.status(400).json({
                message: "Please fill all delivery address fields"
            });
        }

        const order = await createOrderFromCart(
            userId,
            deliveryAddress,
            "Demo Card",
            "Simulated"
        );

        return res.status(201).json({
            message: "Demo payment successful. No real payment was processed.",
            order
        });

    } catch (error) {
        console.error("Demo payment error:", error.message);

        const clientErrors = [
            "Your cart is empty",
            "A product in your cart is unavailable",
            "Product stock changed. Please try again"
        ];

        const isClientError =
            clientErrors.includes(error.message) ||
            error.message.includes("has insufficient stock");

        return res.status(isClientError ? 400 : 500).json({
            message: error.message || "Demo payment failed"
        });
    }
});

// --------------------------------------------------
// GET MY ORDERS
// --------------------------------------------------

app.get("/orders/my-orders", verifyToken, async (req, res) => {
    try {
        const userId = req.user.uid;

        const orders = await Order.find({ userId })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: orders.length,
            orders
        });

    } catch (error) {
        console.error("Fetch orders error:", error.message);

        return res.status(500).json({
            message: "Failed to fetch your orders"
        });
    }
});

// --------------------------------------------------
// ADD TO WISHLIST
// --------------------------------------------------

app.post("/wishlist/add", verifyToken, async (req, res) => {
    try {
        const userId = req.user.uid;
        const { productId } = req.body;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        let wishlist = await Wishlist.findOne({ userId });

        if (!wishlist) {
            wishlist = new Wishlist({
                userId,
                productIds: []
            });
        }

        const alreadyExists = wishlist.productIds.some(
            id => id.toString() === productId
        );

        if (alreadyExists) {
            return res.status(200).json({
                message: "Product already in wishlist"
            });
        }

        wishlist.productIds.push(productId);

        await wishlist.save();

        return res.status(200).json({
            message: "Product added to wishlist",
            wishlist
        });

    } catch (error) {
        console.error("Add wishlist error:", error.message);

        return res.status(500).json({
            message: "Failed to add product to wishlist"
        });
    }
});

// --------------------------------------------------
// GET WISHLIST
// --------------------------------------------------

app.get("/wishlist", verifyToken, async (req, res) => {
    try {
        const userId = req.user.uid;

        const wishlist = await Wishlist.findOne({ userId })
            .populate("productIds");

        return res.status(200).json({
            productIds: wishlist ? wishlist.productIds : []
        });

    } catch (error) {
        console.error("Get wishlist error:", error.message);

        return res.status(500).json({
            message: "Failed to fetch wishlist"
        });
    }
});

// --------------------------------------------------
// REMOVE FROM WISHLIST
// --------------------------------------------------

app.delete("/wishlist/remove", verifyToken, async (req, res) => {
    try {
        const userId = req.user.uid;
        const { productId } = req.body;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        const wishlist = await Wishlist.findOne({ userId });

        if (!wishlist) {
            return res.status(404).json({
                message: "Wishlist not found"
            });
        }

        wishlist.productIds = wishlist.productIds.filter(
            id => id.toString() !== productId
        );

        await wishlist.save();

        return res.status(200).json({
            message: "Product removed from wishlist"
        });

    } catch (error) {
        console.error("Remove wishlist error:", error.message);

        return res.status(500).json({
            message: "Failed to remove product from wishlist"
        });
    }
});

// --------------------------------------------------
// MULTER ERROR HANDLER
// --------------------------------------------------

app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                message: "Image size must be less than 5 MB"
            });
        }

        return res.status(400).json({
            message: error.message
        });
    }

    if (error.message.includes("Only JPG")) {
        return res.status(400).json({
            message: error.message
        });
    }

    if (error.message === "Not allowed by CORS") {
        return res.status(403).json({
            message: "Origin not allowed"
        });
    }

    console.error("Server error:", error.message);

    return res.status(500).json({
        message: "Internal server error"
    });
});

// --------------------------------------------------
// MONGODB CONNECTION AND SERVER START
// --------------------------------------------------

mongoose.connect(process.env.MONGODB_URL)
    .then(() => {
        console.log("DB Connected");

        app.listen(PORT, () => {
            console.log(`Buy2Basket server started on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("DB connection failed:", error.message);
        process.exit(1);
    });

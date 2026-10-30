const { getAuth } = require('firebase-admin/auth');

const firebaseApp = require('../config/firebaseAdmin');

const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Unauthorized. Token required.'
            });
        }

        const token = authHeader.split(' ')[1];

        const decodedToken = await getAuth(firebaseApp).verifyIdToken(token);

        req.user = decodedToken;

        next();

    } catch (error) {
        console.error('Token verification error:', error.message);

        return res.status(401).json({
            message: 'Invalid or expired token.'
        });
    }
};

module.exports = verifyToken;
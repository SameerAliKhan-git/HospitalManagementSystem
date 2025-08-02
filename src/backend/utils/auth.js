const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    return jwt.sign(
        {
            user: {
                id: user.id,
                role: user.role
            }
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        throw new Error('Invalid token');
    }
};

module.exports = {
    generateToken,
    verifyToken
};

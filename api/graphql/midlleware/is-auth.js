const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
    let verifiedToken;
    try {
        const authHeader = req.get('Authorization');
        if (!authHeader) {
            req.isAuth = false;
            return next();
        }
        const token = authHeader.split(' ')[1];
        if (!token || token === '') {
            req.isAuth = false;
            return next();
        }

        verifiedToken = await jwt.verify(token, process.env.JWT_KEY);
        if (!verifiedToken) {
            req.isAuth = false;
            return next();
        }
        req.isAuth = true;
        req.userId = verifiedToken.userId;
        next();

    } catch (e) {
        console.log(e.message);
        req.isAuth = false
        return next();
    }

};
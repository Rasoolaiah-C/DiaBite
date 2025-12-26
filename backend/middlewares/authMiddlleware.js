const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const tokenHeader = req.header("Authorization");
    const token = tokenHeader && tokenHeader.split(" ")[1]; // Extract token after "Bearer "

    if (!token) return res.status(401).json({ error: "Access Denied. No Token Provided!" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify JWT
        req.user = decoded; // Attach user to request
        next();
    } catch (error) {
        res.status(400).json({ error: "Invalid Token" });
    }
};

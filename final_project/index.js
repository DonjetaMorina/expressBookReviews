const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }))

// Integrated Authentication Mechanism
app.use("/customer/auth/*", function auth(req, res, next) {
    // Check if the session exists and contains authorization data
    if (req.session && req.session.authorization) {
        // Retrieve the access token from the session storage
        const token = req.session.authorization['accessToken'];

        // Verify the JWT token using the secret key
        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                // If token is valid, attach user payload to request and proceed
                req.user = user;
                next(); 
            } else {
                return res.status(403).json({ message: "User not authenticated or session expired" });
            }
        });
    } else {
        return res.status(403).json({ message: "User not logged in" });
    }
});
 
const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running on port " + PORT));
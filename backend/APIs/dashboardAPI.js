const express = require("express");
const axios = require("axios");
const User = require("../models/User");
const DashApp = express.Router();
const authMiddleware = require("../middlewares/authMiddlleware");
require("dotenv").config();

DashApp.get("/updated-dashboard/:_id",authMiddleware,async(req,res)=>{
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = DashApp;
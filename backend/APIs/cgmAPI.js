const express = require("express");
const router = express.Router();
const User = require("../models/User");  // Import the User model
const axios = require("axios");
require("dotenv").config();

const authMiddleware = require("../middlewares/authMiddlleware"); // ✅ Fixed Import Typo

// 🟢 1️⃣ Save CGM Data (Manual Input & Trigger Analysis)
router.post("/save", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;  // ✅ Extracted from JWT
        console.log("User ID from JWT:", userId);

        const { mealType, fastingSugarLevel, preMealSugarLevel, postMealSugarLevel, date } = req.body;

        if (!mealType || fastingSugarLevel === undefined || preMealSugarLevel === undefined || postMealSugarLevel === undefined || !date) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // ✅ Ensure `date` is a valid Date object
        const newEntry = {
            mealType,
            fastingSugarLevel,
            preMealSugarLevel,
            postMealSugarLevel,
            date: new Date(date)  // Convert to Date object
        };

        // ✅ Correct User Query (`findByIdAndUpdate`)
        const updatedUser = await User.findByIdAndUpdate(
            userId,  
            { $push: { sugarLevels: newEntry } },  // ✅ No new `_id`
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Perform AI Analysis
        const analysis = await analyzeCGMData(userId);

        res.json({ message: "Data saved successfully!", analysis });
    } catch (error) {
        console.error("Error in /save:", error);
        res.status(500).json({ error: error.message });
    }
});


// 🟢 2️⃣ Get Last 30 Days of CGM Data (Trends)
router.get("/trends", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const data = await getLast30DaysCGM(userId);
        res.json(data);
    } catch (error) {
        console.error("Error in /trends:", error);
        res.status(500).json({ error: error.message });
    }
});

// 🟢 3️⃣ Get **Full History** of CGM Data
router.get("/history", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId); // ✅ Fixed Query

        if (!user || !user.sugarLevels.length) {
            return res.json({ message: "No CGM history found." });
        }

        res.json(user.sugarLevels);
    } catch (error) {
        console.error("Error in /history:", error);
        res.status(500).json({ error: error.message });
    }
});

// 🟢 4️⃣ AI Analysis for CGM Data
router.get("/analyze", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const analysis = await analyzeCGMData(userId);
        res.json(analysis);
    } catch (error) {
        console.error("Error in /analyze:", error);
        res.status(500).json({ error: error.message });
    }
});

// 📌 **Helper Function to Get Last 30 Days of CGM Data**
async function getLast30DaysCGM(userId) {
    const user = await User.findById(userId); // ✅ Fixed Query

    if (!user || !user.sugarLevels.length) {
        return [];
    }

    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    // ✅ Filter only valid date entries
    const recentData = user.sugarLevels.filter(entry => {
        if (!entry.date) return false;
        const entryDate = new Date(entry.date);
        return entryDate >= thirtyDaysAgo;
    });

    return recentData.sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 30);
}

// 📌 **Helper Function to Analyze CGM Data**
async function analyzeCGMData(userId) {
    const cgmData = await getLast30DaysCGM(userId);

    if (!cgmData.length) return { message: "No data available for analysis." };

    const formattedData = cgmData.map(entry => ({
        meal: entry.mealType,
        fasting: entry.fastingSugarLevel,
        preMeal: entry.preMealSugarLevel,
        postMeal: entry.postMealSugarLevel,
        date: new Date(entry.date).toISOString().split("T")[0]  // ✅ Ensure correct date format
    }));

    try {
        console.log("📡 Sending user-specific sugar intake data to AI for analysis...");

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [
                    {
                        parts: [
                            {
                                text: `Analyze the following glucose readings and provide concise, user-friendly insights in bullet points.  
                                    Ensure the response is short (3-4 lines per section) and easy to understand.  

                                    - **Overall Analysis:** Summarize the trends in glucose levels.  
                                    - **Potential Risks:** Highlight any concerning patterns.  
                                    - **Personalized Insights:** Provide actionable diet or lifestyle tips.  

                                    Strictly return only the bullet points without extra text or explanations.  

                                    Glucose Data: ${JSON.stringify(formattedData)}`
                            }
                        ]
                    }
                ]
            },
            { headers: { "Content-Type": "application/json" } }
        );

        // ✅ Ensure a valid response structure
        const insights = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No insights available.";
        console.log("✅ Sugar Intake Insights:", insights);

        return { insights };
    } catch (error) {
        console.error("❌ AI Analysis Error:", error.response?.data || error.message);
        return { error: "AI analysis failed. Try again later." };
    }
}

module.exports = router;

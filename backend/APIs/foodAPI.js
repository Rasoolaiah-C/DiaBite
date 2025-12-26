const express = require("express");
const axios = require("axios");
const User = require("../models/User");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddlleware");
require("dotenv").config();

// NutritionX API credentials
const NUTRITIONX_APP_ID = process.env.NUTRITIONX_APP_ID;
const NUTRITIONX_APP_KEY = process.env.NUTRITIONX_APP_KEY;

// Log food manually (Authenticated)
router.post("/log", authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id; // Extract user ID from token
      const { mealType, foodItems, inputMethod } = req.body;
  
      if (!mealType || !Array.isArray(foodItems) || foodItems.length === 0) {
        return res.status(400).json({ error: "Missing or invalid required fields" });
      }
  
      // Find the user by ID
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: "User not found" });
  
      // Convert foodItems into query format for NutritionX
      const query = foodItems.map(item => `${item.quantity} ${item.name}`).join(", ");
      const url = "https://trackapi.nutritionix.com/v2/natural/nutrients";
      const response = await axios.post(
        url,
        { query },
        {
          headers: {
            "x-app-id": NUTRITIONX_APP_ID,
            "x-app-key": NUTRITIONX_APP_KEY,
            "Content-Type": "application/json"
          }
        }
      );
  
      if (!response.data.foods || response.data.foods.length === 0) {
        return res.status(400).json({ error: "No valid food items found" });
      }
  
      // Extract detailed food data from NutritionX response
      const foodData = response.data.foods.map((food, index) => ({
        foodName: food.food_name,
        brandName: food.brand_name || "Generic",
        servingQty: foodItems[index]?.quantity || 1,
        servingUnit: food.serving_unit,
        servingWeightGrams: food.serving_weight_grams,
        calories: food.nf_calories || 0,
        protein: food.nf_protein || 0,
        carbs: food.nf_total_carbohydrate || 0,
        fats: food.nf_total_fat || 0,
        fiber: food.nf_dietary_fiber,
        sugar: food.nf_sugars || 0,
        sodium: food.nf_sodium,
        potassium: food.nf_potassium,
        phosphorus: food.nf_p,
        fullNutrients: food.full_nutrients,
        photo: food.photo.thumb
      }));
  
      // Calculate total nutrition values from new food items
      const newTotalCalories = foodData.reduce((sum, item) => sum + (item.calories || 0), 0);
      const newTotalProtein = foodData.reduce((sum, item) => sum + (item.protein || 0), 0);
      const newTotalCarbs = foodData.reduce((sum, item) => sum + (item.carbs || 0), 0);
      const newTotalFats = foodData.reduce((sum, item) => sum + (item.fats || 0), 0);
      const newTotalSugars = foodData.reduce((sum,item) => sum + (item.sugar || 0),0);
      const newTotalFiber = foodData.reduce((sum,item) => sum + (item.fiber || 0),0);
      // Determine today's date (set hours to 0 for comparison)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      // Check if a log exists for the same mealType on today's date
      const existingLogIndex = user.foodLogs.findIndex(log => {
        const logDate = new Date(log.dateLogged);
        logDate.setHours(0, 0, 0, 0);
        return log.mealType.toLowerCase() === mealType.toLowerCase() && logDate.getTime() === today.getTime();
      });
  
      if (existingLogIndex >= 0) {
        // Update the existing log: append new food items and update totals
        const existingLog = user.foodLogs[existingLogIndex];
        existingLog.foodItems = existingLog.foodItems.concat(foodData);
        existingLog.totalCalories += newTotalCalories;
        existingLog.totalProtein += newTotalProtein;
        existingLog.totalCarbs += newTotalCarbs;
        existingLog.totalFats += newTotalFats;
        existingLog.totalSugars += newTotalSugars;
        existingLog.totalFiber += newTotalFiber;
        existingLog.dateLogged = new Date(); // Update timestamp
      } else {
        // Create new food log entry
        const foodLog = {
          mealType,
          foodItems: foodData,
          inputMethod,
          totalCalories: newTotalCalories,
          totalProtein: newTotalProtein,
          totalCarbs: newTotalCarbs,
          totalFats: newTotalFats,
          totalSugars: newTotalSugars,
          totalFiber: newTotalFiber,
          dateLogged: new Date()
        };
        user.foodLogs.push(foodLog);
      }
  
      // Save updated user document
      await user.save();
      res.status(201).json({ message: "Food logged successfully", foodLogs: user.foodLogs });
    } catch (error) {
      console.error("Error in /log:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
  
// Get user food logs (Authenticated)
router.get("/logs", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10 } = req.query;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        const startIndex = (page - 1) * limit;
        const paginatedLogs = user.foodLogs.slice(startIndex, startIndex + Number(limit));

        res.status(200).json({
            foodLogs: paginatedLogs,
            totalLogs: user.foodLogs.length,
            page,
            limit
        });

    } catch (error) {
        console.error("Error fetching logs:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// Delete a food log (Authenticated)
router.delete("/log/:logId", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { logId } = req.params;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        // Find the log index
        const logIndex = user.foodLogs.findIndex(log => log._id.toString() === logId);
        if (logIndex === -1) {
            return res.status(404).json({ error: "Food log not found" });
        }

        // Remove the log
        user.foodLogs.splice(logIndex, 1);
        await user.save();

        res.status(200).json({ message: "Food log deleted successfully" });

    } catch (error) {
        console.error("Error in /log/:logId:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// Log food using voice input (Authenticated)
router.post("/log/voice", authMiddleware, async (req, res) => {
  try {
      const userId = req.user.id;
      const { mealType, voiceText } = req.body;

      if (!mealType || !voiceText) {
          return res.status(400).json({ error: "Missing required fields: mealType and voiceText" });
      }

      // Find user
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      // Call NutritionX API to fetch nutritional details
      const url = "https://trackapi.nutritionix.com/v2/natural/nutrients";
      const response = await axios.post(
          url,
          { query: voiceText },
          {
              headers: {
                  "x-app-id": NUTRITIONX_APP_ID,
                  "x-app-key": NUTRITIONX_APP_KEY,
                  "Content-Type": "application/json"
              }
          }
      );

      if (!response.data.foods || response.data.foods.length === 0) {
          return res.status(400).json({ error: "No valid food items found in voice input" });
      }

      // Extract food data
      const foodData = response.data.foods.map(food => ({
          foodName: food.food_name,
          brandName: food.brand_name || "Generic",
          servingQty: food.serving_qty || 1,
          servingUnit: food.serving_unit,
          servingWeightGrams: food.serving_weight_grams,
          calories: food.nf_calories || 0,
          protein: food.nf_protein || 0,
          carbs: food.nf_total_carbohydrate || 0,
          fats: food.nf_total_fat || 0,
          fiber: food.nf_dietary_fiber || 0,
          sugar: food.nf_sugars || 0,
          sodium: food.nf_sodium || 0,
          potassium: food.nf_potassium || 0,
          phosphorus: food.nf_p || 0,
          fullNutrients: food.full_nutrients,
          photo: food.photo.thumb
      }));

      // Calculate total nutrition values
      const newTotalCalories = foodData.reduce((sum, item) => sum + (item.calories || 0), 0);
      const newTotalProtein = foodData.reduce((sum, item) => sum + (item.protein || 0), 0);
      const newTotalCarbs = foodData.reduce((sum, item) => sum + (item.carbs || 0), 0);
      const newTotalFats = foodData.reduce((sum, item) => sum + (item.fats || 0), 0);
      const newTotalSugars = foodData.reduce((sum, item) => sum + (item.sugar || 0), 0);
      const newTotalFiber = foodData.reduce((sum, item) => sum + (item.fiber || 0), 0);

      // Determine today's date (set hours to 0 for comparison)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if a log exists for the same mealType on today's date
      const existingLogIndex = user.foodLogs.findIndex(log => {
          const logDate = new Date(log.dateLogged);
          logDate.setHours(0, 0, 0, 0);
          return log.mealType.toLowerCase() === mealType.toLowerCase() && logDate.getTime() === today.getTime();
      });

      if (existingLogIndex >= 0) {
          // Update the existing log: append new food items and update totals
          const existingLog = user.foodLogs[existingLogIndex];
          existingLog.foodItems = existingLog.foodItems.concat(foodData);
          existingLog.totalCalories += newTotalCalories;
          existingLog.totalProtein += newTotalProtein;
          existingLog.totalCarbs += newTotalCarbs;
          existingLog.totalFats += newTotalFats;
          existingLog.totalSugars += newTotalSugars;
          existingLog.totalFiber += newTotalFiber;
          existingLog.dateLogged = new Date(); // Update timestamp
      } else {
          // Create new food log entry
          const foodLog = {
              mealType,
              foodItems: foodData,
              inputMethod: "voice",
              totalCalories: newTotalCalories,
              totalProtein: newTotalProtein,
              totalCarbs: newTotalCarbs,
              totalFats: newTotalFats,
              totalSugars: newTotalSugars,
              totalFiber: newTotalFiber,
              dateLogged: new Date()
          };
          user.foodLogs.push(foodLog);
      }

      // Save updated user document
      await user.save();

      res.status(201).json({ message: "Voice meal logged successfully", foodLogs: user.foodLogs });

  } catch (error) {
      console.error("Error in /log/voice:", error);
      res.status(500).json({ error: "Server error" });
  }
});

// Update food log (Authenticated)
router.put("/log/:logId", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { logId } = req.params;
    const { mealType, foodItems, inputMethod } = req.body;

    // Validate required fields
    if (!mealType || !Array.isArray(foodItems) || foodItems.length === 0) {
      return res.status(400).json({ error: "Missing or invalid required fields" });
    }

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Locate the food log entry by logId
    const foodLogIndex = user.foodLogs.findIndex(log => log._id.toString() === logId);
    if (foodLogIndex === -1) {
      return res.status(404).json({ error: "Food log not found" });
    }

    // Convert foodItems into query format for NutritionX
    const query = foodItems.map(item => `${item.quantity} ${item.name}`).join(", ");
    const url = "https://trackapi.nutritionix.com/v2/natural/nutrients";
    const response = await axios.post(
      url,
      { query },
      {
        headers: {
          "x-app-id": NUTRITIONX_APP_ID,
          "x-app-key": NUTRITIONX_APP_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    if (!response.data.foods || response.data.foods.length === 0) {
      return res.status(400).json({ error: "No valid food items found" });
    }

    // Map NutritionX response to food data objects
    const foodData = response.data.foods.map((food, index) => ({
      foodName: food.food_name,
      brandName: food.brand_name || "Generic",
      servingQty: foodItems[index]?.quantity || 1,
      servingUnit: food.serving_unit,
      servingWeightGrams: food.serving_weight_grams,
      calories: food.nf_calories || 0,
      protein: food.nf_protein || 0,
      carbs: food.nf_total_carbohydrate || 0,
      fats: food.nf_total_fat || 0,
      fiber: food.nf_dietary_fiber,
      sugar: food.nf_sugars || 0,
      sodium: food.nf_sodium,
      potassium: food.nf_potassium,
      phosphorus: food.nf_p,
      fullNutrients: food.full_nutrients,
      photo: food.photo.thumb
    }));

    // Calculate total nutritional values
    const totalCalories = foodData.reduce((sum, item) => sum + (item.calories || 0), 0);
    const totalProtein = foodData.reduce((sum, item) => sum + (item.protein || 0), 0);
    const totalCarbs = foodData.reduce((sum, item) => sum + (item.carbs || 0), 0);
    const totalFats = foodData.reduce((sum, item) => sum + (item.fats || 0), 0);
    const totalSugars = foodData.reduce((sum, item) => sum + (item.sugar || 0), 0);
    const totalFiber = foodData.reduce((sum, item) => sum + (item.fiber || 0), 0);

    // Update the existing food log with new details
    user.foodLogs[foodLogIndex].mealType = mealType;
    user.foodLogs[foodLogIndex].foodItems = foodData;
    user.foodLogs[foodLogIndex].inputMethod = inputMethod || "text";
    user.foodLogs[foodLogIndex].totalCalories = totalCalories;
    user.foodLogs[foodLogIndex].totalProtein = totalProtein;
    user.foodLogs[foodLogIndex].totalCarbs = totalCarbs;
    user.foodLogs[foodLogIndex].totalFats = totalFats;
    user.foodLogs[foodLogIndex].totalSugars = totalSugars;
    user.foodLogs[foodLogIndex].totalFiber = totalFiber;
    user.foodLogs[foodLogIndex].dateLogged = new Date(); // Update timestamp

    // Save the updated user document
    await user.save();
    res.status(200).json({ message: "Food log updated successfully", foodLogs: user.foodLogs });
  } catch (error) {
    console.error("Error in update food log route:", error);
    res.status(500).json({ error: "Server error" });
  }
});



module.exports = router;

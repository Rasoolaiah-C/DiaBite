import React, { useState } from "react";
import axios from "axios";
import "./FoodTrackingForm.css";

const FoodTrackingForm = () => {
  const [formData, setFormData] = useState({
    userId: Math.random().toString(36).substring(2, 15), // Randomly generated user ID
    mealType: "",
    foodItems: [],
    inputMethod: "text",
  });

  const [newFood, setNewFood] = useState({ name: "", quantity: "" });
  const [loading, setLoading] = useState(false);

  // Handle Meal Type Change
  const handleMealChange = (e) => {
    setFormData({ ...formData, mealType: e.target.value });
  };

  // Handle Food Item Input Change
  const handleFoodChange = (e) => {
    setNewFood({ ...newFood, [e.target.name]: e.target.value });
  };

  // Add Food Item to the List
  const addFoodItem = () => {
    if (newFood.name.trim() !== "" && newFood.quantity !== "") {
      setFormData({ ...formData, foodItems: [...formData.foodItems, newFood] });
      setNewFood({ name: "", quantity: "" }); // Reset input fields
    } else {
      alert("⚠️ Please enter a valid food name and quantity.");
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.mealType === "" || formData.foodItems.length === 0) {
      alert("⚠️ Please select a meal type and add at least one food item.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/food/log", formData);
      if (response.status === 201) {
        alert("✅ Food log recorded successfully!");
        setFormData({
          userId: Math.random().toString(36).substring(2, 15), // New User ID
          mealType: "",
          foodItems: [],
          inputMethod: "text",
        });
      } else {
        alert("⚠️ Something went wrong. Try again!");
      }
    } catch (error) {
      console.error("Error submitting food log:", error);
      alert("❌ Failed to submit. Please check your connection!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="glass-box">
        <h2>🍽️ Log Your Meal</h2>

        {/* Meal Type Dropdown */}
        <label>🍕 Select Meal Type:</label>
        <select value={formData.mealType} onChange={handleMealChange}>
          <option value="">-- Select Meal --</option>
          <option value="Breakfast">Breakfast</option>
          <option value="Lunch">Lunch</option>
          <option value="Dinner">Dinner</option>
          <option value="Snacks">Snacks</option>
        </select>

        {/* Food Items Section */}
        <div className="food-items-section">
          <h3>🥗 Food Items</h3>

          {formData.foodItems.map((item, index) => (
            <p key={index} className="food-item">
              🍛 {item.name} - {item.quantity} servings
            </p>
          ))}

          <input
            type="text"
            name="name"
            placeholder="Food name (e.g., Brown Rice)"
            value={newFood.name}
            onChange={handleFoodChange}
          />
          <input
            type="number"
            name="quantity"
            placeholder="Quantity (e.g., 1.5)"
            value={newFood.quantity}
            onChange={handleFoodChange}
          />
          <button type="button" className="add-btn" onClick={addFoodItem}>
            ➕ Add Food Item
          </button>
        </div>

        {/* Submit Button */}
        <button type="submit" className="submit-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? "⏳ Submitting..." : "✅ Submit Log"}
        </button>
      </div>
    </div>
  );
};

export default FoodTrackingForm;

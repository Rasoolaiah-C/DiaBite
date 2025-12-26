import React, { useState } from "react";
import "./SugarLevelsForm.css";

const SugarLevelsForm = () => {
  const [formData, setFormData] = useState({
    fastingSugar: "",
    preMealSugar: "",
    postMealSugar: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Show loading indicator

    try {
      const response = await axios.post("http://localhost:5000/cgm/save", formData);

      if (response.status === 201) {
        alert("✅ Sugar levels recorded successfully!");
        setFormData({
          fastingSugar: "",
          preMealSugar: "",
          postMealSugar: "",
        });
      } else {
        alert("⚠️ Something went wrong. Try again!");
      }
    } catch (error) {
      console.error("Error submitting sugar levels:", error);
      alert("❌ Failed to submit. Please check your connection!");
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  return (
    <div className="form-container">
      <div className="glass-box">
        <h2>🩺 Record Your Sugar Levels</h2>

        <label>🔬 Fasting Sugar Level (mg/dL):</label>
        <input
          type="number"
          name="fastingSugar"
          placeholder="e.g., 90"
          onChange={handleChange}
          required
        />

        <label>🍽️ Pre-Meal Sugar Level (mg/dL):</label>
        <input
          type="number"
          name="preMealSugar"
          placeholder="e.g., 110"
          onChange={handleChange}
          required
        />

        <label>🍰 Post-Meal Sugar Level (mg/dL):</label>
        <input
          type="number"
          name="postMealSugar"
          placeholder="e.g., 140"
          onChange={handleChange}
          required
        />

        <button type="submit" className="submit-btn" onClick={handleSubmit}>
          ✅ Submit
        </button>
      </div>
    </div>
  );
};

export default SugarLevelsForm;

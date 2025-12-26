

const mongoose = require("mongoose");

const sugarLevelsSchema = new mongoose.Schema({
    mealType: { type: String, default: "initial" },
    fastingSugarLevel: { type: Number, default: -1 ,set: v => (v === null ? -1 : v)},
    preMealSugarLevel: { type: Number, default: -1 ,set: v => (v === null ? -1 : v)},
    postMealSugarLevel: { type: Number, default: -1 ,set: v => (v === null ? -1 : v)},
    date: { type: Date, required: true }
}, { _id: false }); 


const foodLogSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, required: true, auto: true }, 
    mealType: { type: String, required: true }, // e.g., Breakfast, Lunch, Dinner
    foodItems: [
        {
            foodName: String,
            brandName: String,
            servingQty: Number,  
            servingUnit: String,
            servingWeightGrams: Number,
            calories: Number,
            protein: Number,
            carbs: Number,
            fats: Number,
            fiber: Number,
            sugar: Number,
            sodium: Number,
            potassium: Number,
            phosphorus: Number,
            fullNutrients: Object,
            photo: String
        }
    ],
    inputMethod: { type: String, enum: ["text", "voice"], default: "text" },
    totalCalories: Number,
    totalProtein: Number,
    totalCarbs: Number,
    totalFats: Number,
    totalSugars: Number,
    totalFiber: Number,
    dateLogged: { type: Date, default: Date.now }
},{ _id: false }); 

// Updated User Schema
const userSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, required: true, auto: true }, 
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    weight: { type: Number, required: true },
    height: { type: Number, required: true },
    sugarLevels: { type: [sugarLevelsSchema], default: [] },  
    foodAllergies: { type: [String], default: [] },  
    dailyCaloricIntake: { type: Number, required: true },  
    mealTypePreference: { type: String },  
    diabetesType: { type: String, required: true },
    dietaryPreference: { type: String, required: true },  
    activityLevel: { type: String },  
    foodLogs: { type: [foodLogSchema], default: [] } 
});

const User = mongoose.model("User", userSchema);

module.exports = User;

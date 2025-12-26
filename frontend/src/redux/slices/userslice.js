import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

// **Login API Call**
export const userLoginThunk = createAsyncThunk(
    "users/login",
    async (userCredObj, thunkApi) => {
        try {
            const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/users/login`, userCredObj);
            
            console.log("Login Response:", res.data); // Debugging response

            if (res.data.message === "Login successful") {  
                // Store the token in local storage
                localStorage.setItem("token", res.data.token);
                localStorage.setItem("currentUser", JSON.stringify(res.data));

                // Toast notification
                toast.success("Login Successful!");

                return res.data; // Return full response
            } else {
                toast.error("Login Failed!");
                return thunkApi.rejectWithValue(res.data.message);
            }
        } catch (err) {
            toast.error("Something went wrong!");
            return thunkApi.rejectWithValue(err.response?.data?.message || "Server error");
        }
    }
);

// **Redux Slice**
const userslice = createSlice({
    name: "user",
    initialState: {
        currentUser: {},    
        isPending: false,
        errmsg: "",
        errStatus: false,
        isLoggedIn: false
    },
    reducers: {
        resetUserState: (state) => {
            state.currentUser = {};
            state.isPending = false;
            state.errmsg = "";
            state.errStatus = false;
            state.isLoggedIn = false;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(userLoginThunk.pending, (state) => {
                state.isPending = true;
            })
            .addCase(userLoginThunk.fulfilled, (state, action) => {
                state.currentUser = action.payload.payload || {};  // ✅ Fixed field
                state.isPending = false;
                state.isLoggedIn = true;
                state.errmsg = "";
                state.errStatus = false;
            })
            .addCase(userLoginThunk.rejected, (state, action) => {
                state.isPending = false;
                state.errmsg = action.payload;
                state.errStatus = true;
                state.isLoggedIn = false;
                state.currentUser = {};
            });
    }
});

// **Export Reducer**
export default userslice.reducer;

// **Export Actions**
export const { resetUserState } = userslice.actions;

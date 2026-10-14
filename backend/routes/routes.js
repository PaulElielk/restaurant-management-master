import express from "express";

import {
    showFoods,
    showFoodById,
    showRecommendedFoods,
    showRecommendationEvaluation,
    showUsersAlsoBought,
    createFood,
    updateFood,
    deleteFood,
} from "../controllers/food.js";

import {
    showAUser,
    showUserById,
    createAccount
} from "../controllers/user.js";

import {
    addItems,
    getItem,
    updateItem,
    allItems,
    deleteItem,
    deleteItems
} from "../controllers/cart.js";

import {
    createBooking
} from "../controllers/booktable.js";

import {
    createBillDetails,
    getBillDetailsById
} from "../controllers/billdetails.js";

import {
    showNewestStatusId,
    createBillStatus, 
    getAllBillsByUser,
    getAllBillsByBill,
    getAllBills,
    updateBillStatus,
    updateBillPaid,
    cancelBillStatus,
    showDemandForecast
} from "../controllers/billstatus.js";

import { handleChatbotMessage } from "../controllers/chatbot.js";

const router = express.Router();

// --- Food & Recommendation Endpoints ---
router.get("/api/foods", showFoods);
router.get("/api/foods/:id", showFoodById);
router.post("/api/foods", createFood);
router.put("/api/foods/:id", updateFood);
router.delete("/api/foods/:id", deleteFood);

// AI Recommendation routes
router.get("/api/recommendations/:id", showRecommendedFoods);
router.get("/api/recommendations/:id/evaluate", showRecommendationEvaluation); // Offline P@K & R@K benchmark
router.get("/api/foods/:id/also-bought", showUsersAlsoBought);                  // Co-purchase cross-sell

// --- User & Auth Endpoints ---
router.get("/api/users/id/:id", showUserById);
router.get("/api/users/:email", showAUser);
router.post("/api/users/", createAccount);

// --- Cart Operations ---
router.post("/api/cartItem", addItems);
router.get("/api/cartItem/:user_id/:food_id", getItem);
router.get("/api/cartItem/:id", allItems);
router.put("/api/cartItem/", updateItem);
router.delete("/api/cartItem/:user_id/:food_id", deleteItem);
router.delete("/api/cartItem/:id", deleteItems);

// --- Table Booking ---
router.post("/api/booking", createBooking);

// --- Order Items (Bill Details) ---
router.post("/api/billdetails", createBillDetails);
router.get("/api/billdetails/:id", getBillDetailsById);

// --- Order Lifecycle & Forecasting (Bill Status) ---
router.get("/api/billstatus/new", showNewestStatusId);
router.post("/api/billstatus", createBillStatus);
router.get("/api/billstatus/user/:id", getAllBillsByUser);
router.get("/api/billstatus/bill/:id", getAllBillsByBill);
router.get("/api/billstatus", getAllBills);
router.put("/api/billstatus/:id", updateBillStatus);
router.put("/api/billstatus/paid/:id", updateBillPaid);
router.put("/api/billstatus/cancel/:id", cancelBillStatus);

// AI Demand Forecasting
router.get("/api/billstatus/forecast", showDemandForecast);

// --- AI NLP Chatbot ---
router.post("/api/chatbot/message", handleChatbotMessage);

export default router;

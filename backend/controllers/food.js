// import functions from Food model

import {
    getFoods,
    getFoodById,
    insertFood,
    updateFoodById,
    deleteFoodById,
    getRecommendedFoodsForUser,
    evaluateRecommendationsForUser,
    getUsersAlsoBought,
} from "../models/FoodModel.js";

// get all Foods
export const showFoods=(req,res)=>{
    getFoods((err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};


// get single Food
export const showFoodById=(req,res)=>{
    getFoodById(req.params.id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

// personalized recommendations by user id (or popular fallback for guest/new user)
export const showRecommendedFoods = (req, res) => {
    const options = {
        limit: req.query.limit,
        minHistory: req.query.minHistory,
        excludeCart: req.query.excludeCart === "true" || req.query.excludeCart === "1"
    };

    getRecommendedFoodsForUser(req.params.id, options, (err, results) => {
        if (err) {
            res.send(err);
        } else {
            res.json(results);
        }
    });
};

// offline evaluation for recommendation quality (single user)
export const showRecommendationEvaluation = (req, res) => {
    const options = {
        limit: req.query.limit
    };

    evaluateRecommendationsForUser(req.params.id, options, (err, results) => {
        if (err) {
            res.send(err);
        } else {
            res.json(results);
        }
    });
};

// create Food
export const createFood=(req,res)=>{
    const data = req.body;
    insertFood(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

// update Food
export const updateFood=(req,res)=>{
    const data = req.body;
    const id = req.params.id;
    updateFoodById(data,id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

// delete Food
export const deleteFood=(req,res)=>{
    const id = req.params.id;
    deleteFoodById(id,(err,results)=>{
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

// users also bought — co-purchase recommendations for a given food id
export const showUsersAlsoBought = (req, res) => {
    const limit = req.query.limit;

    getUsersAlsoBought(req.params.id, limit, (err, results) => {
        if (err) {
            res.send(err);
        } else {
            res.json(results);
        }
    });
};


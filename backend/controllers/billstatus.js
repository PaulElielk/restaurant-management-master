// Controller for order lifecycle management (bill status) and AI demand forecasting.

import {
    getNewestId,
    insertBillStatus,
    getBillsByUser,
    getBillsByBill,
    getAll,
    updateStatus,
    updatePaid,
    cancelStatus,
    getDemandForecast,
    getOrderHistoryByUser
} from "../models/BillStatusModel.js";

// get newest Bill Status
export const showNewestStatusId=(req,res)=>{
    getNewestId((err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

// create BillStatus
export const createBillStatus=(req,res)=>{
    const data = req.body;
    insertBillStatus(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

// get Bills Status
export const getAllBillsByUser=(req,res)=>{
    getBillsByUser(req.params.id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

// get Bills Status
export const getAllBillsByBill=(req,res)=>{
    getBillsByBill(req.params.id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

// get Bills Status
export const getAllBills=(req,res)=>{
    getAll((err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};


// update Status
export const updateBillStatus=(req,res)=>{
    updateStatus(req.params.id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

// update Paid
export const updateBillPaid=(req,res)=>{
    updatePaid(req.params.id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

// cancel Status
export const cancelBillStatus=(req,res)=>{
    cancelStatus(req.params.id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

// demand forecast for admin planning
export const showDemandForecast = (req, res) => {
    const lookbackDays = req.query.lookback || 30;
    const forecastDays = req.query.days || 7;

    getDemandForecast(lookbackDays, forecastDays, (err, results) => {
        if (err) {
            res.send(err);
        } else {
            res.json(results);
        }
    });
};

// get complete order history for authenticated user
export const getUserOrderHistory = (req, res) => {
    getOrderHistoryByUser(req.params.id, (err, results) => {
        if (err) {
            res.status(500).json({ error: "Failed to retrieve order history", details: err });
        } else {
            res.json(results);
        }
    });
};

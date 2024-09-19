"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticate_1 = require("../middleware/authenticate");
const expenses_1 = require("../controllers/expenses");
const router = (0, express_1.Router)();
router.post("/add", authenticate_1.authenticate);
router.get("/expenseStats", authenticate_1.authenticate, expenses_1.addExpense);
router.post("/getbyDay", authenticate_1.authenticate, expenses_1.getExpenseByDay);
router.post("/getbyMonth", authenticate_1.authenticate, expenses_1.getExpenseByMonth);
router.post("/getbyYear", authenticate_1.authenticate, expenses_1.getexpenseByYear);
router.post("/getbyMonthGrouped", authenticate_1.authenticate, expenses_1.getExpenseByMonthGrouped);
router.post("/leaderboard", authenticate_1.authenticate, expenses_1.getLeaderboard);
router.post("/delete/:id", authenticate_1.authenticate, expenses_1.deleteExpense);
exports.default = router;

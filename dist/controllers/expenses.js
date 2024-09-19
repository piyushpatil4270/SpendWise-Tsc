"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStats = exports.deleteExpense = exports.getLeaderboard = exports.getExpenseByMonthGrouped = exports.getexpenseByYear = exports.getExpenseByMonth = exports.getExpenseByDay = exports.addExpense = void 0;
const expenses_1 = __importDefault(require("../models/expenses"));
const user_1 = __importDefault(require("../models/user"));
const moment_1 = __importDefault(require("moment"));
const sequelize_1 = __importStar(require("sequelize"));
const addExpense = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(404).json("Your are not authorized");
        const userId = req.user.id;
        const body = req.body;
        const formattedDate = moment_1.default.utc(body.date).toDate();
        const newExpense = yield expenses_1.default.create({
            title: body.title,
            description: body.description,
            amount: body.amount,
            category: body.category,
            userId: userId,
            date: formattedDate
        });
        const existingUser = yield user_1.default.findOne({ where: { id: userId } });
        existingUser === null || existingUser === void 0 ? void 0 : existingUser.increment('totalExpenses', { by: body.amount });
        res.status(202).json("Expense added successfully");
    }
    catch (error) {
        console.log(error);
        res.status(404).json("An error occured try again");
    }
});
exports.addExpense = addExpense;
const getExpenseByDay = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(404).json("Your are not authorized");
        const userId = req.user.id;
        const body = req.body;
        const skipExpenses = (body.page - 1) * (body.limit);
        const limit = body.limit;
        const startDate = moment_1.default.utc(body.date).startOf("day").toDate();
        const endDate = moment_1.default.utc(body.date).endOf("day").toDate();
        const { count, rows } = yield expenses_1.default.findAndCountAll({
            where: { userId: userId,
                date: {
                    [sequelize_1.default.Op.between]: [startDate, endDate]
                }
            },
            offset: skipExpenses,
            limit: limit
        });
        const totalAmount = yield expenses_1.default.sum("amount", {
            where: { userId: userId,
                date: {
                    [sequelize_1.default.Op.between]: [startDate, endDate]
                }
            }
        });
        res.status(202).json({ expenses: rows, total: count, totalAmount: totalAmount });
    }
    catch (error) {
        console.log(error);
        res.status(404).json("An error occured try again");
    }
});
exports.getExpenseByDay = getExpenseByDay;
const getExpenseByMonth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(404).json("Your are not authorized");
        const userId = req.user.id;
        const body = req.body;
        const startMonth = moment_1.default.utc(body.date).startOf("month").toDate();
        const endMonth = moment_1.default.utc(body.date).endOf("month").toDate();
        const skip = (body.page - 1) * body.limit;
        const { rows, count } = yield expenses_1.default.findAndCountAll({
            where: { userId: userId,
                date: {
                    [sequelize_1.default.Op.between]: [startMonth, endMonth]
                }
            },
            limit: body.limit,
            offset: skip,
            order: [sequelize_1.default.literal("DATE(date)")]
        });
        const totalAmount = yield expenses_1.default.sum("amount", {
            where: { userId: userId,
                date: {
                    [sequelize_1.default.Op.between]: [startMonth, endMonth]
                }
            }
        });
        res.status(202).json({ expenses: rows, totalAmount: totalAmount, total: count });
    }
    catch (error) {
        console.log(error);
        res.status(404).json("An error occured try again");
    }
});
exports.getExpenseByMonth = getExpenseByMonth;
const getexpenseByYear = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(404).json("Your are not authorized");
        const userId = req.user.id;
        const body = req.body;
        const startYear = moment_1.default.utc(body.date).startOf('year').toDate();
        const endYear = moment_1.default.utc(body.date).endOf('year').toDate();
        const expenses = yield expenses_1.default.findAll({
            attributes: [
                [sequelize_1.default.fn('DATE_FORMAT', sequelize_1.default.col('date'), '%Y-%m'), 'month'],
                [sequelize_1.default.fn("SUM", sequelize_1.default.col("amount")), 'totalAmount']
            ],
            where: { userId: userId,
                date: {
                    [sequelize_1.default.Op.between]: [startYear, endYear]
                }
            },
            group: [sequelize_1.default.fn('DATE_FORMAT', sequelize_1.default.col('date'), '%Y-%m')],
            order: [sequelize_1.default.fn("DATE_FORMAT", sequelize_1.default.col("date"), '%Y-%m')]
        });
        const totalAmount = yield expenses_1.default.sum("amount", {
            where: { userId: userId,
                date: {
                    [sequelize_1.default.Op.between]: [startYear, endYear]
                }
            }
        });
        res.status(202).json({ expenses: expenses, totalAmount: totalAmount, total: expenses.length });
    }
    catch (error) {
        console.log(error);
        res.status(404).json("An error occured try again");
    }
});
exports.getexpenseByYear = getexpenseByYear;
const getExpenseByMonthGrouped = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(404).json("Your are not authorized");
        const userId = req.user.id;
        const body = req.body;
        const date = body.date;
        const startYear = moment_1.default.utc(date).startOf("year").toDate();
        const endYear = moment_1.default.utc(date).endOf("year").toDate();
        const expenses = yield expenses_1.default.findAll({
            where: {
                userId: userId,
                date: {
                    [sequelize_1.default.Op.between]: [startYear, endYear]
                }
            },
            order: [sequelize_1.default.literal('DATE(date)')]
        });
        const groupByMonth = expenses.reduce((acc, expense) => {
            /// @ts-ignore
            const month = (0, moment_1.default)(expense.date).format("MMMM");
            if (!acc[month]) {
                acc[month] = [];
            }
            acc[month].push(expense);
            return acc;
        }, {});
        res.status(202).json(groupByMonth);
    }
    catch (error) {
        console.log(error);
        res.status(404).json("An error occured please try again");
    }
});
exports.getExpenseByMonthGrouped = getExpenseByMonthGrouped;
const getLeaderboard = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(404).json("Your are not authorized");
        const userId = req.user.id;
        const users = yield user_1.default.findAll({
            order: [['totalAmount', 'DESC']],
            limit: 10
        });
        res.status(202).json(users);
    }
    catch (error) {
        res.status(404).json(error);
    }
});
exports.getLeaderboard = getLeaderboard;
const deleteExpense = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(404).json("Your are not authorized");
        const { id: expenseId } = req.params;
        const userId = req.user.id;
        console.log(typeof expenseId);
        const newId = parseInt(expenseId);
        const expense = yield expenses_1.default.findOne({ where: { id: newId } });
        if (expense) {
            const amt = expense.toJSON().amount;
            const user = yield user_1.default.findByPk(userId);
            // @ts-ignore
            user.totalAmount -= amt;
            yield (user === null || user === void 0 ? void 0 : user.save());
            yield expense.destroy();
            return res.status(202).json("expense deleted");
        }
        res.status(202).json("expense not found");
    }
    catch (error) {
        res.status(404).json(error);
    }
});
exports.deleteExpense = deleteExpense;
/* router.get("/leaderboard",authenticate,async(req:CustomRequest,res:Response,next:NextFunction)=>{
 try {
     if(!req.user) return res.status(404).json("Your are not authorized")
     const userId:number=req.user.id
     const users=await Users.findAll({
         order:[['totalAmount','DESC']],
         limit:10
     })
     res.status(202).json(users)
 } catch (error) {
     res.status(404).json(error)
 }
})*/
const getStats = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(404).json("Your are not authorized");
        const userId = req.user.id;
        const startDate = moment_1.default.utc().startOf("year").format("YYYY-MM-DD");
        const endDate = moment_1.default.utc().endOf("year").format("YYYY-MM-DD");
        const monthlyData = yield expenses_1.default.findAll({
            where: { userId: userId, date: { [sequelize_1.default.Op.between]: [startDate, endDate] } }, attributes: [
                [sequelize_1.Sequelize.fn('DATE_FORMAT', sequelize_1.Sequelize.col('date'), '%M'), 'monthName'],
                [sequelize_1.Sequelize.fn('SUM', sequelize_1.Sequelize.col('amount')), 'amount']
            ],
            group: ['monthName'],
        });
        res.status(202).json({ monthlyData: monthlyData });
    }
    catch (error) {
        console.log(error);
        res.status(404).json("An error occured try again");
    }
});
exports.getStats = getStats;

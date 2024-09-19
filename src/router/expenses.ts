import { Router } from "express";

import {authenticate} from "../middleware/authenticate"
import { addExpense, deleteExpense, getExpenseByDay, getExpenseByMonth, getExpenseByMonthGrouped, getexpenseByYear, getLeaderboard } from "../controllers/expenses";
const router=Router()


interface ExpenseBody{
    title:string,
    description:string,
    category:string,
    amount:number,
    date:Date
}



export interface User{
    id: number;
  username: string;
  email: string;
  password: string;
  totalExpenses: number;
  isPremium: boolean;
}

interface ExpensebyDate{
    limit:number,
    page:number,
    date:Date
}


// class inheritance
export interface CustomRequest extends Request{
    user?:User
}

router.post("/add",authenticate,addExpense)



router.get("/expenseStats",authenticate,addExpense)

router.post("/getbyDay",authenticate,getExpenseByDay)


router.post("/getbyMonth",authenticate,getExpenseByMonth)


router.post("/getbyYear",authenticate,getexpenseByYear)



router.post("/getbyMonthGrouped",authenticate,getExpenseByMonthGrouped)



router.post("/leaderboard",authenticate,getLeaderboard)

router.post("/delete/:id",authenticate,deleteExpense)




export default router
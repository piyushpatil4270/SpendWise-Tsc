import  {Router,Request,Response,NextFunction} from "express"
import Expenses from "../models/expenses"
import Users from "../models/user"
import moment from "moment"

import sequelize, { Sequelize, where } from "sequelize"

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



export const addExpense=async(req:CustomRequest,res:Response,next:NextFunction)=>{
    try {
        if(!req.user) return res.status(404).json("Your are not authorized")
        const userId=req.user.id
        const body:ExpenseBody=req.body
        const formattedDate:Date=moment.utc(body.date).toDate()
        const newExpense=await Expenses.create({
            title:body.title,
            description:body.description,
            amount:body.amount,
            category:body.category,
            userId:userId,
            creationDate:formattedDate
        })
        const existingUser=await Users.findOne({where:{id:userId}})
        existingUser?.increment('totalExpenses',{by:body.amount})
        res.status(202).json("Expense added successfully")
    
    } catch (error) {
        console.log(error)
        res.status(404).json("An error occured try again")
    }
    }


    export const getExpenseByDay=async(req:CustomRequest,res:Response,next:NextFunction)=>{
        try {
            if(!req.user) return res.status(404).json("Your are not authorized")
            const userId=req.user.id
            const body:ExpensebyDate=req.body
            const skipExpenses:number=(body.page-1)*(body.limit)
            const limit:number=body.limit
            const startDate:Date=moment.utc(body.date).startOf("day").toDate()
            const endDate:Date=moment.utc(body.date).endOf("day").toDate()
            const {count,rows}=await Expenses.findAndCountAll({
                where:{userId:userId,
                    date:{
                        [sequelize.Op.between]:[startDate,endDate]
                    }
                },
                offset:skipExpenses,
                limit:limit
            })
    
            const totalAmount=await Expenses.sum("amount",{
                where:{userId:userId,
                    date:{
                        [sequelize.Op.between]:[startDate,endDate]
                    }
                }
            })
            res.status(202).json({expenses:rows,total:count,totalAmount:totalAmount})
        
        } catch (error) {
            console.log(error)
            res.status(404).json("An error occured try again")
        }
        }


        export const getExpenseByMonth=async(req:CustomRequest,res:Response,next:NextFunction)=>{
            try {
                if(!req.user) return res.status(404).json("Your are not authorized")
                const userId=req.user.id
                const body=req.body
                const startMonth:Date=moment.utc(body.date).startOf("month").toDate()
                const endMonth:Date=moment.utc(body.date).endOf("month").toDate()
                const skip:number=(body.page-1)*body.limit
                const {rows,count}=await Expenses.findAndCountAll({
                    where:{userId:userId,
                        date:{
                            [sequelize.Op.between]:[startMonth,endMonth]
                        }
                    },
                    limit:body.limit,
                    offset:skip,
                    order:[sequelize.literal("DATE(date)")]
                })
                const totalAmount=await Expenses.sum("amount",{
                    where:{userId:userId,
                        date:{
                            [sequelize.Op.between]:[startMonth,endMonth]
                        }
                    }
                })
                res.status(202).json({expenses:rows,totalAmount:totalAmount,total:count})
        
            } catch (error) {
                console.log(error)
                res.status(404).json("An error occured try again")
            }
        }


        export const getexpenseByYear=async(req:CustomRequest,res:Response,next:NextFunction)=>{
            try {
                if(!req.user) return res.status(404).json("Your are not authorized")
                const userId=req.user.id
                const body:ExpensebyDate=req.body
                const startYear:Date=moment.utc(body.date).startOf('year').toDate()
                const endYear:Date=moment.utc(body.date).endOf('year').toDate()
                
                const expenses=await Expenses.findAll({
                    attributes:[
                        [sequelize.fn('DATE_FORMAT',sequelize.col('date'),'%Y-%m'),'month'],
                        [sequelize.fn("SUM",sequelize.col("amount")),'totalAmount']
                    ],
                    where:{userId:userId,
                        date:{
                            [sequelize.Op.between]:[startYear,endYear]
                        }
                    },
                    group:[sequelize.fn('DATE_FORMAT',sequelize.col('date'),'%Y-%m')],
                    order:[sequelize.fn("DATE_FORMAT",sequelize.col("date"),'%Y-%m')]
                })
                const totalAmount=await Expenses.sum("amount",{
                    where:{userId:userId,
                        date:{
                            [sequelize.Op.between]:[startYear,endYear]
                        }
                    }
                })
                res.status(202).json({expenses:expenses,totalAmount:totalAmount,total:expenses.length})
        
            } catch (error) {
                console.log(error)
                res.status(404).json("An error occured try again")
            }
        }


        export const getExpenseByMonthGrouped=async(req:CustomRequest,res:Response,next:NextFunction)=>{
            try {
                if(!req.user) return res.status(404).json("Your are not authorized")
                const userId=req.user.id
                const body=req.body
                const date:Date=body.date
                const startYear=moment.utc(date).startOf("year").toDate()
                const endYear=moment.utc(date).endOf("year").toDate()
                const expenses=await Expenses.findAll({
                    where:{
                        userId:userId,
                        cretionate:{
                            [sequelize.Op.between]:[startYear,endYear]
                        }
                    },
                    order:[sequelize.literal('DATE(date)')]
                }) 
                
        
                const groupByMonth=expenses.reduce((acc:{[key:string]:typeof expenses},expense)=>{
                    /// @ts-ignore
                    const month=moment(expense.date).format("MMMM")
                    if(!acc[month]){
                      acc[month]=[]
                    }
                    acc[month].push(expense)
                    return acc
                    },{})
               res.status(202).json(groupByMonth)
            } catch (error) {
                console.log(error)
                res.status(404).json("An error occured please try again")
            }
        }

     export const getLeaderboard=   async(req:CustomRequest,res:Response,next:NextFunction)=>{
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
        }

        export const deleteExpense=async(req:CustomRequest,res:Response,next:NextFunction)=>{
            try {
                if(!req.user) return res.status(404).json("Your are not authorized")
                    const { id: expenseId } = req.params;
                const userId = req.user.id;
                console.log(typeof expenseId)
                const newId:number=parseInt(expenseId)
                const expense = await Expenses.findOne(
                  { where: { id: newId} }
                );
                if (expense) {
                  const amt = expense.toJSON().amount;
                  const user = await Users.findByPk(userId);
                  // @ts-ignore
                   user.totalAmount-=amt
                  await user?.save()
                  await expense.destroy();
                  return res.status(202).json("expense deleted");
                }
                res.status(202).json("expense not found")
        
            } catch (error) {
                res.status(404).json(error)
            }
        }



    
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
        export const getStats=async(req:CustomRequest,res:Response,next:NextFunction)=>{                                                          try {
        if(!req.user) return res.status(404).json("Your are not authorized")        
        const userId=req.user.id
        const startDate=moment.utc().startOf("year").format("YYYY-MM-DD")
        const endDate=moment.utc().endOf("year").format("YYYY-MM-DD")
        const monthlyData=await Expenses.findAll({
where:{userId:userId,date:{[sequelize.Op.between]:[startDate,endDate]}},attributes: [
    [Sequelize.fn('DATE_FORMAT', Sequelize.col('date'), '%M'), 'monthName'],
    [Sequelize.fn('SUM', Sequelize.col('amount')), 'amount']
],
group: ['monthName'],})
const categoryStats=await Expenses.findAll({
    where:{userId:userId,date:{[sequelize.Op.between]:[startDate,endDate]}},attributes: [
        [Sequelize.col("category"),"category"],
        [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalAmount']
    ],
    group: ['category'],})
res.status(202).json({monthlyData:monthlyData})

    } catch (error) {
        console.log(error)
        res.status(404).json("An error occured try again")
    }
    }
        
import { NextFunction, Router,Request,Response } from "express";
import crypto from "crypto"
import { authenticate } from "../middleware/authenticate";
import Users from "../models/user"
import { where } from "sequelize";
const router=Router()

export interface User{
    id: number;
  username: string;
  email: string;
  password: string;
  totalExpenses: number;
  isPremium: boolean;
  }
  interface CustomRequest extends Request{
  user?:User
  }
  

  function generateHash(key:any, txnid:any, amount:any, productinfo:any, firstname:any, email:any, salt:any) {
    const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
    return crypto.createHash('sha512').update(hashString).digest('hex');
  }

  export const payforPremium=async (req:Request, res:Response, next:NextFunction) => {
    try {
      const { txnid, amount, productinfo, firstname, email, phone } = req.body;
      const hash = generateHash(process.env.PAYU_KEY, txnid, amount, productinfo, firstname, email, process.env.PAYU_SALT);
      const payuData = {
        key: process.env.PAYU_KEY,
        txnid: txnid,
        amount: amount,
        productinfo: productinfo,
        firstname: firstname,
        email: email,
        phone: phone,
        surl: 'http://localhost:5500/premium/success',
        furl: 'http://localhost:5500/premium/failure',
        hash: hash,
        service_provider: 'payu_paisa',
      };
  
      res.status(200).json({ ...payuData, status: 'success' });
    } catch (error) {
      console.error('Error in /payu endpoint:', error);
      res.status(500).json({ status: 'failure', message: 'Internal Server Error' });
    }
  }


  export const generateResponse=async(req:CustomRequest, res:Response,next:NextFunction) => {
    try {
      const { key, txnid, amount, productinfo, firstname, email, status, hash } = req.body;
      const newHash = generateHash(key, txnid, amount, productinfo, firstname, email, process.env.PAYU_SALT);
      if (newHash === hash) {
        res.status(200).json({ status: 'success', message: 'Payment Successful' });
      } else {
        res.status(400).json({ status: 'failure', message: 'Payment Verification Failed' });
      }
    } catch (error) {
      console.error('Error in /payu_response endpoint:', error);
      res.status(500).json({ status: 'failure', message: 'Internal Server Error' });
    }
  }


  export const addPremium=async(req:CustomRequest,res:Response,next:NextFunction)=>{
    try {
      if(!req.user) return res.status(404).json("You are not authorized")
        const userId=req.user.id
      const user=await Users.findByPk(userId)
      const updateToPremium=await Users.update(
        {isPremium:true},
        { where:{id:userId},})
      res.status(202).json("You are a premium user now")
  
      
    } catch (error) {
      console.log("error")
      
    }
  }


  export const paymentSuccess=async(req:Request, res:Response,next:NextFunction) => {
    res.json('Payment success');
  }

  export const paymentFailed=async(req:Request, res:Response,next:NextFunction) => {
    res.json('Payment failed');
  }
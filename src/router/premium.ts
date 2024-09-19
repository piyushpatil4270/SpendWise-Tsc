import { Router } from "express";
import { addPremium, generateResponse, payforPremium, paymentFailed, paymentSuccess } from "../controllers/premium";
import { authenticate } from "../middleware/authenticate";

const router=Router()



  
router.post('/payu',payforPremium );
  
  router.post('/payu_response',generateResponse);
  
  router.post('/success',paymentSuccess);
  
  router.post('/failure',paymentFailed );


router.post("/add",authenticate,addPremium)
  export default router
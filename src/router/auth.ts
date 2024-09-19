import { Router } from "express"
import { forgotPass, resetPass, signin, signUp } from "../controllers/auth"

const router=Router()



router.post("/signup",signUp)



router.post("/signin",signin)



router.post("/forgot_password",forgotPass)


router.post("/reset/:id",resetPass)

export default router
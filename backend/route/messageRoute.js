import express from "express"
import { sendMessage,getMessages } from "../Controllers/messageRouteControllers.js";
import isLogin from "../middlewares/isLogin.js";

const router = express.Router();

router.post('/send/:id',isLogin,sendMessage)
router.get('/:id',isLogin,getMessages)



export default router;
import express from "express";
import isLogin from "../middlewares/isLogin.js";
import { getCurrentChatters, getUserBySearch } from "../Controllers/userHandlerController.js";

const router = express.Router();

router.get('/search',isLogin,getUserBySearch)
router.get('/currentChatters',isLogin,getCurrentChatters)

export default router;
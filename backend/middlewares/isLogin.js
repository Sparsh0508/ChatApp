import jwt, { decode } from 'jsonwebtoken';
import User from '../Models/userModels.js';

const isLogin = async (req, res, next) => {
    try {
        
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }   
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded){
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({ message: "Unauthorized: User not found" });
        }
        req.user = user;
        next();
    }catch (error) {
        console.error("Error in isLogin middleware:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export default isLogin;
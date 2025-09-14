import mongoose from "mongoose";

const dbConnect = async() => {
    try{
        await mongoose.connect(process.env.MONGODB_CONNECT);
        console.log("Database connected");
    }catch(err){
        console.log(err);
    }
}

export default dbConnect;
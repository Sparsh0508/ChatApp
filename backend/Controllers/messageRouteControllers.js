import Conversation from "../Models/conversationModel.js";
import Message from "../Models/messagesModel.js";
import { io , getReciverSocketId} from "../Socket/Socket.js";

export const sendMessage = async(req, res) => {
    try {
        const {message} = req.body;
        const {id:receiverId} = req.params;
        const senderId = req.user._id;
         
        let chats = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        });

        if(!chats){
            chats = await Conversation.create({
                participants:[senderId,receiverId]
            })
        }
        const newMessages = await Message.create({
            senderId,receiverId,conversationId:chats._id,message
        })

        if(newMessages){
            chats.messages.push(newMessages._id);
        }

        await Promise.all([chats.save(),newMessages.save()]);

        //Socket.io function

        const receiverSocketId = getReciverSocketId(receiverId);
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage",newMessages)
        }

        res.status(201).send(newMessages);

    } catch (error) {
        
    }
}


export const getMessages = async(req, res) => {
    try {
        const {id:receiverId} = req.params;
        const senderId = req.user._id;

        const chats = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        }).populate('messages');

        if(!chats){
            return res.status(200).send([]);
        }

        res.status(200).send(chats.messages);

    }catch(err){
        res.status(500).send({
            success:false,
            message:err.message
        })
        console.log(err);
    }
}
import Conversation from "../Models/conversationModel.js";
import User from "../Models/userModels.js";

export const getUserBySearch = async(req, res) => {
    try {
        const search = req.query.search || '';
        const currentUserId = req.user._id;
        const user = await User.find({
            $and:[
                {
                    $or:[
                        {username:{$regex:'.*'+search+'.*',$options:'i'}},
                        {fullname:{$regex:'.*'+search+'.*',$options:'i'}}
                    ]
                },{
                    _id:{$ne:currentUserId}
                }
            ]
        }).select('-password').select("email");

        res.status(200).send(user);
    } catch (error) {
        res.status(500).send({  
            success:false,
            message:error.message
        })
        console.log(error);
    }

}        

// export const getCurrentChatters = async(req,res)=>{
//     try {
//         const currentUserId = req.user._id;
//         const currentChatters = await Conversation.find({
//             participants:currentUserId
//         }).sort({
//             updatedAt:-1
//         });
//         if(!currentChatters || currentChatters.length===0){
//             return res.status(200).send([]);
//         }
//         const participants = currentChatters.reduce((ids,conversations) => {
//             const otherParticipant = conversations.participants.filter(id => id !== currentUserId);
//             return [...ids,...otherParticipant];
//         })

//         const otherparticipantsIds = participants.filter(id => id.toString() !== currentUserId.toString());

//         const user = await User.find({_id:{$in:otherparticipantsIds}}).select('-password').select('-email');

//         const users = otherparticipantsIds.map(id => {
//             return user.find(user => user._id.toString() === id.toString());
//         })

//         res.status(200).send(users);

//     }catch(err){
//         res.status(500).send({  
//             success:false,
//             message:err.message
//         })
//         console.log(err);
//     }
// }

export const getCurrentChatters = async(req,res)=>{
    try {
        const currentUserId = req.user._id;
        const conversations = await Conversation.find({
            participants: currentUserId
        }).sort({
            updatedAt: -1
        });
        if (!conversations || conversations.length === 0) {
            return res.status(200).send([]);
        }
        const participants = conversations.reduce((ids, conversation) => {
            const others = conversation.participants.filter(id => id.toString() !== currentUserId.toString());
            return ids.concat(others);
        }, []);
        const uniqueParticipantIds = [...new Set(participants.map(id => id.toString()))];
        
        const users = await User.find({ _id: { $in: uniqueParticipantIds } }).select('-password').select('-email');
        res.status(200).send(users);

    }catch(err){
        res.status(500).send({  
            success:false,
            message:err.message
        })
        console.log(err);
    }
}
import React, { useEffect, useState } from 'react'
import { FaSearch } from 'react-icons/fa'
import axios from 'axios';
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom'
import { IoArrowBackSharp } from 'react-icons/io5';
import { BiLogOut } from "react-icons/bi";
import userConversation from '../../Zustans/userConversations.js';
import { useSocketContext } from '../../context/SocketContext';

const Sidebar = ({ onSelectUser }) => {

    const navigate = useNavigate();
    const { authUser, setAuthUser } = useAuth();
    const [searchInput, setSearchInput] = useState('');
    const [searchUser, setSearchuser] = useState([]);
    const [chatUser, setChatUser] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedUserId, setSetSelectedUserId] = useState(null);
    const [newMessageUsers, setNewMessageUsers] = useState('');
    const {messages , setMessage, selectedConversation ,  setSelectedConversation} = userConversation();
    const { onlineUser , socket} = useSocketContext();

    const nowOnline = chatUser.map((user)=>(user._id));
    //chats function
    // const isOnline = nowOnline.map(userId => onlineUser.includes(userId));f 
    const isOnline = nowOnline.map(userId => (onlineUser || []).includes(userId));

    useEffect(() => {
  if (!socket) return;

  const handleNewMessage = (newMessage) => {
    setNewMessageUsers(newMessage);

    // If the user is not already in chatUser, fetch chatUser list again
    const exists = chatUser.some(u => u._id === newMessage.senderId || u._id === newMessage.reciverId);
    if (!exists) {
      fetchChatUsers();
    }
  };

  socket.on("newMessage", handleNewMessage);

  return () => socket.off("newMessage", handleNewMessage);
}, [socket, chatUser]);

// extract fetch function so it can be reused
const fetchChatUsers = async () => {
  setLoading(true);
  try {
    const chatters = await axios.get(`/api/user/currentchatters`);
    const data = chatters.data;
    if (data.success !== false) {
      setChatUser(data);
    }
  } catch (error) {
    console.log(error);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchChatUsers();
}, []);

    
    //show user from the search result
    const handelSearchSubmit = async (e) => {
        e.preventDefault();
        setLoading(true)
        try {
            const search = await axios.get(`/api/user/search?search=${searchInput}`);
            const data = search.data;
            if (data.success === false) {
                setLoading(false)
                console.log(data.message);
            }
            setLoading(false)
            if (data.length === 0) {
                toast.info("User Not Found")
            } else {
                setSearchuser(data)
            }
        } catch (error) {
            setLoading(false)
            console.log(error);
        }
    }

    //show which user is selected
    const handelUserClick = (user) => {
        onSelectUser(user);
        setSelectedConversation(user);
        setSetSelectedUserId(user._id);
        setNewMessageUsers('')
    }

    //back from search result
    const handSearchback = () => {
        setSearchuser([]);
        setSearchInput('')
    }

    //logout
    const handelLogOut = async () => {

        const confirmlogout = window.prompt("type 'UserName' To LOGOUT");
        if (confirmlogout === authUser.username) {
            setLoading(true)
            try {
                const logout = await axios.post('/api/auth/logout')
                const data = logout.data;
                if (data?.success === false) {
                    setLoading(false)
                    console.log(data?.message);
                }
                toast.info(data?.message)
                localStorage.removeItem('chatapp')
                setAuthUser(null)
                setLoading(false)
                navigate('/login')
            } catch (error) {
                setLoading(false)
                console.log(error);
            }
        } else {
            toast.info("LogOut Cancelled")
        }

    }

    return (
        <div className="h-full w-full px-2 flex flex-col">
  {/* Search + Profile */}
  <div className="flex justify-between items-center gap-2">
    <form
      onSubmit={handelSearchSubmit}
      className="flex items-center bg-white rounded-full shadow px-3 w-full max-w-[300px]"
    >
      <input
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        type="text"
        className="px-2 py-2 w-full bg-transparent outline-none text-gray-800 placeholder-gray-400"
        placeholder="Search user..."
      />
      <button
        type="submit"
        className="btn btn-circle border-white bg-white hover:bg-gray-900 text-sky-700 "
      >
        <FaSearch size={18} />
      </button>
    </form>

    <img
      onClick={() => navigate(`/profile/${authUser?._id}`)}
      src={authUser?.profilepic}
      alt="Profile"
      className="h-12 w-12 rounded-full border cursor-pointer hover:scale-110 transition-transform"
    />
  </div>

  <div className="divider my-2"></div>

  {/* Search Results */}
  {searchUser?.length > 0 ? (
    <>
      <div className="flex-1 overflow-y-auto scrollbar-thin pr-1 text-white">
        {searchUser.map((user, index) => (
          <div key={user._id}>
            <div
              onClick={() => handelUserClick(user)}
              className={`flex items-center gap-3 p-2 rounded cursor-pointer transition 
                hover:bg-sky-100 ${
                  selectedUserId === user?._id ? "bg-sky-500 text-white" : "text-white"
                }`}
            >
              {/* Online Status */}
              <div className={`avatar ${isOnline[index] ? "online" : ""}`}>
                <div className="w-12 h-12 rounded-full">
                  <img src={user.profilepic} alt="user" />
                </div>
              </div>
              <div className="flex flex-col flex-1">
                <p
                  className={`font-semibold ${
                    selectedUserId === user?._id
                      ? "text-white"
                      : "text-white"
                  }`}
                >
                  {user.username}
                </p>
              </div>
            </div>
            <div className="divider h-[1px] my-1"></div>
          </div>
        ))}
      </div>

      {/* Back Button */}
      <div className="mt-2 flex justify-center">
        <button
          onClick={handSearchback}
          className="bg-white rounded-full p-2 shadow hover:bg-sky-100"
        >
          <IoArrowBackSharp size={22} className="text-gray-700" />
        </button>
      </div>
    </>
  ) : (
    <>
      {/* Default Chat User List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin pr-1">
        {chatUser.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-yellow-500 font-bold text-lg mt-6">
            <h1>Why are you alone!! 🤔</h1>
            <h1>Search username to chat</h1>
          </div>
        ) : (
          chatUser.map((user, index) => (
            <div key={user._id}>
              <div
                onClick={() => handelUserClick(user)}
                className={`flex items-center gap-3 p-2 rounded cursor-pointer transition 
                  hover:bg-sky-100 ${
                    selectedUserId === user?._id ? "bg-sky-500 text-white" : ""
                  }`}
              >
                {/* Online Status */}
                <div className={`avatar ${isOnline[index] ? "online" : ""}`}>
                  <div className="w-12 h-12 rounded-full">
                    <img src={user.profilepic} alt="user" />
                  </div>
                </div>

                <div className="flex flex-col flex-1">
                  <p
                    className={`font-semibold ${
                      selectedUserId === user?._id
                        ? "text-white"
                        : "text-white"
                    }`}
                  >
                    {user.username}
                  </p>
                </div>

                {/* New Message Indicator */}
                {newMessageUsers.reciverId === authUser._id &&
                newMessageUsers.senderId === user._id ? (
                  <div className="rounded-full bg-green-600 text-xs text-white px-2 py-[2px]">
                    +1
                  </div>
                ) : null}
              </div>
              <div className="divider h-[1px] my-1"></div>
            </div>
          ))
        )}
      </div>

      {/* Logout */}
      <div className="mt-2 flex items-center gap-2 px-2">
        <button
          onClick={handelLogOut}
          className="hover:bg-red-600 p-2 w-10 h-10 flex items-center justify-center rounded-lg cursor-pointer transition text-red-600 hover:text-white"
        >
          <BiLogOut size={22} />
        </button>
        <p className="text-sm text-gray-600">Logout</p>
      </div>
    </>
  )}
</div>

    )
}

export default Sidebar
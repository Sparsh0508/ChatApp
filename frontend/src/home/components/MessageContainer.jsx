import React, { useEffect, useState, useRef } from "react";
import userConversation from "../../Zustans/userConversations";
import { useAuth } from "../../context/AuthContext";
import { TiMessages } from "react-icons/ti";
import { IoArrowBackSharp, IoSend } from "react-icons/io5";
import axios from "axios";
import { useSocketContext } from "../../context/SocketContext";
import notify from "../../assets/jai_shri_ram.mp3";

const MessageContainer = ({ onBackUser }) => {
  const {
    messages,
    selectedConversation,
    setMessage,
    setSelectedConversation,
  } = userConversation();
  const { socket } = useSocketContext();
  const { authUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendData, setSendData] = useState("");
  const lastMessageRef = useRef();

  useEffect(() => {
    socket?.on("newMessage", (newMessage) => {
      const sound = new Audio(notify);
      sound.play();
      setMessage([...messages, newMessage]);
    });

    return () => socket?.off("newMessage");
  }, [socket, setMessage, messages]);

  useEffect(() => {
    setTimeout(() => {
      lastMessageRef?.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [messages]);

  useEffect(() => {
    const getMessages = async () => {
      setLoading(true);
      try {
        const get = await axios.get(
          `/api/message/${selectedConversation?._id}`
        );
        const data = await get.data;
        if (data.success === false) {
          setLoading(false);
          console.log(data.message);
        }
        setLoading(false);
        setMessage(data);
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    };

    if (selectedConversation?._id) getMessages();
  }, [selectedConversation?._id, setMessage]);
  console.log(messages);

  const handleMessages = (e) => {
    setSendData(e.target.value);
  };

  const handelSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await axios.post(
        `/api/message/send/${selectedConversation?._id}`,
        { message: sendData }
      );
      const data = await res.data;
      if (data.success === false) {
        setSending(false);
        console.log(data.message);
      }
      setSending(false);
      setSendData("");
      setMessage([...messages, data]);
    } catch (error) {
      setSending(false);
      console.log(error);
    }
  };

  return (
    <div className="md:min-w-[500px] h-[500px] flex flex-col py-2">
      {selectedConversation === null ? (
        <div className="flex items-center justify-center w-full h-full">
          <div
            className="px-4 text-center text-2xl text-gray-900 font-semibold 
        flex flex-col items-center gap-2"
          >
            <p className="text-2xl">Welcome!!👋 {authUser.username}😉</p>
            <p className="text-lg text-gray-600">
              Select a chat to start messaging
            </p>
            <TiMessages className="text-6xl text-sky-600" />
          </div>
        </div>
      ) : (
        <>
          {/* Chat Header */}
          <div
            className="flex justify-between gap-1 bg-sky-600 md:px-4 px-2 
        rounded-lg h-12 items-center shadow"
          >
            <div className="flex items-center gap-2 w-full">
              <div className="md:hidden">
                <button
                  onClick={() => onBackUser(true)}
                  className="bg-white rounded-full p-1 shadow"
                >
                  <IoArrowBackSharp size={22} className="text-sky-600" />
                </button>
              </div>
              <img
                className="rounded-full w-8 h-8 md:w-10 md:h-10 object-cover border"
                src={selectedConversation?.profilepic}
              />
              <span className="text-gray-900 text-sm md:text-lg font-bold">
                {selectedConversation?.username}
              </span>
            </div>
          </div>

          {/* Messages Section */}
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2">
            {loading && (
              <div className="flex w-full h-full flex-col items-center justify-center gap-4">
                <div className="loading loading-spinner text-sky-600"></div>
              </div>
            )}

            {!loading && messages?.length === 0 && (
              <p className="text-center text-gray-400">
                Send a message to start conversation
              </p>
            )}

            {!loading &&
              messages?.length > 0 &&
              messages?.map((message) => (
                <div key={message?._id} ref={lastMessageRef}>
                  <div
                    className={`chat ${
                      message.senderId === authUser._id
                        ? "chat-end"
                        : "chat-start"
                    }`}
                  >
                    <div
                      className={`chat-bubble text-white ${
                        message.senderId === authUser._id
                          ? "bg-sky-600"
                          : "bg-gray-600"
                      }`}
                    >
                      {message?.message}
                    </div>
                    <div className="chat-footer text-[10px] text-gray-400 mt-1">
                      {new Date(message?.createdAt).toLocaleDateString("en-IN")}{" "}
                      {new Date(message?.createdAt).toLocaleTimeString(
                        "en-IN",
                        {
                          hour: "numeric",
                          minute: "numeric",
                        }
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Message Input */}
          <form
            onSubmit={handelSubmit}
            className="w-full mt-2 flex items-center px-2"
          >
            <div className="w-full flex items-center bg-white rounded-full shadow px-2">
              <input
                value={sendData}
                onChange={handleMessages}
                required
                id="message"
                type="text"
                placeholder="Type a message..."
                className="w-full bg-transparent outline-none px-3 py-2 rounded-full text-gray-900"
              />
              <button type="submit" className="ml-2">
                {sending ? (
                  <div className="loading loading-spinner text-sky-600"></div>
                ) : (
                  <IoSend
                    size={22}
                    className="text-sky-600 cursor-pointer rounded-full p-1 hover:bg-sky-100"
                  />
                )}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default MessageContainer;

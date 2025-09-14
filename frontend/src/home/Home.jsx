import { useAuth } from "../context/AuthContext";
import Sidebar from "./components/Sidebar.jsx";
import MessageContainer from "./components/MessageContainer.jsx";
import React, { useEffect, useState } from 'react';




const Home = () => {
  const { authUser } = useAuth();

  const [selectedUser , setSelectedUser] = useState(null);
  const [isSidebarVisible , setIsSidebarVisible]= useState(true);

  const handelUserSelect=(user)=>{
    setSelectedUser(user);
    setIsSidebarVisible(false);
  }
  const handelShowSidebar=()=>{
    setIsSidebarVisible(true);
    setSelectedUser(null);
  }

  return (
    <div
  className="flex justify-between w-full md:min-w-[650px] md:max-w-[65%] px-2 h-[95%] md:h-full rounded-xl shadow-lg bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-0"
>
  {/* Sidebar */}
  <div
    className={`w-full py-2 md:flex ${isSidebarVisible ? "" : "hidden"}`}
  >
    <Sidebar onSelectUser={handelUserSelect} />
  </div>

  {/* Divider (only show when sidebar & user selected) */}
  <div
    className={`divider divider-horizontal px-3 md:flex ${
      isSidebarVisible && selectedUser ? "block" : "hidden"
    }`}
  ></div>

  {/* Message container */}
  <div
    className={`flex-auto ${
      selectedUser ? "flex" : "hidden md:flex"
    } `}
  >
    <MessageContainer onBackUser={handelShowSidebar} />
  </div>
</div>

  );
};

export default Home;
Home;

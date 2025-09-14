import { createContext, useContext, useEffect , useState} from "react";
import io from "socket.io-client";
import { useAuth } from "./AuthContext.jsx";

const SocketContext = createContext();

export const useSocketContext = () => {
  return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { authUser } = useAuth();

  useEffect(() => {
    if (authUser) {
      const socket = io("https://chatlify-4x5z.onrender.com/", {
        query: {
          userId: authUser?._id,
        },
      });
      socket.on("getOnlineUsers", (users) => {
        setOnlineUsers(users);
      });
      setSocket(socket);
      return () => socket.close();
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [authUser]);
  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

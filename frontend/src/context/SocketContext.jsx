import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

// Dùng global socket để không bị mất kết nối hay dính reconnect loop khi Vite HMR hoặc React re-render
let globalSocket = null;

export const SocketProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Nếu chưa đăng nhập hoặc không có token
    if (!isAuthenticated || !token) {
      if (globalSocket) {
        globalSocket.disconnect();
        globalSocket = null;
      }
      if (socketRef.current) {
        socketRef.current = null;
      }
      setConnected(false);
      return;
    }

    // Chỉ khởi tạo kết nối MỚI nếu socket chưa tồn tại (chưa có globalSocket)
    if (!globalSocket) {
      globalSocket = io(import.meta.env.VITE_API_SOCKET_URL || "http://localhost:5000", {
        auth: { token },
        transports: ["websocket"],
      });

      globalSocket.on("connect", () => {
        setConnected(true);
        console.log("🔌 Socket connected (Singleton):", globalSocket.id);
      });

      globalSocket.on("disconnect", (reason) => {
        setConnected(false);
        console.log("❌ Socket disconnected (Singleton). Reason:", reason);
        // Nếu server ngắt hoặc do transport lỗi, nó sẽ tự reconnect theo cơ chế mặc định
      });

      globalSocket.on("connect_error", (err) => {
        console.warn("Socket connect error:", err.message);
      });
    } else {
      // Nếu globalSocket đã có sẵn, chỉ cần update state
      setConnected(globalSocket.connected);
    }

    socketRef.current = globalSocket;

    // KHÔNG gọi globalSocket.disconnect() trong cleanup để tránh Vite HMR làm rớt mạng liên tục.
    return () => {
      // Chỉ cleanup các event listener (nếu có add trực tiếp) chứ không dập socket connection
    };
  }, [isAuthenticated, token]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

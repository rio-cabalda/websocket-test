"use client";

import { useState, useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";

export default function Home() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [serverUrl, setServerUrl] = useState("http://localhost:5000");

  // Function to connect to WebSocket server
  const connectWebSocket = useCallback(() => {
    try {
      const socketInstance = io(serverUrl, {
        reconnectionAttempts: 5,
        timeout: 10000,
      });

      socketInstance.on("connect", () => {
        const timestamp = new Date().toLocaleTimeString();
        setConnected(true);
        setMessages((prev) => [
          ...prev,
          `${timestamp}: Connected to WebSocket server at ${serverUrl}`,
        ]);
      });

      socketInstance.on("connect_error", (error) => {
        const timestamp = new Date().toLocaleTimeString();
        setMessages((prev) => [
          ...prev,
          `${timestamp}: Connection error: ${error.message}`,
        ]);
      });

      socketInstance.on("disconnect", () => {
        const timestamp = new Date().toLocaleTimeString();
        setConnected(false);
        setMessages((prev) => [
          ...prev,
          `${timestamp}: Disconnected from WebSocket server`,
        ]);
      });

      socketInstance.on("message", (data) => {
        const timestamp = new Date().toLocaleTimeString();
        setMessages((prev) => [...prev, `${timestamp}: Received: ${data}`]);
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        `Error: ${error instanceof Error ? error.message : String(error)}`,
      ]);
    }
  }, [serverUrl]);

  // Function to disconnect from WebSocket server
  const disconnectWebSocket = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  }, [socket]);

  // Function to send a message
  const sendMessage = useCallback(() => {
    if (socket && inputMessage.trim()) {
      socket.emit("message", inputMessage);
      const timestamp = new Date().toLocaleTimeString();
      setMessages((prev) => [...prev, `${timestamp} Sent: ${inputMessage}`]);
      setInputMessage("");
    }
  }, [socket, inputMessage]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch(serverUrl + "/ping", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      })
        .then((response) => response.json())
        .then((data) => console.log(data))
        .catch((error) => console.error("Error:", error));
      console.log("Ping backend");
    }, 600000); // 10 minutes in milliseconds

    return () => clearInterval(interval);
  }, [serverUrl]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">
        WebSocket Test App
      </h1>

      <div className="w-full max-w-md mb-8 p-6 bg-white rounded-lg shadow-md">
        <div className="mb-4">
          <label
            htmlFor="server-url"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            WebSocket Server URL
          </label>
          <input
            id="server-url"
            type="text"
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
            className="w-full px-4 py-2 border text-gray-900 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-4 mb-4">
          {!connected ? (
            <button
              onClick={connectWebSocket}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Connect
            </button>
          ) : (
            <button
              onClick={disconnectWebSocket}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Disconnect
            </button>
          )}
        </div>

        {connected && (
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border text-gray-900 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Send
            </button>
          </div>
        )}
      </div>

      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 h-fit overflow-y-hidden">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Messages</h2>
        <div className="border border-gray-200 rounded-md p-3 h-64 overflow-y-auto bg-gray-50">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No messages yet</p>
          ) : (
            <ul className="space-y-2">
              {messages.map((msg, index) => (
                <li
                  key={index}
                  className={`p-2 rounded-md text-sm ${
                    msg.includes("Sent:")
                      ? "bg-blue-100 text-blue-800"
                      : msg.includes("Received:")
                      ? "bg-green-100 text-green-800"
                      : msg.includes("Error:") ||
                        msg.includes("Connection error:")
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {msg}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-8 text-sm text-gray-500 max-w-md text-center">
        <p>
          This is a simple WebSocket test application. Connect to your WebSocket
          server, send messages, and see the responses in real-time.
        </p>
      </div>
    </div>
  );
}

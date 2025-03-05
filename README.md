# WebSocket Test App

A simple Next.js application for testing WebSocket connections.

## Features

- Connect to any WebSocket server
- Send messages to the server
- Receive and display messages from the server
- Real-time connection status
- Error handling for connection issues

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn

### Installation

1. Clone this repository:

```bash
git clone <repository-url>
cd websocket-test
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

1. Enter the WebSocket server URL in the input field (default: http://localhost:3001)
2. Click the "Connect" button to establish a WebSocket connection
3. Once connected, you can send messages using the input field and "Send" button
4. All sent and received messages will be displayed in the Messages section
5. Click "Disconnect" to close the WebSocket connection

## Testing with a Simple WebSocket Server

You can test this application with a simple WebSocket server. Here's how to create one using Node.js and Socket.IO:

1. Create a new directory for your server:

```bash
mkdir websocket-server
cd websocket-server
```

2. Initialize a new Node.js project:

```bash
npm init -y
```

3. Install Socket.IO:

```bash
npm install socket.io cors
```

4. Create a file named `server.js` with the following content:

```javascript
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Echo back any messages received
  socket.on("message", (data) => {
    console.log("Message received:", data);
    socket.emit("message", `Echo: ${data}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});
```

5. Start the server:

```bash
node server.js
```

Now you can use the WebSocket Test App to connect to this server at `http://localhost:3001`.

## License

This project is licensed under the MIT License.

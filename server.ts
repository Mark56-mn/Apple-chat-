import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import http from "http";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import RedisManager from "./src/lib/redis";
import clientPromise from "./src/lib/mongodb";
import apiRouter from "./src/routes/api";

async function startServer() {
  const app = express();
  const PORT = 3000;
  const httpServer = http.createServer(app);
  
  app.use("/api", apiRouter);

  const io = new Server(httpServer, {
    cors: {
      origin: "*", 
    }
  });

  // Setup Redis adapter for Socket.io scaling
  const { pub, sub } = RedisManager.getClients();
  if (pub && sub) {
    Promise.all([pub.connect(), sub.connect()]).then(() => {
      io.adapter(createAdapter(pub, sub));
      console.log('Socket.io Redis adapter attached');
    }).catch(err => {
      console.warn('Could not connect to Redis for PubSub:', err.message);
    });
  }

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/trade/execute", express.json(), async (req, res) => {
    const { userId, assetSymbol, type, amount, currentPrice } = req.body;
    
    // 1. Randomized Latency (1000ms - 3000ms)
    const latencyMs = Math.floor(Math.random() * 2000) + 1000;
    await new Promise(resolve => setTimeout(resolve, latencyMs));

    // 2. Flash Crash Simulator (5% chance of -10% spike)
    const isFlashCrash = Math.random() < 0.05;
    const basePrice = isFlashCrash ? currentPrice * 0.90 : currentPrice;

    // 3. Aggressive Slippage (1.5% - 3.0%)
    const slippagePercent = (Math.random() * 1.5 + 1.5);
    const slippageMultiplier = slippagePercent / 100;
    
    const executionPrice = type === 'buy' 
      ? basePrice * (1 + slippageMultiplier)
      : basePrice * (1 - slippageMultiplier);

    let virtualBalanceUsd = 10000;
    let fallbackToMock = true;

    try {
      const client = await clientPromise;
      const db = client.db('apple-chat');
      const user = await db.collection("users").findOne({ id: userId });
      if (user) {
        virtualBalanceUsd = user.virtualBalanceUsd;
        fallbackToMock = false;
      }
    } catch (e: any) {
      console.warn("MongoDB access failed, using mocked balance", e?.toString());
    }

    const tradeValue = amount * executionPrice;
    let feePercent = 0.001; // Base 0.1%
    let isPanicFee = false;

    // 4. Panic Fee (if > 20% of balance)
    if (tradeValue > virtualBalanceUsd * 0.2) {
       feePercent += 0.02; // Add 2%
       isPanicFee = true;
    }

    const feesApplied = tradeValue * feePercent;
    const totalCost = type === 'buy' ? tradeValue + feesApplied : tradeValue - feesApplied;

    try {
       if (!fallbackToMock) {
         const client = await clientPromise;
         const db = client.db('apple-chat');
         
         await db.collection("trades").insertOne({
            userId, assetSymbol, type, amount, executionPrice, appliedSlippage: slippagePercent, executionDelayMs: latencyMs, feesApplied
         });
         
         await db.collection("users").updateOne(
            { id: userId },
            { $set: { virtualBalanceUsd: type === 'buy' ? virtualBalanceUsd - totalCost : virtualBalanceUsd + totalCost } }
         );
       }
    } catch(e: any) {
       console.warn("Failed to persist via MongoDB", e?.toString());
    }

    res.json({
       success: true,
       latencyMs,
       originalPrice: currentPrice,
       executionPrice,
       slippageApplied: slippagePercent,
       feesApplied,
       isFlashCrash,
       isPanicFee,
       totalCost
    });
  });

  // Socket.io connection logic
  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId as string;
    if (userId) {
      socket.join(`user_${userId}`); // Join personal room for private events
      console.log(`User connected: ${userId}`);
    }

    // Join a specific chat room
    socket.on('join_room', (roomId: string) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    // Handle sending message
    socket.on('send_message', async ({ tempId, message }) => {
      try {
        // Broadcast immediately to the room (optimistic delivery)
        socket.to(message.chatRoomId).emit('receive_message', message);
        
        // Acknowledge back to sender
        socket.emit('message_sent', { tempId, message });

        // Save to MongoDB asynchronously
        if (process.env.MONGODB_URI || process.env.NODE_ENV === 'development') {
          try {
            const client = await clientPromise;
            const db = client.db('apple-chat');
            await db.collection("messages").insertOne({
              chatRoomId: message.chatRoomId,
              senderId: message.senderId,
              receiverId: message.receiverId,
              content: message.content,
              type: message.type,
              isRead: false,
              timestamp: message.timestamp
            });
          } catch(dbErr) {
            console.error('Failed to save message to MongoDB', dbErr);
          }
        }
      } catch (err) {
        socket.emit('message_error', { tempId, roomId: message.chatRoomId });
      }
    });

    // Typing indicators
    socket.on('typing', ({ roomId, isTyping }) => {
      socket.to(roomId).emit('typing_indicator', { roomId, userId, isTyping });
    });

    // Read receipts
    socket.on('read_messages', ({ roomId, messageIds }) => {
      socket.to(roomId).emit('read_receipt', { roomId, messageIds });
      
      // Update DB
      if (process.env.MONGODB_URI || process.env.NODE_ENV === 'development') {
        clientPromise.then(client => {
          const db = client.db('apple-chat');
          db.collection("messages").updateMany(
            { _id: { $in: messageIds } },
            { $set: { isRead: true } }
          ).catch(console.error);
        });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

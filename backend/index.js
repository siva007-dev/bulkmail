import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.APPLICATION_URL }));
app.use(express.json());

/* ---------------- DB CONNECTION (CACHED) ---------------- */

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  try {
    const db = await mongoose.connect(process.env.MONGODB_URL, {
      bufferCommands: false
    });
    isConnected = db.connections[0].readyState;
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed", error);
    throw error;
  }
}

/* ---------------- MODEL ---------------- */

const Credential = mongoose.model("credential", {}, "bulkmail");

/* ---------------- ROUTE ---------------- */

app.post("/sendemail", async (req, res) => {
  try {
    // 1️⃣ Ensure DB is connected
    await connectDB();

    // 2️⃣ Fetch credentials
    const data = await Credential.find();

    if (!data.length) {
      return res.status(500).send("Email credentials not found");
    }

    // 3️⃣ Setup mail transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: data[0].user,
        pass: data[0].pass
      }
    });

    const { msg, emaillist } = req.body;

    // 4️⃣ Send emails (parallel & fast)
    await Promise.all(
      emaillist.map(email =>
        transporter.sendMail({
          from: data[0].user,
          to: email,
          subject: "Message from BulkMail",
          text: msg
        })
      )
    );

    res.send(true);

  } catch (error) {
    console.error(error);
    res.status(500).send(false);
  }
});

/* ---------------- EXPORT FOR VERCEL ---------------- */

export default app;

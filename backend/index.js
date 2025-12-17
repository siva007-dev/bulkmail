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

/* ---------------- MODEL & SCHEMA ----- */

const credentialSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      required: true
    },
    pass: {
      type: String,
      required: true
    }
  },
  { collection: "bulkmail" }
);

const Credential = mongoose.model("Credential", credentialSchema);


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

   const cred = data[0];

const user = typeof cred.user === "string" ? cred.user.trim() : "";
const pass = typeof cred.pass === "string" ? cred.pass.trim() : "";

console.log("USER:", user);
console.log("PASS LENGTH:", pass.length);

if (!user || !pass) {
  throw new Error("Email credentials missing in database");
}

    // 3️⃣ Setup mail transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass
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

// app.listen(5000,()=>{
//     console.log("server is started...")
// })


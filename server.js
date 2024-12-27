import fs from 'fs';
import express from "express";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import groupRoutes from "./routes/groupRoutes.js";
import connectDB from "./backend/src/config/db.js";
import bodyParser from "body-parser";
import { getSpendingInsights } from "./controllers/insightsController.js";
import path from "path";
import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config();

// import categoryRoutes from "./routes/categoryRoutes.js";
import {
  deleteUserController,
  fetchBudgets,
  loginController,
  logout,
  registerController,
  setZeroBalance,
  userDetails,
} from "./controllers/authController.js";
import {
  contributeAmount,
  contributor,
} from "./controllers/ContributeController.js";

const app = express();
const port =process.env.PORT || 5000;

//for logging 
app.use(morgan("combined"));

app.use(cors());
app.use(express.json());
// Serve the public/images directory
app.use("/public", express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));


console.log("Attempting to start the server...");
connectDB();

// app.use(
//   session({
//     secret: "mysecretkey",
//     resave: false,
//     saveUninitialized: true,
//   })
// ); this was messagetore, below is mongostore
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: "sessions",
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);


if (process.env.NODE_ENV === "production") {
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, "dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "dist", "index.html"));
  });
}

app.post("/register", registerController);
app.post("/login", loginController);
app.post("/delete", deleteUserController);
app.get("/getuser/:id", userDetails);
app.post("/logout", logout);
app.post("/setzerobalance", setZeroBalance);

app.post("/contribute/email", contributor);
app.post("/contribute/amount", contributeAmount);

app.post("/fetchBudgets", fetchBudgets);

// group routes
app.use("/api/groups", groupRoutes);
app.post("/save-image", async (req, res) => {
  const { image } = req.body;
  const base64Data = image.replace(/^data:image\/png;base64,/, "");
  const imageSavePath = path.join(__dirname,"public", "images", "captured-chart.png");

  fs.writeFile(imageSavePath, base64Data, "base64", (err) => {
    if (err) {
      console.error("Error saving the image:", err);
      res.status(500).json({ error: "Failed to save the image" });
    } else {
      console.log("Image saved successfully");
      res.status(200).json({ message: "Image saved successfully" });
    }
  });
});


app.post("/api/insights", getSpendingInsights);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
import fs from 'fs';
import express from "express";
import cors from "cors";
import session from "express-session";
import groupRoutes from "./routes/groupRoutes.js";
import connectDB from "./backend/src/config/db.js";
import bodyParser from "body-parser";
import { getSpendingInsights } from "./controllers/insightsController.js";
import path from "path";

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

app.use(cors());
app.use(express.json());

app.use(
  session({
    secret: "mysecretkey",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use(express.urlencoded({ extended: false }));
console.log("Attempting to start the server...");
connectDB();

if (process.env.NODE_ENV === "production") {
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, "dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "dist", "index.html"));
  });
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
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
  const { image } = await req.body;

  // Decode the data URL and save the image to the public/images/ directory
  const base64Data = image.replace(/^data:image\/png;base64,/, "");
  fs.writeFile(
    "C:/Users/vishe/Desktop/Mayank_Workspace/ReactProject/src/images/captured-chart.png",
    base64Data,
    "base64",
    (err) => {
      if (err) {
        console.error("Error saving the image:", err);
        res.status(500).json({ error: "Failed to save the image" });
      } else {
        console.log("Image saved successfully");
        res.status(200).json({ message: "Image saved successfully" });
      }
    }
  );
});


app.post("/api/insights", getSpendingInsights);
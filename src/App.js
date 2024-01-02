import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import { dirname } from "path";
// const fileUpload = require("express-fileupload");
import fileUpload from "express-fileupload";

import routes from "./routes/routes.js";
// import { invalidPathHandler } from "./middlewares/errorHandler.js";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// app.use(cors({ origin: "*" }));

const allowedOrigins = [
  "http://localhost:3000",
  "https://quiz-app-backend-cloud.azurewebsites.net",
  "https://dev-routes-rk.netlify.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      const isAllowed = allowedOrigins.includes(origin) || !origin;
      callback(null, isAllowed);
    },
    credentials: true, // Set the credentials option to true
  })
);

app.use(express.json());
app.use(cookieParser());

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, "/tmp"),
  })
);

app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.send("Happy new year!");
});
app.use("/api/v1", routes);

app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// app.use(invalidPathHandler);

// app.use("*", (req, res) => {
//   res.status(404).json({ error: "not found" });
// });

export default app;

import { app } from "./app.js";
import connectDB from "./db/index.js";
import "dotenv/config";

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log("app listening on port", process.env.PORT);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection failed (from src/index.js)", error);
  });

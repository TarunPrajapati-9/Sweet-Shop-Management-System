import { Application, Request, Response } from "express";
import express from "express";
import sweetRouter from "./routes/sweet.route";
import orderRouter from "./routes/order.route";

// Create an Express application
const app: Application = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Router for handling API routes
app.use("/sweets", sweetRouter);
app.use("/orders", orderRouter);

// root route to test server
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the Sweet Shop Management System!");
});

export default app;

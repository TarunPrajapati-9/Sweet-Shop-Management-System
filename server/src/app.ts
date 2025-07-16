import { Application, Request, Response } from "express";
import express from "express";

// Create an Express application
const app: Application = express();

// root route to test server
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the Sweet Shop Management System!");
});

export default app;

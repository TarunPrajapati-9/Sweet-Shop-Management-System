import { Router } from "express";

const purchaseRouter = Router();

// GET ROUTES
purchaseRouter.get("/"); // Define the route to get all purchases
purchaseRouter.get("/:id"); // Define the route to get a purchase by ID

// POST ROUTES
purchaseRouter.post("/"); // Define the route to create a new purchase (multiple sweets)

export default purchaseRouter;

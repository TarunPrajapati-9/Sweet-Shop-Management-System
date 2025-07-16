import { Router } from "express";
import {
  getSweets,
  addSweet,
  deleteSweet,
} from "../controllers/sweet.controller";

// create a router instance for sweets
const sweetRouter = Router();

// all routes related to sweets

//GET ROUTES
sweetRouter.get("/", getSweets); // Define the route to get all sweets
sweetRouter.get("/stock"); // Define the route to get sweets in stock or out of stock
sweetRouter.get("/search/"); // Define the route to get sweets by search query
sweetRouter.get("/:id"); // Define the route to get a sweet by ID (if needed)

// POST ROUTES
sweetRouter.post("/", addSweet); // Define the route to add a new sweet

// PUT ROUTES
sweetRouter.put("/:id"); // Define the route to update major fields of sweet by ID (if needed)

// PATCH ROUTES
sweetRouter.patch("/:id/restock"); // Define the route to update stock of a sweet by ID (if needed)

// DELETE ROUTES
sweetRouter.delete("/:id", deleteSweet); // Define the route to delete a sweet by ID

export default sweetRouter;

import { Router } from "express";
import {
  getSweets,
  getSweetById,
  checkStock,
  searchSweets,
  addSweet,
  deleteSweet,
  updateSweet,
  restockSweet,
} from "../controllers/sweet.controller";

// create a router instance for sweets
const sweetRouter = Router();

//GET ROUTES
sweetRouter.get("/", searchSweets); // Define the route to get all sweets or search with query parameters
sweetRouter.get("/check-stock", checkStock); // Define the route to get sweets in stock or out of stock
sweetRouter.get("/:id", getSweetById); // Define the route to get a sweet by ID

// POST ROUTES
sweetRouter.post("/", addSweet); // Define the route to add a new sweet

// PUT ROUTES
sweetRouter.put("/:id", updateSweet); // Define the route to update major fields of sweet by ID

// PATCH ROUTES
sweetRouter.patch("/:id/restock", restockSweet); // Define the route to update stock of a sweet by ID

// DELETE ROUTES
sweetRouter.delete("/:id", deleteSweet); // Define the route to delete a sweet by ID

export default sweetRouter;

import { Router } from "express";
import { getSweets, addSweet } from "../controllers/sweet.controller";

// create a router instance for sweets
const sweetRouter = Router();

// all routes related to sweets
sweetRouter.get("/", getSweets); // Define the route to get all sweets
sweetRouter.post("/", addSweet); // Define the route to add a new sweet

export default sweetRouter;

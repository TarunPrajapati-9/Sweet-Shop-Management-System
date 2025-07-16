import { Request, Response } from "express";
import sweets from "../data/sweetDB";
import { createResponse } from "../utils/response";
import { Sweet, validCategories } from "../types/sweet.type";
import { isValidSweet } from "../utils/validators";

export const getSweets = async (req: Request, res: Response): Promise<void> => {
  try {
    const items = sweets; //fetch items

    //return the sweets data with custom response format
    res
      .status(200)
      .json(createResponse(true, "All sweets fetched successfully", items));
  } catch (error) {
    res
      .status(500)
      .json(createResponse(false, "Internal Server Error", { error }));
  }
};

export const addSweet = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate the request body
    const error = isValidSweet(req.body);
    if (error) {
      res.status(400).json(createResponse(false, error, {}));
      return;
    }

    const { name, category, price, quantity }: Sweet = req.body;

    const newSweet: Sweet = {
      id: sweets.length + 1, // Simple ID generation
      name: name.trim(), // Trim whitespace from name
      category,
      price,
      quantity,
    };

    // Add the new sweet to the database (in-memory array)
    sweets.push(newSweet);
    res
      .status(201)
      .json(createResponse(true, "Sweet added successfully", newSweet));
  } catch (error) {
    res
      .status(500)
      .json(createResponse(false, "Internal Server Error", { error }));
  }
};

export const deleteSweet = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const sweetId = parseInt(req.params.id, 10);
    const sweetIndex = sweets.findIndex((s) => s.id === sweetId);

    if (sweetIndex === -1) {
      res.status(404).json(createResponse(false, "Sweet not found", {}));
      return;
    }

    // Remove the sweet from the database
    sweets.splice(sweetIndex, 1);
    res
      .status(200)
      .json(createResponse(true, "Sweet deleted successfully", {}));
  } catch (error) {
    res
      .status(500)
      .json(createResponse(false, "Internal Server Error", { error }));
  }
};

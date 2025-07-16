import { Request, Response } from "express";
import { prisma } from "../utils/client";
import { createResponse } from "../utils/response";
import { isValidSweet } from "../utils/validators";

export const getSweets = async (req: Request, res: Response): Promise<void> => {
  try {
    const items = await prisma.sweet.findMany(); //fetch items from database

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

    const { name, category, price, quantity } = req.body;

    // Check if a sweet with the same name already exists
    const existingSweet = await prisma.sweet.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: "insensitive", // Case-insensitive comparison (Kaju = kaju = KAJU)
        },
      },
    });

    if (existingSweet) {
      res
        .status(409)
        .json(
          createResponse(false, "A sweet with this name already exists", {})
        );
      return;
    }

    // Create the new sweet in the database using Prisma
    const newSweet = await prisma.sweet.create({
      data: {
        name: name.trim(), // Trim whitespace from name
        category,
        price,
        quantity,
      },
    });

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

    // Check if the sweet exists
    const existingSweet = await prisma.sweet.findUnique({
      where: { id: sweetId },
    });

    if (!existingSweet) {
      res.status(404).json(createResponse(false, "Sweet not found", {}));
      return;
    }

    // Delete the sweet from the database
    await prisma.sweet.delete({
      where: { id: sweetId },
    });

    res
      .status(200)
      .json(createResponse(true, "Sweet deleted successfully", {}));
  } catch (error) {
    res
      .status(500)
      .json(createResponse(false, "Internal Server Error", { error }));
  }
};

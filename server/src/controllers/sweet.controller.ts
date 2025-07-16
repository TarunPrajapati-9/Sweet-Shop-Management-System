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

export const getSweetById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const sweetId = parseInt(req.params.id, 10);

    // Check if the ID is a valid number
    if (isNaN(sweetId) || sweetId <= 0) {
      res.status(400).json(createResponse(false, "Invalid sweet ID", {}));
      return;
    }

    // Fetch the sweet from database
    const sweet = await prisma.sweet.findUnique({
      where: { id: sweetId },
    });

    // Check if sweet exists
    if (!sweet) {
      res.status(404).json(createResponse(false, "Sweet not found", {}));
      return;
    }

    // Return the sweet data with custom response format
    res
      .status(200)
      .json(createResponse(true, "Sweet fetched successfully", sweet));
  } catch (error) {
    res
      .status(500)
      .json(createResponse(false, "Internal Server Error", { error }));
  }
};

export const checkStock = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { stock } = req.query;

    // Validate stock parameter
    if (!stock) {
      res
        .status(400)
        .json(
          createResponse(
            false,
            "Stock parameter is required. Use 'available' or 'out'",
            {}
          )
        );
      return;
    }

    // Convert to lowercase for case-insensitive comparison
    const stockParam = (stock as string).toLowerCase();

    // Validate stock parameter value
    if (stockParam !== "available" && stockParam !== "out") {
      res
        .status(400)
        .json(
          createResponse(
            false,
            "Invalid stock parameter. Use 'available' or 'out'",
            {}
          )
        );
      return;
    }

    let sweets;
    let message;

    if (stockParam === "available") {
      // Fetch sweets with quantity > 0
      sweets = await prisma.sweet.findMany({
        where: {
          quantity: {
            gt: 0,
          },
        },
        orderBy: {
          id: "asc",
        },
      });
      message = "Available sweets fetched successfully";
    } else {
      // Fetch sweets with quantity = 0
      sweets = await prisma.sweet.findMany({
        where: {
          quantity: 0,
        },
        orderBy: {
          id: "asc",
        },
      });
      message = "Out of stock sweets fetched successfully";
    }

    // Return the filtered sweets data with custom response format
    res.status(200).json(createResponse(true, message, sweets));
  } catch (error) {
    res
      .status(500)
      .json(createResponse(false, "Internal Server Error", { error }));
  }
};

export const searchSweets = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, category, minPrice, maxPrice } = req.query;

    // Build the where clause dynamically based on provided query parameters
    const whereClause: any = {};

    // Name filter - case insensitive partial match
    if (name) {
      whereClause.name = {
        contains: name as string,
        mode: "insensitive",
      };
    }

    // Category filter - case insensitive exact match
    if (category) {
      whereClause.category = {
        equals: category as string,
        mode: "insensitive",
      };
    }

    // Price range filters
    if (minPrice || maxPrice) {
      whereClause.price = {};

      if (minPrice) {
        const minPriceNum = parseFloat(minPrice as string);
        if (isNaN(minPriceNum) || minPriceNum < 0) {
          res
            .status(400)
            .json(
              createResponse(
                false,
                "Invalid minPrice. Must be a positive number",
                {}
              )
            );
          return;
        }
        whereClause.price.gte = minPriceNum;
      }

      if (maxPrice) {
        const maxPriceNum = parseFloat(maxPrice as string);
        if (isNaN(maxPriceNum) || maxPriceNum < 0) {
          res
            .status(400)
            .json(
              createResponse(
                false,
                "Invalid maxPrice. Must be a positive number",
                {}
              )
            );
          return;
        }
        whereClause.price.lte = maxPriceNum;
      }

      // Validate that minPrice <= maxPrice if both are provided
      if (minPrice && maxPrice) {
        const minPriceNum = parseFloat(minPrice as string);
        const maxPriceNum = parseFloat(maxPrice as string);
        if (minPriceNum > maxPriceNum) {
          res
            .status(400)
            .json(
              createResponse(
                false,
                "minPrice cannot be greater than maxPrice",
                {}
              )
            );
          return;
        } else if (minPriceNum === maxPriceNum) {
          // If minPrice and maxPrice are equal, treat it as an exact price match
          whereClause.price = {
            equals: minPriceNum,
          };
        } else {
          whereClause.price.gte = minPriceNum;
          whereClause.price.lte = maxPriceNum;
        }
      }
    }

    // If no search parameters provided, return all sweets
    if (Object.keys(whereClause).length === 0) {
      const allSweets = await prisma.sweet.findMany({
        orderBy: {
          id: "asc",
        },
      });
      res
        .status(200)
        .json(
          createResponse(true, "All sweets fetched successfully", allSweets)
        );
      return;
    }

    // Fetch filtered sweets from database
    const sweets = await prisma.sweet.findMany({
      where: whereClause,
      orderBy: {
        id: "asc",
      },
    });

    // Generate appropriate success message
    const searchTerms = [];
    if (name) searchTerms.push(`name containing "${name}"`);
    if (category) searchTerms.push(`category "${category}"`);
    if (minPrice) searchTerms.push(`minimum price ${minPrice}`);
    if (maxPrice) searchTerms.push(`maximum price ${maxPrice}`);

    const message = `Sweets filtered by ${searchTerms.join(
      ", "
    )} fetched successfully`;

    // Return the filtered sweets data with custom response format
    res.status(200).json(createResponse(true, message, sweets));
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

    // Check if the ID is a valid number (parseInt returns NaN for invalid strings)
    if (isNaN(sweetId) || sweetId <= 0) {
      res.status(404).json(createResponse(false, "Sweet not found", {}));
      return;
    }

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

export const updateSweet = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const sweetId = parseInt(req.params.id, 10);

    // Check if the ID is a valid number
    if (isNaN(sweetId) || sweetId <= 0) {
      res.status(404).json(createResponse(false, "Sweet not found", {}));
      return;
    }

    // Validate the request body
    const error = isValidSweet(req.body);
    if (error) {
      res.status(400).json(createResponse(false, error, {}));
      return;
    }

    const { name, category, price, quantity } = req.body;

    // Check if the sweet exists
    const existingSweet = await prisma.sweet.findUnique({
      where: { id: sweetId },
    });

    if (!existingSweet) {
      res.status(404).json(createResponse(false, "Sweet not found", {}));
      return;
    }

    // Check if another sweet with the same name already exists (excluding current sweet)
    const duplicateSweet = await prisma.sweet.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: "insensitive",
        },
        NOT: {
          id: sweetId, // Exclude the current sweet being updated
        },
      },
    });

    if (duplicateSweet) {
      res
        .status(409)
        .json(
          createResponse(false, "A sweet with this name already exists", {})
        );
      return;
    }

    // Update the sweet in the database
    const updatedSweet = await prisma.sweet.update({
      where: { id: sweetId },
      data: {
        name: name.trim(),
        category,
        price,
        quantity,
      },
    });

    res
      .status(200)
      .json(createResponse(true, "Sweet updated successfully", updatedSweet));
  } catch (error) {
    res
      .status(500)
      .json(createResponse(false, "Internal Server Error", { error }));
  }
};

export const restockSweet = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const sweetId = parseInt(req.params.id, 10);

    // Check if the ID is a valid number
    if (isNaN(sweetId) || sweetId <= 0) {
      res.status(404).json(createResponse(false, "Sweet not found", {}));
      return;
    }

    // Validate quantity from request body
    const { quantity } = req.body;

    // Check if quantity is provided
    if (quantity === undefined || quantity === null) {
      res.status(400).json(createResponse(false, "Quantity is required", {}));
      return;
    }

    // Check if quantity is a valid number
    if (typeof quantity !== "number") {
      res
        .status(400)
        .json(createResponse(false, "Quantity must be a number", {}));
      return;
    }

    // Check if quantity is valid (non-negative)
    if (quantity < 0) {
      res
        .status(400)
        .json(
          createResponse(
            false,
            "Quantity must be greater than or equal to 0",
            {}
          )
        );
      return;
    }

    // Check if the sweet exists
    const existingSweet = await prisma.sweet.findUnique({
      where: { id: sweetId },
    });

    if (!existingSweet) {
      res.status(404).json(createResponse(false, "Sweet not found", {}));
      return;
    }

    // Update only the quantity in the database
    const restockedSweet = await prisma.sweet.update({
      where: { id: sweetId },
      data: {
        quantity,
      },
    });

    res
      .status(200)
      .json(
        createResponse(true, "Sweet restocked successfully", restockedSweet)
      );
  } catch (error) {
    res
      .status(500)
      .json(createResponse(false, "Internal Server Error", { error }));
  }
};

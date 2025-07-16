export const validSweetRequests = {
  chocolateBarfi: {
    name: "Chocolate Barfi",
    category: "Chocolate-Based",
    price: 45,
    quantity: 25,
  },

  trimmedSweet: {
    name: "  Trimmed Sweet  ",
    category: "Milk-Based",
    price: 35,
    quantity: 20,
  },

  milkBasedSweet: {
    name: "Rasmalai",
    category: "Milk-Based",
    price: 60,
    quantity: 15,
  },

  fruitBasedSweet: {
    name: "Mango Kulfi",
    category: "Fruit-Based",
    price: 40,
    quantity: 30,
  },

  decimalQuantitySweet: {
    name: "Decimal Quantity Sweet",
    category: "Nut-Based",
    price: 75,
    quantity: 12.5,
  },

  smallDecimalQuantitySweet: {
    name: "Small Decimal Sweet",
    category: "Fruit-Based",
    price: 15.75,
    quantity: 0.25,
  },

  zeroDecimalQuantitySweet: {
    name: "Zero Decimal Sweet",
    category: "Milk-Based",
    price: 20.0,
    quantity: 0.0,
  },
};

export const invalidSweetRequests = {
  missingFields: {
    name: "Incomplete Sweet",
    // Missing category, price, quantity
  },

  invalidDataTypes: {
    name: 123, // Should be string
    category: "Milk-Based",
    price: "not-a-number", // Should be number
    quantity: 10,
  },

  invalidCategory: {
    name: "Invalid Category Sweet",
    category: "Non-Existent-Category",
    price: 25,
    quantity: 10,
  },

  negativePrice: {
    name: "Negative Price Sweet",
    category: "Milk-Based",
    price: -10,
    quantity: 5,
  },

  negativeQuantity: {
    name: "Negative Quantity Sweet",
    category: "Milk-Based",
    price: 20,
    quantity: -5,
  },

  emptyName: {
    name: "   ", // Empty/whitespace name
    category: "Milk-Based",
    price: 15,
    quantity: 10,
  },

  zeroPrice: {
    name: "Zero Price Sweet",
    category: "Milk-Based",
    price: 0,
    quantity: 10,
  },
  zeroQuantity: {
    name: "Zero Quantity Sweet",
    category: "Milk-Based",
    price: 25,
    quantity: 0,
  },
};

export const duplicateNameRequests = {
  original: {
    name: "Kaju Katli",
    category: "Nut-Based",
    price: 80,
    quantity: 20,
  },

  duplicateLowerCase: {
    name: "kaju katli", // Same name but lowercase
    category: "Nut-Based",
    price: 85,
    quantity: 15,
  },

  duplicateUpperCase: {
    name: "KAJU KATLI", // Same name but uppercase
    category: "Nut-Based",
    price: 90,
    quantity: 10,
  },

  duplicateWithSpaces: {
    name: "  Kaju Katli  ", // Same name with spaces
    category: "Nut-Based",
    price: 75,
    quantity: 25,
  },
};

export const updateSweetRequests = {
  validUpdate: {
    name: "Updated Sweet Name",
    category: "Chocolate-Based",
    price: 55,
    quantity: 30,
  },

  priceUpdate: {
    name: "Price Update Sweet",
    category: "Milk-Based",
    price: 25,
    quantity: 20,
  },

  quantityUpdate: {
    name: "Quantity Update Sweet",
    category: "Fruit-Based",
    price: 40,
    quantity: 50,
  },

  categoryUpdate: {
    name: "Category Update Sweet",
    category: "Nut-Based",
    price: 70,
    quantity: 15,
  },

  trimmedNameUpdate: {
    name: "  Trimmed Update  ",
    category: "Milk-Based",
    price: 35,
    quantity: 25,
  },
};

export const restockRequests = {
  validRestock: {
    quantity: 50,
  },

  zeroRestock: {
    quantity: 0,
  },

  largeRestock: {
    quantity: 1000,
  },

  negativeQuantity: {
    quantity: -5,
  },

  invalidDataType: {
    quantity: "not-a-number",
  },

  missingQuantity: {
    // No quantity field
  },

  nullQuantity: {
    quantity: null,
  },

  undefinedQuantity: {
    quantity: undefined,
  },
};

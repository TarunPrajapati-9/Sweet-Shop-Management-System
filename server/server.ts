import "dotenv/config"; //import dotenv to load environment variables
import app from "./src/app";

// Use environment variable PORT or default to 3000
const port: number = process.env.PORT ? Number(process.env.PORT) : 3000;

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

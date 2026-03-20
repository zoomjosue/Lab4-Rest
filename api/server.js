require("dotenv").config();

const express    = require("express");
const cors       = require("cors");
const carsRouter = require("./routes");

const app  = express();
const PORT = process.env.APP_PORT || 8080;

// Middleware

app.use(cors());          // permite peticiones desde cualquier lugar del frontend
app.use(express.json());  // parsea el body como JSON

// Routes

app.use("/cars", carsRouter);

// Start

app.listen(PORT, () => {
  console.log(`Cars API corriendo en puerto ${PORT}`);
});
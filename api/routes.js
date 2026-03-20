const express = require("express");
const router  = express.Router();
const pool    = require("./db");

// Helpers

function formatRow(row) {
  return {
    id:     row.id,
    campo1: row.campo1,
    campo2: row.campo2,
    campo3: row.campo3,
    campo4: row.campo4,
    campo5: parseFloat(row.campo5), 
    campo6: row.campo6,               
  };
}

function validate(body) {
  const { campo1, campo2, campo3, campo4, campo5, campo6 } = body;
  const errors = [];

  if (campo1 === undefined || campo1 === null || String(campo1).trim() === "")
    errors.push("campo1 es requerido y debe ser string");

  if (campo2 === undefined || campo2 === null || String(campo2).trim() === "")
    errors.push("campo2 es requerido y debe ser string");

  if (campo3 === undefined || campo3 === null || String(campo3).trim() === "")
    errors.push("campo3 es requerido y debe ser string");

  if (campo4 === undefined || campo4 === null || !Number.isInteger(Number(campo4)) || isNaN(Number(campo4)))
    errors.push("campo4 es requerido y debe ser integer");

  if (campo5 === undefined || campo5 === null || isNaN(parseFloat(campo5)))
    errors.push("campo5 es requerido y debe ser float");

  if (campo6 === undefined || campo6 === null || typeof campo6 !== "boolean")
    errors.push("campo6 es requerido y debe ser boolean");

  return errors;
}

// GET /cars

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM cars ORDER BY id ASC");
    res.status(200).json(result.rows.map(formatRow));
  } catch (err) {
    res.status(500).json({ error: "Error al obtener registros" });
  }
});

// GET /cars/:id

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM cars WHERE id = $1", [id]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Registro no encontrado" });
    res.status(200).json(formatRow(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: "Error al obtener el registro" });
  }
});

// POST /cars

router.post("/", async (req, res) => {
  const errors = validate(req.body);
  if (errors.length > 0)
    return res.status(422).json({ errors });

  const { campo1, campo2, campo3, campo4, campo5, campo6 } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO cars (campo1, campo2, campo3, campo4, campo5, campo6)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [campo1, campo2, campo3, Number(campo4), Number(campo5), campo6]
    );
    res.status(201).json(formatRow(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: "Error al crear el registro" });
  }
});

// PUT /cars/:id

router.put("/:id", async (req, res) => {
  const errors = validate(req.body);
  if (errors.length > 0)
    return res.status(422).json({ errors });

  const { id } = req.params;
  const { campo1, campo2, campo3, campo4, campo5, campo6 } = req.body;
  try {
    const result = await pool.query(
      `UPDATE cars
       SET campo1=$1, campo2=$2, campo3=$3, campo4=$4, campo5=$5, campo6=$6
       WHERE id=$7 RETURNING *`,
      [campo1, campo2, campo3, Number(campo4), Number(campo5), campo6, id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Registro no encontrado" });
    res.status(200).json(formatRow(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar el registro" });
  }
});

// DELETE /cars/:id

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM cars WHERE id = $1 RETURNING id",
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Registro no encontrado" });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar el registro" });
  }
});

module.exports = router;
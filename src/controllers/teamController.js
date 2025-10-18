import pool from "../db.js";

export const createTeam = async (req, res) => {
  const { name, description } = req.body;
  try {
    await pool.query("INSERT INTO teams (name, description) VALUES ($1, $2)", [name, description]);
    res.json({ message: "Team created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTeams = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM teams");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

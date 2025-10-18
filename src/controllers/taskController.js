import pool from "../db.js";

export const createTask = async (req, res) => {
  const { title, description, team_id, assigned_to } = req.body;
  try {
    await pool.query(
      "INSERT INTO tasks (title, description, team_id, assigned_to) VALUES ($1, $2, $3, $4)",
      [title, description, team_id, assigned_to]
    );
    res.json({ message: "Task created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tasks");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

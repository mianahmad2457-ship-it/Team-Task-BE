const express = require('express');
const router = express.Router();
const knex = require('../db');
const ensureAuth = require('../middlewares/auth');
const { body, validationResult } = require('express-validator');

// create task
router.post('/', ensureAuth, [body('title').notEmpty(), body('team_id').isInt()], async (req, res) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
  try {
    const payload = {
      title: req.body.title,
      description: req.body.description,
      creator_id: req.user.id,
      assignee_id: req.body.assignee_id || null,
      team_id: req.body.team_id,
      status: req.body.status || 'todo',
      due_at: req.body.due_at || null
    };
    const [task] = await knex('tasks').insert(payload).returning('*');
    res.json({ task });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// update task
router.put('/:id', ensureAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const update = { ...req.body, updated_at: new Date() };
    const [task] = await knex('tasks').where({ id }).update(update).returning('*');
    res.json({ task });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// delete task
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    await knex('tasks').where({ id: req.params.id }).del();
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// list tasks (filter by team or assignee)
router.get('/', ensureAuth, async (req, res) => {
  try {
    const { team_id, assignee_id } = req.query;
    const q = knex('tasks').select('*');
    if (team_id) q.where('team_id', team_id);
    if (assignee_id) q.where('assignee_id', assignee_id);
    const tasks = await q.orderBy('created_at', 'desc');
    res.json({ tasks });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

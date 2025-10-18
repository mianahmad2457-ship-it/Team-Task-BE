const express = require('express');
const router = express.Router();
const knex = require('../db');
const ensureAuth = require('../middlewares/auth');
const { body, validationResult } = require('express-validator');

// create team
router.post('/', ensureAuth, [body('name').notEmpty()], async (req, res) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
  try {
    const [team] = await knex('teams').insert({ name: req.body.name, creator_id: req.user.id }).returning(['id', 'name', 'creator_id']);
    // add membership for creator
    await knex('memberships').insert({ user_id: req.user.id, team_id: team.id, role: 'owner' });
    res.json({ team });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// list teams the user is member of
router.get('/', ensureAuth, async (req, res) => {
  try {
    const teams = await knex('teams')
      .join('memberships', 'teams.id', 'memberships.team_id')
      .where('memberships.user_id', req.user.id)
      .select('teams.*');
    res.json({ teams });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// add member (by email) - stub invite
router.post('/:teamId/members', ensureAuth, [body('email').isEmail()], async (req, res) => {
  const { teamId } = req.params;
  const { email, role } = req.body;
  try {
    const user = await knex('users').where({ email }).first();
    if (!user) return res.status(404).json({ message: 'User not found' });
    await knex('memberships').insert({ user_id: user.id, team_id: teamId, role: role || 'member' }).onConflict(['user_id', 'team_id']).ignore();
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

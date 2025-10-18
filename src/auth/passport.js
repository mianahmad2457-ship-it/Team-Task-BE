const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const knex = require('../db');

passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
  try {
    const user = await knex('users').where({ email }).first();
    if (!user) return done(null, false, { message: 'Incorrect email or password.' });
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return done(null, false, { message: 'Incorrect email or password.' });
    return done(null, { id: user.id, name: user.name, email: user.email });
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await knex('users').where({ id }).first();
    if (!user) return done(null, false);
    done(null, { id: user.id, name: user.name, email: user.email });
  } catch (err) {
    done(err);
  }
});

module.exports = passport;

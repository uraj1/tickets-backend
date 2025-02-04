import passport from 'passport';

import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import { findAdminByEmail, findAdminById } from '../utils/dbUtils';

passport.use(
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password' },
    async (email, password, done) => {
      try {
        const user = await findAdminByEmail(email);
        if (!user) {
          return done(null, false, { message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: 'Incorrect password' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user: any, done: any) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done: any) => {
  try {
    const user = await findAdminById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;

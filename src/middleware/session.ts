import session from 'express-session';

export const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET as string,
  cookie: {
    secure: false,
    sameSite: 'none',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  },
  resave: false,
  saveUninitialized: false,
});
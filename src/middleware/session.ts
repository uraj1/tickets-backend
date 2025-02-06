import session from 'express-session';

export const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET as string,
  cookie: {
    secure: process.env.NODE_ENV === 'production' ? true : false,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  },
  resave: false,
  saveUninitialized: false,
});
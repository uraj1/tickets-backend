import session from 'express-session';

export const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET as string, 
  resave: false, 
  saveUninitialized: false, 
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, 
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: false, 
  }
})
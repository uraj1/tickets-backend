import express from "express";
import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "../services/database.service";
import Admins from "../models/admins";
import { adminsSchema } from "../utils/validationSchemas";
import { logger } from "../services/logger.service";
import { ObjectId } from "mongodb";

export const authRouter = express.Router();

// Passport Local Strategy
passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      try {
        const db = await connectToDatabase();
        const user = await db.collection("admins").findOne({ email }, { projection: { hashedPassword: 1, email: 1 } });

        if (!user) {
          return done(null, false, { message: "Incorrect email or password." });
        }

        if (!user.hashedPassword) {
          console.error("Error: user.hashedPassword is undefined for user:", user);
          return done(null, false, { message: "Incorrect email or password." });
        }

        const isMatch = await bcrypt.compare(password, user.hashedPassword);
        if (!isMatch) {
          return done(null, false, { message: "Incorrect email or password." });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Serialize user to session
passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const db = await connectToDatabase();
    const user = await db.collection("admins").findOne({ _id: new ObjectId(id) });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Login Route
authRouter.post("/login", (req: Request, res: any, next: NextFunction) => {
  try {
    passport.authenticate("local", (err: Error, user: Admins, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info.message });
  
      req.logIn(user, (err) => {
        if (err) return next(err);
        return res.json({ message: "Logged in successfully", user: {
          email: user.email,
          id: user._id
        } });
      });
    })(req, res, next);

  } catch (error) {
    console.error("Error in admin login:", error);
    res.status(500).json({ message: "Error in admin login", error });
  }
});

// Logout Route
authRouter.post("/logout", (req: Request, res: any) => {
  try {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
    
  } catch (error) {
    console.error("Error in logout admin:", error);
    res.status(500).json({ message: "Error in logout admin", error });
  }
});

// authRouter.post("/register", async (req: Request, res: any) => {
//   try {
//     const db = await connectToDatabase();
//     const adminsCollection = db.collection("admins");

//     const { email, password } = req.body;
//     if (!email || !password) {
//       return res.status(400).json({ message: "Email and password are required" });
//     }

//     const existingAdmin = await adminsCollection.findOne({ email });
//     if (existingAdmin) {
//       return res.status(400).json({ message: "Admin already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const validatedAdmin = adminsSchema.parse({ email, hashedPassword });
//     const newAdmin = new Admins(validatedAdmin.email, validatedAdmin.hashedPassword);
//     const result = await adminsCollection.insertOne(newAdmin);
    
//     logger.info(`Admin created successfully with ID: ${result.insertedId}`);
//     res.status(201).json({ message: "Admin created successfully", adminId: result.insertedId });
//   } catch (error) {
//     console.error("Error in admin register:", error);
//     res.status(500).json({ message: "Error in admin register", error });
//   }
// })

export default authRouter;

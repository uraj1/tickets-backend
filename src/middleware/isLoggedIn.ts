import type { NextFunction, Response } from 'express'

export const isLoggedIn = (req: any, res: Response, next: NextFunction) => {
    if (req.user && req.user.hasOnboarded) {
        next()
    } else {
        res.sendStatus(401)
    }
}

export const isLoggedInWithoutOnboarding = (req: any, res: Response, next: NextFunction) => {
    if (req.user) {
        next()
    } else {
        res.sendStatus(401)
    }
}
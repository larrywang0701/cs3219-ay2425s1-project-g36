import { Router, Request, Response } from 'express'
import { User } from '../models/userModel'
import { Blacklist } from '../models/blacklistModel'
import bcrypt from 'bcrypt'
import jwt, { JwtPayload } from 'jsonwebtoken';

const router: Router = Router()
const secretKey = "undecided" // to be replaced with a more secure key in .env file
const MAX_FAILED_ATTEMPTS = 5; 
const CAPTCHA_REQUIRED_ATTEMPTS = 3; 

// Login route
router.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: 'User not found' })

    // Check if account is blocked due to too many failed attempts
    if (user.numberOfFailedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        return res.status(403).json({ message: 'Account locked due to too many failed attempts' });
    }

    // Check if password is correct
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        user.numberOfFailedLoginAttempts += 1;
        await user.save();

        if (user.numberOfFailedLoginAttempts >= CAPTCHA_REQUIRED_ATTEMPTS) {
            //TODO: Implement captcha
            return res.status(403).json({ message: 'Captcha Required' });
        }
        return res.status(400).json({ message: 'Invalid Credentials' })
    }

    //Reset failed attempts once login is successful
    user.numberOfFailedLoginAttempts = 0;
    await user.save();

    // Timeout set to 1 hour for now
    const token = jwt.sign({ id: user._id, email: user.email }, secretKey, { expiresIn: '1h' })
    res.json({ token, message: 'Login successful' });
});

// Middleware for verifying token and checking blacklist
const CheckTokenAgainstBlacklist = async (req: Request, res: Response, next: Function) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const isBlacklisted = await Blacklist.findOne({ token });
    if (isBlacklisted) {
        return res.status(403).json({ message: 'Token is blacklisted, please log in again' });
    }

    next(); // Continue to the next middleware or route handler
};


// Logout route
router.post('/logout', async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split(' ')[1]; // Assuming the token is passed in the Authorization header

    if (!token) {
        return res.status(400).json({ message: 'No token provided' });
    }

    // Decode the token to get the expiration
    var expiresAt = null
    try {
        const decodedToken = jwt.verify(token, secretKey)
        // Type guard to check if decodedToken is JwtPayload
        if (typeof decodedToken === 'object' && 'exp' in decodedToken) {
            const expiresAt = new Date((decodedToken as JwtPayload).exp! * 1000);
            console.log('Token expires at:', expiresAt);
        } else {
            return res.status(400).json({ message: 'Invalid token format' });
        }
    } catch (error) {
        return res.status(400).json({ message: 'Invalid token' })
    }

    // Add the token to the blacklist
    await Blacklist.create({ token, expiresAt })

    //TODO: clean up session data

    res.json({ message: 'Logout successful' });
});


export default router

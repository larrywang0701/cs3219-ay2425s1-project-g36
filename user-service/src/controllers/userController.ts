import { Request, Response } from "express";
import bcrypt from "bcrypt";
import UserModel from '../models/userModel';

export async function createUser(req: Request, res: Response) {
  try {
    const { username, email, password } = req.body;
    if (username && email && password) {
      const existingUser = await UserModel.findOne({
        $or: [
          { username },
          { email },
        ],
      });

      if (existingUser) {
        return res.status(409).json({ message: "username or email already exists" });
      }

      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);
      const createdUser = await new UserModel({ username, email, password }).save();

      return res.status(201).json({
        message: `Created new user ${username} successfully`,
        // data: formatUserResponse(createdUser),
      });
    } else {
      return res.status(400).json({ message: "username and/or email and/or password are missing" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unknown error when creating new user!" });
  }
}

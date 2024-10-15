import { Router } from 'express';
import { createUser, getAllUsers, getUser } from '../controllers/userController';
import { protectRoute } from '../middlewares/protectRoute';

const router: Router = Router();

router.post("/", createUser);

router.get("/:id", protectRoute, getUser);

router.get("/", getAllUsers);

export default router;

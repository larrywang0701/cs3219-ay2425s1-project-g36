import { Router } from 'express';

import { createUser, getAllUsers, getUser, updateUser, deleteUser } from '../controllers/userController';
import { protectRoute } from '../middlewares/protectRoute';

const router: Router = Router();

router.post("/", createUser);

router.get("/:id", protectRoute, getUser);

router.get("/", protectRoute, getAllUsers);

router.patch("/update", protectRoute, updateUser);

router.delete("/:id", protectRoute, deleteUser);

export default router;

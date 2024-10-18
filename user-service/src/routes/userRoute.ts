import { Router } from 'express';

import { createUser, getAllUsers, getUser, updateUser, deleteUser, updateUserPrivilege } from '../controllers/userController';
import { protectRoute } from '../middlewares/protectRoute';
import { adminProtectRoute } from '../middlewares/adminProtectRoute';

const router: Router = Router();

/**
 * Non-protected routes
 */
router.post("/", createUser);

/**
 * Normal protected routes
 */
router.get("/:id", protectRoute, getUser);

router.get("/", protectRoute, getAllUsers);

router.patch("/update", protectRoute, updateUser);

router.delete("/:id", protectRoute, deleteUser);

/**
 * Admin-protected routes
 */
router.patch("/:id/privilege", protectRoute, adminProtectRoute, updateUserPrivilege);

export default router;

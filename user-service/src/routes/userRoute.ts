import { Router, Request, Response } from 'express';
import { createUser, getUser } from '../controllers/userController';
import { protectRoute } from '../middlewares/protectRoute';

const router: Router = Router();

// test
router.get('/', (req: Request, res: Response) => {
    res.send({
        message: "Test user route"
    })
})

router.post("/", createUser);

router.get("/:id", protectRoute, getUser);

export default router;

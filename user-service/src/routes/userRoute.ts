import { Router, Request, Response } from 'express';
import { createUser } from '../controllers/userController';
import { protectRoute } from '../middlewares/protectRoute';

const router: Router = Router();

// test
router.get('/', (req: Request, res: Response) => {
    res.send({
        message: "Test user route"
    })
})

router.post("/", protectRoute, createUser);

export default router;

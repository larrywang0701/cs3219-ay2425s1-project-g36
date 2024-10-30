import { Router, Request, Response } from "express";
import userStore from '../utils/userStore'

const router = Router()

// checks if user_id is present in the userStore, and returns the information of the collaboration
router.get("/:id", (req: Request, res: Response): any => {
    const id = req.params.id;
    if (id === null) {
        return res.status(400).send({
            message: "You need to put a user ID in the URL"
        })
    }

    const present = userStore.hasUser(id)

    if (present) {
        const data = userStore.getUser(id)
        return res.status(200).send({
            data: data,
            message: "The information of the collaboration is obtained"
        })
    }
    return res.status(404).send({
        message: "The user is not in the user store"
    })
}); 

// removes user from userStore
router.post("/remove/:id", (req: Request, res, Response): any => {
    const id = req.params.id;
    if (id === null) {
        return res.status(400).send({
            message: "You need to put a user ID in the URL"
        })
    }

    const present = userStore.hasUser(id)

    if (present) {
        userStore.removeUser(id)
        console.log('after removing user, the userStore is:')
        userStore.printContents()
        return res.status(200).send({
            message: `User ${id} is removed from userStore`
        })
    }
    return res.status(404).send({
        message: `This user ${id} is not in the user store`
    })
})

export default router
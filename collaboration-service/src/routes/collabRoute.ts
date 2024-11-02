import { Router, Request, Response } from "express";
import collabStore from '../utils/collabStore'

const router = Router()

// Retrieves the information of the collaboration
router.get("/:id", (req: Request, res: Response): any => {
    const id = req.params.id;
    if (id === null) {
        return res.status(400).send({
            message: "You need to put a user ID in the URL"
        })
    }

    const present = collabStore.hasUser(id)

    if (present) {
        const data = collabStore.getUser(id)
        return res.status(200).send({
            data: data,
            message: "The information of the collaboration is obtained"
        })
    }
    return res.status(404).send({
        message: "The user is not in the user store"
    })
}); 

// Removes user from collabStore
router.post("/remove/:id", (req: Request, res, Response): any => {
    const id = req.params.id;
    if (id === null) {
        return res.status(400).send({
            message: "You need to put a user ID in the URL"
        })
    }

    const present = collabStore.hasUser(id)

    if (present) {
        collabStore.removeUser(id)
        console.log('after removing user, the collabStore is:')
        collabStore.printContents()
        return res.status(200).send({
            message: `User ${id} is removed from collabStore`
        })
    }
    return res.status(404).send({
        message: `This user ${id} is not in the user store`
    })
})

// Checks if user is in collabStore
router.get("/in-store/:id", (req: Request, res: Response): any => {
    const id = req.params.id;

    if (id === null) {
        return res.status(400).send({
            message: "You need to put a user ID in the URL"
        })
    }

    const present = collabStore.hasUser(id)

    if (present) {
        return res.status(200).send({
            message: "User is in collab store"
        })
    }
    return res.status(404).send({
        message: "The user is not in the collab store"
    })
}); 

export default router
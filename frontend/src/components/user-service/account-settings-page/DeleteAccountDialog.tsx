import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";

export default function DeleteAccountDialog() {

    function handleDeleteClick() {
        console.log("i dunno man");
    }

    return (
        <Dialog>
            <DialogTrigger>
                <Button className="btnred">
                    Delete Account
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-50">
                <DialogHeader>
                <DialogTitle>Are you absolutely sure you want to delete your account?</DialogTitle>
                <DialogDescription>
                    This action cannot be undone. This will permanently delete your account
                    and remove your data.
                </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-2">
                        <DialogClose asChild>
                            <Button type="button" className="btngray" variant="secondary">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="button" className="btnred" variant="secondary" onClick={ handleDeleteClick }>
                            Delete
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
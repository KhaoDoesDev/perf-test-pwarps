"use client";

import { Dialog, DialogOverlay, DialogContent, DialogTitle } from "./ui/dialog";
import { useRouter } from "next/navigation";

export function FuckOffModal() {
  const router = useRouter();

  const handleOpenChange = () => {
    router.back();
  };

  return (
    <Dialog
      defaultOpen={true}
      open={true}
      onOpenChange={handleOpenChange}
    >
      <DialogOverlay>
				<DialogTitle>Fuck off</DialogTitle>
        <DialogContent>
					Test
				</DialogContent>
      </DialogOverlay>
    </Dialog>
  );
}
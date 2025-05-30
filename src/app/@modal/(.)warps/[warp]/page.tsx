/* eslint-disable @next/next/no-img-element */
import { Modal } from "@/components/modal";
import { getWarp } from "@/lib/warps";

export default async function Warp({ params }: { params: Promise<{ warp: string }> }) {
	const { warp } = await params;
  const warpData = await getWarp(warp);

  if (!warpData) {
    return <Modal>
			
		</Modal>
  }

  return (
    <Modal>
      <div className="flex rounded-xl bg-black">
				<img src={warpData.imageUrl} alt={`Screenshot of the \"${warpData.safeName}\" warp`} className="w-full h-full object-cover" />
			</div>
    </Modal>
  );
}
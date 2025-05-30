import { WarpData } from "@/types/warp";

export async function getWarp(warpName: string): Promise<WarpData | null> {
	const warps = await getWarps();
	return warps?.find((warp) => warp.name === warpName) ?? null;
}

export async function getWarps(): Promise<WarpData[] | null> {
	const response = await fetch((process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://ptwarps.info") + "/data.json");
	if (response.ok) {
		const data: WarpData[] = await response.json();
		return data;
	}
	return null;
}	
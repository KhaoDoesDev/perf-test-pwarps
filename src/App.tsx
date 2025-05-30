import type React from "react";

import { useState, useEffect, useMemo } from "react";
import { Search, ArrowUp, ArrowDown, Shuffle, Copy, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
} from "./components/ui/dialog";
import Footer from "@/components/Footer";
import OwnerDisplay from "@/components/OwnerDisplay";
import CopyWarpButton from "@/components/CopyWarpButton";

interface WarpData {
  name: string;
  safeName: string;
  owner: string;
  created: string;
  visits: number;
  imageUrl: string;
  info: string;
  note: string;
}

type SortOption = "name" | "owner" | "created" | "visits" | "shuffle";
type SortOrder = "asc" | "desc";

export default function PlayerWarpGallery() {
  const [warps, setWarps] = useState<WarpData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [displayMode, setDisplayMode] = useState<"immersive" | "details">(
    "immersive"
  );
  const [copiedWarp, setCopiedWarp] = useState<string | null>(null);
  const [openWarp, setOpenWarp] = useState<WarpData | null>(null);
  const [initialPath, setInitialPath] = useState<string>("");

  useEffect(() => {
    fetchWarps();
  }, []);

  useEffect(() => {
    // Handle popstate for closing dialog on back
    const onPopState = () => {
      setOpenWarp(null);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (openWarp) {
      setInitialPath((prev) => prev || window.location.pathname);
      window.history.pushState(
        {},
        "",
        `/warp/${encodeURIComponent(openWarp.name)}`
      );
    } else if (!openWarp) {
      window.history.replaceState({}, "", "/");
    } else if (initialPath) {
      window.history.replaceState({}, "", initialPath);
      setInitialPath("");
    }
  }, [openWarp]);

  const fetchWarps = async (): Promise<void> => {
    try {
      const response = await fetch("/data.json");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: WarpData[] = await response.json();
      setWarps(data);
    } catch (error) {
      console.error("Failed to fetch warps:", error);
      toast.error("Failed to load player warps");
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedWarps = useMemo((): WarpData[] => {
    const filtered = warps.filter(
      (warp: WarpData) =>
        warp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        warp.owner.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortBy === "shuffle") {
      const shuffled = [...filtered];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    }

    return filtered.sort((a: WarpData, b: WarpData) => {
      let aValue: string | number | Date = a[sortBy as keyof WarpData];
      let bValue: string | number | Date = b[sortBy as keyof WarpData];

      if (sortBy === "created") {
        aValue = new Date(
          a.created.split(" ")[0].split("/").reverse().join("-")
        );
        bValue = new Date(
          b.created.split(" ")[0].split("/").reverse().join("-")
        );
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [warps, searchTerm, sortBy, sortOrder]);

  const copyWarpCommand = async (warpName: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(`/pwarp ${warpName}`);
      setCopiedWarp(warpName);
      setTimeout(() => setCopiedWarp(null), 2000);
      toast.success("Copied!", {
        description: `/pwarp ${warpName} copied to clipboard`,
      });
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast.error("Failed to copy to clipboard");
    }
  };

  const toggleSortOrder = (): void => {
    setSortOrder((prev: SortOrder) => (prev === "asc" ? "desc" : "asc"));
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-gradient-to-br from-gray-900 to-slate-800 py-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-12 text-gray-100">
            Player-Warp Gallery on Perf-Test
          </h1>
          <div className="text-center text-gray-400">Loading warps...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-gray-900 to-slate-800 pt-4 sm:pt-8 md:pt-12">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6 sm:mb-10 md:mb-12 text-gray-100">
          Player-Warp Gallery on Perf-Test
        </h1>

        {/* Search and Sort Controls */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-4 bg-gray-800 p-3 sm:p-4 rounded-lg shadow-md border border-gray-700">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search warps, owners, or categories..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
              className="pl-10 bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-400"
            />
          </div>

          <div className="flex gap-2">
            <Select
              value={sortBy}
              onValueChange={(value: SortOption) => setSortBy(value)}
            >
              <SelectTrigger className="w-28 sm:w-32 bg-gray-700 border-gray-600 text-gray-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-gray-100">
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="visits">Visits</SelectItem>
                <SelectItem value="shuffle">
                  <div className="flex items-center gap-2">
                    <Shuffle className="h-4 w-4" />
                    Shuffle
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {sortBy !== "shuffle" && (
              <Button
                variant="outline"
                size="icon"
                onClick={toggleSortOrder}
                className="shrink-0 bg-gray-700 border-gray-600 text-gray-100 hover:bg-gray-600 hover:text-gray-100"
              >
                {sortOrder === "asc" ? (
                  <ArrowUp className="h-4 w-4" />
                ) : (
                  <ArrowDown className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
          <div className="text-gray-400 text-sm sm:text-base">
            Showing {filteredAndSortedWarps.length} of {warps.length} warps
          </div>

          <Select
            value={displayMode}
            onValueChange={(value: "immersive" | "details") =>
              setDisplayMode(value)
            }
            defaultValue="immersive"
          >
            <SelectTrigger className="w-28 sm:w-32 bg-gray-700 border-gray-600 text-gray-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-gray-100">
              <SelectItem value="immersive">Immersive</SelectItem>
              <SelectItem value="details">Details</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Warp Gallery */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6`}
        >
          {filteredAndSortedWarps.map((warp) =>
            displayMode === "immersive" ? (
              <div
                key={warp.name}
                className="relative group aspect-video rounded-lg overflow-hidden cursor-pointer bg-gray-800 border border-gray-700 hover:shadow-lg transition-shadow"
                onClick={() => setOpenWarp(warp)}
                tabIndex={0}
                role="button"
                aria-label={`Open details for ${warp.name}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setOpenWarp(warp);
                }}
              >
                <img
                  src={warp.imageUrl}
                  alt={`Screenshot of the \"${warp.safeName}\" warp`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <div className="absolute top-2 left-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="bg-black/70 px-2 py-1 rounded text-cyan-300 font-bold text-sm shadow">
                    {warp.name}
                  </span>
                  <OwnerDisplay owner={warp.owner} />
                </div>
              </div>
            ) : (
              <Card
                key={warp.name}
                className="overflow-hidden hover:shadow-lg transition-shadow bg-gray-800 border-gray-700 p-0"
              >
                <CardHeader className="p-0">
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={warp.imageUrl}
                      alt={`Screenshot of the \"${warp.name}\" warp`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </CardHeader>
                <CardContent className="pb-6">
                  <CardTitle className="flex items-center justify-between mb-4 flex-wrap">
                    <CopyWarpButton warpName={warp.name} />
                    <OwnerDisplay owner={warp.owner} />
                  </CardTitle>
                  <div className="space-y-2 text-sm">
                    <p className="mt-1 text-gray-200">{warp.info}</p>
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>

        {/* Immersive Dialog (controlled) */}
        {openWarp && (
          <Dialog
            open={!!openWarp}
            onOpenChange={(open) => {
              if (!open) setOpenWarp(null);
            }}
          >
            <DialogContent className="p-0 flex flex-col md:flex-row bg-gray-800 !w-full max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto overflow-hidden">
              <div className="flex-[2_2_0%] min-w-0 max-h-[60vh] md:max-h-[70vh] flex items-center justify-center bg-black">
                <img
                  src={openWarp.imageUrl}
                  alt={`Screenshot of the \"${openWarp.name}\" warp`}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>
              <div className="flex-[1_1_0%] min-w-0 flex flex-col gap-4 p-4 md:p-8 overflow-y-auto max-h-[60vh] md:max-h-[70vh] md:max-w-md mx-auto justify-center">
                <CopyWarpButton warpName={openWarp.name} />
                <OwnerDisplay owner={openWarp.owner} />
                <div className="space-y-2 text-base text-gray-200 break-words">
                  <p className="whitespace-pre-line">{openWarp.info}</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {filteredAndSortedWarps.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              No warps found matching your search.
            </p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

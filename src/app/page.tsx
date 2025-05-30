/* eslint-disable @next/next/no-img-element */
"use client";

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
import Link from "next/link";

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
	const [displayMode, setDisplayMode] = useState<"immersive" | "details">("immersive");
  const [copiedWarp, setCopiedWarp] = useState<string | null>(null);

  useEffect(() => {
    fetchWarps();
  }, []);

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
    <div className="min-h-dvh bg-gradient-to-br from-gray-900 to-slate-800 py-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-100">
          Player-Warp Gallery on Perf-Test
        </h1>

        {/* Search and Sort Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-4 bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700">
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
              <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-gray-100">
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
				<div className="flex justify-between items-center mb-4">
					<div className="text-gray-400">
						Showing {filteredAndSortedWarps.length} of {warps.length} warps
					</div>

					<Select
						value={displayMode}
						onValueChange={(value: "immersive" | "details") => setDisplayMode(value)}
						defaultValue="immersive"
					>
						<SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-gray-100">
							<SelectValue />
						</SelectTrigger>
						<SelectContent className="bg-gray-800 border-gray-700 text-gray-100">
							<SelectItem value="immersive">Immersive</SelectItem>
							<SelectItem value="details">Details</SelectItem>
						</SelectContent>
					</Select>
				</div>

        {/* Warp Gallery */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${displayMode === "immersive" ? "" : "xl:grid-cols-4"} gap-6`}>
          {filteredAndSortedWarps.map((warp) => (
            displayMode === "immersive" ? (
              <Link
                key={warp.name}
                className="relative group aspect-video rounded-lg overflow-hidden cursor-pointer bg-gray-800 border border-gray-700 hover:shadow-lg transition-shadow"
								href={`/warps/${warp.safeName}`}
              >
                <img
                  src={warp.imageUrl}
                  alt={`Screenshot of the \"${warp.safeName}\" warp`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <div className="absolute top-2 left-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="bg-black/70 px-2 py-1 rounded text-cyan-300 font-bold text-sm shadow">
                    {warp.name}
                  </span>
                  <span className="flex items-center bg-black/60 px-2 py-1 rounded text-white text-xs shadow">
                    by
                    <img
                      src={`https://minotar.net/helm/${warp.owner}/100.png`}
                      width={16}
                      height={16}
                      alt={`${warp.owner}'s avatar`}
                      className="mx-1 rounded"
                    />
                    {warp.owner}
                  </span>
                </div>
              </Link>
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
                    />
                  </div>
                </CardHeader>
                <CardContent className="pb-6">
                  <CardTitle className="flex items-center justify-between mb-4 flex-wrap">
                    <button
                      onClick={() => copyWarpCommand(warp.name)}
                      className="text-lg font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 group"
                    >
                      {warp.name}
                      {copiedWarp === warp.name ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </button>
                    <div className="text-white flex">
                      by
                      <div className="flex ml-2">
                        <img
                          src={`https://minotar.net/helm/${warp.owner}/100.png`}
                          width={16}
                          height={16}
                          alt={`${warp.owner}'s avatar`}
                          className="mr-1"
                        />
                        {warp.owner}
                      </div>
                    </div>
                  </CardTitle>
                  <div className="space-y-2 text-sm">
										<p className="mt-1 text-gray-200">{warp.info}</p>
                  </div>
                </CardContent>
              </Card>
            )
          ))}
        </div>

        {filteredAndSortedWarps.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              No warps found matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router";
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

export default function WarpDisplay() {
  const [warp, setWarp] = useState<WarpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const navigate = useNavigate();
  const { warpName } = useParams();

  useEffect(() => {
    if (!warpName) {
      navigate("/", { replace: true });
      return;
    }
    const fetchWarp = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const response = await fetch("/data.json");
        if (!response.ok) throw new Error("Failed to fetch warps");
        const data: WarpData[] = await response.json();
        const found = data.find(
          (w) => w.name.toLowerCase() === warpName.toLowerCase()
        );
        if (found) {
          setWarp(found);
        } else {
          setNotFound(true);
        }
      } catch (e) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchWarp();
  }, [warpName, navigate]);

  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-br from-gray-900 to-slate-800">
      <div className="flex-1 flex flex-col items-center justify-center px-2 sm:px-4 md:px-8 w-full">
        <div className="w-full max-w-6xl mx-auto mt-4 mb-6 flex items-start">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-cyan-300 hover:bg-gray-700 hover:text-cyan-200 transition-colors shadow"
            aria-label="Back to Gallery"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Gallery
          </button>
        </div>
        {loading ? (
          <div className="text-gray-400 text-lg mt-24">Loading warp...</div>
        ) : notFound ? (
          <div className="text-center mt-24">
            <h1 className="text-3xl font-bold text-gray-100 mb-4">Warp Not Found</h1>
            <p className="text-gray-400">No warp found with the name "{warpName}".</p>
          </div>
        ) : warp ? (
          <div className="w-full max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden flex flex-col md:flex-row">
            <div className="flex-[2_2_0%] min-w-0 max-h-[60vh] md:max-h-[70vh] flex items-center justify-center bg-black aspect-video">
              <img
                src={warp.imageUrl}
                alt={`Screenshot of the \"${warp.name}\" warp`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="flex-[1_1_0%] min-w-0 flex flex-col gap-4 p-4 md:p-8 overflow-y-auto max-h-[60vh] md:max-h-[70vh] md:max-w-md mx-auto justify-center">
              <CopyWarpButton warpName={warp.name} />
              <OwnerDisplay owner={warp.owner} />
              <div className="space-y-2 text-base text-gray-200 break-words">
                <p className="whitespace-pre-line">{warp.info}</p>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Created: {warp.created} | Visits: {warp.visits}
              </div>
            </div>
          </div>
        ) : null}
      </div>
      <Footer />
    </div>
  );
}

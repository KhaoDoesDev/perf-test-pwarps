import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function CopyWarpButton({ warpName }: { warpName: string }) {
  const [copied, setCopied] = useState(false);

  const copyWarpCommand = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`/pwarp ${warpName}`);
      setCopied(true);
      toast.success("Copied!", {
        description: `/pwarp ${warpName} copied to clipboard`,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  }, [warpName]);

  return (
    <button
      onClick={copyWarpCommand}
      aria-label={`Copy /pwarp ${warpName} to clipboard`}
      className="text-2xl font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-2 group break-all"
      tabIndex={0}
    >
      {warpName}
      {copied ? (
        <Check className="h-5 w-5 text-green-400" />
      ) : (
        <Copy className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </button>
  );
} 
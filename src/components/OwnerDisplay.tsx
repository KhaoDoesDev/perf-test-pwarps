import React from "react";

export default function OwnerDisplay({ owner }: { owner: string }) {
  return (
    <span className="flex items-center gap-2">
      <img
        src={`https://minotar.net/helm/${owner}/100.png`}
        width={20}
        height={20}
        alt={`${owner}'s avatar`}
        className="mx-1 rounded"
        loading="lazy"
      />
      <span className="font-medium text-white">{owner}</span>
    </span>
  );
} 
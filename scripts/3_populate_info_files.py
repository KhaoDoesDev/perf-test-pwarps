#!/usr/bin/env python3

import os
import os.path
import sys
import urllib.parse

if __name__ == "__main__":
  if len(sys.argv) != 3:
    print(f"Usage: {sys.argv[0]} <LogFile> <DataDirectory>", file=sys.stderr)
    exit(1)

  warps = {} # Warp: FilePath
  for fileName in os.listdir(sys.argv[2]):
    if not fileName.endswith(".info"):
      continue
    warp = urllib.parse.unquote(fileName[:-len(".info")])
    print(f"{warp}")
    warps[warp] = os.path.join(sys.argv[2], fileName)

  with open(sys.argv[1]) as logfile:
    for line in logfile.readlines():
      line = line.strip()
      if "[CHAT] " not in line:
        continue
      line = line[line.index("[CHAT] ") + len("[CHAT] "):]
      if "PW » Warp Information for " not in line:
        continue
      warp = line.split("PW » Warp Information for ")[1].split(":")[0]
      warpOrig = warp
      warpInfoLines = line.split("\\n")
      if warp not in warps:
        warp = warp.replace(" ", "_") # Try with alternate writing
        if warp not in warps:
          print(f"No .info file exists for warp {warp}. Skipping it...")
          continue
        else:
          print(f"{warpOrig} is {warp}")
      with open(warps[warp], "w") as infoFile:
        for warpInfoLine in warpInfoLines:
          if warpInfoLine.startswith("PW » "):
            warpInfoLine = warpInfoLine[len("PW » "):]
          infoFile.write(warpInfoLine + "\n")

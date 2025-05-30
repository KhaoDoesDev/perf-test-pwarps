#!/usr/bin/env python3

import os
import os.path
import sys
import urllib.parse

if __name__ == "__main__":
  if len(sys.argv) != 3:
    print(f"Usage: {sys.argv[0]} <LogFile> <DataDirectory>", file=sys.stderr)
    exit(1)

  warps = set()
  with open(sys.argv[1]) as logfile:
    for line in logfile.readlines():
      line = line.strip()
      if "[CHAT] " not in line:
        continue
      line = line[line.index("[CHAT] ") + len("[CHAT] "):]
      if "PW » Current Warps" not in line:
        continue
      for subline in line.split("\\n")[1:-1]:
        warps.add(subline.replace("§d", "").replace("*", "").strip())
  warps = sorted(list(warps))

  print(f"{len(warps)} warps: {warps}")
  for warp in warps:
    safe = urllib.parse.quote(warp, safe="")
    if safe != warp:
      print(f"{warp} => {safe}")
    with open(os.path.join(sys.argv[2], f"{safe}.info"), "w"):
      pass # Empty file


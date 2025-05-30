#!/usr/bin/env python3

import sys
import os
import os.path
import urllib.parse
import shutil
import pathlib
import datetime
import json

if __name__ == "__main__":
  if len(sys.argv) < 2:
    print(f"Usage: {sys.argv[0]} <DataDirectory> <StaticDirectory>", file=sys.stderr)
    exit(1)
    warps = {} # Warp: FilePath
  dataDirectory, staticDirectory = sys.argv[1:3]

  warps = []
  for fileName in os.listdir(dataDirectory):
    if not fileName.endswith(".info"):
      continue
    fileNameBase = fileName[:-len(".info")]
    warp = urllib.parse.unquote(fileNameBase)
    #print(f"{warp}")
    infoFilePath = os.path.join(dataDirectory, f"{fileNameBase}.info")
    screenshotFilePath = os.path.join(dataDirectory, f"{fileNameBase}.webp")
    noteFilePath = os.path.join(dataDirectory, f"{fileNameBase}.note")

    screenshotHref = None
    if os.path.exists(screenshotFilePath):
      # Copy screenshot into static/imgs
      screenshotStaticImgFolderPath = os.path.join(staticDirectory, "images")
      screenshotStaticPath = os.path.join(screenshotStaticImgFolderPath, fileNameBase + ".webp")
      pathlib.Path(screenshotStaticImgFolderPath).mkdir(parents=True, exist_ok=True)
      shutil.copyfile(screenshotFilePath, screenshotStaticPath)
      screenshotHref = "/images/" + urllib.parse.quote(fileNameBase) + ".webp" # Yes, it's double-quoted!

    note = None
    if os.path.exists(noteFilePath):
      with open(noteFilePath) as noteFile:
        note = noteFile.read().strip()

    info = None
    owner = None
    created = None
    visits = None
    if os.path.exists(infoFilePath):
      with open(infoFilePath) as infoFile:
        info = ""
        for i, line in enumerate(infoFile.readlines()):
          line = line.strip()
          if i == 0:
            continue # Skip first line
          info += line + "\n"
          if line.startswith("Owner: "):
            owner = line[len("Owner: "):].strip()
          if line.startswith("Time Created: "):
            time = line[line.index(":")+1:].strip()
            try:
              created = datetime.datetime.strptime(time, "%d/%m/%Y %H:%M:%S").isoformat()
            except:
              print(f"Failed to parse created time of {warp}: {time}")
          if line.startswith("Visits: "):
            visits = line[len("Visits: "):].strip()
        info = info.strip()

    safeName = urllib.parse.quote(warp, safe="")

    warps.append({
      "name": warp,
      "safeName": safeName,
      "owner": owner,
      "created": created,
      "visits": visits,
      "imageUrl": screenshotHref,
      "info": info,
      "note": note,
    })

    with open(os.path.join(staticDirectory, "data.json"), "w") as jsonFile:
      json.dump(warps, jsonFile, indent=4)
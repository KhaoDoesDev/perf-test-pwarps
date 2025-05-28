#!/usr/bin/env python3

import jinja2
import sys
import os
import os.path
import urllib.parse
import shutil
import pathlib

if __name__ == "__main__":
  if len(sys.argv) != 4:
    print(f"Usage: {sys.argv[0]} <DataDirectory> <WebDirectory> <StaticDirectory>", file=sys.stderr)
    exit(1)
    warps = {} # Warp: FilePath

  warps = []
  for fileName in os.listdir(sys.argv[1]):
    if not fileName.endswith(".info"):
      continue
    fileNameBase = fileName[:-len(".info")]
    warp = urllib.parse.unquote(fileNameBase)
    print(f"{warp}")
    infoFilePath = os.path.join(sys.argv[1], f"{fileNameBase}.info")
    screenshotFilePath = os.path.join(sys.argv[1], f"{fileNameBase}.webp")
    noteFilePath = os.path.join(sys.argv[1], f"{fileNameBase}.note")

    screenshotHref = None
    if os.path.exists(screenshotFilePath):
      # Copy screenshot into static/imgs
      screenshotStaticImgFolderPath = os.path.join(sys.argv[3], "img")
      screenshotStaticPath = os.path.join(screenshotStaticImgFolderPath, fileNameBase + ".webp")
      pathlib.Path(screenshotStaticImgFolderPath).mkdir(parents=True, exist_ok=True)
      shutil.copyfile(screenshotFilePath, screenshotStaticPath)
      screenshotHref = "img/" + urllib.parse.quote(fileNameBase) + ".webp" # Yes, it's double-quoted!

    note = None
    if os.path.exists(noteFilePath):
      with open(noteFilePath) as noteFile:
        note = noteFile.read().strip()

    info = None
    if os.path.exists(infoFilePath):
      with open(infoFilePath) as infoFile:
        info = ""
        for i, line in enumerate(infoFile.readlines()):
          line = line.strip()
          if i == 0:
            continue # Skip first line
          info += line + "\n"
        info = info.strip()

    warps.append({
      "name": warp,
      "screenshotHref": screenshotHref,
      "info": info,
      "note": note,
    })

  # Copy files in web/ + render .j2 templates out, removing that extension
  env = jinja2.Environment(loader=jinja2.FileSystemLoader(sys.argv[2]))
  for fileName in os.listdir(sys.argv[2]):
    if fileName.endswith(".j2"):
      template = env.get_template(fileName)
      rendered = template.render(warps=warps)
      with open(os.path.join(sys.argv[3], fileName[:-len(".j2")]), "w") as renderedFile:
        renderedFile.write(rendered)
    else:
      shutil.copyfile(os.path.join(sys.argv[2], fileName), os.path.join(sys.argv[3], fileName))

#!/usr/bin/env python3

from bs4 import BeautifulSoup
from copy import copy
import json
import sys
import os

if len(sys.argv) < 3:
  print(f"Usage: {sys.argv[0]} <StaticDirectory> <BaseUrl>", file=sys.stderr)
  exit(1)
staticDirectory, baseUrl = sys.argv[1:3]
if baseUrl.endswith("/"):
  baseUrl = baseUrl[:-1]

# Warps were already parsed with 5_create_static.py
with open(os.path.join(staticDirectory, "data.json")) as f:
  warps = json.load(f)

# Use 404.html as base html
with open(os.path.join(staticDirectory, "404.html")) as f:
  document = BeautifulSoup(f, "html.parser")

# Remove pre-defined meta-tags
for child in document.find("head").find_all("head"):
  if (child.has_attr("property") and child["property"].startswith("og:")) \
          or (child.has_attr("name") and child["name"] in [ "title", "description" ]):
    child.decompose() # Remove it

# Create per-warp documents
for warp in warps:
  # Copy document
  warpDoc = copy(document)
  head = warpDoc.find("head")

  head.find("title").string = f"/pwarp {warp["name"]}"

  # https://ogp.me/
  head.append(warpDoc.new_tag("meta", property="og:title", content=f"/pwarp {warp["name"]}"))
  head.append(warpDoc.new_tag("meta", property="og:type", content="website"))
  head.append(warpDoc.new_tag("meta", property="og:url", content=f"{baseUrl}/warp/{warp["safeName"]}"))
  head.append(warpDoc.new_tag("meta", property="og:description", content=f"{warp["owner"]}'s Player Warp: {warp["name"]}\nCreated at {warp["created"]} and visited at least {warp["visits"]} times!"))
  head.append(warpDoc.new_tag("meta", property="og:image", content=f"{baseUrl}/{warp["imageUrl"]}"))
  head.append(warpDoc.new_tag("meta", property="og:image:type", content="image/webp"))
  head.append(warpDoc.new_tag("meta", property="og:image:alt", content=f"Screenshot of Player Warp {warp["name"]}"))

  head.append(warpDoc.new_tag("meta", property="twitter:card", content="summary_large_image")) # request bigger image
  head.append(warpDoc.new_tag("meta", property="theme-color", content="#55FFFF")) # §b

  # Safe to static/warp/<safeName>/index.html
  indexFilePath = os.path.join(staticDirectory, "warp", warp["safeName"], "index.html")
  os.makedirs(os.path.dirname(indexFilePath), exist_ok=True)
  with open(indexFilePath, "wb") as f:
    f.write(warpDoc.encode_contents())
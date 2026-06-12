"""Merge resolved streaming links into tracks.js.

Usage: python tools/apply_links.py links.json tracks.js
Adds (or replaces) a `spotify:`/`apple:` line after each track's
license line. Idempotent — safe to re-run as links improve.
"""
import json
import re
import sys


def main():
    links_path, tracks_path = sys.argv[1], sys.argv[2]
    links = json.load(open(links_path, encoding="utf-8"))
    src = open(tracks_path, encoding="utf-8").read()

    # drop any previous link lines, then re-add fresh after the license line
    src = re.sub(r"\n[ \t]*spotify:[^\n]*", "", src)
    src = re.sub(r"\n[ \t]*apple:[^\n]*", "", src)

    def add_links(m):
        entry = m.group(0)
        title = re.search(r"title:\s*'([^']+)'", entry).group(1)
        l = links.get(title)
        if not l:
            return entry
        lines = []
        if l.get("spotify"):
            lines.append(f"    spotify: '{l['spotify']}',")
        if l.get("apple"):
            lines.append(f"    apple: '{l['apple']}',")
        if not lines:
            return entry
        return re.sub(r"(\n[^\n]*license:[^\n]*)", r"\1\n" + "\n".join(lines).replace("\\", "\\\\"), entry)

    src = re.sub(r"\{[^{}]*?title:[^{}]*?\},", add_links, src, flags=re.S)
    open(tracks_path, "w", encoding="utf-8", newline="\n").write(src)
    n = src.count("spotify:")
    print(f"applied: {n} spotify, {src.count('apple:')} apple links")


if __name__ == "__main__":
    main()

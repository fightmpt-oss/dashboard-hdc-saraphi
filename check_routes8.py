import re

with open(r"d:\PROJECTS\Dashboard HDC Saraphi\8-es2015.d4290ed1a4afcd98f2f6.js", "r", encoding="utf-8", errors="ignore") as f:
    text = f.read()

paths = re.findall(r'path:\s*["\']([^"\']+)["\']', text)
print("Routes in chunk 8:", paths)

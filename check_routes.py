import re

with open(r"d:\PROJECTS\Dashboard HDC Saraphi\main-es2015.574d89f3cbe8eddceebd.js", "r", encoding="utf-8", errors="ignore") as f:
    text = f.read()

# search for path:
paths = re.findall(r'path:\s*["\']([^"\']+)["\']', text)
print("Routes in main:", paths)

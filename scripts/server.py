import http.server
import json
import os
import subprocess
import sys
import threading
from datetime import datetime

sys.stdout.reconfigure(encoding='utf-8')

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8095
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA_DIR = os.path.join(ROOT_DIR, "data", "nhso")
META_PATH = os.path.join(DATA_DIR, "nhso_sync_metadata.json")

sync_lock = threading.Lock()
current_sync_process = None

def run_sync_task(sheets=None, years=None):
    global current_sync_process
    cmd = [sys.executable, os.path.join(ROOT_DIR, "scripts", "sync_nhso_medata_realtime.py")]
    if sheets:
        cmd.extend(["--sheets"] + sheets)
    if years:
        cmd.extend(["--years"] + years)

    try:
        current_sync_process = subprocess.Popen(
            cmd, cwd=ROOT_DIR, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, encoding="utf-8"
        )
        stdout, _ = current_sync_process.communicate()
        print(f"[Sync Process Finished with code {current_sync_process.returncode}]")
    except Exception as e:
        print(f"[Sync Process Error: {e}]")
    finally:
        current_sync_process = None

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT_DIR, **kwargs)

    def do_GET(self):
        global current_sync_process
        if self.path == "/api/nhso-sync-status":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()

            is_running = current_sync_process is not None and current_sync_process.poll() is None
            meta = {}
            if os.path.exists(META_PATH):
                try:
                    with open(META_PATH, "r", encoding="utf-8") as f:
                        meta = json.load(f)
                except Exception:
                    pass
            meta["is_running"] = is_running
            self.wfile.write(json.dumps(meta, ensure_ascii=False).encode("utf-8"))
            return

        if self.path.startswith("/api/nhso-live-sync"):
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()

            if current_sync_process is not None and current_sync_process.poll() is None:
                resp = {"status": "already_running", "message": "ระบบกำลังดำเนินการซิงค์ข้อมูลอยู่ในขณะนี้..."}
            else:
                t = threading.Thread(target=run_sync_task, daemon=True)
                t.start()
                resp = {"status": "started", "message": "เริ่มกระบวนการดึงข้อมูล สปสช. MeData เรียบร้อยแล้ว"}
            self.wfile.write(json.dumps(resp, ensure_ascii=False).encode("utf-8"))
            return

        return super().do_GET()

    def do_POST(self):
        if self.path == "/api/nhso-live-sync":
            return self.do_GET()
        return super().do_POST()

if __name__ == "__main__":
    os.chdir(ROOT_DIR)
    server = http.server.ThreadingHTTPServer(("", PORT), CustomHandler)
    print(f"🚀 Dashboard Server with Live Sync API running at http://localhost:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
        server.server_close()

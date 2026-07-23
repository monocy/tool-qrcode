# -*- coding: utf-8 -*-
"""Local Smoke Test for Single HTML Tool using http.server and Playwright."""
import sys
import http.server
import socketserver
import threading
import time
import re
from pathlib import Path
from playwright.sync_api import sync_playwright

PORT = 8099
EXPOSED_VAR_PATTERN = re.compile(r"(\[\[\s*.*?\s*\]\]|\{\{\s*.*?\s*\}\})")
UNDEFINED_LEAK_PATTERN = re.compile(r"\b(undefined|NaN|\[object Object\])\b")

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass  # suppress logging to console

    def translate_path(self, path):
        # Redirect absolute static paths to the shared asset directory
        res = super().translate_path(path)
        if path.startswith("/static/"):
            # The test script is located in assets/official/free_web_tools/tools/<tool>/.ai/tests/smoke_app.py
            # So the root of free_web_tools is 5 levels up (parents[4])
            base_dir = Path(__file__).resolve().parents[4]
            res = str(base_dir / path.lstrip("/"))
        print(f"[TEST SERVER] translate_path: {path} -> {res} (exists: {Path(res).exists()})")
        return res

def start_server():
    handler = Handler
    # Use TCPServer with allow_reuse_address to avoid port binding locks
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("127.0.0.1", PORT), handler) as httpd:
        httpd.serve_forever()

def main():
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(1) # wait for boot
    
    url = f"http://127.0.0.1:{PORT}/index.html"
    passed = True
    issues = []
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        console_errors = []
        page_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda exc: page_errors.append(str(exc)))
        
        try:
            response = page.goto(url, wait_until="networkidle", timeout=5000)
            if not response or response.status != 200:
                issues.append(f"HTTP Status: {response.status if response else 'No Response'}")
                passed = False
            else:
                body_text = page.inner_text("body")
                
                # Check mustache leaks
                var_matches = EXPOSED_VAR_PATTERN.findall(body_text)
                if var_matches:
                    issues.append(f"Exposed variables: {var_matches}")
                    passed = False
                    
                # Check undefined leakages
                undef_matches = UNDEFINED_LEAK_PATTERN.findall(body_text)
                if undef_matches:
                    issues.append(f"Undefined/NaN leaks: {undef_matches}")
                    passed = False
                    
                # Check JS errors
                if console_errors:
                    issues.append(f"Console errors: {console_errors}")
                    passed = False
                if page_errors:
                    issues.append(f"Page Exceptions: {page_errors}")
                    passed = False
        except Exception as e:
            issues.append(f"Execution Error: {e}")
            passed = False
        finally:
            browser.close()
            
    if passed:
        print("[PASS] Smoke test cleared successfully.")
        return 0
    else:
        print(f"[FAIL] Smoke test failed with issues: {issues}")
        return 1

if __name__ == "__main__":
    sys.exit(main())

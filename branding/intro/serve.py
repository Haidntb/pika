#!/usr/bin/env python3
"""Máy chủ xem lab intro Pika: như python3 -m http.server nhưng dặn trình duyệt không giữ bản cũ,
để sửa trang hay đổi tên thư mục version là tải lại thấy ngay.
Dùng: python3 serve.py [cổng=8842]   (chạy trong thư mục này)"""
import sys, http.server, functools

class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, max-age=0')
        super().end_headers()

port = int(sys.argv[1]) if len(sys.argv) > 1 else 8842
handler = functools.partial(NoCache, directory='.')
http.server.ThreadingHTTPServer(('127.0.0.1', port), handler).serve_forever()

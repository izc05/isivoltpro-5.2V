from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class PanelRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Evita que el navegador conserve una versión anterior del panel.
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_GET(self):
        if self.path == '/':
            self.path = '/index_panel.html'
        return super().do_GET()


if __name__ == '__main__':
    server = ThreadingHTTPServer(('0.0.0.0', 8000), PanelRequestHandler)
    print('Servidor iniciado en http://0.0.0.0:8000')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()

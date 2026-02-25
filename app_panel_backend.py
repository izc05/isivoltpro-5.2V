from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class PanelRequestHandler(SimpleHTTPRequestHandler):
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

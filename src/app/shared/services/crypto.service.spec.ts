import { CryptoService } from './crypto.service';

describe('When using the crypto service', () => {
    let cryptoService: CryptoService;

    beforeEach(() => {
        cryptoService = new CryptoService(null);
    });

    it('should verify and parse JWS', (cb) => {
        const jws = getJws();

        cryptoService
            .verifyAndParseJWS(jws)
            .then(data => {
                expect(data.signed).toBe(jws);
                cb();
            });
    });

    function getJws(): String {
        return 'eyJhbGciOiJFUzI1NiIsImp3ayI6eyJrdHkiOiJFQyIsImNydiI6IlAtMjU2I' +
        'iwieCI6ImFHV2hXYkdYR212bUExUTNieTJTVFg2SERfZGFKRTZ5SDQyNFZ0UXRjdUEiLCJ5IjoiR3pQLUJzSDIxZlpQbnJ2bmtmM1J4RX' +
        'laSy1RU2FhejBVQ0R5ME5xUzZfayJ9LCJraWQiOiJXRHhZWmx3WF9NOG5tbVVTUklGc0NORGVpVG43VXNLR3pwaGwzQ3FaOFgwPSJ9.ey' +
        'JAdHlwZSI6Imh0dHBzOi8vc2NoZW1hLmJyaWNrY2hhaW4uY29tL3YyL2FjdGlvbi1kZXNjcmlwdG9yLmpzb24iLCJAdGltZXN0YW1wIjoiM' +
        'jAxOC0wOC0wMlQwOTowNDoyNC4yNjE2NzgzNjVaIiwiQGlkIjoiZjNkYjZiMGMtNDZiNi00NzY1LWI0NDAtZWU3MGIwNThjMWMzIiwibGFi' +
        'ZWwiOiJEaXNjbyIsInJvbGVzIjpbImFkbWluQGplc3Blci10dW5uZWwucGx1c2ludGVncml0eS5jb20iXSwidWlVUkkiOiJodHRwczovL2p' +
        'lc3Blci10dW5uZWwucGx1c2ludGVncml0eS5jb20vaGFzcy9oYXNzLXdlYmFwcC8iLCJhY3Rpb25VUkkiOiJodHRwczovL2plc3Blci10dW' +
        '5uZWwucGx1c2ludGVncml0eS5jb20vc2VydmljZS9oYXNzL2FjdGlvbi9mM2RiNmIwYy00NmI2LTQ3NjUtYjQ0MC1lZTcwYjA1OGMxYzM_Y' +
        'mluZGluZz1kZWZhdWx0IiwicmVmcmVzaFVSSSI6Imh0dHBzOi8vamVzcGVyLXR1bm5lbC5wbHVzaW50ZWdyaXR5LmNvbS9zZXJ2aWNlL2hh' +
        'c3MvZGVzY3JpcHRvcj9iaW5kaW5nPWRlZmF1bHQiLCJwYXJhbXMiOnsiZGV2aWNlIjoiZjNkYjZiMGMtNDZiNi00NzY1LWI0NDAtZWU3MGI' +
        'wNThjMWMzIn0sImljb24iOiJodHRwczovL2plc3Blci10dW5uZWwucGx1c2ludGVncml0eS5jb20vaGFzcy9oYXNzLXdlYmFwcC9hc3NldH' +
        'MvaWNvbnMvc3dpdGNoLnN2ZyIsImtleUxldmVsIjoxMH0.CUNEmRDd-7zsP6qqW6q_R5q2Q7E-LlxXam0X97wRS3mn5qyiPXPVR7KcjZrNz' +
        '2IFM3ypyuEkap3RfVr-DAXgfQ';
    }
});

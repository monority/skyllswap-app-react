import http from 'http';
import { Server } from 'socket.io';
import type { JwtPayload, ValidationResult } from './src/types/index.js';
declare const app: import("express-serve-static-core").Express;
declare const validateProfileUpdate: (input: unknown) => ValidationResult;
declare const countOverlap: (left: unknown, right: unknown) => number;
declare global {
    namespace Express {
        interface Request {
            auth?: JwtPayload;
        }
    }
}
declare const initSocketIO: (server: http.Server) => Server;
export { app, validateProfileUpdate, countOverlap, initSocketIO };
//# sourceMappingURL=index.d.ts.map
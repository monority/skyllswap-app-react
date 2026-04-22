import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { secretManager } from '../utils/secrets.js';

export interface JwtPayload {
    sub: string;
    email?: string;
    name?: string;
    type?: 'access' | 'refresh';
    iat?: number;
    exp?: number;
}

declare global {
    namespace Express {
        interface Request {
            auth?: JwtPayload;
        }
    }
}

export class AuthMiddleware {
    private static instance: AuthMiddleware;

    private constructor() { }

    static getInstance(): AuthMiddleware {
        if (!AuthMiddleware.instance) {
            AuthMiddleware.instance = new AuthMiddleware();
        }
        return AuthMiddleware.instance;
    }

    /**
     * Middleware pour vérifier les tokens JWT avec support de rotation
     */
    verifyTokenWithRotation(req: Request, res: Response, next: NextFunction): void {
        const header = req.headers.authorization || '';
        const headerParts = header.split(' ');
        const scheme = headerParts[0] || '';
        const token = headerParts[1] || '';
        const cookieToken = req.cookies ? req.cookies[process.env.SESSION_COOKIE_NAME || 'skillswap_session'] : null;
        const accessToken = scheme === 'Bearer' && token ? token : cookieToken ?? null;

        if (!accessToken) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        try {
            // Essayer de vérifier avec le secret courant
            const currentSecret = secretManager.getCurrentSecret('jwt');
            const payload = jwt.verify(accessToken, currentSecret) as JwtPayload;
            req.auth = payload;
            next();
        } catch (error) {
            // Si échec, essayer avec l'ancien secret (grace period)
            const previousSecret = secretManager.getPreviousSecret('jwt');
            if (previousSecret) {
                try {
                    const payload = jwt.verify(accessToken, previousSecret) as JwtPayload;
                    req.auth = payload;

                    // Loguer l'utilisation d'un ancien secret (pour monitoring)
                    console.warn('⚠️ Token verified with previous secret', {
                        userId: payload.sub,
                        timestamp: new Date().toISOString()
                    });

                    next();
                    return;
                } catch {
                    // Les deux secrets ont échoué
                }
            }

            // Token invalide ou expiré
            if ((error as Error).name === 'TokenExpiredError') {
                res.status(401).json({
                    message: 'Invalid or expired token',
                    code: 'TOKEN_EXPIRED'
                });
            } else {
                res.status(401).json({
                    message: 'Invalid token',
                    code: 'TOKEN_INVALID'
                });
            }
        }
    }

    /**
     * Middleware pour vérifier les tokens de rafraîchissement
     */
    verifyRefreshToken(req: Request, res: Response, next: NextFunction): void {
        const refreshToken = req.cookies ? req.cookies[process.env.REFRESH_TOKEN_COOKIE_NAME || 'skillswap_refresh'] : null;

        if (!refreshToken) {
            res.status(401).json({ message: 'Refresh token required' });
            return;
        }

        try {
            const currentSecret = secretManager.getCurrentSecret('jwt');
            const payload = jwt.verify(refreshToken, currentSecret) as JwtPayload;

            if (payload.type !== 'refresh') {
                res.status(401).json({ message: 'Invalid refresh token type' });
                return;
            }

            req.auth = payload;
            next();
        } catch (error) {
            // Essayer avec l'ancien secret
            const previousSecret = secretManager.getPreviousSecret('jwt');
            if (previousSecret) {
                try {
                    const payload = jwt.verify(refreshToken, previousSecret) as JwtPayload;

                    if (payload.type !== 'refresh') {
                        res.status(401).json({ message: 'Invalid refresh token type' });
                        return;
                    }

                    req.auth = payload;

                    console.warn('⚠️ Refresh token verified with previous secret', {
                        userId: payload.sub,
                        timestamp: new Date().toISOString()
                    });

                    next();
                    return;
                } catch {
                    // Les deux secrets ont échoué
                }
            }

            res.status(401).json({
                message: 'Invalid or expired refresh token',
                code: 'REFRESH_TOKEN_INVALID'
            });
        }
    }

    /**
     * Générer un token JWT avec le secret courant
     */
    signToken(payload: Omit<JwtPayload, 'iat' | 'exp'>, expiresIn: string | number): string {
        const secret = secretManager.getCurrentSecret('jwt');
        return jwt.sign(payload, secret, { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] });
    }

    /**
     * Vérifier si l'utilisateur a un rôle spécifique
     */
    requireRole(_role: string) {
        return (req: Request, res: Response, next: NextFunction): void => {
            if (!req.auth) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            // Pour l'instant, tous les utilisateurs ont le même rôle
            // À étendre pour supporter différents rôles
            next();
        };
    }

    /**
     * Vérifier si l'utilisateur est le propriétaire de la ressource
     */
    requireOwnership(_paramName: string = 'id') {
        return (req: Request, res: Response, next: NextFunction): void => {
            if (!req.auth) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            // Vérifier l'accès à la ressource
            // À implémenter selon les besoins de l'application
            next();
        };
    }

    /**
     * Loguer les tentatives d'authentification échouées
     */
    logFailedAttempt(req: Request, error: string): void {
        const ip = req.ip || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];
        const endpoint = req.originalUrl;

        console.warn('🔐 Failed authentication attempt', {
            ip,
            userAgent,
            endpoint,
            error,
            timestamp: new Date().toISOString()
        });
    }
}

export const authMiddleware = AuthMiddleware.getInstance();
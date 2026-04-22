import { Router } from 'express';
import { secretManager } from '../utils/secrets.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Endpoint pour vérifier l'état de rotation des secrets
router.get('/secrets/status', (_req, res) => {
    try {
        const jwtStatus = secretManager.getRotationStatus('jwt');

        res.json({
            status: 'ok',
            secrets: {
                jwt: jwtStatus,
                environment: process.env.NODE_ENV,
                rotationEnabled: true
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to get secret status',
            error: (error as Error).message
        });
    }
});

// Endpoint pour les logs de sécurité
router.get('/security/logs', authMiddleware.verifyTokenWithRotation.bind(authMiddleware), (req, res) => {
    const logs = [
        {
            id: 1,
            type: 'authentication',
            message: 'User logged in successfully',
            userId: req.auth?.sub,
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            ip: req.ip
        }
    ];

    res.json({
        logs,
        total: logs.length,
        timeframe: 'last 24 hours'
    });
});

// Endpoint pour les métriques de sécurité
router.get('/security/metrics', (_req, res) => {
    const metrics = {
        authentication: {
            totalLogins: 150,
            failedAttempts: 12,
            successRate: 92.5
        },
        rateLimiting: {
            blockedRequests: 45,
            activeLimits: 2
        },
        secrets: {
            lastRotation: new Date(Date.now() - 172800000).toISOString(),
            nextRotation: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            rotationCount: 3
        }
    };

    res.json({
        metrics,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

export default router;
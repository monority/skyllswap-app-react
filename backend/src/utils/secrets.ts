import crypto from 'crypto';

/**
 * Gestion sécurisée des secrets JWT avec rotation
 */

export interface JwtSecretRotation {
    current: string;
    previous: string | null;
    rotatedAt: Date;
}

export class SecretManager {
    private static instance: SecretManager;
    private secrets: Map<string, JwtSecretRotation> = new Map();
    private rotationInterval: number = 7 * 24 * 60 * 60 * 1000; // 7 jours

    private constructor() {
        this.initializeSecrets();
    }

    static getInstance(): SecretManager {
        if (!SecretManager.instance) {
            SecretManager.instance = new SecretManager();
        }
        return SecretManager.instance;
    }

    private initializeSecrets(): void {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET is required in environment variables');
        }

        this.secrets.set('jwt', {
            current: jwtSecret,
            previous: null,
            rotatedAt: new Date()
        });

        // Planifier la rotation automatique
        this.scheduleRotation();
    }

    private scheduleRotation(): void {
        setInterval(() => {
            this.rotateSecret('jwt');
        }, this.rotationInterval);
    }

    rotateSecret(key: string): void {
        const currentRotation = this.secrets.get(key);
        if (!currentRotation) {
            return;
        }

        const newSecret = crypto.randomBytes(64).toString('hex');

        this.secrets.set(key, {
            current: newSecret,
            previous: currentRotation.current,
            rotatedAt: new Date()
        });

        console.log(`🔄 Secret ${key} rotated at ${new Date().toISOString()}`);

        // En production, on pourrait notifier un service de gestion des secrets
        // ou mettre à jour les variables d'environnement
        if (process.env.NODE_ENV === 'production') {
            this.logRotation(key);
        }
    }

    getCurrentSecret(key: string): string {
        const rotation = this.secrets.get(key);
        if (!rotation) {
            throw new Error(`Secret ${key} not found`);
        }
        return rotation.current;
    }

    getPreviousSecret(key: string): string | null {
        const rotation = this.secrets.get(key);
        return rotation?.previous || null;
    }

    verifyTokenWithRotation(token: string, key: string = 'jwt'): boolean {
        const rotation = this.secrets.get(key);
        if (!rotation) {
            return false;
        }

        // Essayer avec le secret courant
        try {
            this.verifyToken(token, rotation.current);
            return true;
        } catch {
            // Si échec, essayer avec l'ancien secret (grace period)
            if (rotation.previous) {
                try {
                    this.verifyToken(token, rotation.previous);
                    return true;
                } catch {
                    return false;
                }
            }
            return false;
        }
    }

    private verifyToken(token: string, secret: string): void {
        // Cette fonction simule la vérification JWT
        // En réalité, elle serait implémentée avec jsonwebtoken.verify
        // C'est un placeholder pour la logique de rotation
        if (!token || !secret) {
            throw new Error('Invalid token or secret');
        }
    }

    private logRotation(key: string): void {
        const rotation = this.secrets.get(key);
        if (!rotation) return;

        const logEntry = {
            event: 'secret_rotation',
            key,
            rotatedAt: rotation.rotatedAt,
            environment: process.env.NODE_ENV,
            timestamp: new Date().toISOString()
        };

        console.log(JSON.stringify(logEntry));
    }

    getRotationStatus(key: string): {
        current: boolean;
        previous: boolean;
        rotatedAt: Date;
        nextRotation: Date;
    } {
        const rotation = this.secrets.get(key);
        if (!rotation) {
            throw new Error(`Secret ${key} not found`);
        }

        return {
            current: true,
            previous: !!rotation.previous,
            rotatedAt: rotation.rotatedAt,
            nextRotation: new Date(rotation.rotatedAt.getTime() + this.rotationInterval)
        };
    }
}

// Export singleton instance
export const secretManager = SecretManager.getInstance();

// Helper functions
export function generateSecureSecret(length: number = 64): string {
    return crypto.randomBytes(length).toString('hex');
}

export function validateSecretStrength(secret: string): {
    isValid: boolean;
    reasons: string[];
} {
    const reasons: string[] = [];

    if (secret.length < 32) {
        reasons.push('Secret too short (min 32 characters)');
    }

    if (!/[A-Z]/.test(secret)) {
        reasons.push('Missing uppercase letters');
    }

    if (!/[a-z]/.test(secret)) {
        reasons.push('Missing lowercase letters');
    }

    if (!/[0-9]/.test(secret)) {
        reasons.push('Missing numbers');
    }

    if (!/[^A-Za-z0-9]/.test(secret)) {
        reasons.push('Missing special characters');
    }

    return {
        isValid: reasons.length === 0,
        reasons
    };
}
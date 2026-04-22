/**
 * Logger de sécurité simplifié
 */

export interface SecurityEvent {
    type: 'authentication' | 'authorization' | 'input_validation' | 'rate_limit' | 'csrf' | 'secret_rotation' | 'error';
    level: 'info' | 'warn' | 'error' | 'critical';
    message: string;
    userId?: string;
    ip?: string;
    userAgent?: string;
    endpoint?: string;
    metadata?: Record<string, unknown>;
    timestamp: Date;
}

export class SecurityLogger {
    private static instance: SecurityLogger;
    private events: SecurityEvent[] = [];
    private maxEvents: number = 10000;

    private constructor() { }

    static getInstance(): SecurityLogger {
        if (!SecurityLogger.instance) {
            SecurityLogger.instance = new SecurityLogger();
        }
        return SecurityLogger.instance;
    }

    log(event: Omit<SecurityEvent, 'timestamp'>): void {
        const fullEvent: SecurityEvent = {
            ...event,
            timestamp: new Date()
        };

        // Ajouter à l'historique
        this.events.push(fullEvent);

        // Garder seulement les derniers événements
        if (this.events.length > this.maxEvents) {
            this.events = this.events.slice(-this.maxEvents);
        }

        // Loguer dans la console (structuré JSON)
        const logEntry = {
            level: fullEvent.level,
            type: 'security',
            event: fullEvent.type,
            message: fullEvent.message,
            userId: fullEvent.userId,
            ip: fullEvent.ip,
            endpoint: fullEvent.endpoint,
            timestamp: fullEvent.timestamp.toISOString(),
            metadata: fullEvent.metadata
        };

        const logMethod = {
            info: console.log,
            warn: console.warn,
            error: console.error,
            critical: console.error
        }[fullEvent.level];

        logMethod(JSON.stringify(logEntry));
    }

    getEvents(filter?: Partial<SecurityEvent>): SecurityEvent[] {
        if (!filter) {
            return [...this.events];
        }

        return this.events.filter(event => {
            for (const [key, value] of Object.entries(filter)) {
                if (event[key as keyof SecurityEvent] !== value) {
                    return false;
                }
            }
            return true;
        });
    }

    getStats(timeframe: number = 24 * 60 * 60 * 1000): {
        total: number;
        byType: Record<string, number>;
        byLevel: Record<string, number>;
    } {
        const cutoff = new Date(Date.now() - timeframe);
        const recentEvents = this.events.filter(e => e.timestamp > cutoff);

        const byType: Record<string, number> = {};
        const byLevel: Record<string, number> = {};

        for (const event of recentEvents) {
            byType[event.type] = (byType[event.type] || 0) + 1;
            byLevel[event.level] = (byLevel[event.level] || 0) + 1;
        }

        return {
            total: recentEvents.length,
            byType,
            byLevel
        };
    }

    clearEvents(): void {
        this.events = [];
    }
}

// Export singleton instance
export const securityLogger = SecurityLogger.getInstance();

// Helper functions pour les événements courants
export function logAuthenticationSuccess(userId: string, ip?: string, userAgent?: string): void {
    securityLogger.log({
        type: 'authentication',
        level: 'info',
        message: 'User authenticated successfully',
        userId,
        ip,
        userAgent,
        metadata: { action: 'login' }
    });
}

export function logAuthenticationFailure(reason: string, ip?: string, userAgent?: string, endpoint?: string): void {
    securityLogger.log({
        type: 'authentication',
        level: 'error',
        message: `Authentication failed: ${reason}`,
        ip,
        userAgent,
        endpoint,
        metadata: { reason }
    });
}
import { Request, Response, NextFunction } from "express";

// Interface pour le cache en mémoire
interface MemoryCache {
    [key: string]: {
        value: unknown;
        expiry: number;
    };
}

// Cache en mémoire (fallback si Redis non configuré)
const memoryCache: MemoryCache = {};

// Configuration du cache
interface CacheConfig {
    ttl: number; // Time to live en secondes
    prefix: string; // Préfixe pour les clés de cache
}

const defaultConfig: CacheConfig = {
    ttl: 300, // 5 minutes par défaut
    prefix: "skyll:",
};

/**
 * Génère une clé de cache basée sur la requête
 */
export function generateCacheKey(req: Request, prefix: string = defaultConfig.prefix): string {
    return `${prefix}${req.originalUrl || req.url}`;
}

/**
 * Middleware Express pour le cache en mémoire
 * Optimise les requêtes fréquentes
 */
export function cacheMiddleware(config: Partial<CacheConfig> = {}) {
    const { ttl, prefix } = { ...defaultConfig, ...config };

    return (req: Request, res: Response, next: NextFunction): void => {
        // Seulement pour les requêtes GET
        if (req.method !== "GET") {
            return next();
        }

        const key = generateCacheKey(req, prefix);
        const cached = memoryCache[key];

        // Vérifier si la clé existe et n'a pas expiré
        if (cached && cached.expiry > Date.now()) {
            res.setHeader("X-Cache", "HIT");
            res.setHeader("X-Cache-Key", key);
            res.setHeader("Cache-Control", `public, max-age=${Math.floor(ttl / 60)}`);
            res.json(cached.value);
            return;
        }

        // Stocker la réponse originale
        const originalJson = res.json.bind(res);
        res.json = (body: unknown) => {
            // Mettre en cache si pas d'erreur
            if (res.statusCode >= 200 && res.statusCode < 300) {
                memoryCache[key] = {
                    value: body,
                    expiry: Date.now() + ttl * 1000,
                };
            }
            return originalJson(body);
        };

        res.setHeader("X-Cache", "MISS");
        next();
    };
}

/**
 * Invalide le cache (pour les opérations POST/PUT/DELETE)
 */
export function invalidateCache(pattern?: string): void {
    if (!pattern) {
        // Vider tout le cache
        Object.keys(memoryCache).forEach((key) => {
            delete memoryCache[key];
        });
        return;
    }

    // Supprimer les clés correspondant au pattern
    Object.keys(memoryCache).forEach((key) => {
        if (key.includes(pattern)) {
            delete memoryCache[key];
        }
    });
}

/**
 * Hook pour intégrer le cache avec Prisma (optionnel)
 */
export function withCache<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = defaultConfig.ttl
): Promise<T> {
    const cached = memoryCache[key];

    if (cached && cached.expiry > Date.now()) {
        return Promise.resolve(cached.value as T);
    }

    return fetchFn().then((result) => {
        memoryCache[key] = {
            value: result,
            expiry: Date.now() + ttl * 1000,
        };
        return result;
    });
}

/**
 * Nettoie le cache expiré (à appeler périodiquement)
 */
export function cleanExpiredCache(): number {
    const now = Date.now();
    let cleaned = 0;

    Object.keys(memoryCache).forEach((key) => {
        if (memoryCache[key].expiry <= now) {
            delete memoryCache[key];
            cleaned++;
        }
    });

    return cleaned;
}
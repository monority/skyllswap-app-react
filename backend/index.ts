import express, { Response, NextFunction, Request } from 'express';
import crypto from 'crypto';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import http from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from './src/middleware/auth.js';
// import { secretManager } from './src/utils/secrets.js';
import {
  logAuthenticationSuccess,
  logAuthenticationFailure
} from './src/utils/securityLogger-simple.js';
import type {
  JwtPayload,
  ProfileData,
  ProfileUpdateInput,
  ValidationResult,
  UserPublic,
  MatchItem,
  ConversationWithParticipants,
  MessageData,
} from './src/types/index.js';

dotenv.config();

// Vérification des variables d'environnement requises
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Variables d\'environnement manquantes:', missingVars.join(', '));
  console.error('Pour résoudre ce problème sur Render:');
  console.error('1. Allez sur le dashboard Render');
  console.error('2. Sélectionnez votre service "skillswap-api"');
  console.error('3. Cliquez sur "Environment" dans le menu de gauche');
  console.error('4. Ajoutez les variables manquantes');
  process.exit(1);
}

console.log('✅ Variables d\'environnement vérifiées');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('FRONTEND_ORIGIN:', process.env.FRONTEND_ORIGIN || 'http://localhost:5173');

interface Logger {
  info: (msg: string, meta?: Record<string, unknown>) => void;
  error: (msg: string, meta?: Record<string, unknown>) => void;
  warn: (msg: string, meta?: Record<string, unknown>) => void;
}

const logger: Logger = {
  info: (msg, meta = {}) =>
    console.log(
      JSON.stringify({
        level: 'info',
        message: msg,
        timestamp: new Date().toISOString(),
        ...meta,
      })
    ),
  error: (msg, meta = {}) =>
    console.log(
      JSON.stringify({
        level: 'error',
        message: msg,
        timestamp: new Date().toISOString(),
        ...meta,
      })
    ),
  warn: (msg, meta = {}) =>
    console.log(
      JSON.stringify({
        level: 'warn',
        message: msg,
        timestamp: new Date().toISOString(),
        ...meta,
      })
    ),
};

const app = express();
const prisma = new PrismaClient();
const csrfTokens = new Map<number, { token: string; expires: number }>();
const PORT = process.env.PORT || 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required. Set it in your .env file.');
}
const ALLOWED_ORIGINS = FRONTEND_ORIGIN.split(',').map((origin) =>
  origin.trim()
).filter(Boolean);
const SESSION_COOKIE_NAME =
  process.env.SESSION_COOKIE_NAME || 'skillswap_session';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const hasLocalOrigin = ALLOWED_ORIGINS.some(
  (origin) => origin.includes('localhost') || origin.includes('127.0.0.1')
);
const COOKIE_SECURE =
  process.env.COOKIE_SECURE === 'true'
    ? true
    : process.env.COOKIE_SECURE === 'false'
      ? false
      : !hasLocalOrigin;
const COOKIE_SAME_SITE: 'none' | 'lax' = COOKIE_SECURE ? 'none' : 'lax';

app.set('trust proxy', 1);

const skills = [
  { id: 1, title: 'JavaScript', level: 'Intermediaire', offers: 14, needs: 9 },
  { id: 2, title: 'Design UI', level: 'Debutant', offers: 6, needs: 19 },
  { id: 3, title: 'Photographie', level: 'Intermediaire', offers: 11, needs: 7 },
  {
    id: 4,
    title: 'Anglais conversation',
    level: 'Tous niveaux',
    offers: 20,
    needs: 13,
  },
  { id: 5, title: 'React', level: 'Intermediaire', offers: 12, needs: 18 },
  {
    id: 6,
    title: 'Cuisine italienne',
    level: 'Debutant',
    offers: 8,
    needs: 15,
  },
];

const AVAILABILITY_OPTIONS = new Set([
  'matin',
  'apres-midi',
  'soir',
  'week-end',
  'flexible',
]);

const normalizeText = (value: unknown): string => String(value).trim();

const normalizeSkillList = (value: unknown): string[] | null => {
  if (!Array.isArray(value)) {
    return null;
  }

  const cleaned = (value as unknown[])
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter(Boolean)
    .map((entry) => entry.slice(0, 40));

  return [...new Set(cleaned)];
};

const validateProfileUpdate = (input: unknown): ValidationResult => {
  const next: ProfileUpdateInput = {};
  const data = input as Record<string, unknown>;

  if (Object.prototype.hasOwnProperty.call(data, 'city')) {
    if (typeof data.city !== 'string') {
      return { error: 'city must be a string' };
    }

    const city = normalizeText(data.city);
    if (city.length < 2 || city.length > 60) {
      return { error: 'city must have between 2 and 60 chars' };
    }

    next.city = city;
  }

  if (Object.prototype.hasOwnProperty.call(data, 'availability')) {
    if (typeof data.availability !== 'string') {
      return { error: 'availability must be a string' };
    }

    const availability = normalizeText(data.availability).toLowerCase();
    if (!AVAILABILITY_OPTIONS.has(availability)) {
      return {
        error:
          'availability must be one of: matin, apres-midi, soir, week-end, flexible',
      };
    }

    next.availability = availability;
  }

  if (Object.prototype.hasOwnProperty.call(data, 'offers')) {
    const offers = normalizeSkillList(data.offers);
    if (!offers) {
      return { error: 'offers must be an array of strings' };
    }

    if (
      offers.length > 20 ||
      offers.some((item) => item.length < 2 || item.length > 40)
    ) {
      return { error: 'offers accepts up to 20 items (2-40 chars each)' };
    }

    next.offers = offers;
  }

  if (Object.prototype.hasOwnProperty.call(data, 'needs')) {
    const needs = normalizeSkillList(data.needs);
    if (!needs) {
      return { error: 'needs must be an array of strings' };
    }

    if (
      needs.length > 20 ||
      needs.some((item) => item.length < 2 || item.length > 40)
    ) {
      return { error: 'needs accepts up to 20 items (2-40 chars each)' };
    }

    next.needs = needs;
  }

  return { next };
};

const serializeProfile = (profile: ProfileData): ProfileData => ({
  city: profile.city,
  availability: profile.availability,
  offers: profile.offers,
  needs: profile.needs,
});

const toNormalizedSet = (items: unknown): Set<string> =>
  new Set(
    ((items as string[]) || [])
      .map((item) => item.toString().trim().toLowerCase())
      .filter(Boolean)
  );

const countOverlap = (left: unknown, right: unknown): number => {
  const leftSet = toNormalizedSet(left);
  const rightSet = toNormalizedSet(right);
  let count = 0;

  for (const value of leftSet) {
    if (rightSet.has(value)) {
      count += 1;
    }
  }

  return count;
};

interface UserWithProfile {
  id: number;
  name: string;
  email: string;
  profile: ProfileData | null;
}

const toPublicUser = (user: UserWithProfile): UserPublic => ({
  id: user.id,
  name: user.name,
  profile: user.profile ? serializeProfile(user.profile) : null,
});

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const REFRESH_TOKEN_COOKIE_NAME =
  process.env.REFRESH_TOKEN_COOKIE_NAME || 'skillswap_refresh';

let io: Server | null = null;

const signAccessToken = (user: UserWithProfile): string =>
  authMiddleware.signToken(
    {
      sub: user.id.toString(),
      email: user.email,
      name: user.name,
    },
    ACCESS_TOKEN_TTL
  );

const signRefreshToken = (user: UserWithProfile): string =>
  authMiddleware.signToken(
    {
      sub: user.id.toString(),
      type: 'refresh',
    },
    '7d'
  );

const sessionCookieOptions = {
  httpOnly: true,
  secure: COOKIE_SECURE,
  sameSite: COOKIE_SAME_SITE,
  maxAge: SESSION_TTL_MS,
  path: '/',
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: COOKIE_SECURE,
  sameSite: COOKIE_SAME_SITE,
  maxAge: REFRESH_TOKEN_TTL_MS,
  path: '/',
};

const setSessionCookies = async (res: Response, user: UserWithProfile) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  await prisma.refreshToken.deleteMany({
    where: { userId: user.id },
  });
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    },
  });

  res.cookie(SESSION_COOKIE_NAME, accessToken, sessionCookieOptions);
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, refreshCookieOptions);
};

const clearAllCookies = (res: Response) => {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: COOKIE_SAME_SITE,
    path: '/',
  });
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: COOKIE_SAME_SITE,
    path: '/',
  });
};

const verifyRefreshToken = async (token: string): Promise<JwtPayload | null> => {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    if (payload.type !== 'refresh') {
      return null;
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
};

// Utiliser le middleware d'authentification avec rotation de secrets
const authRequired = authMiddleware.verifyTokenWithRotation.bind(authMiddleware);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many authentication attempts. Try again later.',
  },
});

const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many requests. Please slow down.',
  },
});

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const generateCsrfToken = async (userId: number): Promise<string> => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 3600000);

  try {
    await prisma.csrfToken.upsert({
      where: { userId },
      update: { token, expiresAt, createdAt: new Date() },
      create: { userId, token, expiresAt },
    });
  } catch {
    // Silently handle errors
  }

  return token;
};

const verifyCsrfToken = async (
  userId: number,
  token: string | undefined
): Promise<boolean> => {
  if (!token || !userId) return false;

  try {
    const stored = await prisma.csrfToken.findUnique({
      where: { userId },
    });
    if (stored && stored.expiresAt > new Date() && stored.token === token) {
      return true;
    }
  } catch {
    // Silently handle errors
  }

  return false;
};

const csrfProtection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const publicPaths = [
    '/api/auth/register',
    '/api/auth/login',
    '/api/health',
    '/api/skills',
    '/api/matches/preview',
    '/api/matches/me',
  ];
  if (
    req.method === 'GET' &&
    publicPaths.some((p) => req.path.startsWith(p))
  ) {
    return next();
  }
  const token = req.headers['x-csrf-token'] as string | undefined;
  if (
    !token ||
    !req.auth?.sub ||
    !(await verifyCsrfToken(Number(req.auth.sub), token))
  ) {
    return res.status(403).json({ message: 'invalid csrf token' });
  }
  next();
};

app.use(compression());
app.use(
  helmet({
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"], // unsafe-inline pour le développement
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: [
          "'self'",
          'http://localhost:4000',
          'ws://localhost:5173',
          'wss://localhost:5173'
        ],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        workerSrc: ["'self'", 'blob:'],
        manifestSrc: ["'self'"],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : undefined as any,
      },
      reportOnly: process.env.NODE_ENV === 'development',
    },
    crossOriginEmbedderPolicy: false,
  })
);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('CORS origin not allowed'));
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '100kb' }));
app.use(globalLimiter);

app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'skillswap-local-api' });
});

app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: 'name, email and password are required' });
    }

    const normalizedEmail = email.toString().trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: 'invalid email format' });
    }

    const normalizedName = name.toString().trim();
    if (normalizedName.length < 2 || normalizedName.length > 40) {
      return res
        .status(400)
        .json({ message: 'name must contain between 2 and 40 chars' });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: 'password must contain at least 8 chars' });
    }

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return res.status(409).json({ message: 'unable to create account' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: normalizedName,
        email: normalizedEmail,
        passwordHash,
        profile: {
          create: {
            city: 'Paris',
            availability: 'flexible',
            offers: [],
            needs: [],
          },
        },
      },
      include: {
        profile: true,
      },
    });

    await setSessionCookies(res, user as unknown as UserWithProfile);
    const csrfToken = await generateCsrfToken(user.id);
    return res
      .status(201)
      .json({ user: toPublicUser(user as unknown as UserWithProfile), csrfToken });
  } catch (error) {
    const err = error as Error;
    logger.error('Register failed:', { error: err.message });
    return res.status(500).json({ message: 'internal server error' });
  }
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];

    if (!email || !password) {
      logAuthenticationFailure('Missing email or password', ip, userAgent, '/api/auth/login');
      return res
        .status(400)
        .json({ message: 'email and password are required' });
    }

    const normalizedEmail = email.toString().trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
      logAuthenticationFailure('Invalid email format', ip, userAgent, '/api/auth/login');
      return res.status(400).json({ message: 'invalid email format' });
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        profile: true,
      },
    });

    if (!user) {
      logAuthenticationFailure('User not found', ip, userAgent, '/api/auth/login');
      return res.status(401).json({ message: 'invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      logAuthenticationFailure('Invalid password', ip, userAgent, '/api/auth/login');
      return res.status(401).json({ message: 'invalid credentials' });
    }

    await setSessionCookies(res, user as unknown as UserWithProfile);
    const csrfToken = await generateCsrfToken(user.id);

    logAuthenticationSuccess(user.id.toString(), ip, userAgent);

    return res.json({
      user: toPublicUser(user as unknown as UserWithProfile),
      csrfToken,
    });
  } catch (error) {
    const err = error as Error;
    logger.error('Login failed:', { error: err.message });
    logAuthenticationFailure('Server error', req.ip, req.headers['user-agent'], '/api/auth/login');
    return res.status(500).json({ message: 'internal server error' });
  }
});

app.post('/api/auth/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies
      ? req.cookies[REFRESH_TOKEN_COOKIE_NAME]
      : null;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    const payload = await verifyRefreshToken(refreshToken);
    if (!payload) {
      clearAllCookies(res);
      return res
        .status(401)
        .json({ message: 'Invalid or expired refresh token' });
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(payload.sub) },
      include: { profile: true },
    });

    if (!user) {
      clearAllCookies(res);
      return res.status(401).json({ message: 'User not found' });
    }

    await prisma.refreshToken.deleteMany({
      where: { userId: user.id },
    });

    await setSessionCookies(res, user as unknown as UserWithProfile);
    const csrfToken = await generateCsrfToken(user.id);

    return res.json({
      user: toPublicUser(user as unknown as UserWithProfile),
      csrfToken,
    });
  } catch (error) {
    const err = error as Error;
    logger.error('Refresh failed:', { error: err.message });
    return res.status(500).json({ message: 'internal server error' });
  }
});

app.get('/api/auth/me', authRequired, csrfProtection, async (req, res) => {
  try {
    const userId = Number(req.auth?.sub);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'user not found' });
    }

    return res.json({ user: toPublicUser(user as unknown as UserWithProfile) });
  } catch (error) {
    const err = error as Error;
    logger.error('Fetch current user failed:', { error: err.message });
    return res.status(500).json({ message: 'internal server error' });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies
      ? req.cookies[REFRESH_TOKEN_COOKIE_NAME]
      : null;
    if (refreshToken) {
      await prisma.refreshToken
        .deleteMany({
          where: { token: refreshToken },
        })
        .catch(() => { });
    }
  } catch {
    // Silently handle errors
  }

  clearAllCookies(res);
  return res.json({ message: 'logout ok' });
});

app.get(
  '/api/profile/me',
  authRequired,
  csrfProtection,
  async (req, res) => {
    try {
      const userId = Number(req.auth?.sub);
      const profile = await prisma.profile.findUnique({
        where: { userId },
      });

      if (!profile) {
        return res.status(404).json({ message: 'profile not found' });
      }

      return res.json({
        profile: serializeProfile(profile as unknown as ProfileData),
      });
    } catch (error) {
      const err = error as Error;
      logger.error('Fetch profile failed:', { error: err.message });
      return res.status(500).json({ message: 'internal server error' });
    }
  }
);

app.put(
  '/api/profile/me',
  authRequired,
  csrfProtection,
  async (req, res) => {
    try {
      const userId = Number(req.auth?.sub);
      const { next, error } = validateProfileUpdate(req.body || {});
      if (error) {
        return res.status(400).json({ message: error });
      }

      const profile = await prisma.profile.update({
        where: { userId },
        data: next!,
      });

      return res.json({
        profile: serializeProfile(profile as unknown as ProfileData),
        message: 'profile updated',
      });
    } catch (error) {
      const err = error as { code?: string; message: string };
      if (err.code === 'P2025') {
        return res.status(404).json({ message: 'profile not found' });
      }

      logger.error('Update profile failed:', { error: err.message });
      return res.status(500).json({ message: 'internal server error' });
    }
  }
);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'skillswap-local-api' });
});

app.get('/api/skills', (req, res) => {
  const q = (req.query.q || '').toString().trim().toLowerCase();
  const filtered = q
    ? skills.filter((skill) => skill.title.toLowerCase().includes(q))
    : skills;

  res.json({ count: filtered.length, items: filtered });
});

app.get('/api/matches/preview', (_req, res) => {
  const score = Math.floor(Math.random() * 31) + 65;

  res.json({
    user: 'Ronan',
    city: 'Paris',
    bestMatch: {
      pseudo: 'Camille',
      gives: 'React',
      wants: 'Design UI',
      compatibility: score,
    },
  });
});

app.get(
  '/api/matches/me',
  authRequired,
  csrfProtection,
  async (req, res) => {
    try {
      const currentUserId = Number(req.auth?.sub);
      const cityFilter = (req.query.city || '')
        .toString()
        .trim()
        .toLowerCase();
      const availFilter = (req.query.availability || '')
        .toString()
        .trim()
        .toLowerCase();

      const currentUser = await prisma.user.findUnique({
        where: { id: currentUserId },
        include: {
          profile: true,
        },
      });

      if (!currentUser || !currentUser.profile) {
        return res
          .status(404)
          .json({ message: 'profile not found for current user' });
      }

      const profileWhere: Record<string, unknown> = {};
      if (cityFilter) profileWhere.city = { contains: cityFilter, mode: 'insensitive' };
      if (availFilter && AVAILABILITY_OPTIONS.has(availFilter))
        profileWhere.availability = availFilter;

      const candidates = await prisma.user.findMany({
        where: {
          id: { not: currentUserId },
          profile: Object.keys(profileWhere).length > 0
            ? { is: profileWhere }
            : { isNot: null },
        },
        include: {
          profile: true,
        },
      });

      if (!candidates.length) {
        return res.json({
          user: currentUser.name,
          city: currentUser.profile.city,
          bestMatch: null,
          topMatches: [],
          message: 'Aucun autre profil disponible pour le moment.',
        });
      }

      const totalDesired = Math.max(
        1,
        (currentUser.profile.offers || []).length +
        (currentUser.profile.needs || []).length
      );

      const currentProfile = currentUser.profile;
      const ranked = candidates.map((candidate: typeof candidates[number]) => {
        const givesCount = countOverlap(
          currentProfile.offers,
          candidate.profile?.needs
        );
        const receivesCount = countOverlap(
          currentProfile.needs,
          candidate.profile?.offers
        );
        const base =
          ((givesCount + receivesCount) / totalDesired) * 80;
        const reciprocalBonus =
          givesCount > 0 && receivesCount > 0 ? 20 : 0;
        const compatibility = Math.min(
          100,
          Math.round(base + reciprocalBonus)
        );

        return {
          candidate,
          givesCount,
          receivesCount,
          compatibility,
        };
      });

      ranked.sort((a: { compatibility: number }, b: { compatibility: number }) => b.compatibility - a.compatibility);
      const best = ranked[0];

      const toMatchItem = ({
        candidate,
        givesCount,
        receivesCount,
        compatibility,
      }: {
        candidate: { id: number; name: string; profile: ProfileData | null };
        givesCount: number;
        receivesCount: number;
        compatibility: number;
      }): MatchItem => ({
        matchId: candidate.id,
        pseudo: candidate.name,
        gives:
          givesCount > 0 ? 'Competences compatibles trouvees' : 'Aucun recoupement fort',
        wants:
          receivesCount > 0
            ? 'Besoins reciproques identifies'
            : 'Peu de besoins reciproques',
        city: candidate.profile?.city || '',
        availability: candidate.profile?.availability || '',
        compatibility,
      });

      const bestMatch = best ? toMatchItem(best) : null;
      const topMatches = ranked.slice(0, 5).map(toMatchItem);

      return res.json({
        user: currentUser.name,
        city: currentUser.profile.city,
        bestMatch,
        topMatches,
        comparedProfiles: candidates.length,
      });
    } catch (error) {
      const err = error as Error;
      logger.error('Fetch real match failed:', { error: err.message });
      return res.status(500).json({ message: 'internal server error' });
    }
  }
);

app.post(
  '/api/conversations',
  authRequired,
  csrfProtection,
  async (req, res) => {
    try {
      const currentUserId = Number(req.auth?.sub);
      const { recipientId } = req.body || {};

      if (!recipientId || isNaN(Number(recipientId))) {
        return res.status(400).json({ message: 'recipientId is required' });
      }

      const rid = Number(recipientId);
      if (rid === currentUserId) {
        return res
          .status(400)
          .json({ message: 'Cannot start a conversation with yourself' });
      }

      const recipient = await prisma.user.findUnique({ where: { id: rid } });
      if (!recipient) {
        return res.status(404).json({ message: 'Recipient not found' });
      }

      const existing = await prisma.conversation.findFirst({
        where: {
          AND: [
            { participants: { some: { id: currentUserId } } },
            { participants: { some: { id: rid } } },
          ],
        },
        include: {
          participants: { select: { id: true, name: true } },
          messages: {
            orderBy: { createdAt: 'asc' },
            include: { sender: { select: { id: true, name: true } } },
          },
        },
      });

      if (existing) {
        return res.json({
          conversation: existing as unknown as ConversationWithParticipants,
        });
      }

      const conversation = await prisma.conversation.create({
        data: {
          participants: { connect: [{ id: currentUserId }, { id: rid }] },
        },
        include: {
          participants: { select: { id: true, name: true } },
          messages: true,
        },
      });

      return res.status(201).json({
        conversation: conversation as unknown as ConversationWithParticipants,
      });
    } catch (error) {
      const err = error as Error;
      logger.error('Create conversation failed:', { error: err.message });
      return res.status(500).json({ message: 'internal server error' });
    }
  }
);

app.get(
  '/api/conversations',
  authRequired,
  csrfProtection,
  async (req, res) => {
    try {
      const currentUserId = Number(req.auth?.sub);
      const conversations = await prisma.conversation.findMany({
        where: { participants: { some: { id: currentUserId } } },
        include: {
          participants: { select: { id: true, name: true } },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: { sender: { select: { id: true, name: true } } },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });
      return res.json({
        conversations: conversations as unknown as ConversationWithParticipants[],
      });
    } catch (error) {
      const err = error as Error;
      logger.error('List conversations failed:', { error: err.message });
      return res.status(500).json({ message: 'internal server error' });
    }
  }
);

app.post(
  '/api/conversations/:id/messages',
  authRequired,
  csrfProtection,
  async (req, res) => {
    try {
      const currentUserId = Number(req.auth?.sub);
      const conversationId = Number(req.params.id);
      const { content } = req.body || {};

      if (!content || typeof content !== 'string' || !content.trim()) {
        return res.status(400).json({ message: 'content is required' });
      }

      if (content.length > 500) {
        return res
          .status(400)
          .json({ message: 'message too long (max 500 chars)' });
      }

      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          participants: { some: { id: currentUserId } },
        },
      });

      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }

      const message = await prisma.message.create({
        data: {
          content: content.trim(),
          senderId: currentUserId,
          conversationId,
        },
        include: { sender: { select: { id: true, name: true } } },
      });

      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      if (io) {
        io.to(`conv:${conversationId}`).emit('newMessage', {
          message: message as unknown as MessageData,
          conversationId,
        });
        const participants = await prisma.conversation.findUnique({
          where: { id: conversationId },
          include: { participants: { select: { id: true } } },
        });
        const socketServer = io;
        if (participants && socketServer) {
          participants.participants.forEach((p: { id: number }) => {
            socketServer.to(`user:${p.id}`).emit('conversationUpdated', {
              conversationId,
            });
          });
        }
      }

      return res.status(201).json({ message: message as unknown as MessageData });
    } catch (error) {
      const err = error as Error;
      logger.error('Send message failed:', { error: err.message });
      return res.status(500).json({ message: 'internal server error' });
    }
  }
);

app.get(
  '/api/conversations/:id/messages',
  authRequired,
  csrfProtection,
  async (req, res) => {
    try {
      const currentUserId = Number(req.auth?.sub);
      const conversationId = Number(req.params.id);

      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          participants: { some: { id: currentUserId } },
        },
      });

      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }

      const messages = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
        include: { sender: { select: { id: true, name: true } } },
      });

      return res.json({ messages: messages as unknown as MessageData[] });
    } catch (error) {
      const err = error as Error;
      logger.error('Get messages failed:', { error: err.message });
      return res.status(500).json({ message: 'internal server error' });
    }
  }
);

interface AuthenticatedSocket {
  userId?: number;
  user?: JwtPayload;
  join: (room: string) => void;
  leave: (room: string) => void;
  on: (event: string, callback: (arg: unknown) => void) => void;
}

const initSocketIO = (server: http.Server): Server => {
  io = new Server(server, {
    cors: {
      origin: ALLOWED_ORIGINS,
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.use((socket, next) => {
    try {
      const cookies = cookieParser.JSONCookie(
        (socket.handshake.headers.cookie as string) || ''
      ) as Record<string, string>;
      const sessionToken = cookies[SESSION_COOKIE_NAME];

      if (!sessionToken) {
        return next(new Error('Authentication required'));
      }

      const payload = jwt.verify(sessionToken, JWT_SECRET) as JwtPayload;
      (socket as AuthenticatedSocket).userId = Number(payload.sub);
      (socket as AuthenticatedSocket).user = payload;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const authSocket = socket as AuthenticatedSocket;
    logger.info('User connected', { userId: authSocket.userId });

    authSocket.join(`user:${authSocket.userId}`);

    authSocket.on('joinConversation', (conversationId) => {
      authSocket.join(`conv:${conversationId}`);
      logger.info('User joined conversation', {
        userId: authSocket.userId,
        conversationId,
      });
    });

    authSocket.on('leaveConversation', (conversationId) => {
      authSocket.leave(`conv:${conversationId}`);
    });

    socket.on('disconnect', () => {
      logger.info('User disconnected', { userId: authSocket.userId });
    });
  });

  return io;
};

// Endpoint de diagnostic pour vérifier la connexion à la base de données
app.get('/api/diagnose/db', async (_req, res) => {
  try {
    console.log('=== Diagnostic de la base de données ===');

    const envInfo = {
      NODE_ENV: process.env.NODE_ENV || 'non défini',
      DATABASE_URL: process.env.DATABASE_URL ? 'DÉFINIE' : 'NON DÉFINIE',
      DATABASE_URL_MASKED: process.env.DATABASE_URL
        ? process.env.DATABASE_URL.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')
        : null,
      JWT_SECRET: process.env.JWT_SECRET ? 'DÉFINIE' : 'NON DÉFINIE',
      FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || 'non défini'
    };

    console.log('Variables d\'environnement:', envInfo);

    if (!process.env.DATABASE_URL) {
      return res.status(500).json({
        status: 'error',
        message: 'DATABASE_URL non définie',
        env: envInfo,
        solution: 'Configurez DATABASE_URL sur Render: Dashboard → Environment'
      });
    }

    // Tester la connexion
    console.log('🔗 Test de connexion à la base de données...');
    await prisma.$connect();
    console.log('✅ Connexion réussie');

    // Tester une requête simple
    const testResult = await prisma.$queryRaw`SELECT 1 as test` as unknown[];
    console.log('✅ Requête test réussie');

    // Vérifier les migrations
    let migrations: unknown[] = [];
    try {
      migrations = await prisma.$queryRaw`SELECT * FROM _prisma_migrations ORDER BY finished_at DESC`;
      console.log(`📊 Migrations trouvées: ${migrations.length}`);
    } catch (e) {
      console.log('ℹ️ Table _prisma_migrations non trouvée');
    }

    await prisma.$disconnect();

    return res.json({
      status: 'success',
      message: 'Base de données accessible',
      env: envInfo,
      testQuery: testResult[0],
      migrationsCount: migrations.length,
      migrations: migrations.slice(0, 5) // Premières 5 migrations
    });

  } catch (error: any) {
    console.error('❌ Erreur de diagnostic:', error.message);
    console.error('Code d\'erreur:', error.code);

    return res.status(500).json({
      status: 'error',
      message: error.message,
      code: error.code,
      env: {
        NODE_ENV: process.env.NODE_ENV || 'non défini',
        DATABASE_URL: process.env.DATABASE_URL ? 'DÉFINIE' : 'NON DÉFINIE'
      },
      commonSolutions: [
        'Vérifiez que DATABASE_URL est correcte sur Render',
        'Vérifiez que la base de données PostgreSQL est créée',
        'Vérifiez que le service de base de données est démarré',
        'Vérifiez les permissions de l\'utilisateur de la base de données'
      ]
    });
  }
});

// Endpoint de debug pour voir toutes les variables d'environnement
app.get('/api/debug/env', (_req, res) => {
  const allEnvVars = process.env;
  const maskedEnvVars: Record<string, string> = {};

  // Masquer les valeurs sensibles
  for (const [key, value] of Object.entries(allEnvVars)) {
    if (!value) {
      maskedEnvVars[key] = 'NON DÉFINIE';
    } else if (key.includes('URL') || key.includes('URI')) {
      // Masquer les mots de passe dans les URLs
      maskedEnvVars[key] = value.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
    } else if (key.includes('SECRET') || key.includes('KEY') || key.includes('PASSWORD')) {
      maskedEnvVars[key] = '***' + value.slice(-4); // Montrer seulement les 4 derniers caractères
    } else {
      maskedEnvVars[key] = value;
    }
  }

  // Log dans la console pour les logs Render
  console.log('=== DEBUG Variables d\'environnement ===');
  console.log('DATABASE_URL présente:', !!process.env.DATABASE_URL);
  console.log('JWT_SECRET présente:', !!process.env.JWT_SECRET);
  console.log('FRONTEND_ORIGIN présente:', !!process.env.FRONTEND_ORIGIN);
  console.log('NODE_ENV:', process.env.NODE_ENV || 'non défini');

  if (process.env.DATABASE_URL) {
    console.log('DATABASE_URL (masquée):', process.env.DATABASE_URL.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));
  }

  return res.json({
    message: 'Variables d\'environnement (valeurs sensibles masquées)',
    env: maskedEnvVars,
    criticalVars: {
      DATABASE_URL: process.env.DATABASE_URL ? 'PRÉSENTE' : 'ABSENTE',
      JWT_SECRET: process.env.JWT_SECRET ? 'PRÉSENTE' : 'ABSENTE',
      FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || 'ABSENTE',
      NODE_ENV: process.env.NODE_ENV || 'ABSENTE',
      PORT: process.env.PORT || '4000 (par défaut)'
    },
    timestamp: new Date().toISOString()
  });
});

// Routes de sécurité et monitoring
import securityRoutes from './src/routes/security-simple.js';
app.use('/api/security', securityRoutes);

// Endpoint pour vérifier l'état de sécurité global
app.get('/api/security/status', (_req, res) => {
  const securityStatus = {
    authentication: {
      jwtRotation: true,
      refreshTokens: true,
      csrfProtection: true,
      rateLimiting: true
    },
    headers: {
      hsts: true,
      csp: true,
      xFrameOptions: true,
      xContentTypeOptions: true
    },
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    recommendations: [
      'Regular security audits',
      'Dependency updates',
      'Log monitoring',
      'Incident response plan'
    ]
  };

  res.json(securityStatus);
});

const startServer = async () => {
  const server = http.createServer(app);
  initSocketIO(server);
  server.listen(PORT, () => {
    console.log(`SkillSwap API running on port ${PORT}`);
  });

  const shutdown = async () => {
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export { app, validateProfileUpdate, countOverlap, initSocketIO, csrfTokens };

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-env';
const ALLOWED_ORIGINS = FRONTEND_ORIGIN.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'skillswap_session';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const hasLocalOrigin = ALLOWED_ORIGINS.some(
    (origin) => origin.includes('localhost') || origin.includes('127.0.0.1'),
);
const COOKIE_SECURE =
    process.env.COOKIE_SECURE === 'true'
        ? true
        : process.env.COOKIE_SECURE === 'false'
            ? false
            : !hasLocalOrigin;
const COOKIE_SAME_SITE = COOKIE_SECURE ? 'none' : 'lax';

app.set('trust proxy', 1);

const skills = [
    { id: 1, title: 'JavaScript', level: 'Intermediaire', offers: 14, needs: 9 },
    { id: 2, title: 'Design UI', level: 'Debutant', offers: 6, needs: 19 },
    { id: 3, title: 'Photographie', level: 'Intermediaire', offers: 11, needs: 7 },
    { id: 4, title: 'Anglais conversation', level: 'Tous niveaux', offers: 20, needs: 13 },
    { id: 5, title: 'React', level: 'Intermediaire', offers: 12, needs: 18 },
    { id: 6, title: 'Cuisine italienne', level: 'Debutant', offers: 8, needs: 15 },
];

const AVAILABILITY_OPTIONS = new Set([
    'matin',
    'apres-midi',
    'soir',
    'week-end',
    'flexible',
]);

const normalizeText = (value) => value.toString().trim();

const normalizeSkillList = (value) => {
    if (!Array.isArray(value)) {
        return null;
    }

    const cleaned = value
        .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
        .filter(Boolean)
        .map((entry) => entry.slice(0, 40));

    return [...new Set(cleaned)];
};

const validateProfileUpdate = (input) => {
    const next = {};

    if (Object.prototype.hasOwnProperty.call(input, 'city')) {
        if (typeof input.city !== 'string') {
            return { error: 'city must be a string' };
        }

        const city = normalizeText(input.city);
        if (city.length < 2 || city.length > 60) {
            return { error: 'city must have between 2 and 60 chars' };
        }

        next.city = city;
    }

    if (Object.prototype.hasOwnProperty.call(input, 'availability')) {
        if (typeof input.availability !== 'string') {
            return { error: 'availability must be a string' };
        }

        const availability = normalizeText(input.availability).toLowerCase();
        if (!AVAILABILITY_OPTIONS.has(availability)) {
            return {
                error:
                    'availability must be one of: matin, apres-midi, soir, week-end, flexible',
            };
        }

        next.availability = availability;
    }

    if (Object.prototype.hasOwnProperty.call(input, 'offers')) {
        const offers = normalizeSkillList(input.offers);
        if (!offers) {
            return { error: 'offers must be an array of strings' };
        }

        if (offers.length > 20 || offers.some((item) => item.length < 2 || item.length > 40)) {
            return { error: 'offers accepts up to 20 items (2-40 chars each)' };
        }

        next.offers = offers;
    }

    if (Object.prototype.hasOwnProperty.call(input, 'needs')) {
        const needs = normalizeSkillList(input.needs);
        if (!needs) {
            return { error: 'needs must be an array of strings' };
        }

        if (needs.length > 20 || needs.some((item) => item.length < 2 || item.length > 40)) {
            return { error: 'needs accepts up to 20 items (2-40 chars each)' };
        }

        next.needs = needs;
    }

    return { next };
};

const serializeProfile = (profile) => ({
    city: profile.city,
    availability: profile.availability,
    offers: profile.offers,
    needs: profile.needs,
});

const toNormalizedSet = (items) =>
    new Set((items || []).map((item) => item.toString().trim().toLowerCase()).filter(Boolean));

const countOverlap = (left, right) => {
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

const toPublicUser = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    profile: user.profile ? serializeProfile(user.profile) : null,
});

const signToken = (user) =>
    jwt.sign(
        {
            sub: user.id,
            email: user.email,
            name: user.name,
        },
        JWT_SECRET,
        { expiresIn: '7d' },
    );

const sessionCookieOptions = {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: COOKIE_SAME_SITE,
    maxAge: SESSION_TTL_MS,
    path: '/',
};

const setSessionCookie = (res, user) => {
    res.cookie(SESSION_COOKIE_NAME, signToken(user), sessionCookieOptions);
};

const clearSessionCookie = (res) => {
    res.clearCookie(SESSION_COOKIE_NAME, {
        httpOnly: true,
        secure: COOKIE_SECURE,
        sameSite: COOKIE_SAME_SITE,
        path: '/',
    });
};

const authRequired = (req, res, next) => {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    const cookieToken = req.cookies ? req.cookies[SESSION_COOKIE_NAME] : null;
    const accessToken = scheme === 'Bearer' && token ? token : cookieToken;

    if (!accessToken) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const payload = jwt.verify(accessToken, JWT_SECRET);
        req.auth = payload;
        return next();
    } catch (_error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: 'Too many authentication attempts. Try again later.',
    },
});

app.use(
    helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
    }),
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
    }),
);
app.use(cookieParser());
app.use(express.json({ limit: '100kb' }));

app.get('/', (_req, res) => {
    res.json({ status: 'ok', service: 'skillswap-local-api' });
});

app.post('/api/auth/register', authLimiter, async (req, res) => {
    try {
        const { name, email, password } = req.body || {};

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'name, email and password are required' });
        }

        const normalizedName = name.toString().trim();
        if (normalizedName.length < 2 || normalizedName.length > 40) {
            return res.status(400).json({ message: 'name must contain between 2 and 40 chars' });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: 'password must contain at least 8 chars' });
        }

        const normalizedEmail = email.toString().trim().toLowerCase();
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

        setSessionCookie(res, user);
        return res.status(201).json({ user: toPublicUser(user) });
    } catch (error) {
        console.error('Register failed', error);
        return res.status(500).json({ message: 'internal server error' });
    }
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({ message: 'email and password are required' });
        }

        const normalizedEmail = email.toString().trim().toLowerCase();
        const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            include: {
                profile: true,
            },
        });

        if (!user) {
            return res.status(401).json({ message: 'invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            return res.status(401).json({ message: 'invalid credentials' });
        }

        setSessionCookie(res, user);
        return res.json({ user: toPublicUser(user) });
    } catch (error) {
        console.error('Login failed', error);
        return res.status(500).json({ message: 'internal server error' });
    }
});

app.get('/api/auth/me', authRequired, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: Number(req.auth.sub) },
            include: {
                profile: true,
            },
        });

        if (!user) {
            return res.status(404).json({ message: 'user not found' });
        }

        return res.json({ user: toPublicUser(user) });
    } catch (error) {
        console.error('Fetch current user failed', error);
        return res.status(500).json({ message: 'internal server error' });
    }
});

app.post('/api/auth/logout', (_req, res) => {
    clearSessionCookie(res);
    return res.json({ message: 'logout ok' });
});

app.get('/api/profile/me', authRequired, async (req, res) => {
    try {
        const profile = await prisma.profile.findUnique({
            where: { userId: Number(req.auth.sub) },
        });

        if (!profile) {
            return res.status(404).json({ message: 'profile not found' });
        }

        return res.json({ profile: serializeProfile(profile) });
    } catch (error) {
        console.error('Fetch profile failed', error);
        return res.status(500).json({ message: 'internal server error' });
    }
});

app.put('/api/profile/me', authRequired, async (req, res) => {
    try {
        const { next, error } = validateProfileUpdate(req.body || {});
        if (error) {
            return res.status(400).json({ message: error });
        }

        const profile = await prisma.profile.update({
            where: { userId: Number(req.auth.sub) },
            data: next,
        });

        return res.json({
            profile: serializeProfile(profile),
            message: 'profile updated',
        });
    } catch (error) {
        if (error && error.code === 'P2025') {
            return res.status(404).json({ message: 'profile not found' });
        }

        console.error('Update profile failed', error);
        return res.status(500).json({ message: 'internal server error' });
    }
});

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

app.get('/api/matches/me', authRequired, async (req, res) => {
    try {
        const currentUserId = Number(req.auth.sub);
        const currentUser = await prisma.user.findUnique({
            where: { id: currentUserId },
            include: {
                profile: true,
            },
        });

        if (!currentUser || !currentUser.profile) {
            return res.status(404).json({ message: 'profile not found for current user' });
        }

        const candidates = await prisma.user.findMany({
            where: {
                id: {
                    not: currentUserId,
                },
                profile: {
                    isNot: null,
                },
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
                message: 'Aucun autre profil disponible pour le moment.',
            });
        }

        const totalDesired = Math.max(
            1,
            (currentUser.profile.offers || []).length + (currentUser.profile.needs || []).length,
        );

        const ranked = candidates.map((candidate) => {
            const givesCount = countOverlap(currentUser.profile.offers, candidate.profile.needs);
            const receivesCount = countOverlap(currentUser.profile.needs, candidate.profile.offers);
            const base = ((givesCount + receivesCount) / totalDesired) * 80;
            const reciprocalBonus = givesCount > 0 && receivesCount > 0 ? 20 : 0;
            const compatibility = Math.min(100, Math.round(base + reciprocalBonus));

            return {
                candidate,
                givesCount,
                receivesCount,
                compatibility,
            };
        });

        ranked.sort((a, b) => b.compatibility - a.compatibility);
        const best = ranked[0];

        const bestMatch = {
            matchId: best.candidate.id,
            pseudo: best.candidate.name,
            gives: best.givesCount > 0 ? 'Competences compatibles trouvees' : 'Aucun recoupement fort',
            wants: best.receivesCount > 0 ? 'Besoins reciproques identifies' : 'Peu de besoins reciproques',
            city: best.candidate.profile.city,
            compatibility: best.compatibility,
        };

        return res.json({
            user: currentUser.name,
            city: currentUser.profile.city,
            bestMatch,
            comparedProfiles: candidates.length,
        });
    } catch (error) {
        console.error('Fetch real match failed', error);
        return res.status(500).json({ message: 'internal server error' });
    }
});

app.post('/api/conversations', authRequired, async (req, res) => {
    try {
        const currentUserId = Number(req.auth.sub);
        const { recipientId } = req.body || {};

        if (!recipientId || isNaN(Number(recipientId))) {
            return res.status(400).json({ message: 'recipientId is required' });
        }

        const rid = Number(recipientId);
        if (rid === currentUserId) {
            return res.status(400).json({ message: 'Cannot start a conversation with yourself' });
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
            return res.json({ conversation: existing });
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

        return res.status(201).json({ conversation });
    } catch (error) {
        console.error('Create conversation failed', error);
        return res.status(500).json({ message: 'internal server error' });
    }
});

app.get('/api/conversations', authRequired, async (req, res) => {
    try {
        const currentUserId = Number(req.auth.sub);
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
        return res.json({ conversations });
    } catch (error) {
        console.error('List conversations failed', error);
        return res.status(500).json({ message: 'internal server error' });
    }
});

app.post('/api/conversations/:id/messages', authRequired, async (req, res) => {
    try {
        const currentUserId = Number(req.auth.sub);
        const conversationId = Number(req.params.id);
        const { content } = req.body || {};

        if (!content || typeof content !== 'string' || !content.trim()) {
            return res.status(400).json({ message: 'content is required' });
        }

        if (content.length > 500) {
            return res.status(400).json({ message: 'message too long (max 500 chars)' });
        }

        const conversation = await prisma.conversation.findFirst({
            where: { id: conversationId, participants: { some: { id: currentUserId } } },
        });

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        const message = await prisma.message.create({
            data: { content: content.trim(), senderId: currentUserId, conversationId },
            include: { sender: { select: { id: true, name: true } } },
        });

        await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
        });

        return res.status(201).json({ message });
    } catch (error) {
        console.error('Send message failed', error);
        return res.status(500).json({ message: 'internal server error' });
    }
});

app.get('/api/conversations/:id/messages', authRequired, async (req, res) => {
    try {
        const currentUserId = Number(req.auth.sub);
        const conversationId = Number(req.params.id);

        const conversation = await prisma.conversation.findFirst({
            where: { id: conversationId, participants: { some: { id: currentUserId } } },
        });

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        const messages = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
            include: { sender: { select: { id: true, name: true } } },
        });

        return res.json({ messages });
    } catch (error) {
        console.error('Get messages failed', error);
        return res.status(500).json({ message: 'internal server error' });
    }
});

if (require.main === module) {
    app.listen(PORT, () => {
        if (JWT_SECRET === 'change-me-in-env') {
            console.warn('Using fallback JWT_SECRET. Set JWT_SECRET in .env for real usage.');
        }

        console.log(`SkillSwap API running on port ${PORT}`);
    });

    const shutdown = async () => {
        await prisma.$disconnect();
        process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
}

module.exports = {
    app,
    validateProfileUpdate,
    countOverlap,
};

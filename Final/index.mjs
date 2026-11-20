
import 'dotenv/config';
import express from 'express';
import mysql from 'mysql2/promise';
import session from 'express-session';
import bcrypt from 'bcrypt';
import {randomBytes, timingSafeEqual} from 'node:crypto';

const app = express();

if (!process.env.SESSION_SECRET) {
    throw new Error('Set SESSION_SECRET in the .env file');
}

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({extended:true}));

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10,
    waitForConnections: true
});

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    }
}));

app.use((req, res, next) => {
    res.locals.currentUser = req.session.user || null;
    res.locals.authToken = req.session.authToken || '';
    next();
});

let characters = [];
let lastLoaded = 0;
const detailsCache = {};

function isAuthenticated(req, res, next) {
    if (!req.session.authenticated || !req.session.user) {
        return res.redirect('/login');
    }
    next();
}

function checkToken(req, res, next) {
    let savedToken = req.session.authToken || '';
    let givenToken = String(req.body?.authToken || '');

    if (!/^[a-f0-9]{64}$/.test(savedToken) || !/^[a-f0-9]{64}$/.test(givenToken)) {
        return res.status(403).render('error.ejs', {title: 'Invalid Token'});
    }

    let saved = Buffer.from(savedToken);
    let given = Buffer.from(givenToken);

    if (!timingSafeEqual(saved, given)) {
        return res.status(403).render('error.ejs', {title: 'Invalid Token'});
    }

    next();
}

function showError(res, err) {
    console.error('Server error:', err);
    res.status(500).render('error.ejs', {title: 'Error'});
}

function imageUrl(value) {
    if (typeof value !== 'string' || !value.trim()) return '';
    try {
        const url = new URL(value, 'https://umapyoi.net/');
        return url.protocol === 'https:' ? url.href : '';
    } catch {
        return '';
    }
}

async function getCharacters() {
    if (characters.length && Date.now() - lastLoaded < 3600000) {
        return characters;
    }

    try {
        const response = await fetch('https://api.umapyoi.net/api/v1/character/list', {signal: AbortSignal.timeout(8000)});
        if (!response.ok) throw new Error('Umapyoi API unavailable');

        const data = await response.json();
        const list = Array.isArray(data) ? data : (data.characters || data.data || []);
        if (!Array.isArray(list) || list.length === 0) throw new Error('Invalid character list');

        characters = list.filter(item => Number.isInteger(Number(item.id)) && item.name_en).map(item => ({
            id: Number(item.id),
            name_en: item.name_en,
            name_jp: item.name_jp || '',
            thumb_img: imageUrl(item.thumb_img)
        }));
        lastLoaded = Date.now();

        let values = characters.map(item => [item.id, item.name_en.substring(0, 100), item.thumb_img.substring(0, 500)]);
        await pool.query('INSERT INTO umas (umaId, name, img) VALUES ? ON DUPLICATE KEY UPDATE name = VALUES(name), img = VALUES(img);', [values]);

        return characters;
    } catch (err) {
        console.error('Character API:', err.message);
        if (characters.length) return characters;

        const [rows] = await pool.query('SELECT umaId AS id, name AS name_en, img AS thumb_img FROM umas;');
        return rows;
    }
}

async function getDetails(id) {
    if (detailsCache[id]) return detailsCache[id];

    let description = '';
    let fullImage = '';

    try {
        const response = await fetch('https://api.umapyoi.net/api/v1/character/' + id, {signal: AbortSignal.timeout(8000)});
        if (response.ok) {
            const data = await response.json();
            const info = data.character || data.data || data;
            const options = [info.description_en, info.profile_en, info.description, info.bio_en, info.bio,
                info.profile_text, info.introduction, info.profile?.description, info.profile?.text];
            description = options.find(value => typeof value === 'string' && value.trim()) || '';
            fullImage = imageUrl(info.full_img || info.full_image || info.image_url || info.image);
        }
    } catch (err) {
        console.error('Character detail:', err.message);
    }

    try {
        const response = await fetch('https://api.umapyoi.net/api/v1/character/images/' + id, {signal: AbortSignal.timeout(8000)});
        if (response.ok) {
            const data = await response.json();
            const groups = Array.isArray(data) ? data : (data.images || data.data || []);
            if (Array.isArray(groups)) {
                const ordered = [...groups].sort((a, b) => {
                    const score = item => /full|standing|official|body|portrait|uniform/i.test(item.label_en || item.label || '') ? 1 : 0;
                    return score(b) - score(a);
                });
                for (const group of ordered) {
                    const images = Array.isArray(group.images) ? group.images : [group];
                    const found = images.find(item => imageUrl(item.image || item.url || item.img));
                    if (found) {
                        fullImage = imageUrl(found.image || found.url || found.img);
                        break;
                    }
                }
            }
        }
    } catch (err) {
        console.error('Character image:', err.message);
    }

    detailsCache[id] = {description, fullImage};
    return detailsCache[id];
}

async function getProfileData(req, res, userId, isOwner) {
    const [users] = await pool.query('SELECT userId, username, email, profilePicture FROM users WHERE userId = ?;', [userId]);

    if (users.length === 0) {
        return res.status(404).render('error.ejs', {title: 'Not Found'});
    }

    const [comments] = await pool.query('SELECT comments.commentId, comments.comment, umas.umaId, umas.name FROM comments JOIN umas ON comments.umaId = umas.umaId WHERE comments.userId = ? ORDER BY comments.commentId DESC;', [userId]);
    const [liked] = await pool.query('SELECT umas.umaId, umas.name FROM likes JOIN umas ON likes.umaId = umas.umaId WHERE likes.userId = ?;', [userId]);

    res.render('profile.ejs', {
        title: 'Profile',
        user: users[0],
        comments,
        liked,
        isOwner,
        error: req.query.error === 'delete' ? 'Type DELETE to confirm account deletion.' : (req.query.error ? 'Please check the entered values.' : ''),
        message: req.query.saved ? 'Profile updated.' : ''
    });
}

app.get('/', (req, res) => {
    res.render('home.ejs', {title: 'Home'});
});

app.get('/api/characters', async(req, res) => {
    try {
        let list = await getCharacters();
        res.json(list);
    } catch (err) {
        console.error(err);
        res.status(503).json({error: 'Characters unavailable'});
    }
});

app.get('/character/:id', async(req, res) => {
    let id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(404).render('error.ejs', {title: 'Not Found'});
    }

    try {
        const list = await getCharacters();
        const [rows] = await pool.query('SELECT * FROM umas WHERE umaId = ?;', [id]);
        if (rows.length === 0) return res.status(404).render('error.ejs', {title: 'Not Found'});

        const extra = await getDetails(id);
        const [comments] = await pool.query('SELECT comments.commentId, comments.comment, users.userId, users.username FROM comments JOIN users ON comments.userId = users.userId WHERE comments.umaId = ? ORDER BY comments.commentId DESC;', [id]);
        const [likedBy] = await pool.query('SELECT users.userId, users.username FROM likes JOIN users ON likes.userId = users.userId WHERE likes.umaId = ?;', [id]);
        let item = list.find(row => Number(row.id) === id);
        let character = {
            id,
            name: item?.name_en || rows[0].name,
            japanese: item?.name_jp || '',
            image: extra.fullImage || imageUrl(rows[0].img) || '/images/placeholder.svg',
            description: extra.description || rows[0].description || 'No description available from Umapyoi yet.'
        };
        let userLiked = req.session.user ? likedBy.some(row => row.userId === req.session.user.userId) : false;

        res.render('character.ejs', {title: character.name, character, comments, likedBy, userLiked});
    } catch (err) {
        showError(res, err);
    }
});

app.post('/character/:id/like', isAuthenticated, checkToken, async(req, res) => {
    let id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.redirect('/');

    try {
        let userId = req.session.user.userId;
        const [rows] = await pool.query('SELECT likeId FROM likes WHERE userId = ? AND umaId = ?;', [userId, id]);

        if (rows.length > 0) {
            await pool.query('DELETE FROM likes WHERE userId = ? AND umaId = ?;', [userId, id]);
        } else {
            await pool.query('INSERT IGNORE INTO likes (userId, umaId) VALUES (?, ?);', [userId, id]);
        }

        res.redirect('/character/' + id);
    } catch (err) {
        showError(res, err);
    }
});

app.post('/character/:id/comment', isAuthenticated, checkToken, async(req, res) => {
    let id = Number(req.params.id);
    let comment = String(req.body.comment || '').trim();
    if (!Number.isInteger(id) || id <= 0 || comment === '' || comment.length > 1000) {
        return res.redirect('/character/' + id);
    }

    try {
        let sql = 'INSERT INTO comments (userId, umaId, comment) VALUES (?, ?, ?);';
        let params = [req.session.user.userId, id, comment];
        await pool.query(sql, params);
        res.redirect('/character/' + id);
    } catch (err) {
        showError(res, err);
    }
});

app.get('/ranking', async(req, res) => {
    try {
        await getCharacters();
        let sql = 'SELECT umas.umaId, umas.name, umas.img, COUNT(likes.likeId) AS totalLikes FROM umas LEFT JOIN likes ON umas.umaId = likes.umaId GROUP BY umas.umaId, umas.name, umas.img ORDER BY totalLikes DESC, umas.name ASC LIMIT 5;';
        const [rows] = await pool.query(sql);
        res.render('ranking.ejs', {title: 'Ranking', rows});
    } catch (err) {
        showError(res, err);
    }
});

app.get('/login', (req, res) => {
    res.render('login.ejs', {title: 'Log In', error: ''});
});

app.post('/login', async(req, res) => {
    let email = String(req.body.email || '').trim();
    let password = String(req.body.password || '');

    try {
        let sql = 'SELECT userId, username, passwordHash FROM users WHERE email = ?;';
        const [rows] = await pool.query(sql, [email]);

        if (rows.length === 0 || !await bcrypt.compare(password, rows[0].passwordHash)) {
            return res.status(401).render('login.ejs', {title: 'Log In', error: 'Incorrect email or password.'});
        }

        req.session.regenerate(err => {
            if (err) return showError(res, err);

            req.session.authenticated = true;
            req.session.user = {userId: rows[0].userId, username: rows[0].username};
            req.session.authToken = randomBytes(32).toString('hex');

            req.session.save(err => {
                if (err) return showError(res, err);
                res.redirect('/');
            });
        });
    } catch (err) {
        showError(res, err);
    }
});

app.get('/register', (req, res) => {
    res.render('register.ejs', {title: 'Register', error: '', success: req.query.success === '1'});
});

app.post('/register', async(req, res) => {
    let username = String(req.body.username || '').trim();
    let email = String(req.body.email || '').trim();
    let password = String(req.body.password || '');

    if (username.length < 3 || username.length > 50 || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) {
        return res.status(400).render('register.ejs', {
            title: 'Register',
            error: 'Use a username of 3-50 characters, a valid email, and a password of at least 8 characters.',
            success: false
        });
    }

    try {
        let passwordHash = await bcrypt.hash(password, 10);
        let sql = 'INSERT INTO users (username, email, passwordHash) VALUES (?, ?, ?);';
        let params = [username, email, passwordHash];
        await pool.query(sql, params);
        res.redirect('/register?success=1');
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).render('register.ejs', {title: 'Register', error: 'Username or email already exists.', success: false});
        }
        showError(res, err);
    }
});

app.post('/logout', isAuthenticated, checkToken, (req, res) => {
    req.session.destroy(err => {
        if (err) return showError(res, err);
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

app.get('/profile', isAuthenticated, (req, res) => {
    res.redirect('/settings');
});

app.get('/settings', isAuthenticated, async(req, res) => {
    try {
        await getProfileData(req, res, req.session.user.userId, true);
    } catch (err) {
        showError(res, err);
    }
});

app.get('/profile/:id', async(req, res) => {
    let userId = Number(req.params.id);
    if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(404).render('error.ejs', {title: 'Not Found'});
    }

    try {
        await getProfileData(req, res, userId, req.session.user?.userId === userId);
    } catch (err) {
        showError(res, err);
    }
});

app.post('/settings', isAuthenticated, checkToken, async(req, res) => {
    let username = String(req.body.username || '').trim();
    let email = String(req.body.email || '').trim();
    let picture = String(req.body.profilePicture || '').trim();

    if (username.length < 3 || username.length > 50 || !/^\S+@\S+\.\S+$/.test(email) || (picture && !imageUrl(picture))) {
        return res.redirect('/settings?error=1');
    }

    try {
        let sql = 'UPDATE users SET username = ?, email = ?, profilePicture = ? WHERE userId = ?;';
        let params = [username, email, picture || null, req.session.user.userId];
        await pool.query(sql, params);
        req.session.user.username = username;
        res.redirect('/settings?saved=1');
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.redirect('/settings?error=1');
        showError(res, err);
    }
});

app.post('/settings/delete', isAuthenticated, checkToken, async(req, res) => {
    if (req.body.confirmation !== 'DELETE') {
        return res.redirect('/settings?error=delete');
    }

    let connection;

    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        let userId = req.session.user.userId;

        await connection.query('DELETE FROM likes WHERE userId = ?;', [userId]);
        await connection.query('DELETE FROM comments WHERE userId = ?;', [userId]);
        await connection.query('DELETE FROM users WHERE userId = ?;', [userId]);

        await connection.commit();

        req.session.destroy(err => {
            if (err) return showError(res, err);
            res.clearCookie('connect.sid');
            res.redirect('/');
        });
    } catch (err) {
        if (connection) {
            await connection.rollback();
        }
        showError(res, err);
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

app.post('/comments/:id/edit', isAuthenticated, checkToken, async(req, res) => {
    let comment = String(req.body.comment || '').trim();
    if (!comment || comment.length > 1000) return res.redirect('/settings');

    try {
        let sql = 'UPDATE comments SET comment = ? WHERE commentId = ? AND userId = ?;';
        let params = [comment, req.params.id, req.session.user.userId];
        await pool.query(sql, params);
        res.redirect('/settings');
    } catch (err) {
        showError(res, err);
    }
});

app.post('/comments/:id/delete', isAuthenticated, checkToken, async(req, res) => {
    try {
        let sql = 'DELETE FROM comments WHERE commentId = ? AND userId = ?;';
        let params = [req.params.id, req.session.user.userId];
        await pool.query(sql, params);
        res.redirect('/settings');
    } catch (err) {
        showError(res, err);
    }
});

app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});


import 'dotenv/config';
import express from 'express';
import mysql from 'mysql2/promise';

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));

//for Express to get values using the POST method
app.use(express.urlencoded({extended:true}));

//setting up database connection pool, replace values in red
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10,
    waitForConnections: true
});

//routes
app.get('/', (req, res) => {
    res.render('home.ejs');
});

//This function looks up a single quote by ID
async function getQuoteById(quoteId) {
    let singleQuoteQuery = 'SELECT * FROM quotes WHERE quoteId = ?;';
    const [rows] = await pool.query(singleQuoteQuery, [quoteId]);
    if (rows.length < 1) return null;
    return rows[0];
}

//This function gets all the data we need for dropdown lists
async function getQuoteFormData() {
    const [authors] = await pool.query('SELECT * FROM authors;');
    const [categories] = await pool.query('SELECT DISTINCT category FROM quotes;');
    let formErrors = {}; //can be populated with errors for each field
    return {authors, categories};
}

// renders an empty new quote forms
app.get('/newQuote', async (req, res) => {
    //this runs any queries to populate drop-downlists
    let formData = await getQuoteFormData();
    let formObject = {quote: '', authorId: '', category: '', likes: 0};
    res.render('newQuote.ejs', {formData, formObject, formErrors: {}});
});

// submits the users input to be entered into the db
app.post('/insertQuote', async (req, res) => {
    let quote = req.body.quote;
    let authorId = req.body.authorId;
    let category = req.body.category;
    let likes = req.body.likes;
    let errors = {};
    let hasErrors = false;

    if (!quote || quote.trim() === '') { hasErrors = true; errors.quote = 'Quote cannot be empty'; } // you can add other checks after this
    if (!authorId) { hasErrors = true; errors.authorId = 'Please select an author'; }
    if (!category) { hasErrors = true; errors.category = 'Please select a category'; }
    if (likes === '' || isNaN(likes) || Number(likes) < 0) { hasErrors = true; errors.likes = 'Likes cannot be negative'; }

    if (hasErrors) {
        let formData = await getQuoteFormData();
        //attach errors to be returned with the form
        res.render('newQuote.ejs', {formData, formObject: req.body, formErrors: errors});
    } else {
        let insertQuery = 'INSERT INTO quotes (quote, authorId, category, likes) VALUES (?, ?, ?, ?);';
        await pool.query(insertQuery, [quote, authorId, category, likes]);
        //res.render('newQuote.ejs');
        res.redirect('/newQuote');
    }
});

app.get('/quoteList', async (req, res) => {
    let quotesQuery = 'SELECT quotes.*, authors.firstName, authors.lastName FROM quotes JOIN authors ON quotes.authorId = authors.authorId;';
    const [rows] = await pool.query(quotesQuery);
    res.render('quoteList.ejs', {quotes: rows});
});

// renders the edit quote form
app.get('/editQuote', async (req, res) => {
    let quoteObject = await getQuoteById(req.query.quoteId);

    if (quoteObject == null) {
        res.redirect('/quoteList');
    } else {
        let formData = await getQuoteFormData();
        let formObject = quoteObject; // the first record should be the quote we're editing

        //breaking this down:
        //formData is the data for the dropdown lists
        //form object is the "starter" information for the quote we're editing so
        //      it can get plugged into the form
        //formErrors is empty
        res.render('editQuote.ejs', {formData, formObject, formErrors: {}});
    }
});

app.post('/updateQuote', async (req, res) => {
    let quote = req.body.quote;
    let authorId = req.body.authorId;
    let category = req.body.category;
    let likes = req.body.likes;
    let quoteId = req.body.quoteId;
    let errors = {};
    let hasErrors = false;

    if (!quote || quote.trim() === '') { hasErrors = true; errors.quote = 'Quote cannot be empty'; }
    if (!authorId) { hasErrors = true; errors.authorId = 'Please select an author'; }
    if (!category) { hasErrors = true; errors.category = 'Please select a category'; }
    if (likes === '' || isNaN(likes) || Number(likes) < 0) { hasErrors = true; errors.likes = 'Likes cannot be negative'; }

    if (hasErrors) {
        //when we re-render the page with errors, we need to redownload the quote data
        //as well as the data for the dropdown lists
        let formData = await getQuoteFormData();
        res.render('editQuote.ejs', {formData, formObject: req.body, formErrors: errors});
    } else {
        let updateQuery = 'UPDATE quotes SET quote = ?, authorId = ?, category = ?, likes = ? WHERE quoteId = ?;';
        await pool.query(updateQuery, [quote, authorId, category, likes, quoteId]);
        res.redirect('/quoteList');
    }
});

app.get('/newAuthor', (req, res) => {
    res.render('newAuthor.ejs', {formObject: {}, formErrors: {}});
});

app.post('/insertAuthor', async (req, res) => {
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let dob = req.body.dob;
    let dod = req.body.dod;
    let errors = {};
    let hasErrors = false;

    if (!firstName || firstName.trim() === '') { hasErrors = true; errors.firstName = 'First Name cannot be empty'; }
    if (!lastName || lastName.trim() === '') { hasErrors = true; errors.lastName = 'Last name cannot be empty'; }
    if (dob && dod && dod <= dob) { hasErrors = true; errors.dod = 'Date of death must be later than date of birth'; }

    if (hasErrors) {
        res.render('newAuthor.ejs', {formObject: req.body, formErrors: errors});
    } else {
        let insertQuery = `INSERT INTO authors
                           (firstName, lastName, dob, dod, gender, profession, country, portrait, biography)
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`;
        let params = [firstName, lastName, dob || null, dod || null, req.body.gender || null,
                      req.body.profession || null, req.body.country || null, req.body.portrait || null, req.body.biography || null];
        await pool.query(insertQuery, params);
        res.redirect('/newAuthor');
    }
});

app.get('/authorList', async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM authors ORDER BY lastName;');
    res.render('authorList.ejs', {authors: rows});
});

app.get('/updateAuthor', async (req, res) => {
    let authorQuery = `SELECT authorId, firstName, lastName, DATE_FORMAT(dob, '%Y-%m-%d') AS dob,
                       DATE_FORMAT(dod, '%Y-%m-%d') AS dod, gender, profession, country, portrait, biography
                       FROM authors WHERE authorId = ?;`;
    const [rows] = await pool.query(authorQuery, [req.query.authorId]);

    if (rows.length < 1) {
        res.redirect('/authorList');
    } else {
        res.render('editAuthor.ejs', {formObject: rows[0], formErrors: {}});
    }
});

app.post('/updateAuthor', async (req, res) => {
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let dob = req.body.dob;
    let dod = req.body.dod;
    let errors = {};
    let hasErrors = false;

    if (!firstName || firstName.trim() === '') { hasErrors = true; errors.firstName = 'First name cannot be empty'; }
    if (!lastName || lastName.trim() === '') { hasErrors = true; errors.lastName = 'Last name cannot be empty'; }
    if (dob && dod && dod <= dob) { hasErrors = true; errors.dod = 'Date of death must be after date of birth'; }

    if (hasErrors) {
        res.render('editAuthor.ejs', {formObject: req.body, formErrors: errors});
    } else {
        let updateQuery = `UPDATE authors SET firstName = ?, lastName = ?, dob = ?, dod = ?,
                           gender = ?, profession = ?, country = ?, portrait = ?, biography = ?
                           WHERE authorId = ?;`;
        let params = [firstName, lastName, dob || null, dod || null, req.body.gender || null,
                      req.body.profession || null, req.body.country || null, req.body.portrait || null,
                      req.body.biography || null, req.body.authorId];
        await pool.query(updateQuery, params);
        res.redirect('/authorList');
    }
});

app.get('/dbTest', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT CURDATE();');
        res.send(rows);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send('Database error!');
    }
});//dbTest

app.listen(3000, () => {
    console.log('Express server running');
});

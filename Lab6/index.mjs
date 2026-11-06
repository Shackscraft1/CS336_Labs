import express from 'express';
import mysql from 'mysql2/promise';

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

//for Express to get values using the POST method
app.use(express.urlencoded({extended:true}));

//setting up database connection pool, replace values in red
const pool = mysql.createPool({
    host: "d9c88q3e09w6fdb2.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "dicm9fbequpty10y",
    password: "jojqq3pm6xy3pfdb",
    database: "gnldue5kk6wic5qs",
    connectionLimit: 10,
    waitForConnections: true
});

//routes
app.get('/', (req, res) => {
    res.render('home.ejs');
});

//This function looks up a single quote by ID
async function getQuoteById(quoteId) {

    console.log(quoteId);
    let singleQuoteQuery = `SELECT * FROM quotes WHERE quoteId = ?`;
    let params = [ quoteId ];
    const [ rows ] = await pool.query(singleQuoteQuery, params);
    console.log(rows);

    if (rows.length < 1) {
        return null;
    } else {
        return rows[0];
    }


}

//This function gets all the data we need for dropdown lists
async function getQuoteFormData() {
    let getAuthorsQuery = 'SELECT * FROM authors;';
    const [ rows ] =  await pool.query(getAuthorsQuery);

    let formErrors = {}; //can be populated with errors for each field

    return { authors: rows };
} 

// renders an empty new quote form
app.get('/newQuote', async (req, res) => {

    //this runs any queries to populate drop-downlists
    let formData = await getQuoteFormData();    

    res.render('newQuote.ejs', { formData, formErrors: {} });
});

// submits the users input to be entered into the db
app.post('/insertQuote', async (req, res) => {
    let quote = req.body.quote;
    let authorId = req.body.authorId;


    let hasErrors = false;
    let errors = {};
    if (quote === '') {
        hasErrors = true;
        errors.quote = "Quote cannot be empty";
    } // you can add other checks after this 

    if (hasErrors) {

        let formData = await getQuoteFormData();
        //attach errors to be returned with the form
        quoteFormData.formErrors = errors; 
        res.render('newQuote.ejs', {formData, formErrors : errors});

    } else {

        let insertQuery = 
        `INSERT INTO quotes (quote, authorId) 
        VALUES (?, ?);`

        let params = [ quote, authorId ];

        const [rows] = await pool.query(insertQuery, params);

        //res.render('newQuote.ejs');
        res.redirect('/newQuote');

    }

    
    
});

// renders the edit quote form
app.get('/editQuote', async (req, res) => {

    let quoteId = req.query.quoteId;
    let quoteObject = await getQuoteById(quoteId);
    

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


app.get('/quoteList', async (req, res) => {
    let quotesQuery = `SELECT * FROM quotes`;
    const [rows] = await pool.query(quotesQuery);

    res.render('quoteList.ejs', {quotes: rows});

});


app.post('/updateQuote', async (req, res) => {
    let quote = req.body.quote;
    let authorId = req.body.authorId;
    let quoteId = req.body.quoteId;
    

    let errors = {};
    let hasErrors = false;
    if (quote === "") {
        errors.quote = "Quote cannot be empty";
        hasErrors = true;
    }

    if (hasErrors) {
         //when we re-render the page with errors, we need to redownload the quote data
        let quoteObject = getQuoteById(quoteId);
        //as well as the data for the dropdown lists
        let quoteFormData = getQuoteFormData();

        
        res.render({formObject: quoteObject, formData: quoteFormData, formErrors: errors});

    } else {
        let updateQuery = 
            `UPDATE quotes SET
            quote = ?,
            authorId = ?
            WHERE quoteId = ?`

        let params = [quote, authorId, quoteId];
        const [ rows ] = await pool.query(updateQuery, params);
        
        res.redirect('/quoteList');
    }
        
});




app.get("/dbTest", async(req, res) => {
  try {
        const [rows] = await pool.query("SELECT CURDATE()");
        res.send(rows);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error!");
    }
});//dbTest

app.listen(3000, ()=>{
    console.log("Express server running")
})
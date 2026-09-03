const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const port = 3000;
const sqlite3 = require('sqlite3').verbose();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

global.db = new sqlite3.Database('./database.db', function(err){
  if(err){
    console.error(err);
    process.exit(1);
  }else{
    console.log("Database connected");
    global.db.run("PRAGMA foreign_keys=ON");
  }
});

app.set('view engine', 'ejs');

// Render home page with a list of articles
app.get("/", function (req, res) {
  let sqlquery = "SELECT * FROM `Articles`";

  db.all(sqlquery, (err, result) => {
    if (err) {
      return console.error("Error fetching articles: " + err.message);
    } else {
      res.render('home', { availableArticles: result });
    }
  });
});

// Handle form submission for redirection
app.post('/redirect', (req, res) => {
  const userType = req.body.userType;

  if (userType === 'reader') {
    res.redirect('/readers_page');
  } else if (userType === 'author') {
    res.redirect('/authors_page');
  } else {
    res.redirect('/');
  }
});

// Create new user in the database
app.post("/home", function (req,res) {
  let sqlquery = "INSERT INTO Users (username, password, email, is_author) VALUES (?,?,?,?)";
  let newrecord = [req.body.username, req.body.password, req.body.email, req.body.is_author];

  db.run(sqlquery, newrecord, (err, result) => {
    if (err) {
      return console.error(err.message);
    } else {
      res.send("Your account has been created, <br> <b>Username:</b> "+ req.body.username + "<br><b> Password: </b>"+ req.body.password +" <br><b> email: </b>"+ req.body.email +
      "<br><b>Author:</b> "+ req.body.is_author + "<br> <a href='/' class='btn btn-secondary mt-3'>Go Back</a>")
    }
  });
});

// Add comment under an article
app.post('/submit-comment', (req, res) => {
  const articleId = req.body.article_id;
  const authorName = req.body.author_name;
  const email = req.body.email;
  const commentText = req.body.comment;

  const sqlQuery = 'INSERT INTO Comments (article_id, author_name, email, comment, comment_date) VALUES (?, ?, ?, ?, DATE("now"))';
  const values = [articleId, authorName, email, commentText];

  db.run(sqlQuery, values, (err) => {
    if (err) {
      console.error('Error inserting comment:', err.message);
      res.status(500).send('Error submitting comment.');
    } else {
      console.log('Comment inserted successfully.');
      res.redirect('/article-id?id=' + articleId);
    }
  });
});

// Render authors page using the data in the database
app.get('/authors_page', (req, res) => {
  const articlequery = "SELECT * FROM `Articles`;";
  const draftquery = "SELECT * FROM `Drafts`;";
  
  db.serialize(()=>{
    db.all(articlequery, (err, articleResults) => {
      if (err) {
        return console.error("No keyword found in any of the articles " + req.query.keyword + " error: "+ err.message);
      }
      db.all(draftquery, (err, draftResults) => {
        if (err) {
          return console.error("Error fetching comment data: " + err.message);
        }
        res.render('authors_page', {publishedArticles: articleResults, draftArticles: draftResults });
      });
    });
  });
});

// Render readers page using the data in the database
app.get('/readers_page', (req, res) => {
  const articlequery = "SELECT * FROM `Articles`;";
  
  db.serialize(()=>{
    db.all(articlequery, (err, articleResults) => {
      if (err) {
        return console.error("No keyword found in any of the articles " + req.query.keyword + " error: "+ err.message);
      }
      res.render('readers_page', {publishedArticles: articleResults});
    })
  });
});

// Delete draft from the authors page
app.post('/delete-draft', (req, res) => {
  const draftId = req.body.draft_id;
  const sqlQuery = 'DELETE FROM Drafts WHERE draft_id = ?;';
  
  db.run(sqlQuery, draftId, (err) => {
    if (err) {
      console.error('Error deleting article:', err.message);
      res.status(500).send('Error deleting article.');
    } else {
      console.log('Draft deleted successfully.');
      res.redirect('/authors_page');
    }
  });
});

// Publish draft using a button on the authors page
app.post('/publish-draft', (req, res) => {
  const draftId = req.body.draft_id;
  const sqlQuery = 'INSERT INTO Articles (title, subtitle, content, publication_date, user_id) SELECT title, subtitle, content, DATE("now"), user_id FROM Drafts WHERE draft_id = ?;';
  const deletequery = 'DELETE FROM Drafts WHERE draft_id = ?;';

  db.serialize(()=>{
    db.run(sqlQuery, draftId, (err) => {
      if (err) {
        console.error('Error publishing article:', err.message);
        res.status(500).send('Error publishing article.');
      } 
      db.run(deletequery, draftId, (err) => {
        if (err) {
          console.error('Error deleting article:', err.message);
          res.status(500).send('Error deleting article.');
        } else {
          console.log('Draft published successfully.');
          res.redirect('/authors_page');
        }
      });
    });
  });
});

// Assuming authorData is retrieved from your database or another source
const authorData = {
  author_name: 'John Doe', // Replace with actual data
  blogTitle: 'My Blog',    // Replace with actual data
  blogSubtitle: 'Subtitle' // Replace with actual data
};

// Render author settings page
app.get('/author_settings', (req, res) => {
  res.render('authors_settings', { authorData });
});

// Show the draft for editing from the authors page
app.get('/edit_draft', (req, res) => {
  let id = `${req.query.id}`;
  let sqlquery = "SELECT * FROM `Drafts` WHERE draft_id = ?;";

  db.all(sqlquery, id, (err, articleResults) => {
    if (err) {
      return console.error("Error fetching article data: " + err.message);
    }
    res.render('edit_draft',{availableDraft: articleResults});
  });
});

// Update the edited draft
app.post('/changed-draft', (req, res) => {
  const {articleTitle, articleSubtitle, articleText, userId, draftId} = req.body;

  const sqlQuery = 'UPDATE Drafts SET title = ?, subtitle = ?, content = ?, publication_date = DATE("now"), user_id = ? WHERE draft_id = ?;';
  db.run(sqlQuery, [articleTitle, articleSubtitle, articleText, userId, draftId], (err) => {
    if (err) {
      console.error('Error updating article:', err.message);
      res.status(500).send('Error updating article.');
    } else {
      console.log('Article updated successfully.');
      res.redirect('/authors_page');
    }
  });
});

// Show the published article for editing from the authors page
app.get('/edit_published', (req, res) => {
  let id = `${req.query.id}`;
  let sqlquery = "SELECT * FROM `Articles` WHERE article_id = ?;";

  db.all(sqlquery, id, (err, articleResults) => {
    if (err) {
      return console.error("Error fetching article data: " + err.message);
    }
    res.render('edit_published', { availableArticle: articleResults });
  });
});

// Update the edited published article
app.post('/changed-published', (req, res) => {
  const { articleTitle, articleSubtitle, articleText, userId, articleId } = req.body;

  const sqlQuery = 'UPDATE Articles SET title = ?, subtitle = ?, content = ?, publication_date = DATE("now"), user_id = ? WHERE article_id = ?;';
  db.run(sqlQuery, [articleTitle, articleSubtitle, articleText, userId, articleId], (err) => {
    if (err) {
      console.error('Error updating article:', err.message);
      res.status(500).send('Error updating article.');
    } else {
      console.log('Article updated successfully.');
      res.redirect('/authors_page');
    }
  });
});

// Render the create_draft page
app.get('/create_draft', (req, res) => {
  res.render('create_draft');
});

// Send created draft to the database
app.post('/create-draft', (req, res) => {
  const {articleTitle, articleSubtitle, articleText, userId} = req.body;

  const sqlQuery = 'INSERT INTO Drafts (title, subtitle, content, publication_date, user_id) VALUES (?, ?, ?, DATE("now"), ?)';
  db.run(sqlQuery, [articleTitle, articleSubtitle, articleText, userId], (err) => {
    if (err) {
      console.error('Error creating article:', err.message);
      res.status(500).send('Error creating article.');
    } else {
      console.log('Article created successfully.');
      res.redirect('/authors_page');
    }
  });
});

// Render the article and comments after clicking "Read more" on the home page.
app.get("/article-id", function (req, res) {
  let id = `${req.query.id}`;
  let sqlquery = "SELECT * FROM `Articles` WHERE article_id = ?;";
  let commentquery = "SELECT * FROM Comments WHERE article_id = ?;"

  db.serialize(() => {
    db.all(sqlquery, id, (err, articleResults) => {
      if (err) {
        return console.error("Error fetching article data: " + err.message);
      } 
      db.all(commentquery, id, (err, commentResults) => {
        if (err) {
          return console.error("Error fetching comment data: " + err.message);
        }
        res.render('article', { article: articleResults, comments: commentResults });
      });
    });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});

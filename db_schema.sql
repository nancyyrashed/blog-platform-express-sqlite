-- Enable foreign key constraints to ensure referential integrity
PRAGMA foreign_keys=ON;

-- Begin a transaction to group the following operations
BEGIN TRANSACTION;

-- Create the Users table to store user information
CREATE TABLE IF NOT EXISTS Users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    is_author TEXT DEFAULT 'No'
);

-- Create the Articles table to store published articles
CREATE TABLE IF NOT EXISTS Articles (
    article_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    content TEXT NOT NULL,
    publication_date CURRENT_TIMESTAMP,
    user_id INT, -- Reference to the user who created the article
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Create the Drafts table to store draft articles
CREATE TABLE IF NOT EXISTS Drafts (
    draft_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    content TEXT NOT NULL,
    publication_date CURRENT_TIMESTAMP,
    user_id INT, -- Reference to the user who created the draft
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Create the Comments table to store user comments on articles
CREATE TABLE IF NOT EXISTS Comments (
    comment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL, -- Reference to the article being commented on
    author_name VARCHAR(255),
    email VARCHAR(255),
    comment TEXT NOT NULL,
    comment_date CURRENT_TIMESTAMP,
    user_id INT, -- Reference to the user who wrote the comment
    FOREIGN KEY (article_id) REFERENCES Articles(article_id)
);

-- Insert default data for testing purposes
INSERT INTO Users ('username','email','password', 'is_author') VALUES ('Admin','admin@blog.com','password123','Yes');
INSERT INTO Articles ('title','subtitle','content','publication_date', 'user_id') VALUES('This is a title of an article', 'Some more info about the article', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', DATE('now'), 1);
INSERT INTO Articles ('title','subtitle','content','publication_date', 'user_id') VALUES('How to make a CRUD website', 'In this post you will find information on how to create a site where you can create, read, update and delete stuff', 'To develop a CRUD website, you will need to select a technology stack, such as Node.js for the backend and Express.js as the framework, along with a database system like MongoDB. Create RESTful API routes in the backend for handling Create, Read, Update, and Delete operations. Design and build frontend templates using HTML, CSS, and JavaScript, offering user interfaces for listing, adding, editing, and deleting data. Implement frontend JavaScript code to interact with the backend API, using fetch or Axios to send requests and update data on the server. Finally, establish the connection between the frontend and backend to enable users to seamlessly perform CRUD operations. Thoroughly test the functionality and ensure security measures are in place to protect against potential vulnerabilities.', DATE('now'), 1);
INSERT INTO Comments ('article_id','author_name','email','comment','comment_date','user_id') VALUES (1, 'Pablito', 'pablito@pablo.com', 'This makes a lot of sense, best article ever', DATE('now'), 1);
INSERT INTO Drafts ('title','subtitle','content','publication_date', 'user_id') VALUES('Article about making drafts', 'Test draft article', 'This is how you delete drafts', DATE('now'), 1);

-- Commit the transaction to apply changes
COMMIT;

-- Move a draft to the Articles table by copying its data
INSERT INTO Articles (title, subtitle, content, publication_date, user_id)
SELECT title, subtitle, content, DATE('now'), user_id FROM Drafts WHERE draft_id = 2;

-- Commit the transaction after moving the draft
COMMIT;

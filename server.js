'use strict';
require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const PORT = process.env.PORT || 4000;
const app = express();
const pg = require('pg');

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', (err) => console.log(err));

app.set('view engine', 'ejs');
app.use('/public',express.static('public'));
app.use(express.urlencoded({extended :true}));

app.get('/', (req, res) => {
  console.log('hi');
  const SQL = 'SELECT * FROM books;';
  client
    .query(SQL)
    .then((results) => {
      console.log('bye');
      console.log(results.rows);
      res.render('pages/index.ejs',{savedBooks : results.rows});
    })
    .catch((err) => {
      console.log(err);
      errorHandler(err, req, res);
    });

});

app.post('/searchNow', (req, res) => {
  console.log('form enterd',req.body);
  Book.all=[];
  var titleRes =[];
  var aouthorRes = [];
  console.log(req.body);
  Book.searchTitle=req.body.title||null;
  Book.searchAuthor=req.body.author||null;
  console.log(Book.searchTitle, Book.searchAuthor);
  if(Book.searchTitle){
    console.log('search from title');
    const url = `https://www.googleapis.com/books/v1/volumes?q=${req.body.textArea}`;
    superagent.get(url).then((apiResponse) => {
        Book.all=apiResponse.body.items.map(book=>
            new Book(book.volumeInfo) );
    //   apiResponse.body.items.forEach(book => {
    //     // console.log(Book.all);
    //     Book.all.push(new Book(book.volumeInfo));
    //   });
    res.redirect('/searches');
    });
  }


  if(Book.searchAuthor){
    console.log('search from title');
    const url = `https://www.googleapis.com/books/v1/volumes?q=${req.body.textArea}`;
    superagent.get(url).then((apiResponse) => {
    //   console.log(apiResponse.body.items);
    Book.all=apiResponse.body.items.map(book=>
        new Book(book.volumeInfo) );
    //   apiResponse.body.items.forEach(book => {
    //     Book.all.push(new Book(book.volumeInfo));
    //   });
    res.redirect('/searches');
    });
  }

  
});
app.get('/searches', (req, res) => {
//   console.log('books',Book.all);
  // while(Book.all!==[]);
  res.render('pages/searches/show',{Book : Book.all});
});
app.get('/books/:id', (req, res) => {
  console.log('i\'am here',req.params.id);

  const { title,authors,description, imageUrl } = Book.all[req.params.id];
  const SQL =
    'INSERT INTO books (title,author,description, imageURL) VALUES ($1,$2,$3,$4);';
  const values = [title,authors,description, imageUrl];
  client
    .query(SQL, values)
    .then((results) => {
      console.log('stored');
      res.render('pages/books/detail',{book :Book.all[req.params.id]});
    })
    .catch((err) => {
      errorHandler(err, req, res);
    });
});
app.get('/searches/new', (req, res) => {
  res.render('pages/searches/new');
});

app.get('*', (req, res) => {
  res.send('nno way');
});

function errorHandler(err, req, res) {
//   res.status(500).render('pages/error-view', { error: err });
  console.log(err);
}

client.connect().then(() => {
  app.listen(PORT, () => console.log(`I'm running at port ${PORT}`));
});

function Book(obj){
  this.title=obj.title;
  this.authors=obj.authors;
  this.description=obj.description||'there is no description avelable right now';
  this.imageUrl=obj.imageLinks.smallThumbnail||'https://cdn3.iconfinder.com/data/icons/education-flat-icons-shadow/96/18-512.png';
}
Book.all=[];
Book.searchTitle='';
Book.searchAuthor='';

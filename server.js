'use strict';
require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const PORT = process.env.PORT || 4000;
const app = express();

app.set('view engine', 'ejs');
app.use('/public',express.static('public'));

app.get('/', (req, res) => {
  res.render('pages/index');
});
app.listen(PORT, () => console.log(`I'm running at port ${PORT}`));

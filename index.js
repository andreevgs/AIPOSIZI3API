const express = require('express');
const app = express();
const bodyParser = require('body-parser');
require('dotenv').config();

let subdivisionsRouter = require('./routes/subdivisions')
let repairsRouter = require('./routes/repairs');

const port = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use('/public', express.static(__dirname + '/public'));

app.use('/subdivisions', subdivisionsRouter);
app.use('/repairs', repairsRouter);

app.listen(port, () => {
    console.log(`Express web app available at localhost: ${port}`);
});
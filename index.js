const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const pg = require('pg');
require('dotenv').config();
const DB_ACCESS = require('./config').DB_ACCESS;

let subdivisionsRouter = require('./routes/subdivisions');
let repairsRouter = require('./routes/repairs');
let authRouter = require('./routes/auth');

const pool = new pg.Pool(DB_ACCESS);

pool.connect((err, client, done) => {
    if (err) {
        return console.error('error fetching client from pool', err);
    }
    client.query('CREATE TABLE IF NOT EXISTS Subdivisions (id SREIAL, name VARCHAR(150))', function (err, result) {
        done();
        if (err) {
            return console.error('error happened during query', err);
        }
        console.log('Subdivision is created if not exist');   
    });    
});

pool.connect((err, client, done) => {
    if (err) {
        return console.error('error fetching client from pool', err);
    }
    client.query('CREATE TABLE IF NOT EXISTS Affilation_of_technics (id SREIAL, technics_id INT, subdivision_id INT, date TIMESTAMP)', function (err, result) {
        done();
        if (err) {
            return console.error('error happened during query', err);
        }
        console.log('Affilation_of_technics is created if not exist');
    });
});

pool.connect((err, client, done) => {
    if (err) {
        return console.error('error fetching client from pool', err);
    }
    client.query('CREATE TABLE IF NOT EXISTS Layoffs (id SREIAL, full_name VARCHAR(150), subdivision_id INT, age INT, sex VARCHAR(150), position VARCHAR(150), date TIMESTAMP)', function (err, result) {
        done();
        if (err) {
            return console.error('error happened during query', err);
        }
        console.log('Layoffs is created if not exist');       
    });
});

pool.connect((err, client, done) => {
    if (err) {
        return console.error('error fetching client from pool', err);
    }
    client.query('CREATE TABLE IF NOT EXISTS Spares_for_repairs (id SREIAL, spair_id INT, repairs_id INT)', function (err, result) {
        done();
        if (err) {
            return console.error('error happened during query', err);
        }
        console.log('Spares_for_repairs is created if not exist');       
    });
});

pool.connect((err, client, done) => {
    if (err) {
        return console.error('error fetching client from pool', err);
    }
    client.query('CREATE TABLE IF NOT EXISTS Spares (id SREIAL, name VARCHAR(150), cost INT, repairs_id INT, date TIMESTAMP)', function (err, result) {
        done();
        if (err) {
            return console.error('error happened during query', err);
        }
        console.log('Spares is created if not exist');       
    });
});

pool.connect((err, client, done) => {
    if (err) {
        return console.error('error fetching client from pool', err);
    }
    client.query('CREATE TABLE IF NOT EXISTS Technics (id SREIAL, name VARCHAR(150), model VARCHAR(150), year INT, subdivision_id INT, is_decom INT)', function (err, result) {
        done();
        if (err) {
            return console.error('error happened during query', err);
        }
        console.log('Technics is created if not exist');       
    });
});

pool.connect((err, client, done) => {
    if (err) {
        return console.error('error fetching client from pool', err);
    }
    client.query('CREATE TABLE IF NOT EXISTS Staff_relocation (id SREIAL, employee_id INT, date TIMESTAMP, subdivision_id INT, position VARCHAR(150))', function (err, result) {
        done();
        if (err) {
            return console.error('error happened during query', err);
        }
        console.log('Staff_relocation is created if not exist');       
    });
});

pool.connect((err, client, done) => {
    if (err) {
        return console.error('error fetching client from pool', err);
    }
    client.query('CREATE TABLE IF NOT EXISTS Employees (id SREIAL, full_name VARCHAR(150), subdivision_id INT, age VARCHAR(150), sex VARCHAR(150), position VARCHAR(150), user_id INT)', function (err, result) {
        done();
        if (err) {
            return console.error('error happened during query', err);
        }
        console.log('Employees is created if not exist');       
    });
});

pool.connect((err, client, done) => {
    if (err) {
        return console.error('error fetching client from pool', err);
    }
    client.query('CREATE TABLE IF NOT EXISTS Employees_repair_shop (id SREIAL, full_name VARCHAR(150), subdivision_id INT, age VARCHAR(150), sex VARCHAR(150), position VARCHAR(150))', function (err, result) {
        done();
        if (err) {
            return console.error('error happened during query', err);
        }
        console.log('Employees_repair_shop is created if not exist');
    });
});

pool.connect((err, client, done) => {
    if (err) {
        return console.error('error fetching client from pool', err);
    }
    client.query('CREATE TABLE IF NOT EXISTS Repairs (id SREIAL, technics_id INT, subdivision_id INT, date_of_hand_over_for_repair TIMESTAMP, type_of_repair VARCHAR(150), repair_time INT, employee_id_who_gave INT, employee_id_who_accepted INT, employee_id_who_repair INT, is_done INT)', function (err, result) {
        done();
        if (err) {
            return console.error('error happened during query', err);
        }
        console.log('Repairs is created if not exist');
    });
});

const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use('/public', express.static(__dirname + '/public'));

app.use('/api/subdivisions', subdivisionsRouter);
app.use('/api/repairs', repairsRouter);
app.use('/api/auth', authRouter);

app.listen(port, () => {
    console.log(`Express web app available at localhost: ${port}`);
});
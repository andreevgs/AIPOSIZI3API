let express = require('express');
let router = express();
const pg = require('pg');
const fs = require('fs');
const authJwt = require('../middleware/authJWT');

const DB_ACCESS = require('../config').DB_ACCESS;

const pool = new pg.Pool(DB_ACCESS);

router.get('/', authJwt.verifyToken, (req, res) => {
    pool.connect((err, client, done) => {
        if (err) {
            res.json({error: 'Server error'});
            return console.error('error fetching client from pool', err);
        }
        client.query('SELECT * FROM Subdivisions', [], function (err, result) {
            done();
            if (err) {
                res.json({error: 'Server error'});
                return console.error('error happened during query', err);
            }
            res.set('Access-Control-Allow-Origin', '*');
            res.set('Access-Control-Allow-Headers', 'origin, content-type, accept');
            res.json(result);         
        });
    });
}); 

router.post('/add', authJwt.verifyToken, (req, res) => {
    pool.connect((err, client, done) => {
        if (err) {
            res.json({error: 'Server error'});
            return console.error('error fetching client from pool', err);
        }
        client.query('INSERT INTO Subdivisions (name) VALUES ($1)', [req.body.name], function (err, result) {
            done();
            if (err) {
                res.json({error: 'Server error'});
                return console.error('error happened during query', err);
            }
            console.log('subdivision is added');
            fs.appendFileSync(__dirname + '/../logs.txt', 'subdivision is added\n');
            res.json({status: 1});        
        });
    });
});

router.get('/employees', authJwt.verifyToken, (req, res) => {
    pool.connect((err, client, done) => {
        if (err) {
            res.json({error: 'Server error'});
            return console.error('error fetching client from pool', err);
        }
        let query;
        if(req.query.sex && req.query.age){
            if(req.query.sex == 'male'){
                query = 'SELECT Employees.id, Employees.full_name, Subdivisions.name AS subdivision, Employees.age, Employees.sex, Employees.position FROM Employees JOIN Subdivisions ON Subdivisions.id=Employees.subdivision_id WHERE Employees.sex=\'МУЖ\' AND Employees.age=$1';
                client.query(query, [req.query.age], function (err, result) {
                    done();
                    if (err) {
                        res.json({error: 'Server error'});
                        return console.error('error happened during query', err);
                    }
                    res.json(result); 
                });
            }
            if(req.query.sex == 'female'){
                query = 'SELECT Employees.id, Employees.full_name, Subdivisions.name AS subdivision, Employees.age, Employees.sex, Employees.position FROM Employees JOIN Subdivisions ON Subdivisions.id=Employees.subdivision_id WHERE Employees.sex=\'ЖЕН\' AND Employees.age=$1';
                client.query(query, [req.query.age], function (err, result) {
                    done();
                    if (err) {
                        res.json({error: 'Server error'});
                        return console.error('error happened during query', err);
                    }
                    res.json(result);
                });
            }
        }
        else if(req.query.sex){
            if(req.query.sex == 'male'){
                query = 'SELECT Employees.id, Employees.full_name, Subdivisions.name AS subdivision, Employees.age, Employees.sex, Employees.position FROM Employees JOIN Subdivisions ON Subdivisions.id=Employees.subdivision_id WHERE Employees.sex=\'МУЖ\'';
                client.query(query, [], function (err, result) {
                    done();
                    if (err) {
                        res.json({error: 'Server error'});
                        return console.error('error happened during query', err);
                    }
                    res.json(result);
                });
            }
            if(req.query.sex == 'female'){
                query = 'SELECT Employees.id, Employees.full_name, Subdivisions.name AS subdivision, Employees.age, Employees.sex, Employees.position FROM Employees JOIN Subdivisions ON Subdivisions.id=Employees.subdivision_id WHERE Employees.sex=\'ЖЕН\'';
                client.query(query, [], function (err, result) {
                    done();
                    if (err) {
                        res.json({error: 'Server error'});
                        return console.error('error happened during query', err);
                    }
                    res.json(result);
                });
            }
        }
        else if(req.query.age){
            query = 'SELECT Employees.id, Employees.full_name, Subdivisions.name AS subdivision, Employees.age, Employees.sex, Employees.position FROM Employees JOIN Subdivisions ON Subdivisions.id=Employees.subdivision_id WHERE Employees.age=$1';
            client.query(query, [req.query.age], function (err, result) {
                done();
                if (err) {
                    res.json({error: 'Server error'});
                    return console.error('error happened during query', err);
                }
                res.json(result);
            });
        }
        else {
            query = 'SELECT Employees.id, Employees.full_name, Subdivisions.name AS subdivision, Employees.age, Employees.sex, Employees.position FROM Employees JOIN Subdivisions ON Subdivisions.id=Employees.subdivision_id';
            client.query(query, [], function (err, result) {
                done();
                if (err) {
                    res.json({error: 'Server error'});
                    return console.error('error happened during query', err);
                }
                res.json(result);
            });
        }
    });
});

router.post('/:id/technics/add', authJwt.verifyToken, (req, res) => {
    pool.connect((err, client, done) => {
        if (err) {
            res.set('Access-Control-Allow-Origin', '*');
            res.set('Access-Control-Allow-Headers', 'origin, content-type, accept');
            res.json({error: 'Server error'});
            return console.error('error fetching client from pool', err);
        }
        client.query('INSERT INTO Technics (name, model, year, subdivision_id, is_decom) VALUES ($1, $2, $3, $4, 0) RETURNING id', [req.body.name, req.body.model, req.body.year, req.params.id], function (err, result) {
            if (err) {
                res.set('Access-Control-Allow-Origin', '*');
                res.set('Access-Control-Allow-Headers', 'origin, content-type, accept');
                res.json({error: 'Server error'});
                return console.error('error happened during query', err);
            }
            client.query('INSERT INTO Affilation_of_technics (technics_id, subdivision_id, date) VALUES ($1, $2, NOW())', [result.rows[0].id, req.params.id], function(err, result) {
                done();
                console.log('technics is added');
                fs.appendFileSync(__dirname + '/../logs.txt', 'technics is added\n');
                if (err) {
                    res.set('Access-Control-Allow-Origin', '*');
                    res.set('Access-Control-Allow-Headers', 'origin, content-type, accept');
                    res.json({error: 'Server error'});
                    return console.error('error happened during query', err);
                }
                console.log(req.body);
                res.json({status: 1});        
            });
        });
    });       
});

router.get('/:id/technics', authJwt.verifyToken, (req, res) => {
    pool.connect((err, client, done) => {
        if (err) {
            res.json({error: 'Server error'});
            return console.error('error fetching client from pool', err);
        }
        client.query('SELECT * FROM Technics WHERE subdivision_id=$1 AND is_decom=0', [req.params.id], function (err, result) {
            if (err) {
                res.json({error: 'Server error'});
                return console.error('error happened during query', err);
            }
            client.query('SELECT technics_id FROM Repairs WHERE is_done=0', [], function (err, result_technics) {
                done();
                if (err) {
                    res.json({error: 'Server error'});
                    return console.error('error happened during query', err);
                }
                result.rows.forEach((item) => {
                    result_technics.rows.forEach((item_techs) => {
                        if(item.id == item_techs.technics_id){
                            item.is_in_repair = true;
                        }
                    });
                });
                res.set('Access-Control-Allow-Origin', '*');
                res.set('Access-Control-Allow-Headers', 'origin, content-type, accept');
                res.json(result);
            });
        });
    });
});

router.get('/:id/technics/:technics_id/edit', authJwt.verifyToken, (req, res) => {
    pool.connect((err, client, done) => {
        if (err) {
            res.json({error: 'Server error'});
            return console.error('error fetching client from pool', err);
        }
        client.query('SELECT * FROM Technics WHERE id=$1', [req.params.technics_id], function (err, result_tech) {
            if (err) {
                res.json({error: 'Server error'});
                return console.error('error happened during query', err);
            }
            client.query('SELECT * FROM Subdivisions', [], function (err, result_subdivisions) {
                done();
                if (err) {
                    res.json({error: 'Server error'});
                    return console.error('error happened during query', err);
                }
                res.json({result_subdivisions: result_subdivisions, result_tech: result_tech});
            });
        });
    });
});

router.get('/:id/decom', authJwt.verifyToken, (req, res) => {
    pool.connect((err, client, done) => {
        if (err) {
            res.json({error: 'Server error'});
            return console.error('error fetching client from pool', err);
        }
        client.query('SELECT * FROM Technics WHERE subdivision_id=$1 AND is_decom=1', [req.params.id], function (err, result_tech) {
            if (err) {
                res.json({error: 'Server error'});
                return console.error('error happened during query', err);
            }
            res.json(result_tech);
        });
    });
});

router.get('/:id/technics/:technics_id/decom', authJwt.verifyToken, (req, res) => {
    pool.connect((err, client, done) => {
        if (err) {
            res.json({error: 'Server error'});
            return console.error('error fetching client from pool', err);
        }
        
            client.query('UPDATE Technics SET is_decom=1 WHERE id=$1', [req.params.technics_id], function (err, result_subdivisions) {
                if (err) {
                    res.json({error: 'Server error'});
                    return console.error('error happened during query', err);
                }
                res.json({status: 1});
            });
        });
});

router.get('/:id/technics/:technics_id/torepair', authJwt.verifyToken, (req, res) => {
    pool.connect((err, client, done) => {
        if (err) {
            res.json({error: 'Server error'});
            return console.error('error fetching client from pool', err);
        }
        client.query('SELECT * FROM Employees WHERE subdivision_id=$1', [req.params.id], function (err, result_emp) {
            if (err) {
                res.json({error: 'Server error'});
                return console.error('error happened during query', err);
            }
            client.query('SELECT * FROM Employees_repair_shop', [], function (err, result_rep_emp) {
                done();
                if (err) {
                    res.json({error: 'Server error'});
                    return console.error('error happened during query', err);
                }    
                res.json({result_emp: result_emp, result_rep_emp: result_rep_emp});
            });
        });
    });
});

router.post('/:id/technics/:technics_id/torepair', authJwt.verifyToken, (req, res) => {
    pool.connect((err, client, done) => {
        if (err) {
            res.json({error: 'Server error'});
            return console.error('error fetching client from pool', err);
        }
        client.query('INSERT INTO Repairs (technics_id, subdivision_id, date_of_hand_over_for_repair, type_of_repair, repair_time, employee_id_who_gave, employee_id_who_accepted, employee_id_who_repair, is_done) VALUES ($1, $2, NOW(), $3, $4, $5, $6, $7, 0)', [req.params.technics_id, req.params.id, req.body.type_of_repair, req.body.repair_time, req.body.employee_id_who_gave, req.body.employee_id_who_accepted, req.body.employee_id_who_repair], function (err, result_tech) {
            done();
            if (err) {
                res.json({error: 'Server error'});
                return console.error('error happened during query', err);
            }
            console.log('technics is replaced to repair');
            fs.appendFileSync(__dirname + '/../logs.txt', 'technics is replaced to repair\n');
            res.json({status: 1});
        });
    });
});

router.post('/:id/technics/:technics_id/edit', authJwt.verifyToken, (req, res) => {
    pool.connect((err, client, done) => {
        done();
        if (err) {
            res.json({error: 'Server error'});
            return console.error('error fetching client from pool', err);
        }
        client.query('UPDATE Technics SET name=$1, model=$2, year=$3, subdivision_id=$4 WHERE id=$5', [req.body.name, req.body.model, req.body.year, req.body.subdivision_id, req.params.technics_id], function (err, result) {
            if (err) {
                res.json({error: 'Server error'});
                return console.error('error happened during query', err);
            }
            if(req.body.subdivision_id !== req.params.id){
                client.query('INSERT INTO Affilation_of_technics (technics_id, subdivision_id, date) VALUES ($1, $2, NOW())', [req.params.technics_id, req.body.subdivision_id], function (err, result) {
                    if (err) {
                        res.json({error: 'Server error'});
                        return console.error('error happened during query', err);
                    }
                    console.log('technics is replaced to another subdivision');
                    fs.appendFileSync(__dirname + '/../logs.txt', 'technics is replaced to another subdivision\n');
                    res.json({status: 1});
                });
            }
            else {
                console.log('technics is edited');
                fs.appendFileSync(__dirname + '/../logs.txt', 'technics is edited\n');
                res.json({status: 1});            
            }
        });
    });
});

router.get('/:id/employees', authJwt.verifyToken, (req, res) => {
    console.log('user_id: ', req.userId);

    pool.connect((err, client, done) => {
        if (err) {
            res.json({error: 'Server error'});
            return console.error('error fetching client from pool', err);
        }
        client.query('SELECT Employees.id, Employees.full_name, Employees.user_id, Subdivisions.name AS subdivision, Employees.age, Employees.sex, Employees.position FROM Employees JOIN Subdivisions ON Subdivisions.id=Employees.subdivision_id WHERE Employees.subdivision_id=$1', [req.params.id], function (err, result) {
            done();
            if (err) {
                res.json({error: 'Server error'});
                return console.error('error happened during query', err);
            }
            res.json(result);
        });
    });
});

router.get('/:id*?/employees/add', authJwt.verifyToken, (req, res) => {
    pool.connect((err, client, done) => {
        if (err) {
            res.json({error: 'Server error'});
            return console.error('error fetching client from pool', err);
        }
        client.query('SELECT * FROM Subdivisions', [], function (err, result) {
            done();
            if (err) {
                res.json({error: 'Server error'});
                return console.error('error happened during query', err);
            }
            res.json(result);
        });
    });
});

router.post('/:id*?/employees/add', authJwt.verifyToken, (req, res) => {
    pool.connect((err, client, done) => {
        if (err) {
            res.json({error: 'Server error'});
            return console.error('error fetching client from pool', err);
        }
        client.query('INSERT INTO Employees (full_name, subdivision_id, age, sex, position, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id', [req.body.name, req.body.subdivision_id, req.body.age, req.body.sex, req.body.position, req.userId], function (err, result_emp) {
            if (err) {
                res.json({error: 'Server error'});
                return console.error('error happened during query', err);
            }
            client.query('INSERT INTO Staff_relocation (employee_id, date, subdivision_id, position) VALUES ($1, NOW(), $2, $3)', [result_emp.rows[0].id, req.body.subdivision_id, req.body.position], function(err, result_reloc) {
                done();
                if (err) {
                    res.json({error: 'Server error'});
                    return console.error('error happened during query', err);
                }
                console.log('employee is added');
                fs.appendFileSync(__dirname + '/../logs.txt', 'employee is added\n');
                if(req.params.id){
                    res.json({status: 1, id_for_link: req.params.id});
                }
                else {
                    res.json({status: 1});
                }
            });
        });
    });
});

router.get('/:id*?/employees/:employee_id/edit', authJwt.verifyToken, (req, res) => {
    pool.connect((err, client, done) => {
        if (err) {
            res.json({error: 'Server error'});
            return console.error('error fetching client from pool', err);
        }
        client.query('SELECT * FROM Subdivisions', [], function (err, result_sub) {
            if (err) {
                res.json({error: 'Server error'});
                return console.error('error happened during query', err);
            }
            client.query('SELECT * FROM Employees WHERE id=$1', [req.params.employee_id], function (err, result_emp) {
                if (err) {
                    res.json({error: 'Server error'});
                    return console.error('error happened during query', err);
                }
                res.json({result_sub: result_sub, result_emp: result_emp});
            });
        });
    });
});

router.get('/:id*?/employees/:employee_id/del', authJwt.verifyToken, (req, res) => {
    pool.connect((err, client, done) => {
        if (err) {
            res.json({error: 'Server error'});
            return console.error('error fetching client from pool', err);
        }
        client.query('SELECT * FROM Employees WHERE id=$1', [req.params.employee_id], function (err, result_tech) {
            if (err) {
                res.json({error: 'Server error'});
                return console.error('error happened during query 1', err);
            }
            console.log('data ', result_tech.rows[0]);
            if(result_tech.rows[0].user_id != req.userId){
                res.json({error: 'Server error'});
                return console.error('unautorized ');
            }
            client.query('INSERT INTO Layoffs (full_name, subdivision_id, age, sex, position, date) VALUES ($1, $2, $3, $4, $5, NOW())', [result_tech.rows[0].full_name, result_tech.rows[0].subdivision_id, result_tech.rows[0].age, result_tech.rows[0].sex, result_tech.rows[0].position], function (err, result_subdivisions) {
                if (err) {
                    res.json({error: 'Server error'});
                    return console.error('error happened during query 2', err);
                }
                client.query('DELETE FROM Employees WHERE id=$1', [req.params.employee_id], function (err, result_subdivisions) {
                    done();
                    if (err) {
                        res.json({error: 'Server error'});
                        return console.error('error happened during query 3', err);
                    }
                    if(req.params.id){
                        res.json({status: 1, id_for_link: req.params.id});
                    }
                    else {
                        res.json({status: 1});
                    }
                });
            });
        });
    });
});

router.post('/:id*?/employees/:employee_id/edit', authJwt.verifyToken, (req, res) => {
    pool.connect((err, client, done) => {
        if (err) {
            res.json({error: 'Server error'});
            return console.error('error fetching client from pool', err);
        }
        client.query('SELECT subdivision_id FROM Employees WHERE id=$1', [req.params.employee_id], function (err, result_emp) {
            if (err) {
                res.json({error: 'Server error'});
                return console.error('error happened during query', err);
            }
            client.query('UPDATE Employees SET full_name=$1, subdivision_id=$2, age=$3, sex=$4, position=$5 WHERE id=$6', [req.body.name, req.body.subdivision_id, req.body.age, req.body.sex, req.body.position, req.params.employee_id], function(err, result_emp_upd) {
                if (err) {
                    res.json({error: 'Server error'});
                    return console.error('error happened during query', err);
                }
                if(result_emp.rows[0].subdivision_id != req.body.subdivision_id){
                    client.query('INSERT INTO Staff_relocation (employee_id, date, subdivision_id, position) VALUES ($1, NOW(), $2, $3)', [req.params.employee_id, req.body.subdivision_id, req.body.position], function(err, result_reloc) {
                        done();
                        if (err) {
                            res.json({error: 'Server error'});
                            return console.error('error happened during query', err);
                        }
                        if(req.params.id){
                            res.json({status: 1, id_for_link: req.params.id});
                        }
                        else {
                            res.json({status: 1});
                        }
                    });
                }
                else {
                    console.log('employee is edited');
                    fs.appendFileSync(__dirname + '/../logs.txt', 'employee is edited\n');
                    done();
                    if(req.params.id){
                        res.json({status: 1, id_for_link: req.params.id});
                    }
                    else {
                        res.json({status: 1});
                    }
                }
            });
        });
    });
});

module.exports = router;
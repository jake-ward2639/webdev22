const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
app.use(bodyParser.urlencoded({extended: false}));

const port = 3000;
app.get('/save_the_pangolin_api', async (req, res) => {
    const {status, data} = await getComments(req);
    res.status(status);
    if(data) res.json(data);
    else res.end();       
})

app.post('/save_the_pangolin_api', async (req, res) => {
    const {status, data} = await postComments(req);
    res.status(status);
    if(data) res.json(data);
    else res.end();
})

app.put('/save_the_pangolin_api', async (req, res) => {
    res.status(405);
    res.end();
})

app.delete('/save_the_pangolin_api', async (req, res) => {
    res.status(405);
    res.end();
})

async function getComments(req) {
    let status = 500, data = null;
    try {
        const oid = req.query.oid;
        if(oid && oid.length > 0 
        && oid.length <= 32 && oid.match(/^[a-z0-9]+$/i)){
            const sql = 'SELECT `name`, `comment` FROM `comments` WHERE `oid`=?';
            const rows = await db.query(sql, [oid]);

            if(rows){
                status = 200;
                data = {
                    'oid': oid,
                    'comments': rows
                };
            } else {
                status = 204;
            }
        } else {
            status = 400;   
        }
    } catch(e) {
        console.error(e);
    }
    return {status, data};
}

async function postComments(req) {
    let status = 500, data = null;
    try {
        const oid = req.body.oid;
        const name = req.body.name;
        const comment = req.body.comment;
        if(oid && name && comment
        && oid.length > 0 && oid.length <= 32
        && oid.match(/^[a-z0-9]+$/i)
        && name.length > 0 && name.length <= 64
        && comment.length > 0 ){

            const sql = 'INSERT INTO `comments` (`oid`, `name`, `comment`) '
            + 'VALUES (?, ?, ?)';
            const result = await db.query(sql, [oid, name, comment]);

            if(result.affectedRows) {
                status = 201;
                data = {'id': result.insertId };
            }
            
        } else {
            status = 400;
        }
    } catch(e) {
        console.error(e);
    }
    return {status, data};
}
   

app.listen(port, () => {})
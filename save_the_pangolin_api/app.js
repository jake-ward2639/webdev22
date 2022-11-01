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
        const username = req.query.username;
        if(username && username.length > 0 
        && username.length <= 32 && username.match(/^[a-z0-9]+$/i)){
            const sql = 'SELECT `conditionFound`, `notes`, `locationOfSighting`, `imagePath` FROM `sightings` WHERE `username`=?';
            const rows = await db.query(sql, [username]);

            if(rows){
                status = 200;
                data = {
                    'username': username,
                    'sightings': rows
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
        const username = req.body.username;
        const conditionFound = req.body.conditionFound;
        const notes = req.body.notes;
        if(username && conditionFound && notes
        && username.length > 0 && username.length <= 32
        && username.match(/^[a-z0-9]+$/i)
        && conditionFound.length > 0 && conditionFound.length <= 64
        && notes.length > 0 ){

            const sql = 'INSERT INTO `sightings` (`username`, `conditionFound`, `notes`) '
            + 'VALUES (?, ?, ?)';
            const result = await db.query(sql, [username, conditionFound, notes]);

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
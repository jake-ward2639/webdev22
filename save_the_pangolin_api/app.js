const express = require('express');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser'); //allows urlencoded data to be parsed into the body of the request
const cors = require('cors'); //prevents cors errors when contacting from client
const db = require('./db'); //connection to database

const app = express();
app.use(bodyParser.urlencoded({extended: false})); //can include app.use(bodyParser.json()); to utalize json as well
app.use(cors());

const port = 3000;
app.get('/save_the_pangolin_api', async (req, res) => { //handle get requests
    const {status, data} = await getSighting(req);
    res.status(status);
    if(data) res.json(data);
    else res.end();       
})

app.post('/save_the_pangolin_api', async (req, res) => { //handle post requests
    const {status, data} = await postSighting(req);
    res.status(status);
    if(data) res.json(data);
    else res.end();
})

app.put('/save_the_pangolin_api', async (req, res) => { //deny put requests
    res.status(405);
    res.end();
})

app.delete('/save_the_pangolin_api', async (req, res) => { //deny delete requests
    res.status(405);
    res.end();
})

async function getSighting(req) { //establishing valid request and giving appropriate response
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

async function postSighting(req) { //establishing valid request and giving appropriate response
    let status = 500, data = null;
    try {
        const username = req.body.username;
        const conditionFound = req.body.conditionFound;
        const notes = req.body.notes;
        const locationOfSighting = req.body.locationOfSighting;
        const imagePath = 'theImagePath';                           //CHANGE THIS LINE TO USE CORRECT IMAGE PATH
        if(username && conditionFound && notes && locationOfSighting && imagePath
        && username.length > 0 && username.length <= 64
        && username.match(/^[a-z0-9]+$/i)
        && conditionFound.length > 0 && conditionFound.length <= 64
        && notes.length > 0 
        && locationOfSighting.length > 0 && locationOfSighting.length <= 64
        && imagePath.length > 0 ){

            const sql = 'INSERT INTO `sightings` (`username`, `conditionFound`, `notes`, `locationOfSighting`, `imagePath`) '
            + 'VALUES (?, ?, ?, ?, ?)';
            const result = await db.query(sql, [username, conditionFound, notes, locationOfSighting, imagePath]);

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
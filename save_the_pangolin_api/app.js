const express = require('express');
const fileUpload = require('express-fileupload'); //allowing file handling
const bodyParser = require('body-parser'); //allows urlencoded data to be parsed into the body of the request
const cors = require('cors'); //prevents cors errors when contacting from client
const db = require('./db'); //connection to database
const fs = require("fs"); //move files

const app = express();
app.use(fileUpload({
    createParentPath: true
}));
app.use(bodyParser.urlencoded({extended: false}));
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
        const mostRecent = req.query.mostRecent;
        if(username && username.length > 0 
        && username.length <= 32){
            const sql = 'SELECT `id`, `conditionFound`, `notes`, `locationOfSighting`, `imageName` FROM `sightings` WHERE `username`=?';
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
        } else if(mostRecent && mostRecent.length > 0){
            const sql = 'SELECT `id`, `username`, `conditionFound`, `notes`, `locationOfSighting`, `imageName` FROM `sightings` ORDER BY `id` DESC LIMIT ?';
            const rows = await db.query(sql, [mostRecent]);

            if(rows){
                status = 200;
                data = {
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
        let notes = req.body.notes;
        const locationOfSighting = req.body.locationOfSighting;
        const imageName = req.body.imageName;
        if (!notes){
            notes = null;
        }
        if(username && conditionFound && locationOfSighting && imageName
        && username.length > 0 && username.length <= 64
        && conditionFound.length > 0 && conditionFound.length <= 64
        && locationOfSighting.length > 0 && locationOfSighting.length <= 64
        && imageName.length > 0 
        && (imageName.includes('.jpg') || imageName.includes('.jpeg') || imageName.includes('.png'))){

            const sql = 'INSERT INTO `sightings` (`username`, `conditionFound`, `notes`, `locationOfSighting`, `imageName`) '
            + 'VALUES (?, ?, ?, ?, ?)';
            const result = await db.query(sql, [username, conditionFound, notes, locationOfSighting, imageName]);

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

app.get('/save_the_pangolin_api/download', async (req, res) => {
    const img = __dirname + "/uploads/" + req.query.imageName;
    res.sendFile(img);
});

app.post('/save_the_pangolin_api/upload', async (req, res) => { //handling images uploaded
    try {
        let sightingImage = req.files.sightingImage;
        if(!req.files) {
            res.status(400).send({
                status: false,
                message: 'No image submitted uploaded'
            });
        } else if(sightingImage.name.includes('.jpg') || sightingImage.name.includes('.jpeg') || sightingImage.name.includes('.png')){ 
            //check the file has a valid image extention
            
            sightingImage.mv('./uploads/' + sightingImage.name); //move to uploads directory

            res.status(201).send({
                status: true,
                message: 'Image has been uploaded',
                data: {
                    name: sightingImage.name,
                    mimetype: sightingImage.mimetype,
                    size: sightingImage.size
                }
            });

        } else {
            res.status(400).send({
                status: false,
                message: 'File submitted was not in the correct format'
            });
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

app.listen(port, () => {})
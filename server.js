const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const upload = require('express-fileupload')

app.use(cors())
app.use(upload())

app.get('', (req, res) => {
    res.sendFile(path.join(__dirname + '/Machine_Learning/index.html'));
})

app.get('/sketch.js', (req, res) => {
    res.sendFile(path.join(__dirname + '/Machine_Learning/sketch.js'));
})

app.get('/ml.js', (req, res) => {
    res.sendFile(path.join(__dirname + '/Machine_Learning/ml.js'));
})

app.get('/PoseNetTrainingData.json', (req, res) => {
    res.sendFile(path.join(__dirname + '/Machine_Learning/Data/PoseNetTrainingData.json'));
})

app.get('/model_meta.json', (req, res) => {
    res.sendFile(path.join(__dirname + '/Machine_Learning/Model/model_meta.json'));
})

app.get('/model.json', (req, res) => {
    res.sendFile(path.join(__dirname + '/Machine_Learning/Model/model.json'));
})

app.get('/model.weights.bin', (req, res) => {
    res.sendFile(path.join(__dirname + '/Machine_Learning/Model/model.weights.bin'));
})

app.get('/wall.jpg', (req, res) => {
    res.sendFile(path.join(__dirname + '/wall.jpg'));
})

// app.post('/upload', (req, res) => {
//     if (req.files) {
//         let file = req.files;
//         console.log(file);
//     }
// })

const port = parseInt(process.env.PORT, 10) || 3000

app.listen(port, () => {
    console.log(`merge pe portul ${port}`);
})
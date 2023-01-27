let video;
let poseNet;
let pose;
let skeleton;
let brain;
let state = 'waiting';
let targetLabel = ['a', 'b', 'c', 'd', 'e', 'f'];
let targetIndex = 0;
let max = 6;
let llabel = 'a';
let confidence = 100;

let trainingDataFile = 'PoseNetTrainingData.json';
let modelInfo = {
    model: '/model.json',
    metadata: '/model_meta.json',
    weights: '/model.weights.bin',
}

let cnv;
let cw = 600, ch = 550;
let mouseDown;

const gotPoses = (poses) => {
    //console.log(poses)
    if (poses.length > 0) {
        pose = poses[0].pose;
        skeleton = poses[0].skeleton;

        if (state == 'collecting') {
            let inputs = [];
            for (let i = 0; i < pose.keypoints.length; i++) {
                let { x, y } = pose.keypoints[i].position;
                inputs.push(x);
                inputs.push(y);
            }

            let target = [targetLabel[targetIndex]];

            brain.addData(inputs, target);
        }
    }
}

const dataReady = () => {
    alertify.success('Datele de antrenament au fost incarcate!');
}

const finishedTraining = () => {
    alertify.success('Modelul a fost antrenat!');
    classifyPose();
}

const modelLoaded = () => {
    alertify.success('Modelul a fost incarcat!');
    alertify.success('Incepe clasificarea!');
    classifyPose();
}

function classifyPose() {
    if (pose) {
        let inputs = [];
        for (let i = 0; i < pose.keypoints.length; i++) {
            let { x, y } = pose.keypoints[i].position;
            inputs.push(x);
            inputs.push(y);
        }
        brain.classify(inputs, gotPoseResult);
    }
    else {
        setTimeout(classifyPose, 100);
    }
}

const gotPoseResult = (error, results) => {
    //console.log(results);
    //console.log(results[0].label)    

    if (error) {
        console.log(error);
    }
    else if (state == 'waiting') {
        llabel = results[0].label;
        confidence = Math.round(results[0].confidence * 100);
        classifyPose();
    }
}

document.onmousemove = (e) => {
    if (mouseDown == true)
        cnv.position(e.pageX - cw / 2, e.pageY - ch / 2);
}

document.onmousedown = (e) => {
    if (e.pageX > cnv.position().x && e.pageX < cnv.position().x + cw &&
        e.pageY > cnv.position().y && e.pageY < cnv.position().y + ch)
        mouseDown = true;
}

document.onmouseup = (e) => {
    mouseDown = false;
}

function setup() {
    //CREAM CANVAS SI CAPTURAM VIDEO 
    fill(0, 0, 100);
    cnv = createCanvas(cw, ch);
    cnv.position(825, 325)
    video = createCapture(VIDEO);
    video.hide();

    //DATA FORM
    let dataUpload = document.getElementById('dataUpload');
    dataUpload.addEventListener('change', (event) => {
        trainingDataFile = event.target.files;
        //console.log(trainingDataFile);
        // brain.loadData(trainingDataFile, dataReady);
    });

    document.getElementById("submit1").onclick = (e) => {
        if (dataUpload.files.length > 0) {
            brain.loadData(trainingDataFile, dataReady);
        }
    }

    document.getElementById("submit12").onclick = (e) => {
        brain.loadData('/PoseNetTrainingData.json', dataReady);
    }

    //MODEL FORM    
    let modelUpload = document.getElementById('modelUpload');
    modelUpload.addEventListener('change', (event) => {
        modelInfo = event.target.files

    });

    document.getElementById("submit2").onclick = (e) => {
        if (modelUpload.files.length > 2) {
            brain.load(modelInfo, modelLoaded);
        }
    }

    document.getElementById("submit22").onclick = (e) => {
        modelInfo = {
            model: '/model.json',
            metadata: '/model_meta.json',
            weights: '/model.weights.bin',
        }
        brain.load(modelInfo, modelLoaded);
    }

    document.getElementById("train").onclick = (e) => {
        let train = {
            epochs: 40
        }

        brain.normalizeData();
        brain.train(train, finishedTraining)
    }

    document.getElementById("saveModel").onclick = (e) => {
        brain.save();
        alertify.success('Model salvat!');
    }

    document.getElementById("saveData").onclick = (e) => {
        brain.saveData();
        alertify.success('Datele de antrenament salvate!');
    }

    document.getElementById("collect").onclick = (e) => {
        alertify.success('Colectarea incepe in 2 secunde!');
        console.log(targetLabel[targetIndex]);
        llabel = targetLabel[targetIndex];
        state = 'collecting';
        setTimeout(() => {
            //console.log('collecting');
            llabel = targetLabel[targetIndex];
            state = 'collecting';
            setTimeout(() => {
                //console.log('not collecting');
                state = 'waiting';
                alertify.success('Colectarea s-a terminat');
                targetIndex++;
                if (targetIndex >= max)
                    targetIndex = 0;
            }, 10000);
        }, 2000);
    }

    document.getElementById('reset').onclick = () => {
        let options = {
            inputs: 34,
            outputs: 6,
            task: 'classification',
            debug: true
        }

        brain = ml5.neuralNetwork(options);

        alertify.success('Modelul a fost resetat!');
    }

    //POSENET
    poseNet = ml5.poseNet(video, () => { });
    poseNet.on('pose', gotPoses);

    //CREARE RETEA 
    let options = {
        inputs: 34,
        outputs: 6,
        task: 'classification',
        debug: true
    }

    brain = ml5.neuralNetwork(options);

    //INCARCARE DATE SI MODEL PREDEFINIT
    modelInfo = {
        model: '/model.json',
        metadata: '/model_meta.json',
        weights: '/model.weights.bin',
    };

    brain.load(modelInfo, modelLoaded);
    brain.loadData('/PoseNetTrainingData.json', dataReady);
}

function draw() {
    background(68, 137, 228);
    textSize(64);
    fill(255, 80, 80);
    text(llabel, 10, 535);
    fill(50, confidence / 100 * 255, 50);
    text(confidence, 60, 535);

    //FLIPPAM IMAGINEA
    translate(video.width, 0);
    scale(-1, 1);

    //PUTEM DESENA ASA PESTE VIDEO DEOARECE FIECARE FRAME DEVINE     
    //O IMAGINE PE CANVAS

    image(video, 0, 0);

    if (pose) {
        strokeWeight(4);

        // fill(255, 0, 0)
        // ellipse(pose.nose.x, pose.nose.y, 64);

        for (let i = 0; i < skeleton.length; i++) {
            a = skeleton[i][0].position;
            b = skeleton[i][1].position;
            line(a.x, a.y, b.x, b.y);
        }

        for (let i = 5; i < pose.keypoints.length; i++) {
            x = pose.keypoints[i].position.x;
            y = pose.keypoints[i].position.y;
            fill(0, 255, 0);
            ellipse(x, y, 20, 20);
        }
    }
}
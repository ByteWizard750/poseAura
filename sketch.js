let video;
let poseNet;
let poses = [];
let poseNetInitialized = false;

function setup() {
    // Create a larger canvas
    createCanvas(1280, 720);
    
    // Create video capture
    video = createCapture(VIDEO);
    video.size(width, height);
    
    // Hide the video element, and just show the canvas
    video.hide();
    
    // Attempt to initialize PoseNet repeatedly until the function is available
    tryInitializePoseNet();
}

function tryInitializePoseNet() {
    if (typeof ml5 !== 'undefined' && typeof ml5.poseNet === 'function') {
        console.log('ml5.poseNet is available. Initializing PoseNet...');
        // Initialize PoseNet model and set up the event listener
        poseNet = ml5.poseNet(video, modelReady);
        poseNet.on('pose', gotPoses);
        poseNetInitialized = true;
    } else {
        console.log('ml5.poseNet not yet available. Retrying in 100ms...');
        // Retry initialization after a short delay
        setTimeout(tryInitializePoseNet, 100);
    }
}

function modelReady() {
    console.log('PoseNet Model Loaded!');
}

// A function to be called every time a pose is detected
function gotPoses(results) {
    // console.log(results);
    poses = results;
}

function draw() {
    // Draw the video
    image(video, 0, 0, width, height);
    
    // Only draw keypoints and skeleton if PoseNet is initialized and we have pose data
    if (poseNetInitialized && poses.length > 0) {
        // We can call other functions here to draw the keypoints and skeleton
        drawSkeleton();
        drawKeypoints();
    }
}

// A function to draw the keypoints
function drawKeypoints() {
    // Loop through all the poses detected
    for (let i = 0; i < poses.length; i++) {
        // For each pose detected, loop through all the keypoints
        let pose = poses[i].pose;
        for (let j = 0; j < pose.keypoints.length; j++) {
            // A keypoint is an object describing a body part (like rightArm or leftShoulder)
            let keypoint = pose.keypoints[j];
            // Only draw an ellipse if the keypoint probability is bigger than a threshold
            if (keypoint.score > 0.1) { // Lowered threshold slightly for potentially better detection
                fill(0, 255, 0); // Changed keypoint color to green
                noStroke();
                ellipse(keypoint.position.x, keypoint.position.y, 18, 18); // Increased keypoint size
            }
        }
    }
}

// A function to draw the skeletons
function drawSkeleton() {
    // Loop through all the skeletons detected
    for (let i = 0; i < poses.length; i++) {
        let skeleton = poses[i].skeleton;
        // For every skeleton, loop through all body connections
        for (let j = 0; j < skeleton.length; j++) {
            let partA = skeleton[j][0];
            let partB = skeleton[j][1];
            stroke(255, 255, 255); // Skeleton color white
            strokeWeight(4); // Increased skeleton thickness
            line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
        }
    }
}
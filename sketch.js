// sketch.js
let video;
let poseNet;
let poses = [];

// Image overlays
let specsImage;
let smokeImage;
let imagesLoaded = false;

// Control flags
let showSkeleton = true;
let showKeypoints = true;
let showOverlays = false;

// DOM elements
let loadingIndicator;
let toggleSkeletonCheckbox;
let toggleKeypointsCheckbox;
let toggleOverlaysCheckbox;

// Initialization retry mechanism
let initializationAttempts = 0;
const MAX_INITIALIZATION_ATTEMPTS = 100; // Increased attempts
const INITIALIZATION_RETRY_DELAY = 100; // Reduced delay

function setup() {
    console.log('setup() started');
    createCanvas(1280, 720);
    console.log('Canvas created');

    // Get DOM elements
    loadingIndicator = select('#loading');
    toggleSkeletonCheckbox = select('#toggleSkeleton');
    toggleKeypointsCheckbox = select('#toggleKeypoints');
    toggleOverlaysCheckbox = select('#toggleOverlays');

    // Set initial state of checkboxes
    toggleSkeletonCheckbox.checked(showSkeleton);
    toggleKeypointsCheckbox.checked(showKeypoints);
    toggleOverlaysCheckbox.checked(showOverlays);

    // Add event listeners to controls
    toggleSkeletonCheckbox.changed(function() {
        showSkeleton = this.checked();
    });
    toggleKeypointsCheckbox.changed(function() {
        showKeypoints = this.checked();
    });
    toggleOverlaysCheckbox.changed(function() {
        showOverlays = this.checked();
    });

    // Create video capture
    video = createCapture(VIDEO);
    video.size(width, height);
    video.hide(); // Hide the default video element

    // Start the process to check and initialize PoseNet
    checkAndInitializePoseNet(); // Call the check/retry function

    // Preload images - these can start loading independently
    preloadImages();

    console.log('setup() finished');
}

// Function to repeatedly check for ml5.poseNet and initialize
function checkAndInitializePoseNet() {
    initializationAttempts++;
    console.log(`Attempting PoseNet initialization (${initializationAttempts} of ${MAX_INITIALIZATION_ATTEMPTS})...`);

    if (typeof ml5 !== 'undefined' && typeof ml5.poseNet === 'function') {
        console.log('ml5.poseNet is available. Initializing PoseNet model...');
        // Initialize PoseNet model
        poseNet = ml5.poseNet(video, modelReady);
        console.log('ml5.poseNet called. Waiting for modelReady callback...');

        // Set up the event listener to receive pose data
        poseNet.on('pose', gotPoses);
        console.log('PoseNet pose event listener set up.');

        // Hide loading indicator here as we've successfully started initialization
        loadingIndicator.addClass('hidden');

    } else if (initializationAttempts < MAX_INITIALIZATION_ATTEMPTS) {
        console.log('ml5.poseNet not yet available. Retrying in ' + INITIALIZATION_RETRY_DELAY + 'ms...');
        // Retry initialization after a short delay
        setTimeout(checkAndInitializePoseNet, INITIALIZATION_RETRY_DELAY);
    } else {
        console.error('Failed to initialize PoseNet after multiple attempts. ml5.poseNet is still not a function.');
        console.log('ml5 type:', typeof ml5);
        if (typeof ml5 !== 'undefined') {
            console.log('ml5.poseNet type:', typeof ml5.poseNet);
        }
        // Display a persistent error message on the canvas or elsewhere if possible
        // For now, rely on console error.
    }
}

// Function to preload images
function preloadImages() {
    // Note: Error handling for image loading is basic here.
    // A more robust app might check if images loaded successfully before attempting to draw.
    specsImage = loadImage('images/spects.png', imageLoadSuccess, imageLoadError);
    smokeImage = loadImage('images/cigar.png', imageLoadSuccess, imageLoadError);
}

function imageLoadSuccess() {
    console.log('Image loaded successfully');
    // We'll consider images loaded if both attempts finished (success or error)
    // A more advanced approach would track individual image loading status
    if (specsImage && smokeImage) {
         // A simple check if both image objects exist after attempting load
         // This doesn't guarantee they loaded correctly, just that loadImage was called
         imagesLoaded = true;
         console.log('Image loading process finished.');
    }
}

function imageLoadError(err) {
    console.error('Failed to load an image:', err);
     if (specsImage && smokeImage) {
         // A simple check if both image objects exist after attempting load
         imagesLoaded = true;
          console.log('Image loading process finished (with errors).\nCheck if images/spects.png and images/cigar.png exist.');
    }
}

// Callback function that runs when the PoseNet model is loaded
function modelReady() {
    console.log('PoseNet Model Loaded!');
    // The loading indicator is now hidden once initialization starts in checkAndInitializePoseNet
    // We don't need to hide it again here.

    // The pose event listener is also set up in checkAndInitializePoseNet
    // We don't need to set it up again here.
}

// A function to be called every time a pose is detected
function gotPoses(results) {
    // console.log('Pose data received:', results); // Uncomment for debugging pose data
    poses = results;
}

function draw() {
    // Draw the video
    image(video, 0, 0, width, height);

    // Only draw keypoints and skeleton if poseNet object exists and we have pose data
    if (poseNet && poses.length > 0) {
        if (showSkeleton) {
            drawSkeleton();
        }
        if (showKeypoints) {
            drawKeypoints();
        }
        if (showOverlays && imagesLoaded) {
            drawOverlays();
        }
    }

    // The loading indicator is controlled by CSS opacity based on the 'hidden' class
    // It's managed in checkAndInitializePoseNet.
}

// A function to draw the keypoints
function drawKeypoints() {
    // Loop through all the poses detected
    for (let i = 0; i < poses.length; i++) {
        let pose = poses[i].pose;
        for (let j = 0; j < pose.keypoints.length; j++) {
            let keypoint = pose.keypoints[j];
            if (keypoint.score > 0.1) {
                fill(0, 255, 0); // Keypoint color green
                noStroke();
                ellipse(keypoint.position.x, keypoint.position.y, 18, 18); // Keypoint size
            }
        }
    }
}

// A function to draw the skeletons
function drawSkeleton() {
    for (let i = 0; i < poses.length; i++) {
        let skeleton = poses[i].skeleton;
        for (let j = 0; j < skeleton.length; j++) {
            let partA = skeleton[j][0];
            let partB = skeleton[j][1];
            stroke(255, 255, 255); // Skeleton color white
            strokeWeight(4); // Skeleton thickness
            line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
        }
    }
}

// A function to draw image overlays
function drawOverlays() {
    // Loop through all the poses detected
    for (let i = 0; i < poses.length; i++) {
        let pose = poses[i].pose;

        // Example: Overlay glasses on the nose
        if (pose.nose && specsImage) {
            // Adjust position and size as needed
            image(specsImage, pose.nose.x - 40, pose.nose.y - 40, 80, 80);
        }

        // Example: Overlay smoke near the nose/mouth
        // You might need to find a different keypoint or adjust position
        if (pose.nose && smokeImage) {
             image(smokeImage, pose.nose.x - 20, pose.nose.y + 10, 50, 50);
        }
         // Add more overlays for other body parts as desired
         // e.g., pose.leftWrist, pose.rightWrist, etc.
    }
}
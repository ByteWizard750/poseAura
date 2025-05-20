let capture;
let posenet;
let noseX, noseY;
let reyeX, reyeY;
let leyeX, leyeY;
let singlePose, skeleton;
let actor_img;
let specs, smoke;

let videoReady = false; // Flag to check if video metadata is loaded

function setup() {
    console.log('setup() started');
    
    // Create canvas with specific dimensions
    createCanvas(800, 500);
    console.log('Canvas created');
    
    // Create video capture
    capture = createCapture({
        video: {
            width: 800,
            height: 500,
            facingMode: "user"
        }
    }, function(stream) {
        console.log('Camera capture created callback fired', stream);
        // Set capture size to match canvas
        capture.size(800, 500);
        capture.hide();
        
        // Listen for the video metadata to be loaded
        capture.elt.onloadedmetadata = function() {
            console.log('Video metadata loaded event fired');
            videoReady = true; // Set flag once metadata is loaded
            console.log('videoReady flag set to', videoReady);
            
            // Initialize PoseNet after successful capture and metadata loaded
            console.log('Attempting PoseNet initialization...');
            if (typeof ml5 !== 'undefined' && ml5.poseNet) {
                console.log('ml5 and poseNet are available.');
                posenet = ml5.poseNet(capture, modelLoaded);
                posenet.on('pose', receivedPoses);
                console.log('PoseNet initialized');
            } else {
                console.error('ML5 or PoseNet not available after capture.');
            }
        };

        // If onloadedmetadata doesn't fire quickly, check readyState
        if (capture.elt.readyState >= 2) {
             console.log('Video readyState is already >= 2, triggering metadata loaded logic');
             capture.elt.onloadedmetadata(); // Manually trigger the logic if already ready
        }
    });
    
    // Load images - these can start loading independently
    actor_img = loadImage('images/shahrukh.png');
    specs = loadImage('images/spects.png');
    smoke = loadImage('images/cigar.png');
    
    console.log('setup() finished');
}

function receivedPoses(poses) {
    // console.log('receivedPoses() called', poses); // Keep this commented for less console spam during normal operation
    if (poses.length > 0) {
        singlePose = poses[0].pose;
        skeleton = poses[0].skeleton;
    }
}

function modelLoaded() {
    console.log('PoseNet Model has loaded'); // More specific log message
}

function draw() {
    // Log the state of the flags and objects
    console.log(`draw() - capture: ${!!capture}, posenet: ${!!posenet}, videoReady: ${videoReady}`);

    // Only attempt to draw if capture, posenet, and video metadata are ready
    if (capture && posenet && videoReady) {
        // Clear the background
        background(0);
        
        // Draw the video capture
        push();
        translate(width, 0);
        scale(-1, 1);
        image(capture, 0, 0, width, height);
        pop();

        if (singlePose) {
            // Draw keypoints
            fill(255, 0, 0);
            noStroke();
            for (let i = 0; i < singlePose.keypoints.length; i++) {
                let x = singlePose.keypoints[i].position.x;
                let y = singlePose.keypoints[i].position.y;
                ellipse(width - x, y, 20); // Flip x coordinate for mirror effect
            }

            // Draw skeleton
            stroke(255, 255, 255);
            strokeWeight(5);
            for (let j = 0; j < skeleton.length; j++) {
                let [p1, p2] = skeleton[j];
                line(width - p1.position.x, p1.position.y, width - p2.position.x, p2.position.y);
            }

            // Uncomment these lines to add the overlays if images are loaded
            // if (actor_img && specs && smoke) {
            //     image(specs, width - singlePose.nose.x - 35, singlePose.nose.y - 50, 80, 80);
            //     image(smoke, width - singlePose.nose.x - 35, singlePose.nose.y + 10, 40, 40);
            // }
        }
    } else {
        // Display a loading message if not ready
        background(50);
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(24);
        text('Loading video and model...', width / 2, height / 2);
    }
}
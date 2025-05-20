# PoseAura

PoseAura is an interactive web application that uses p5.js and ml5.js to perform real-time pose detection using your webcam. It can overlay images on detected keypoints, creating fun visual effects.

## Setup

1.  **Clone or download the project files.**

2.  **Ensure you have a local web server running.** You can use various methods, such as:
    -   **Python:** If you have Python installed, navigate to the project directory in your terminal and run `python -m http.server`.
    -   **Live Server VS Code Extension:** If you use Visual Studio Code, the "Live Server" extension is a convenient way to host local files.

3.  **Add Images (Optional):** If you want to use the image overlays (spectacles and cigar), create an `images` directory in the project root and add the following files:
    -   `shahrukh.png`
    -   `spects.png`
    -   `cigar.png`

    You can use your own images, but make sure they are named correctly.

## Running the Application

1.  Start your local web server in the project's root directory.
2.  Open your web browser and navigate to the address provided by your local server (usually `http://localhost:8000` or `http://127.0.0.1:5500`).

## How it Works

-   The application uses the `p5.js` library for creative coding and drawing on the canvas.
-   `ml5.js` is used to access the PoseNet machine learning model for real-time pose estimation from the webcam feed.
-   The detected pose keypoints and skeleton are drawn on the canvas.
-   If the image files are present, it attempts to overlay them on specific keypoints (like the nose).

## Troubleshooting

-   **Camera not showing:** Ensure your browser has permission to access the camera. Check the browser's developer console (F12) for any errors.
-   **Images not appearing:** Make sure the `images` directory exists in the project root and the image files (`spects.png`, `cigar.png`, `shahrukh.png`) are correctly named within that directory.

Feel free to modify the `sketch.js` file to experiment with different pose tracking visualizations or overlays! 
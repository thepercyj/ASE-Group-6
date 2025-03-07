import Scene, {
    inputShapes,
    inputCoords,
    Colours,
    shape_obj,
    shape_placed_obj
} from "../js/scene.js"
import Sol_Scene, {
    sol_inputShapes,
    sol_inputCoords,
    sol_Colours
} from "../js/sol_scene.js"

import Pyramid from '../js/pyramid.js'
import {
    convert_to_pyramid_layers
} from "./ConvertSolutionFormat.js";
import {
    generate_headers,
    populate_problem_matrix3D,
    reduce_problem_matrix
} from "./GenerateProblemMatrix.js";
import {
    create_dicts
} from "./CreateObjects.js";
import {
    solve
} from "./Solver.js";
import {
    shapeStore
} from "./Shapes3D.js";
import resetFirstPlacementCoord from "../js/scene.js";



window.onload = function() {
    const image_names = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

    const imageIds = [
        "shape-1", "shape-2", "shape-3", "shape-4", "shape-5", "shape-6",
        "shape-7", "shape-8", "shape-9", "shape-10", "shape-11", "shape-12"
    ];


    let currentIndex = 0;
    let currentAlphabetIndex = 0;
    let currentImageName = "A"
    currentImage.className = currentImageName

    /**
     * Updates the alphabet container with the current alphabet index.
     */
    function updateAlphabet() {
        const alphabetContainer = document.getElementById('currentAlphabet');
        alphabetContainer.textContent = image_names[currentAlphabetIndex];
    }

    /**
     * Updates the image source, name, class, and rotation angle of the current image.
     */
    function updateImage() {
        currentImage.src = `/static/polysphere3D_app/img/shapes/${imageIds[currentIndex]}.png`;
        currentImageName = image_names[currentIndex]
        currentImage.className = currentImageName
    }

    /**
     * Moves to the previous image in the sequence.
     */
    function previousImage() {
        currentIndex = (currentIndex - 1 + imageIds.length) % imageIds.length;
        updateImage();
        currentAlphabetIndex = (currentAlphabetIndex - 1 + image_names.length) % image_names.length;
        updateAlphabet();
    }

    /**
     * Advances to the next image and updates the UI accordingly.
     */
    function nextImage() {
        currentIndex = (currentIndex + 1) % imageIds.length;
        updateImage();
        currentAlphabetIndex = (currentAlphabetIndex + 1) % image_names.length;
        updateAlphabet();
    }

    const previousImageButton = document.getElementById('previousImageButton');
    previousImageButton.addEventListener('click', previousImage);
    const nextImageButton = document.getElementById('nextImageButton');
    nextImageButton.addEventListener('click', nextImage);


}
/**
 * Represents a worker object.
 * @type {Pyramid}
 */
let worker = new Pyramid(5, 1);
/**
 * Represents a sol_worker object.
 * @type {Pyramid}
 */
let sol_worker = new Pyramid(5, 1);

let scene = new Scene();
let sol_scene = new Sol_Scene();
const FPS = 30;
let uiTimer = null;
let visibilityStates = [true, true, true, true, true];

/**
 * Creates a timer that repeatedly calls the specified function at a given frame rate.
 * @param {Function} func - The function to be called repeatedly by the timer.
 */
function createTimer(func) {
    if (uiTimer) {
        clearInterval(uiTimer);
        uiTimer = null;
    }

    uiTimer = setInterval(() => {
        func();
    }, 1000 / FPS);
}


/**
 * Renders the pyramid by iterating through the layers of spheres and updating their positions and colors.
 */
function renderPyramid() {
    for (let i = 0; i < worker.layers.length; i++) {
        const spheres = worker.layers[i].matrix;
        for (let x = 0; x < worker.layers[i].size; x++) {
            for (let y = 0; y < worker.layers[i].size; y++) {
                let pos = spheres[x][y].pos;
                let color = spheres[x][y].color;

                if (!spheres[x][y].userData) {
                    spheres[x][y].userData = scene.createSphere(
                        pos[0],
                        pos[1],
                        pos[2],
                        color,
                        worker.radius()
                    );
                    scene.add(spheres[x][y].userData);
                } else {
                    spheres[x][y].userData.material.color.set(color);
                    spheres[x][y].userData.material.specular.set(color);
                }
            }
        }
    }
}

/**
 * Renders the solution pyramid by updating the positions and colors of the spheres in the scene.
 */
function sol_renderPyramid() {
    for (let i = 0; i < sol_worker.layers.length; i++) {
        const spheres = sol_worker.layers[i].matrix;
        for (let x = 0; x < sol_worker.layers[i].size; x++) {
            for (let y = 0; y < sol_worker.layers[i].size; y++) {
                let pos = spheres[x][y].pos;
                let color = spheres[x][y].color;

                if (!spheres[x][y].userData) {
                    spheres[x][y].userData = sol_scene.createSphere(
                        pos[0],
                        pos[1],
                        pos[2],
                        color,
                        sol_worker.radius()
                    );
                    sol_scene.add(spheres[x][y].userData);
                } else {
                    spheres[x][y].userData.material.color.set(color);
                    spheres[x][y].userData.material.specular.set(color);
                }
            }
        }
    }
}

/**
 * Updates the visibility of a layer and its spheres.
 * @param {number} idx - The index of the layer.
 * @param {boolean} v - The new visibility state.
 */
function layerVisible(idx, v) {
    // Updates the visibilityStates to match change
    visibilityStates[idx - 1] = v
    let layer = worker.getLayer(idx);
    const spheres = layer.matrix;
    for (let x = 0; x < layer.size; x++) {
        for (let y = 0; y < layer.size; y++) {
            if (spheres[x][y].userData) {
                spheres[x][y].userData.visible = v;
                spheres[x][y].visible = v;
                spheres[x][y].userData.needsUpdate = true;
            }
        }
    }
}

/**
 * Updates the visibility of a layer in the solution pyramid object.
 * 
 * @param {number} idx - The index of the layer.
 * @param {boolean} v - The new visibility state of the layer.
 */
function sol_layerVisible(idx, v) {
    // Updates the visibilityStates to match change
    visibilityStates[idx - 1] = v
    let layer = sol_worker.getLayer(idx);
    const spheres = layer.matrix;
    for (let x = 0; x < layer.size; x++) {
        for (let y = 0; y < layer.size; y++) {
            if (spheres[x][y].userData) {
                spheres[x][y].userData.visible = v;
                spheres[x][y].visible = v;
                spheres[x][y].userData.needsUpdate = true;
            }
        }
    }
}

let input;
let input_shapes;
let input_squares;
let problem_mat;
let problem_def;
let headers;
let dicts;

const canvas = document.getElementById('panel');
const sol_canvas = document.getElementById('c');
const NextButton = document.getElementById('onNextButtonClick');
const PrevButton = document.getElementById('onPrevButtonClick');
const ClearButton = document.getElementById('onClearButtonClick');
const StopButton = document.getElementById('onStopButtonClick');
const scount = document.getElementById('solutionCount');
const solveButton = document.getElementById('onSolveButtonClick');
solveButton.addEventListener('click', onSolveButton);
NextButton.addEventListener('click', onNextButton);
PrevButton.addEventListener('click', onPrevButton);

ClearButton.addEventListener('click', onClearButton);
StopButton.addEventListener('click', onStopButton);

const layerCheckboxes = [];
const sol_layerCheckboxes = [];
const toggle = document.getElementById('toggleButton');
const toggleDiv = document.getElementById('SolContainer');
const layer_pyramid = document.getElementById('Levels');

toggleButton.addEventListener('click', function() {
    // Prevent the default form submission behavior
    event.preventDefault();

    // Toggle the display property of the div
    if (toggleDiv.style.display === 'none' || toggleDiv.style.display === '') {
        toggleDiv.style.display = 'flex';
        toggleButton.textContent = 'Hide';
        layer_pyramid.style.display = 'flex';

    } else {
        toggleDiv.style.display = 'none';
        layer_pyramid.style.display = 'none';
        toggleButton.textContent = 'Show Solutions';

    }
});



for (let i = 1; i <= 5; i++) {
    const checkbox = document.getElementById('l' + i);
    const sol_checkbox = document.getElementById('ls' + i);
    checkbox.addEventListener('change', (event) => {
        layerVisible(i, event.target.checked);
    });
    sol_checkbox.addEventListener('change', (event) => {
        sol_layerVisible(i, event.target.checked);
    });
    const label = document.getElementById('l' + i + 'sLabel');
    const sol_label = document.getElementById('ls' + i + 'Label');
    layerCheckboxes.push(checkbox, label);
    sol_layerCheckboxes.push(sol_checkbox, sol_label);
}



const state = createState();

/**
 * Creates a new state object.
 * @returns {Object} The newly created state object.
 */
function createState() {
    return {
        stopExecution: false,
        solutionCount: 0,
        solutions: [],

    };
}

/**
 * Handles the event when the solve button is clicked.
 */
function onSolveButton() {
    state.solutions = []
    var allSolutions = [];
    let solutionCount = 0;
    let solutions = [];

    const startTime = performance.now();

    const input_shapes = inputShapes.get();
    const input_squares = inputCoords.get();

    // If incorrect number of spheres for shape, abort.
    if (!checkInput(input_shapes, input_squares)) {
        return;
    }


    const problem_mat = populate_problem_matrix3D();
    const problem_def = reduce_problem_matrix(problem_mat, generate_headers(problem_mat), input_shapes, input_squares);
    const updatedProblemMat = problem_def[0];
    const headers = problem_def[1];



    const dicts = create_dicts(updatedProblemMat, headers);



    const ret = solve(dicts[0], dicts[1], [], headers);
    let cnt = 0;

    const uiTimer = createTimer(() => {
        const arr = ret.next().value;
        if (arr == undefined) {
            console.log('done');
            if(cnt < 1){
                scount.textContent = "No solutions found!";
            }
            onStopButton();
            return;
        }

        console.log(arr);

        cnt++;
        scount.textContent = "Number of solutions: " + cnt;
        // Push the current pyramid_layers into the array

        const pyramid_layers = convert_to_pyramid_layers(arr, updatedProblemMat, headers, input_shapes, input_squares);
        console.log("Pyramid layers");
        console.log("arr",arr);
        console.log("updatedProblemMat",updatedProblemMat);
        console.log("headers",headers);
        console.log("input_shapes",input_shapes);
        console.log("input_squares",input_squares);
        state.solutions = [...state.solutions, pyramid_layers];
        allSolutions.push(pyramid_layers); // All solutions
        sol_drawPosition(pyramid_layers);
        const endTime = performance.now();
        const totalTime = ((endTime - startTime) / 1000).toFixed(1); // Convert to seconds and round to 1 decimal place
        document.getElementById('timeTakenLabel').textContent = `Time taken: ${totalTime} seconds`;
    });
}

/**
 * Resets the shape object by updating the shape_obj and shape_placed_obj properties.
 */
function resetShapeObj() {
    for (let shape in shapeStore) {
        shape_obj[shape] = shapeStore[shape].layout.length;
        shape_placed_obj[shape] = 0;
    }
}

/**
 * Clears the UI and resets the state.
 */
function onClearButton() {
    // Reset counts to 0 when clearing
    for (let shape in shape_obj) {
        shape_obj[shape] = 0;
        shape_placed_obj[shape] = 0;
    }

    // Reset the count display
    scount.textContent = "Number of solutions: 0";

    // Clear state solutions
    state.solutions = [];

    // Clear input shapes and coords
    inputShapes.clear();
    inputCoords.clear();

    // Reset the firstPlacementCoord
    new resetFirstPlacementCoord();
    new resetShapeObj();
    // Set pyramid to empty and render empty pyramid
    const empty_position = new Array(5);
    for (let i = 0; i < 5; i++) {
        empty_position[i] = new Array(5 - i);
        empty_position[i].fill(0);
    }
    for (let layer = 0; layer < 5; layer++) {
        for (let row = 0; row < 5 - layer; row++) {
            empty_position[layer][row] = new Array(5 - layer);
            empty_position[layer][row].fill(0);
        }
    }

    // Draw the empty pyramid
    drawPosition(empty_position);
    sol_drawPosition(empty_position);
}

/**
 * Draws the position on the pyramid.
 * 
 * @param {Array<Array<Array<string>>>} position - The position to be drawn.
 */
function drawPosition(position) {

    for (let layer = 0; layer < position.length; layer++) {
        for (let i = 0; i < position[layer].length; i++) {
            for (let j = 0; j < position[layer].length; j++) {
                if (["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"].indexOf(position[layer][i][j]) !== -1) {
                    // Set to shape colour
                    worker.getLayer(5 - layer).set(i, j, Colours[position[layer][i][j]]);

                } else {
                    // Set to black to indicate empty
                    worker.getLayer(5 - layer).set(i, j, 0x999999);

                }
            }
        }
    }
    renderPyramid();
}

/**
 * Draws the position on the solution pyramid.
 * 
 * @param {Array<Array<Array<string>>>} position - The position to be drawn on the pyramid.
 * @returns {void}
 */
function sol_drawPosition(position) {

    for (let layer = 0; layer < position.length; layer++) {
        for (let i = 0; i < position[layer].length; i++) {
            for (let j = 0; j < position[layer].length; j++) {
                if (["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"].indexOf(position[layer][i][j]) !== -1) {
                    // Set to shape colour
                    sol_worker.getLayer(5 - layer).set(i, j, sol_Colours[position[layer][i][j]]);

                } else {
                    // Set to black to indicate empty
                   sol_worker.getLayer(5 - layer).set(i, j, 0x999999);

                }
            }
        }
    }
    sol_renderPyramid();
}

/**
 * Checks if the number of spheres for each shape matches the number of coordinates provided.
 * @param {string[]} shapes - An array of shape names.
 * @param {number[][]} coords - An array of coordinate arrays, where each array represents the coordinates for a shape.
 * @returns {boolean} - Returns true if the number of spheres for each shape matches the number of coordinates, otherwise false.
 */
function checkInput(shapes, coords) {
    console.log("Shapes:", shapes, "Coords:", coords);
    for (let i = 0; i < shapes.length; i++) {
        if (shapeStore[shapes[i]].layout.length !== coords[i].length) {
            // Wrong number of spheres for shape, abort.
            return false;
        }
    }
    return true;
}

let currentSolutionIndex = 0;  // Initialize the index at the beginning

/**
 * Handles the click event of the next button.
 * Pops a solution from the state's solutions array and calls sol_drawPosition to draw it.
 */
function onNextButton() {
    console.log("Clicked next");
    const solutions = state.solutions;

    if (currentSolutionIndex < solutions.length - 1) {
        currentSolutionIndex++;
        sol_drawPosition(solutions[currentSolutionIndex]);
    }
}

/**
 * Handles the click event of the "Prev" button.
 */
function onPrevButton() {
    console.log("Clicked Prev");
    const solutions = state.solutions;

    if (currentSolutionIndex > 0) {
        currentSolutionIndex--;
        sol_drawPosition(solutions[currentSolutionIndex]);
    }
}

/**
 * Stops the execution and clears the interval timer.
 */
function onStopButton() {
    let stopExecution = true;
    clearInterval(uiTimer);
    uiTimer = null;
}

/**
 * Initializes the component and sets up the scene and pyramid rendering.
 */
function componentDidMount() {
    scene.init(panel);
    sol_scene.sol_init(c);
    renderPyramid();
    sol_renderPyramid();
}

/**
 * Cleans up resources before the component is unmounted.
 */
function componentWillUnmount() {
    scene.dispose();
    sol_scene.dispose();
}

scene.init(panel);
sol_scene.sol_init(c);
renderPyramid();
sol_renderPyramid();

export {
    worker,
    sol_worker
};
window.worker = worker;
window.sol_worker = sol_worker;
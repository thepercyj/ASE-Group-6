import { Shape3D } from "./Shape3D.js";

let A = new Shape3D("A", [[0, 0, 0], [0, 1, 0], [0, 2, 0],
                          [1, 0, 0],            [1, 2, 0]
                ]);

let B = new Shape3D("B", [                      [0, 2, 0], [0, 3, 0],
                          [1, 0, 0], [1, 1, 0], [1, 2, 0]
                ]);

let C = new Shape3D("C", [           [0, 1, 0],
                          [1, 0, 0], [1, 1, 0],
                                     [2, 1, 0], [2, 2, 0]
                ]);

let D = new Shape3D("D", [           [0,        1, 0],
                          [1, 0, 0], [1, 1, 0], [1, 2, 0]
                ]);

let E = new Shape3D("E", [           [0, 1, 0],
                          [1, 0, 0], [1, 1, 0], [1, 2, 0], [1, 3, 0]
                ]);

let F = new Shape3D("F", [           [0, 1, 0], [0, 2, 0],
                          [1, 0, 0], [1, 1, 0], [1, 2, 0],
                ]);

let G = new Shape3D("G", [           [0, 1, 0], [0, 2, 0],
                          [1, 0, 0], [1, 1, 0],
                ]);

let H = new Shape3D("H", [[0, 0, 0], [0, 1, 0],
                          [1, 0, 0],
                          [2, 0, 0],
                ]);

let I = new Shape3D("I", [[0, 0, 0], [0, 1, 0], [0, 2, 0],
                                                [1, 2, 0],
                                                [2, 2, 0]
                ]);

let J = new Shape3D("J", [[0, 0, 0],
                          [1, 0, 0], [1, 1, 0], [1, 2, 0], [1, 3, 0]
                ]);

let K = new Shape3D("K", [[0, 0, 0],
                          [1, 0, 0], [1, 1, 0]
                ]);

let L = new Shape3D("L", [[0, 0, 0], [0, 1, 0],
                                     [1, 1, 0], [1, 2, 0],
                                                [2, 2, 0]
                ]);

/**
 * Object that stores shapes with their corresponding keys.
 * @type {Object}
 */
let shapeStore = {
    "A": A,
    "B": B,
    "C": C,
    "D": D,
    "E": E,
    "F": F,
    "G": G,
    "H": H,
    "I": I,
    "J": J,
    "K": K,
    "L": L
};

export { shapeStore };
export { A, B, C, D, E, F, G, H, I, J, K, L };
// Stick-figure keyframes for each exercise animation.
// Coordinates live in the figure's viewBox (see components/ExerciseFigure.tsx):
// x grows to the right, y grows downwards and the floor sits at y = 92.
// "near" limbs are drawn in front of the torso, "far" limbs behind it.

export type Point = readonly [number, number];

export type Pose = {
  head: Point;
  neck: Point;
  hip: Point;
  nearElbow: Point;
  nearHand: Point;
  farElbow: Point;
  farHand: Point;
  nearKnee: Point;
  nearFoot: Point;
  farKnee: Point;
  farFoot: Point;
};

export type Prop = 'chair-right' | 'chair-left' | 'wall-left';

export type Animation = {
  keyframes: Pose[];
  // Duration of one full cycle through every keyframe, in milliseconds.
  cycleMs: number;
  props?: Prop[];
};

const jumpingJacksA: Pose = {
  head: [60, 14], neck: [60, 24], hip: [60, 52],
  nearElbow: [66, 37], nearHand: [68, 51], farElbow: [54, 37], farHand: [52, 51],
  nearKnee: [63, 71], nearFoot: [64, 90], farKnee: [57, 71], farFoot: [56, 90],
};
const jumpingJacksB: Pose = {
  head: [60, 12], neck: [60, 22], hip: [60, 50],
  nearElbow: [70, 14], nearHand: [77, 2], farElbow: [50, 14], farHand: [43, 2],
  nearKnee: [67, 70], nearFoot: [74, 90], farKnee: [53, 70], farFoot: [46, 90],
};

const wallSitA: Pose = {
  head: [38, 32], neck: [38, 42], hip: [38, 68],
  nearElbow: [50, 44], nearHand: [63, 44], farElbow: [49, 46], farHand: [62, 46],
  nearKnee: [58, 68], nearFoot: [58, 90], farKnee: [56, 68], farFoot: [56, 90],
};
const wallSitB: Pose = { ...wallSitA, head: [38, 31], nearHand: [63, 42], farHand: [62, 44] };

const pushUpUp: Pose = {
  head: [88, 52], neck: [80, 58], hip: [50, 68],
  nearElbow: [80, 74], nearHand: [80, 90], farElbow: [78, 74], farHand: [78, 90],
  nearKnee: [34, 77], nearFoot: [16, 88], farKnee: [34, 77], farFoot: [16, 88],
};
const pushUpDown: Pose = {
  head: [88, 74], neck: [80, 79], hip: [50, 83],
  nearElbow: [66, 76], nearHand: [80, 90], farElbow: [64, 77], farHand: [78, 90],
  nearKnee: [34, 86], nearFoot: [16, 88], farKnee: [34, 86], farFoot: [16, 88],
};
const pushUpRotated: Pose = {
  head: [86, 46], neck: [80, 54], hip: [50, 70],
  nearElbow: [80, 72], nearHand: [80, 90], farElbow: [82, 38], farHand: [84, 22],
  nearKnee: [34, 79], nearFoot: [16, 88], farKnee: [34, 78], farFoot: [16, 86],
};

const crunchDown: Pose = {
  head: [20, 82], neck: [28, 86], hip: [54, 86],
  nearElbow: [22, 74], nearHand: [17, 80], farElbow: [24, 75], farHand: [18, 81],
  nearKnee: [66, 68], nearFoot: [80, 88], farKnee: [64, 68], farFoot: [78, 88],
};
const crunchUp: Pose = {
  head: [30, 66], neck: [36, 74], hip: [54, 86],
  nearElbow: [32, 61], nearHand: [26, 67], farElbow: [34, 62], farHand: [27, 68],
  nearKnee: [66, 68], nearFoot: [80, 88], farKnee: [64, 68], farFoot: [78, 88],
};

const stepUpFloor: Pose = {
  head: [44, 12], neck: [44, 22], hip: [44, 50],
  nearElbow: [50, 36], nearHand: [54, 48], farElbow: [38, 36], farHand: [34, 48],
  nearKnee: [60, 54], nearFoot: [66, 68], farKnee: [44, 70], farFoot: [44, 90],
};
const stepUpChair: Pose = {
  head: [74, -8], neck: [74, 2], hip: [74, 30],
  nearElbow: [80, 16], nearHand: [84, 28], farElbow: [68, 16], farHand: [64, 28],
  nearKnee: [74, 49], nearFoot: [74, 68], farKnee: [72, 48], farFoot: [70, 66],
};

const squatUp: Pose = {
  head: [56, 12], neck: [56, 22], hip: [56, 50],
  nearElbow: [58, 36], nearHand: [60, 50], farElbow: [55, 36], farHand: [56, 50],
  nearKnee: [56, 70], nearFoot: [56, 90], farKnee: [54, 70], farFoot: [54, 90],
};
const squatDown: Pose = {
  head: [64, 36], neck: [60, 44], hip: [44, 68],
  nearElbow: [74, 44], nearHand: [88, 44], farElbow: [72, 46], farHand: [86, 46],
  nearKnee: [64, 70], nearFoot: [58, 90], farKnee: [62, 70], farFoot: [56, 90],
};

const dipUp: Pose = {
  head: [54, 32], neck: [50, 40], hip: [52, 66],
  nearElbow: [47, 52], nearHand: [44, 64], farElbow: [46, 52], farHand: [43, 64],
  nearKnee: [72, 64], nearFoot: [74, 88], farKnee: [70, 64], farFoot: [72, 88],
};
const dipDown: Pose = {
  head: [54, 46], neck: [50, 54], hip: [52, 80],
  nearElbow: [36, 56], nearHand: [44, 64], farElbow: [35, 56], farHand: [43, 64],
  nearKnee: [72, 72], nearFoot: [74, 88], farKnee: [70, 72], farFoot: [72, 88],
};

const plankA: Pose = {
  head: [88, 66], neck: [80, 72], hip: [50, 76],
  nearElbow: [80, 88], nearHand: [94, 88], farElbow: [78, 88], farHand: [92, 88],
  nearKnee: [34, 81], nearFoot: [16, 88], farKnee: [34, 81], farFoot: [16, 88],
};
const plankB: Pose = { ...plankA, hip: [50, 74], nearKnee: [34, 80], farKnee: [34, 80] };

const highKneesA: Pose = {
  head: [60, 12], neck: [60, 22], hip: [60, 50],
  nearElbow: [54, 34], nearHand: [50, 46], farElbow: [66, 34], farHand: [74, 26],
  nearKnee: [76, 48], nearFoot: [74, 68], farKnee: [58, 70], farFoot: [56, 90],
};
const highKneesB: Pose = {
  head: [60, 12], neck: [60, 22], hip: [60, 50],
  nearElbow: [66, 34], nearHand: [74, 26], farElbow: [54, 34], farHand: [50, 46],
  nearKnee: [58, 70], nearFoot: [56, 90], farKnee: [76, 48], farFoot: [74, 68],
};

const lungeUp: Pose = {
  head: [60, 12], neck: [60, 22], hip: [60, 50],
  nearElbow: [66, 38], nearHand: [62, 48], farElbow: [54, 38], farHand: [58, 48],
  nearKnee: [61, 70], nearFoot: [62, 90], farKnee: [58, 70], farFoot: [57, 90],
};
const lungeDown: Pose = {
  head: [58, 32], neck: [58, 42], hip: [58, 70],
  nearElbow: [64, 58], nearHand: [60, 68], farElbow: [52, 58], farHand: [56, 68],
  nearKnee: [76, 72], nearFoot: [78, 90], farKnee: [48, 88], farFoot: [30, 90],
};

const sidePlankA: Pose = {
  head: [86, 66], neck: [78, 72], hip: [50, 80],
  nearElbow: [78, 88], nearHand: [92, 88], farElbow: [78, 56], farHand: [78, 40],
  nearKnee: [34, 85], nearFoot: [16, 89], farKnee: [34, 84], farFoot: [16, 87],
};
const sidePlankB: Pose = {
  ...sidePlankA,
  hip: [50, 76], nearKnee: [34, 83], farKnee: [34, 82], farElbow: [79, 55], farHand: [80, 39],
};

function mirror(pose: Pose): Pose {
  const flip = ([x, y]: Point): Point => [120 - x, y];
  return Object.fromEntries(
    Object.entries(pose).map(([joint, point]) => [joint, flip(point)]),
  ) as Pose;
}

export const animations: Record<string, Animation> = {
  jumping_jacks: { keyframes: [jumpingJacksA, jumpingJacksB], cycleMs: 900 },
  wall_sit: { keyframes: [wallSitA, wallSitB], cycleMs: 3000, props: ['wall-left'] },
  push_ups: { keyframes: [pushUpUp, pushUpDown], cycleMs: 1800 },
  crunches: { keyframes: [crunchDown, crunchUp], cycleMs: 1800 },
  step_ups: { keyframes: [stepUpFloor, stepUpChair], cycleMs: 2000, props: ['chair-right'] },
  squats: { keyframes: [squatUp, squatDown], cycleMs: 2000 },
  triceps_dips: { keyframes: [dipUp, dipDown], cycleMs: 1800, props: ['chair-left'] },
  plank: { keyframes: [plankA, plankB], cycleMs: 3000 },
  high_knees: { keyframes: [highKneesA, highKneesB], cycleMs: 700 },
  lunges: { keyframes: [lungeUp, lungeDown], cycleMs: 2000 },
  pushup_rotation: {
    keyframes: [pushUpUp, pushUpDown, pushUpUp, pushUpRotated],
    cycleMs: 3600,
  },
  side_plank_right: { keyframes: [sidePlankA, sidePlankB], cycleMs: 3000 },
  side_plank_left: { keyframes: [mirror(sidePlankA), mirror(sidePlankB)], cycleMs: 3000 },
};

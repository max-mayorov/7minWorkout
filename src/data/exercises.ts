export type Exercise = {
  id: string;
  name: string;
  focus: string;
  // Metabolic equivalent used for the calorie estimate.
  met: number;
  steps: string[];
  tip: string;
};

export const exercises: Exercise[] = [
  {
    id: 'jumping_jacks',
    name: 'Jumping Jacks',
    focus: 'Full body',
    met: 8,
    steps: [
      'Stand upright with your feet together and arms at your sides.',
      'Jump, spreading your feet wider than your hips while swinging your arms overhead.',
      'Jump again to return to the starting position. Keep a steady rhythm.',
    ],
    tip: 'Land softly on the balls of your feet.',
  },
  {
    id: 'wall_sit',
    name: 'Wall Sit',
    focus: 'Lower body',
    met: 4,
    steps: [
      'Stand with your back flat against a wall.',
      'Slide down until your knees are bent at 90 degrees, as if sitting on an invisible chair.',
      'Hold the position with your knees directly above your ankles.',
    ],
    tip: 'Keep your back pressed to the wall and breathe evenly.',
  },
  {
    id: 'push_ups',
    name: 'Push-Ups',
    focus: 'Chest & arms',
    met: 8,
    steps: [
      'Start in a high plank with hands slightly wider than your shoulders.',
      'Lower your body until your chest almost touches the floor.',
      'Push back up to the starting position, keeping your body in a straight line.',
    ],
    tip: 'Drop to your knees if you need an easier variation.',
  },
  {
    id: 'crunches',
    name: 'Abdominal Crunches',
    focus: 'Core',
    met: 5,
    steps: [
      'Lie on your back with knees bent and feet flat on the floor.',
      'Place your hands lightly behind your head.',
      'Lift your shoulders off the floor using your abs, then lower slowly.',
    ],
    tip: 'Do not pull on your neck — the movement comes from your core.',
  },
  {
    id: 'step_ups',
    name: 'Step-Up onto Chair',
    focus: 'Legs & glutes',
    met: 8,
    steps: [
      'Stand facing a sturdy chair.',
      'Step up with one foot, then bring the other foot up so you stand on the chair.',
      'Step back down one foot at a time and alternate the leading leg.',
    ],
    tip: 'Make sure the chair is stable and will not slide.',
  },
  {
    id: 'squats',
    name: 'Squats',
    focus: 'Legs & glutes',
    met: 5,
    steps: [
      'Stand with feet shoulder-width apart.',
      'Push your hips back and bend your knees, raising your arms forward for balance.',
      'Lower until your thighs are parallel to the floor, then stand back up.',
    ],
    tip: 'Keep your heels down and your chest up.',
  },
  {
    id: 'triceps_dips',
    name: 'Triceps Dips on Chair',
    focus: 'Arms',
    met: 5,
    steps: [
      'Sit on the edge of a chair and grip the edge next to your hips.',
      'Slide your hips off the chair with your knees bent.',
      'Bend your elbows to lower your body, then press back up.',
    ],
    tip: 'Keep your back close to the chair and elbows pointing backwards.',
  },
  {
    id: 'plank',
    name: 'Plank',
    focus: 'Core',
    met: 4,
    steps: [
      'Rest on your forearms with elbows under your shoulders.',
      'Extend your legs behind you, balancing on your toes.',
      'Hold your body in a straight line from head to heels.',
    ],
    tip: 'Squeeze your glutes and do not let your hips sag.',
  },
  {
    id: 'high_knees',
    name: 'High Knees Running in Place',
    focus: 'Cardio',
    met: 8,
    steps: [
      'Stand tall with your feet hip-width apart.',
      'Run in place, driving your knees up towards your chest.',
      'Pump your arms in time with your legs.',
    ],
    tip: 'Aim to bring your knees to hip height.',
  },
  {
    id: 'lunges',
    name: 'Lunges',
    focus: 'Legs & glutes',
    met: 5,
    steps: [
      'Stand tall with your hands on your hips.',
      'Step forward and lower until both knees are bent at about 90 degrees.',
      'Push back to standing and alternate legs.',
    ],
    tip: 'Keep your front knee above your ankle.',
  },
  {
    id: 'pushup_rotation',
    name: 'Push-Up and Rotation',
    focus: 'Chest & core',
    met: 8,
    steps: [
      'Do a regular push-up.',
      'At the top, rotate your body and lift one arm straight up to the ceiling.',
      'Return to the plank, do another push-up and rotate to the other side.',
    ],
    tip: 'Follow your raised hand with your eyes to keep your balance.',
  },
  {
    id: 'side_plank_right',
    name: 'Side Plank Right',
    focus: 'Obliques',
    met: 4,
    steps: [
      'Lie on your right side with your forearm under your shoulder.',
      'Lift your hips so your body forms a straight line.',
      'Hold, reaching your free arm towards the ceiling.',
    ],
    tip: 'Stack your feet, or stagger them for more stability.',
  },
  {
    id: 'side_plank_left',
    name: 'Side Plank Left',
    focus: 'Obliques',
    met: 4,
    steps: [
      'Lie on your left side with your forearm under your shoulder.',
      'Lift your hips so your body forms a straight line.',
      'Hold, reaching your free arm towards the ceiling.',
    ],
    tip: 'Stack your feet, or stagger them for more stability.',
  },
];

const byId = new Map(exercises.map((exercise) => [exercise.id, exercise]));

export function getExercise(id: string): Exercise {
  const exercise = byId.get(id);
  if (!exercise) throw new Error(`Unknown exercise: ${id}`);
  return exercise;
}

export const classicOrder = exercises.map((exercise) => exercise.id);

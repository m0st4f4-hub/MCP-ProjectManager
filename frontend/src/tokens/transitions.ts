export const transitionDuration = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
};

export const transitionEasing = {
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  emphasized: 'cubic-bezier(0.4, 0, 0.6, 1)',
  decelerate: 'cubic-bezier(0.0, 0, 0.2, 1)',
  accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
};

export const transitions = {
  duration: transitionDuration,
  easing: transitionEasing,
};

export type TransitionDuration = typeof transitionDuration;
export type TransitionEasing = typeof transitionEasing;
export type Transitions = typeof transitions; 
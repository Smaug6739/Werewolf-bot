export function wait(t: number) {
  return new Promise((resolve) => setTimeout(resolve, t));
}
export * from './characters';
export * from './immune';
export * from './interactions/vote';
export * from './components/index';

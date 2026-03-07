
export interface AiBrain {
  weights: number[][]; // [inputs][outputs]
  biases: number[];    // [outputs]
}

export const INPUT_SIZE = 8;
export const OUTPUT_SIZE = 4; // Left, Right, Up, Dash

export const createBrain = (): AiBrain => ({
  weights: Array.from({ length: INPUT_SIZE }, () => 
    Array.from({ length: OUTPUT_SIZE }, () => Math.random() * 2 - 1)
  ),
  biases: Array.from({ length: OUTPUT_SIZE }, () => Math.random() * 2 - 1),
});

export const getBrainOutput = (brain: AiBrain, inputs: number[]): boolean[] => {
  const outputs = new Array(OUTPUT_SIZE).fill(0);
  for (let j = 0; j < OUTPUT_SIZE; j++) {
    let sum = brain.biases[j];
    for (let i = 0; i < INPUT_SIZE; i++) {
      sum += inputs[i] * brain.weights[i][j];
    }
    // Simple activation: > 0.5
    outputs[j] = 1 / (1 + Math.exp(-sum)) > 0.5;
  }
  return outputs;
};

export const mutateBrain = (brain: AiBrain, rate: number = 0.1): AiBrain => ({
  weights: brain.weights.map(row => row.map(w => w + (Math.random() * 2 - 1) * rate)),
  biases: brain.biases.map(b => b + (Math.random() * 2 - 1) * rate),
});

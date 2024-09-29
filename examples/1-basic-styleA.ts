import { Die, DiceShortcuts, DieHard } from 'DieHard';
import 'MadCakeUtil/augmentations.ts'; // console.JSON()

const dice = {
	d3: Die.simple(3),
	d4: Die.simple(4),
};

function simulateGame({ d3, d4 }: DiceShortcuts<typeof dice>) {
	return d3() + d4();
}

const dieHard = new DieHard<number>((a, b) => a - b);
const shortcuts = dieHard.MakeShortcuts(dice);
const simulationFn = () => simulateGame(shortcuts);
const simulationOutcomes = dieHard.simulate(simulationFn);

console.JSON(simulationOutcomes);

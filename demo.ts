import { Die } from './src/Die.ts';
import { DiceShortcuts, DieHard } from './src/DieHard.ts';
import { RollFn } from './src/Roller.ts';
import './submodules/MadCakeUtil-ts/augmentations.ts';

const dice = {
	d3: Die.simple(3),
	d4: Die.simple(4),
};

function styleA() {
	function monteCarlo({ d3, d4 }: DiceShortcuts<typeof dice>) {
		return d3() + d4();
	}

	const dieHard = new DieHard<number>((a, b) => a - b);
	const shortcuts = dieHard.MakeShortcuts(dice);
	return dieHard.simulate(() => monteCarlo(shortcuts));
}

function styleB() {
	function demo(roll: RollFn) {
		const { d3, d4 } = dice;

		return roll(d3) + roll(d4);
	}

	const dieHard = new DieHard<number>((a, b) => a - b);
	return dieHard.simulate(demo);
}

console.JSON(styleA());

console.log(`
------------- alternative style (same result) -------------
`);

console.JSON(styleB());

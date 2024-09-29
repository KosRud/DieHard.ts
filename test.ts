import { Die } from './src/Die.ts';
import { DieHard } from './src/DieHard.ts';
import { Roller } from './src/Roller.ts';
import './submodules/MadCakeUtil-ts/augmentations.ts';

function tester(roller: Roller) {
	const results: number[] = [];

	results.push(roller.roll(Die.simple(3)));
	results.push(roller.roll(Die.simple(4)));

	return results.reduce((a, b) => a + b);
}

const dieHard = new DieHard((a, b) => a == b);
const stats = dieHard.simulate(tester);
console.JSON(stats);

import { Die } from './src/Die.ts';
import { DieHard } from './src/DieHard.ts';
import { Roller } from './src/Roller.ts';
import './submodules/MadCakeUtil-ts/augmentations.ts';

function tester(roller: Roller) {
	const results: number[] = [];

	results.push(roller.roll(Die.simple(3)));
	results.push(roller.roll(Die.simple(4)));

	//console.JSON(results);

	return results.reduce((a, b) => a + b);
}

// BUG: forgot that function must be aware of its input's probability for collapsing/optimization
// or rather the roller should take it into account
// let the roller record result? (it has history with probabilities)
// or supply callback for it

const dieHard = new DieHard((a, b) => a == b);
const stats = dieHard.simulate(tester);
// console.JSON(stats);

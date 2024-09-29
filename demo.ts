import { Die } from './src/Die.ts';
import { DieHard } from './src/DieHard.ts';
import './submodules/MadCakeUtil-ts/augmentations.ts';

const dice = {
	d3: Die.simple(3),
	d4: Die.simple(4),
};

const dieHard = new DieHard<number>((a, b) => a - b);
const shortcuts = dieHard.MakeShortcuts(dice);

function demo() {
	const { d3, d4 } = shortcuts;

	return d3() + d4();
}

const stats = dieHard.simulate(demo);
console.JSON(stats);

import { Die } from './src/Die.ts';
import { DieHard } from './src/DieHard.ts';
import { RollFn } from './src/Roller.ts';
import './submodules/MadCakeUtil-ts/augmentations.ts';

const dice = {
	d3: Die.simple(3),
	d4: Die.simple(4),
};

function demo(roll: RollFn) {
	const { d3, d4 } = dice;

	const roll_d3 = roll(d3);
	const roll_d4 = roll(d4);
	return roll_d3 + roll_d4;
}

const dieHard = new DieHard<number>((a, b) => a - b);
const stats = dieHard.simulate(demo);
console.JSON(stats);

import { Die, DieHard, RollFn } from 'DieHard';
import { Example } from '../src/Example.ts';

export { example };

// creating dice inside the simulation loop is supported
// but keeping them outside is more efficient to reduce GC allocations
const dice = {
	d3: Die.d(3),
	d4: Die.d(4),
};

function run() {
	function simulateGame(diceBag: typeof dice, roll: RollFn) {
		const { d3, d4 } = diceBag;

		return roll(d3) + roll(d4);
	}

	const dieHard = new DieHard<number>((a, b) => a - b);
	const simulationFn = (roll: RollFn) => simulateGame(dice, roll);
	const simulationOutcomes = dieHard.simulate(simulationFn);

	return simulationOutcomes.getSides(2);
}

const expected = [
	{
		value: 2,
		probability: 0.08,
	},
	{
		value: 3,
		probability: 0.17,
	},
	{
		value: 4,
		probability: 0.25,
	},
	{
		value: 5,
		probability: 0.25,
	},
	{
		value: 6,
		probability: 0.17,
	},
	{
		value: 7,
		probability: 0.08,
	},
];

const example: Example<typeof expected> = {
	run,
	expected,
};

import { Die, DieHard, RollFn } from 'DieHard';
import { Example } from '../src/Example.ts';

export { example };

const dice = {
	d3: Die.simple(3),
	d4: Die.simple(4),
};

function run() {
	function simulateGame(roll: RollFn) {
		const { d3, d4 } = dice;

		return roll(d3) + roll(d4);
	}

	const dieHard = new DieHard<number>((a, b) => a - b);
	const simulationOutcomes = dieHard.simulate(simulateGame);

	return simulationOutcomes.getSides();
}

const expected = [
	{
		value: 2,
		probability: 0.08333333333333334,
	},
	{
		value: 3,
		probability: 0.16666666666666669,
	},
	{
		value: 4,
		probability: 0.25000000000000006,
	},
	{
		value: 5,
		probability: 0.25000000000000006,
	},
	{
		value: 6,
		probability: 0.16666666666666669,
	},
	{
		value: 7,
		probability: 0.08333333333333334,
	},
];

const example: Example<typeof expected> = {
	run,
	expected,
	name: 'basic: style B',
};

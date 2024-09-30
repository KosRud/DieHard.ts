import { Die } from 'DieHard';
import { Example } from '../src/Example.ts';

export { example };

/*
	This example simulates taking highest of 3d6
*/

function run() {
	const d6 = Die.d(6);
	const pool = Array.from({ length: 3 }).map(() => d6);
	const result = Die.combine(
		(outcomes) => outcomes.reduce((a, b) => Math.max(a, b)),
		...pool
	);
	return result.sort((a, b) => a - b).getSides(2);
}

const expected = [
	{
		probability: 0,
		value: 1,
	},
	{
		probability: 0.03,
		value: 2,
	},
	{
		probability: 0.09,
		value: 3,
	},
	{
		probability: 0.17,
		value: 4,
	},
	{
		probability: 0.28,
		value: 5,
	},
	{
		probability: 0.42,
		value: 6,
	},
];

const example: Example<typeof expected> = {
	run,
	expected,
};

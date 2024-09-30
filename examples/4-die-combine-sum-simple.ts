import { Die } from 'DieHard';
import { Example } from '../src/Example.ts';

export { example };

/*
	This example simulates
	"roll 1d6, add highest 1 of 3d4"
*/

function run() {
	const d6 = Die.d(6);
	const d4 = Die.d(4);
	const numd4 = 3;
	const d4pool = Array.from({ length: numd4 }).map(() => d4);
	const result = d6.combine(
		([d6, ...d4pool]) => d6 + d4pool.reduce((a, b) => Math.max(a, b)),
		...d4pool
	);
	return result.sort((a, b) => a - b).getSides(2);
}

const expected = [
	{
		probability: 0,
		value: 2,
	},
	{
		probability: 0.02,
		value: 3,
	},
	{
		probability: 0.07,
		value: 4,
	},
	{
		probability: 0.17,
		value: 5,
	},
	{
		probability: 0.17,
		value: 6,
	},
	{
		probability: 0.17,
		value: 7,
	},
	{
		probability: 0.16,
		value: 8,
	},
	{
		probability: 0.15,
		value: 9,
	},
	{
		probability: 0.1,
		value: 10,
	},
];

const example: Example<typeof expected> = {
	run,
	expected,
};

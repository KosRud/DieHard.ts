import { Die, DieSide } from 'DieHard';
import { Example } from '../src/Example.ts';

export { example };

type SuccessLevel =
	| 'major success'
	| 'minor success'
	| 'minor failure'
	| 'major failure';

function getSuccessLevel(n: number) {
	switch (true) {
		case n > 90:
			return 'major success';
		case n > 50:
			return 'minor success';
		case n > 10:
			return 'minor failure';
		default:
			return 'major failure';
	}
}

function run() {
	const d100: Die<number> = Die.simple(100);
	return d100.interpret(getSuccessLevel).getSides(2);
}

const expected = [
	{
		value: 'major failure',
		probability: 0.1,
	},
	{
		value: 'minor failure',
		probability: 0.4,
	},
	{
		value: 'minor success',
		probability: 0.4,
	},
	{
		value: 'major success',
		probability: 0.1,
	},
];

const example: Example<typeof expected> = {
	run,
	expected,
};

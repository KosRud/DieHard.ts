import { Die } from 'DieHard';
import { Example } from '../src/Example.ts';

export { example };

/*
	This code simulates a slot machine

	first 3 slots can show one of 4 card suits
	3rd slot additionaly can show a wildcard
	4th slot determines prize multiplier

	you receive a prize if all slots show the same suit
	wildcard counts as any suit
	multiplier determines size of your prize
*/

function run() {
	const suits = ['clubs', 'diamonds', 'hearts', 'spades'] as const;
	const suitsWithWildcard = [...suits, 'wildcard'] as const;

	const slotA = Die.outcomes(suits);
	const slotB = Die.outcomes(suits);
	const slotC = Die.outcomes(suitsWithWildcard);
	const slotPrizeMultiplier = Die.d(4);

	const result = Die.combine(
		[slotA, slotB, slotC, slotPrizeMultiplier],
		([suitA, suitB, suitC, prizeMultiplier]) => {
			switch (true) {
				case suitA == suitB && suitB == suitC:
					return prizeMultiplier;
				case suitA == suitB && suitC == 'wildcard':
					return prizeMultiplier;
				default:
					return 0;
			}
		}
	);
	return result.sort((a, b) => a - b).getSides(2);
}

const expected = [
	// no prize
	{
		probability: 0.9,
		value: 0,
	},
	{
		probability: 0.02,
		value: 1,
	},
	{
		probability: 0.02,
		value: 2,
	},
	{
		probability: 0.02,
		value: 3,
	},
	{
		probability: 0.02,
		value: 4,
	},
];

const example: Example<typeof expected> = {
	run,
	expected,
};

export { Die };
export type { DieSide };

import { DeepReadonly, deepReadonly } from 'MadCakeUtil/mod.ts';

type DieSide<T> = { probability: number; value: T };

/**
 * A die has one or more sides. Each side has a value and a probability. The probabilities of all sides must add up to 1. The values can be of any type, e.g. `number` for polyhedral dice, `string` for dice with symbols on them, or `object` for more complex simulations.
 */
class Die<T> {
	#sides: DieSide<T>[];

	getSides(roundingDigits?: number): DeepReadonly<DieSide<T>[]> {
		if (!roundingDigits) {
			return deepReadonly(this.#sides);
		}

		return deepReadonly(
			this.#sides.map((side) => ({
				...side,
				probability: Number(side.probability.toFixed(roundingDigits)),
			}))
		);
	}

	#infuseOutcome(outcome: DieSide<T>) {
		const existingSide = this.#sides.find(
			(newSide) => newSide.value == outcome.value
		);

		if (existingSide) {
			existingSide.probability += outcome.probability;
		} else {
			this.#sides.push({
				probability: outcome.probability,
				value: outcome.value,
			});
		}
	}

	constructor(sides: DieSide<T>[]) {
		this.#sides = sides;
	}

	static uniform<T>(values: readonly T[]): Die<T> {
		const probability = 1 / values.length;
		const sides = values.map((side) => ({
			probability,
			value: side,
		}));
		return new Die(sides);
	}

	static d(numSides: number): Die<number> {
		const probability = 1 / numSides;
		const sides = Array.from({ length: numSides }, (_, id) => ({
			probability,
			value: id + 1,
		}));
		return new Die(sides);
	}

	static nd(numDice: number, numSides: number): Die<number> {
		if (numDice <= 0) {
			throw new Error(`incorrect number of dice in a pool: ${numDice}`);
		}

		const die = Die.d(numSides);

		if (numDice == 1) {
			return die;
		}

		const dice = Array.from({ length: numDice }).fill(
			die
		) as (typeof die)[];

		return Die.reduce(dice, (a, b) => a + b);
	}

	static #empty<K>() {
		return new Die<K>([]);
	}

	normalize(): this {
		const sumProbabilities = this.#sides.reduce<number>(
			(sum, current) => sum + current.probability,
			0
		);

		for (const side of this.#sides) {
			side.probability /= sumProbabilities;
		}

		return this;
	}

	sort(compareFn: (a: T, b: T) => number): this {
		this.#sides.sort((a, b) => compareFn(a.value, b.value));
		return this;
	}

	interpret<K>(fn: (value: DeepReadonly<T>) => K) {
		// we could re-use `Die.combine()` as a special case with only one die,
		// but this is more efficient

		const result = Die.#empty<K>();

		for (const side of this.getSides()) {
			result.#infuseOutcome({
				probability: side.probability,
				value: fn(side.value),
			});
		}

		return result.normalize();
	}

	static #combineRecursive<T, K extends unknown[], U>(
		combineFn: (values: DeepReadonly<K>) => U,
		rolledSides: DeepReadonly<DieSide<unknown>[]>,
		result: Die<U>,
		dice: Die<any>[]
	) {
		if (dice.length == 0) {
			const probability = rolledSides.reduce(
				(probability, nextSide) => probability * nextSide.probability,
				1
			);
			const rolledValues = rolledSides.map((side) => side.value);
			const value = combineFn(rolledValues as DeepReadonly<K>);

			result.#infuseOutcome({ probability, value });

			return;
		}

		for (const side of dice[0].getSides()) {
			this.#combineRecursive(
				combineFn,
				rolledSides.concat(side),
				result,
				dice.slice(1)
			);
		}
	}

	static reduce<T>(
		dice: Die<T>[],
		fn: (cur: DeepReadonly<T>, next: DeepReadonly<T>) => T
	) {
		return dice.reduce((cur, next) => {
			const result = Die.#empty<T>();

			for (const curSide of cur.getSides()) {
				for (const nextSide of next.getSides()) {
					const value = fn(curSide.value, nextSide.value);
					const probability =
						curSide.probability * nextSide.probability;
					result.#infuseOutcome({ value, probability });
				}
			}

			return result;
		});
	}

	static combine<T, K extends unknown[], U>(
		dice: { [k in keyof K]: Die<K[k]> },
		combineFn: (values: DeepReadonly<K>) => U
	) {
		const result = Die.#empty<U>();

		Die.#combineRecursive(combineFn, [], result, dice);

		return result.normalize();
	}

	// TODO: https://kosrud.github.io/dice-pool-calc/classes/index.Die.html
}

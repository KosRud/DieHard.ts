export { Die };
export type { DieSide };

import { DeepReadonly, deepReadonly } from 'MadCakeUtil/mod.ts';

type DieSide<T> = { probability: number; value: T };

/**
 * A die has one or more sides. Each side has a value and a probability. The probabilities of all sides must add up to 1. The values can be of any type, e.g. `number` for polyhedral dice, `string` for dice with symbols on them, or `object` for more complex simulations.
 */
class Die<T> {
	/**
	 * @internal
	 */
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

	static simple(numSides: number): Die<number>;
	static simple<T>(sides: readonly T[]): Die<T>;
	static simple<T>(arg: number | readonly T[]) {
		if (Array.isArray(arg)) {
			return Die.#simpleFromArray(arg);
		}

		return Die.#simpleFromNumber(arg as number);
	}

	static #empty<K>() {
		return new Die<K>([]);
	}

	static #simpleFromNumber(numSides: number): Die<number> {
		const probability = 1 / numSides;
		const sides = Array.from({ length: numSides }, (_, id) => ({
			probability,
			value: id + 1,
		}));
		return new Die(sides);
	}

	static #simpleFromArray<T>(sideValues: T[]): Die<T> {
		const probability = 1 / sideValues.length;
		const sides = sideValues.map((side) => ({
			probability,
			value: side,
		}));
		return new Die(sides);
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
		const result = Die.#empty<K>();

		for (const side of this.getSides()) {
			result.#infuseOutcome({
				probability: side.probability,
				value: fn(side.value),
			});
		}

		return result.normalize();
	}

	#combineRecursive<K extends unknown[], U>(
		combineFn: (values: DeepReadonly<[T, ...K]>) => U,
		rolledSides: DeepReadonly<DieSide<unknown>[]>,
		result: Die<U>,
		dice: Die<any>[]
	) {
		if (dice.length == 0) {
			const rolledSidesTyped = rolledSides as [
				DieSide<T>,
				...{ [k in keyof K]: DieSide<K[k]> }
			];
			const probability = rolledSidesTyped.reduce(
				(probability, nextSide) => probability * nextSide.probability,
				1
			);
			const rolledValues = rolledSidesTyped.map((side) => side.value);
			const value = combineFn(rolledValues as DeepReadonly<[T, ...K]>);

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

	combine<K extends unknown[], U>(
		combineFn: (values: DeepReadonly<[T, ...K]>) => U,
		...dice: { [k in keyof K]: Die<K[k]> }
	) {
		const result = Die.#empty<U>();

		const allDice = ([this] as unknown[]).concat(dice) as [
			Die<T>,
			...typeof dice
		];

		this.#combineRecursive(combineFn, [], result, allDice);

		return result.normalize();
	}

	// TODO: https://kosrud.github.io/dice-pool-calc/classes/index.Die.html
}

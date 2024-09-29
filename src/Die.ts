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

	getSides(): DeepReadonly<DieSide<T>[]> {
		return deepReadonly(this.#sides);
	}

	constructor(sides: DieSide<T>[]) {
		this.#sides = sides;
	}

	static simple(numSides: number): Die<number>;
	static simple<T>(sides: T[]): Die<number>;
	static simple<T>(arg: number | T[]) {
		if (Array.isArray(arg)) {
			return Die.#simpleFromArray(arg);
		}

		return Die.#simpleFromNumber(arg);
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
}

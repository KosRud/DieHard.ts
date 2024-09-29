export { Die };
export type { DieSide };

import { deepReadonly } from '../submodules/MadCakeUtil-ts/mod.ts';

type DieSide<T> = { probability: number; value: T };

class Die<T> {
	private sides: DieSide<T>[];

	public getSides() {
		return deepReadonly(this.sides);
	}

	constructor(sides: DieSide<T>[]) {
		this.sides = sides;
	}

	static simple(numSides: number): Die<number>;
	static simple<T>(sides: T[]): Die<number>;
	static simple<T>(arg: number | T[]) {
		if (Array.isArray(arg)) {
			return Die.simpleFromArray(arg);
		}

		return Die.simpleFromNumber(arg);
	}

	private static simpleFromNumber(numSides: number) {
		const probability = 1 / numSides;
		const sides = Array.from({ length: numSides }, (_, id) => ({
			probability,
			value: id + 1,
		}));
		return new Die(sides);
	}

	private static simpleFromArray<T>(sideValues: T[]) {
		const probability = 1 / sideValues.length;
		const sides = sideValues.map((side) => ({
			probability,
			value: side,
		}));
		return new Die(sides);
	}

	normalize() {
		const sumProbabilities = this.sides.reduce<number>(
			(sum, current) => sum + current.probability,
			0
		);

		for (const side of this.sides) {
			side.probability /= sumProbabilities;
		}

		return this;
	}

	sort(compareFn: (a: DieSide<T>, b: DieSide<T>) => number) {
		this.sides.sort(compareFn);
	}
}

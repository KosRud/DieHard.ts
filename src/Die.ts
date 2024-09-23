export { Die, DieSide };

import { deepReadonly, DeepReadonly } from './lib/MadCakeUtil-ts';

type DieSide<T> = { probability: number; value: T };

class Die<T> {
	private sides: DieSide<T>[];

	public getSides() {
		return deepReadonly(this.sides);
	}

	constructor(sides: DieSide<T>[]) {
		this.sides = sides;
	}

	static simple(numSides: number);
	static simple<T>(sides: T[]);
	static simple<T>(arg: number | T[]) {
		if (Array.isArray(arg)) {
			const sideValues = arg;
			const probability = 1 / arg.length;
			const sides = arg.map((side) => ({ probability, value: side }));
			return new Die(sides);
		}

		const numSides: number = arg;
		const probability = 1 / numSides;
		const sides = Array.from({ length: numSides }, (_, id) => ({
			probability,
			value: id + 1,
		}));
		return new Die(sides);
	}
}

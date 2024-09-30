import { Roller, RollerReplay, RollFn } from './Roller.ts';
import { Die, DieSide } from './Die.ts';
import 'MadCakeUtil/augmentations.ts';

export { DieHard };
export type { DiceShortcuts };

type DiceShortcuts<T extends Record<string, Die<any>>> = {
	[key in keyof T]: T[key] extends Die<infer V> ? () => V : never;
};

class DieHard<T> {
	#schedule: RollerReplay[] = [[]];
	#roller = new Roller(this.#scheduleSimulation.bind(this));
	#outcomes: DieSide<T>[] = [];
	#compareFn: (a: T, b: T) => number;

	/**
	 *
	 * @param compareFn Must return `0` when arguments are equal, and non-zero when they are not equal. To have the resulting die sides sorted *(optional)*, return a negative value when the first argument is lesser than second argument, and a positive value when the first argument is greater than second argument.
	 */
	constructor(compareFn: (a: T, b: T) => number) {
		this.#compareFn = compareFn;
	}

	#scheduleSimulation(replay: RollerReplay, ...sides: DieSide<unknown>[]) {
		for (const side of sides) {
			this.#schedule.push(replay.concat(side));
		}
	}

	MakeShortcuts<T extends Record<string, Die<any>>>(dice: {
		[key in keyof T]: T[key];
	}): DiceShortcuts<T> {
		const entries = Object.entries(dice);
		const newEntries = entries.map(([key, value]) => {
			return [key, this.#roller.MakeShortcut(value)];
		});
		return Object.fromEntries(newEntries) as {
			[key in keyof T]: T[key] extends Die<infer D> ? () => D : never;
		};
	}

	#trackOutcome(outcome: DieSide<T>) {
		// check if this outcome was recorded before
		const existingRecord = this.#outcomes.find(
			(record) => this.#compareFn(record.value, outcome.value) == 0
		);

		// add probability to existing record
		if (existingRecord) {
			existingRecord.probability += outcome.probability;
			return;
		}

		// it's the first time we see this outcome
		// create new record
		this.#outcomes.push(outcome);
	}

	simulate(fn: (roler: RollFn) => T): Die<T> {
		while (this.#schedule.isNotEmpty()) {
			const replay = this.#schedule.pop();
			const rollFn = this.#roller.setup(replay);

			const value = fn(rollFn);
			const probability = replay.reduce(
				(probability, nextDieSide) =>
					probability * nextDieSide.probability,
				1
			);

			this.#trackOutcome({ value, probability });
		}

		return new Die<T>(this.#outcomes).normalize().sort(this.#compareFn);
	}
}

import { Roller, RollerReplay } from './Roller.ts';
import { Die, DieSide } from './Die.ts';
import '../submodules/MadCakeUtil-ts/augmentations.ts';

export { DieHard };

class DieHard<T> {
	schedule: RollerReplay[] = [[]];
	roller = new Roller(this.scheduleSimulation.bind(this));
	outcomes: DieSide<T>[] = [];
	compareFn: (a: T, b: T) => number;

	constructor(compareFn: (a: T, b: T) => number) {
		this.compareFn = compareFn;
	}

	private scheduleSimulation(
		replay: RollerReplay,
		...sides: DieSide<unknown>[]
	) {
		for (const side of sides) {
			this.schedule.push(replay.concat(side));
		}
	}

	private trackOutcome(outcome: DieSide<T>) {
		// check if this outcome was recorded before
		const existingRecord = this.outcomes.find(
			(record) => this.compareFn(record.value, outcome.value) == 0
		);

		// add probability to existing record
		if (existingRecord) {
			existingRecord.probability += outcome.probability;
			return;
		}

		// it's the first time we see this outcome
		// create new record
		this.outcomes.push(outcome);
	}

	simulate(func: (roler: Roller) => T) {
		while (this.schedule.isNotEmpty()) {
			const replay = this.schedule.pop();
			this.roller.setup(replay);

			const value = func(this.roller);
			const probability = replay.reduce(
				(probability, nextDieSide) =>
					probability * nextDieSide.probability,
				1
			);

			this.trackOutcome({ value, probability });
		}

		return new Die<T>(this.outcomes).normalize().sort(this.compareFn);
	}
}

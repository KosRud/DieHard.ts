import { Roller, RollerReplay } from './src/Roller';
import { Die, DieSide } from './src/Die';
import {
	deepReadonly,
	isNotEmpty,
	NonEmptyArray,
} from './src/lib/MadCakeUtil-ts';

function simulate<T>(
	func: (roler: Roller) => T,
	isEqual: (a: T, b: T) => boolean
) {
	const schedule: RollerReplay[] = [[]];
	const roller = new Roller(scheduleSimulation);
	const outcomes: DieSide<T>[] = [];

	function scheduleSimulation(...sides: DieSide<unknown>[]) {
		schedule.splice(schedule.length, 0, sides);
	}

	function trackOutcome(outcome: T) {
		// check if this outcome was recorded before
		const existingRecord = outcomes.find((record) =>
			isEqual(record.value, outcome)
		);

		// increase number of occurences
		if (existingRecord) {
			existingRecord.probability++;
			return;
		}

		// it's the first time we see this outcome
		// create a new record with 1 occurrence
		outcomes.push({ value: outcome, probability: 1 });
	}

	function normalizeOutcomes() {
		const sumProbabilities = outcomes.reduce<number>(
			(sum, current) => sum + current.probability,
			0
		);

		for (const outcome of outcomes) {
			outcome.probability /= sumProbabilities;
		}
	}

	while (schedule.some(() => true)) {
		const replay = schedule.pop();
		roller.setup(replay);

		const outcome = func(roller);

		trackOutcome(outcome);
	}

	normalizeOutcomes();

	return deepReadonly(outcomes);
}

function tester(roller: Roller) {
	const results: number[] = [];
	results.push(roller.roll(Die.simple(3)));
	results.push(roller.roll(Die.simple(4)));
	console.log(`d3: ${results[0]}, d4: ${results[1]}`);
	return results.reduce((a, b) => a + b);
}

// BUG: forgot that function must be aware of its input's probability for collapsing/optimization
// or rather the roller should take it into account
// let the roller record result? (it has history with probabilities)
// or supply callback for it

const stats = simulate(tester, (a, b) => a == b);
console.log(JSON.stringify(stats, null, 2));

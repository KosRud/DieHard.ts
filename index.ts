import { Roller, RollerReplay } from './src/Roller';
import { Die, DieSide } from './src/Die';
import { isNotEmpty, NonEmptyArray } from './src/lib/MadCakeUtil-ts';

function simulate<T>(
	func: (roler: Roller) => T,
	isEqual: (a: T, b: T) => boolean
) {
	const schedule: RollerReplay[] = [[]];

	function scheduleSimulation(...sides: DieSide<unknown>[]) {
		schedule.splice(schedule.length, 0, sides);
	}

	const roller = new Roller(scheduleSimulation);
	const outcomes: DieSide<T>[] = [];

	while (schedule.some(() => true)) {
		const replay = schedule.pop();
		roller.setup(replay);
	}
}

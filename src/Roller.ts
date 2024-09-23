export { Roller, RollerReplay };

import { DieSide, Die } from './Die';
import { DeepReadonly } from './lib/MadCakeUtil-ts';

type ScheduleSimulationCallback = (...sides: DieSide<unknown>[]) => void;

type RollerReplay = DieSide<unknown>[];

class Roller {
	private history: RollerReplay = [];
	private historyCursor: number = 0;
	private scheduleSimulation: ScheduleSimulationCallback;

	constructor(scheduleSimulation: ScheduleSimulationCallback) {
		this.scheduleSimulation = scheduleSimulation;
	}

	setup(history: RollerReplay) {
		this.history = history;
		this.historyCursor = 0;
	}

	roll<T>(die: Die<T>): DeepReadonly<DieSide<T>['value']> {
		// replay a roll from history, if available
		// and increment history cursor
		if (this.history.length > this.historyCursor) {
			const result = this.history[this.historyCursor++];
			return result as DeepReadonly<DieSide<T>['value']>;
		}

		// otherwise, make new roll
		return this.newRoll(die);
	}

	/**
	 * Return first side. Schedule all possible alternatives to be simulated.
	 */
	private newRoll<T>(die: Die<T>) {
		const sides = die.getSides();

		// schedule simulation for all sides except first
		this.scheduleSimulation(...sides.slice(0));

		// return first side
		return sides[0].value;
	}
}

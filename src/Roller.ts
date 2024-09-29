export { Roller };
export type { RollerReplay };

import { DieSide, Die } from './Die.ts';
import { DeepReadonly } from '../submodules/MadCakeUtil-ts/mod.ts';

type ScheduleSimulationCallback = (
	replay: RollerReplay,
	...sides: DieSide<unknown>[]
) => void;

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
			const result = this.history[this.historyCursor++].value;
			return result as DeepReadonly<DieSide<T>['value']>;
		}

		// otherwise, make new roll
		return this.newRoll(die);
	}

	/**
	 * Return first side. Schedule all possible alternatives to be simulated.
	 */
	private newRoll<T>(die: Die<T>): DeepReadonly<DieSide<T>['value']> {
		const sides = die.getSides();

		// schedule simulation for all sides except first
		this.scheduleSimulation(this.history, ...sides.slice(1));

		// record current roll in history
		this.history.push(sides[0]);

		// return first side
		return sides[0].value;
	}
}

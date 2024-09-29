export { Roller };
export type { RollerReplay };

import { DieSide, Die } from './Die.ts';
import { DeepReadonly } from '../submodules/MadCakeUtil-ts/mod.ts';
import { deferScope } from '../submodules/MadCakeUtil-ts/deferScope.ts';

type ScheduleSimulationCallback = (
	replay: RollerReplay,
	...sides: DieSide<unknown>[]
) => void;

type RollerReplay = DieSide<unknown>[];

class Roller {
	private replay: RollerReplay = [];
	private replayCursor: number = 0;
	private scheduleSimulation: ScheduleSimulationCallback;

	constructor(scheduleSimulation: ScheduleSimulationCallback) {
		this.scheduleSimulation = scheduleSimulation;
	}

	setup(replay: RollerReplay) {
		this.replay = replay;
		this.replayCursor = 0;
	}

	roll<T>(die: Die<T>): DeepReadonly<DieSide<T>['value']> {
		return deferScope((defer) => {
			defer(() => {
				this.replayCursor++;
			});

			// replay a roll, if available
			// and increment replay cursor
			if (this.replay.length > this.replayCursor) {
				const result = this.replay[this.replayCursor].value;
				return result as DeepReadonly<DieSide<T>['value']>;
			}

			// otherwise, make new roll
			return this.newRoll(die);
		});
	}

	/**
	 * Return first side. Schedule all possible alternatives to be simulated.
	 */
	private newRoll<T>(die: Die<T>): DeepReadonly<DieSide<T>['value']> {
		const sides = die.getSides();

		// schedule simulation for all sides except first
		this.scheduleSimulation(this.replay, ...sides.slice(1));

		// record current roll in history
		this.replay.push(sides[0]);

		// return first side
		return sides[0].value;
	}
}

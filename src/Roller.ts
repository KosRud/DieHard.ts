export { Roller };
export type { RollerReplay, RollFn };

import { DieSide, Die } from './Die.ts';
import { DeepReadonly } from '../submodules/MadCakeUtil-ts/mod.ts';
import { useDefer } from '../submodules/MadCakeUtil-ts/useDefer.ts';

type ScheduleSimulationCallback = (
	replay: RollerReplay,
	...sides: DieSide<unknown>[]
) => void;

type RollerReplay = DieSide<unknown>[];
type RollFn = <T>(die: Die<T>) => DeepReadonly<DieSide<T>['value']>;

class Roller {
	private replay: RollerReplay = [];
	private replayCursor: number = 0;
	private scheduleSimulation: ScheduleSimulationCallback;

	constructor(scheduleSimulation: ScheduleSimulationCallback) {
		this.scheduleSimulation = scheduleSimulation;
	}

	setup(replay: RollerReplay): RollFn {
		this.replay = replay;
		this.replayCursor = 0;
		return this.roll.bind(this);
	}

	public MakeShortcut<T>(die: Die<T>) {
		return () => this.roll(die);
	}

	private roll<T>(die: Die<T>): DeepReadonly<DieSide<T>['value']> {
		return useDefer((defer) => {
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

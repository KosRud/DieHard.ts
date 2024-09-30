export { Roller };
export type { RollerReplay, RollFn };

import { DieSide, Die } from './Die.ts';
import { deepReadonly, DeepReadonly } from 'MadCakeUtil/mod.ts';
import { useDefer } from 'MadCakeUtil/useDefer.ts';

function randomInt(max: number) {
	return Math.floor(Math.random() * max);
}

type ScheduleSimulationCallback = (
	replay: RollerReplay,
	...sides: DieSide<unknown>[]
) => void;

type RollerReplay = DieSide<unknown>[];
type RollFn = <T>(die: Die<T>) => DeepReadonly<DieSide<T>['value']>;

class Roller {
	#replay: RollerReplay = [];
	#replayCursor: number = 0;
	#scheduleSimulation: ScheduleSimulationCallback;

	constructor(scheduleSimulation: ScheduleSimulationCallback) {
		this.#scheduleSimulation = scheduleSimulation;
	}

	setup(replay: RollerReplay): RollFn {
		this.#replay = replay;
		this.#replayCursor = 0;
		return this.#roll.bind(this);
	}

	public MakeShortcut<T>(die: Die<T>) {
		return () => this.#roll(die);
	}

	#roll<T>(die: Die<T>): DeepReadonly<T> {
		return useDefer((defer) => {
			defer(() => {
				this.#replayCursor++;
			});

			// replay a roll, if available
			// and increment replay cursor
			if (this.#replay.length > this.#replayCursor) {
				const result = this.#replay[this.#replayCursor].value;
				return result as DeepReadonly<T>;
			}

			// otherwise, make new roll
			return this.#newRoll(die);
		});
	}

	/**
	 * Return first side. Schedule all possible alternatives to be simulated.
	 */
	#newRoll<T>(die: Die<T>): DeepReadonly<T> {
		const sidesCopy = die.getSides().concat() as DieSide<T>[];

		const randomId = randomInt(sidesCopy.length);
		const randomSide = sidesCopy.splice(randomId, 1)[0];

		// schedule simulation for all sides except first
		this.#scheduleSimulation(this.#replay, ...sidesCopy);

		// record current roll in history
		this.#replay.push(randomSide);

		// return first side
		return deepReadonly(randomSide.value);
	}
}

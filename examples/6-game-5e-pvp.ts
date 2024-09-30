import { Die, DieHard, RollFn } from 'DieHard';
import { Example } from '../src/Example.ts';
import 'MadCakeUtil/augmentations.ts';

// export { example };

class Creature {
	protected ac: number;
	protected attackDie: Die<number>;
	protected damageDie: Die<number>;
	protected hp: number;
	protected hpMax: number;
	protected readonly roll: RollFn;
	protected toHit: number;
	public readonly initiative: Die<number>;
	public readonly name: string;

	get isDead() {
		return this.hp <= 0;
	}

	takeDamage(amount: number) {
		this.hp = Math.max(this.hp - amount, 0);
	}

	attack(target: Creature) {
		target.getHit(this.attackDie, this.damageDie);
	}

	getHit(attackDie: Die<number>, damageDie: Die<number>) {
		const isHitDie = attackDie.interpret((x) => x >= this.ac);
		const isHit = this.roll(isHitDie);
		if (!isHit) {
			return;
		}
		this.takeDamage(this.roll(damageDie));
	}

	constructor(
		name: string,
		stats: {
			initiative: Die<number>;
			ac: number;
			hp: number;
			toHit: number;
			damage: Die<number>;
		},
		roll: RollFn
	) {
		this.name = name;
		this.initiative = stats.initiative;
		this.ac = stats.ac;
		this.hp = stats.hp;
		this.hpMax = stats.hp;
		this.toHit = stats.toHit;
		this.damageDie = stats.damage;
		this.attackDie = Die.d(20).interpret((x) => x + this.toHit);
		this.roll = roll;
	}
}

class Fighter extends Creature {
	#secondWindDie: Die<number>;
	#secondWindAvailable: boolean = true;

	getHit(attackDie: Die<number>, damageDie: Die<number>) {
		super.getHit(attackDie, damageDie);
		if (this.isDead || !this.#secondWindAvailable) {
			return;
		}

		const secondWindUsageThreshold = {
			missingHp: 5, // use Second Wind if missing 5 hp or more
			maxHpMultiplier: 0.6, // use Second Wind if hp at or below 60%
		};
		if (
			this.hpMax - this.hp >= secondWindUsageThreshold.missingHp ||
			this.hp <= this.hpMax * secondWindUsageThreshold.maxHpMultiplier
		) {
			this.#useSecondwind();
		}
	}

	#useSecondwind() {
		this.#secondWindAvailable = false;
		this.hp = Math.min(this.hpMax, this.roll(this.#secondWindDie));
	}

	constructor(roll: RollFn) {
		const d20 = Die.d(20);
		const d6 = Die.d(6);

		// Fighting Style: Great Weapon Fighting
		// Reroll 1 and 2
		// BUG: roll(d6) evaluated into a single value right here
		const d6gwf = d6.reroll((x) => (x <= 2 ? d6 : Die.one(x)));
		// 2d6r<2[greatsword, two-weapon fighting]+3[strength mod]
		const greatswordDamageDie = Die.reduce(
			[d6gwf, d6gwf],
			(a, b) => a + b
		).interpret((x) => x + 3);

		// d20+2[dexterity mod]
		const initiativeDie = d20.interpret((x) => x + 2);

		super(
			'fighter',
			{
				initiative: initiativeDie,
				ac: 16, // chain mail
				hp: 13,
				toHit: 3,
				damage: greatswordDamageDie,
			},
			roll
		);

		// 1d10+1[fighter level]
		this.#secondWindDie = Die.d(10).interpret((x) => x + 1);

		this.attackDie = Die.reduce([this.attackDie, this.attackDie], (a, b) =>
			Math.max(a, b)
		);
	}
}

class Rogue extends Creature {
	constructor(roll: RollFn) {
		const d20 = Die.d(20);
		const d8 = Die.d(8);
		const d6 = Die.d(6);

		const dex = 3;

		// 1d8[rapier]+1d6[sneak attack]+3[dexterity mod]
		const sneakRapierDamageDie = Die.reduce(
			[d6, d8],
			(a, b) => a + b
		).interpret((x) => x + dex);

		// d20+3[dexterity mod]
		const initiativeDie = d20.interpret((x) => x + dex);

		super(
			'rogue',
			{
				initiative: initiativeDie,
				ac: 12 + dex, // studded leather armor
				hp: 11,
				toHit: dex,
				damage: sneakRapierDamageDie,
			},
			roll
		);

		// Cunnig action: Steady Aim
		// gives advantage
		// 2d20kh1 + 3[dexterity mod]
		this.attackDie = Die.reduce([d20, d20], (a, b) =>
			Math.max(a, b)
		).interpret((x) => x + 3);
	}
}

function run() {
	function simulateGame(roll: RollFn) {
		const fighter = new Fighter(roll);
		const rogue = new Rogue(roll);

		const fighterFirstDie = Die.reduce(
			[fighter.initiative, rogue.initiative],
			(f, r) => {
				if (f == r) {
					// tie
					return -1;
				}
				if (f > r) {
					return 1;
				}
				return 0;
			}
		);

		const fighterFirst = roll(fighterFirstDie);

		if (fighterFirst == -1) {
			return 'initiative tie'; // don't count these situations
		}

		for (let turn = 1; turn <= 8; turn++) {
			const [attacker, defender] =
				(turn + fighterFirst) % 2 == 0
					? [fighter, rogue]
					: [rogue, fighter];
			attacker.attack(defender);
			if (defender.isDead) {
				return `winner: ${attacker.name}`;
			}
		}

		// after fighting for the predeterined maximum number of rounds,
		// both contenders are still alive
		return 'draw';
	}

	const dieHard = new DieHard<string>((a, b) => a.localeCompare(b), 0.8);
	const simulationOutcomes = dieHard.simulate(simulateGame);

	return simulationOutcomes.getSides();
}

const expected = [];

// const example: Example<typeof expected> = {
// 	run,
// 	expected,
// };

console.JSON(run());

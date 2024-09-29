import { DeepReadonly } from 'MadCakeUtil/tsUtil.ts';

export interface Example<T> {
	expected: DeepReadonly<T>;
	run: () => DeepReadonly<T>;
	name: string;
}

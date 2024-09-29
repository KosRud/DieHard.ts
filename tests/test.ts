import { assertEquals } from 'jsr:@std/assert';

import { examples } from './exampleTests.ts';

Deno.test('examples', async (t) => {
	for (const [name, example] of Object.entries(examples)) {
		await t.step(name, () => assertEquals(example.run(), example.expected));
	}
});

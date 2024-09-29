import docopt from 'docopt';

export type { Args };
export { parseArgs };

interface Args {
	'<number>': number;
}

const doc = `
Run diehard.ts exampe

Usage:
  runExample.ts [options] <number>

Options:
  <number>      The number of example file you want to run.
                The name of each example file starts with a number.
`;

function parseArgs() {
	try {
		return docopt(doc) as unknown as Args;
	} catch (e) {
		console.error(e.message);
		Deno.exit();
	}
}

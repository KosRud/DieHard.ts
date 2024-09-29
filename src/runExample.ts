import { parseArgs } from './runExampleOptions.ts';

const args = parseArgs();
const exampleNum = args['<number>'];
const examples = [...Deno.readDirSync('./examples/')].map((file) => file.name);
const regex = new RegExp(`^${exampleNum}`);
const chosenExample = examples.find((fname) => fname.match(regex) != null);

if (!chosenExample) {
	const examplesStr = examples.map((example) => '  ' + example).join('\n');

	console.log(`No example found for this regex: ${regex}

Available examples:
${examplesStr}`);

	Deno.exit();
}

const command = new Deno.Command(`deno`, {
	args: ['run', `./examples/${chosenExample}`],
});
command.spawn();

export function partition<T>(arr: T[], n: number) {
	const parts: T[][] = [];
	for (let i = 0; i <= arr.length - n; i += n) {
		parts.push(arr.slice(i, i + n));
	}
	if (arr.length % n) {
		parts.push(arr.slice(-(arr.length % n)));
	}
	return parts;
}

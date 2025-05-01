export const name = "utils";

class AssertionError extends Error {
	constructor(message: string) {
		super(message);
		// Adding the stack info to error.
		// Inspired by: https://blog.dennisokeeffe.com/blog/2020-08-07-error-tracing-with-sentry-and-es6-classes
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, AssertionError);
		} else {
			this.stack = new Error(message).stack;
		}
		this.name = "AssertionError";
	}
}

/**
 * Use this function to assert things as being true (and provide a nice error message)
 * @param condition to assert true
 * @param message the error message that appears when the condition is not true
 */
export function assert(condition: boolean, message: string): asserts condition {
	if (!condition) {
		throw new AssertionError(message);
	}
};

/**
 * Always returns a value, otherwise throws an error
 */
export const parseFirstEl = <T extends object>(x: T[]) => {
	const y = x[0];
	assert(!!y, "No first element found :(");

	return y;
}

/**
 * Returns first element or null
 */
export const getFirstEl = <T extends object>(x: T[] | null | undefined) => {
	return x?.[0] ?? null;
};
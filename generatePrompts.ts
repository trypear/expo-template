import * as fs from 'fs';
import * as path from 'path';

// Define your base text as a multiline string variable
const baseText = `
You are using a monorepo and dev is running.
You are developing a mobile app and will make changes under apps/mobile-app.
Import using the @acme/x convention and do not change the ts config.

If you ever get stuck with something potentially being undefined, do:
import { assert } from "@acme/utils";

assert(!!value, "value should be defined")

FOLLOW THE STEPS AND CALL new_task WITh THE EXPERT NAMES.
If you ever gets stuck, tell me where you are getting stuck, don't keep trying over and over again
`;// TODO: remove stuck sentence for creator

// Define the file paths to include in the prompt
const filePaths = [
	// DB
	'packages/db/src/schema.ts',
	'packages/db/package.json',
	'packages/db/src/relations.ts',
	// API
	'packages/api/package.json',
	'packages/api/src/root.ts',
	'packages/api/src/router/test.ts',
	'packages/api/src/router/auth.ts',
	// UTILS
	'packages/utils/src/index.ts',
	// MOBILE APP
	'apps/mobile-app/app/_layout.tsx',
	'apps/mobile-app/package.json'
];

/**
 * Generates a system prompt for an AI programming agent by combining text and file contents
 * from specified paths, then saves it to .roo/rules/rules.md
 */
function generateSystemPrompt(): void {
	// Initialize the prompt with the base text
	let finalPrompt = baseText;

	// Process each file path
	for (const relativePath of filePaths) {
		try {
			// Resolve the relative path to an absolute path
			const absolutePath = path.resolve(process.cwd(), relativePath);

			// Check if the file exists
			if (fs.existsSync(absolutePath)) {
				// Read the file content
				const fileContent = fs.readFileSync(absolutePath, 'utf8');

				// Add file path and content to the prompt
				finalPrompt += `## File: ${relativePath}\n\`\`\`\n${fileContent}\n\`\`\`\n\n`;
			} else {
				console.warn(`Warning: File not found at path: ${relativePath}`);
			}
		} catch (error) {
			console.error(`Error processing file ${relativePath}:`, error);
		}
	}

	// Ensure the output directory exists
	const outputDir = path.resolve(process.cwd(), '.roo/rules');
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true });
	}

	// Write the final prompt to the specified location
	const outputPath = path.resolve(outputDir, 'rules.md');
	fs.writeFileSync(outputPath, finalPrompt);

	console.log(`System prompt successfully generated at ${outputPath}`);
}

// Run the script
generateSystemPrompt();
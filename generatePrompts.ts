import * as fs from 'fs';
import * as path from 'path';

// Define your base text as a multiline string variable
const baseText = `
You are using a monorepo and dev is running.
You are developing a mobile app and will make changes under apps/mobile-app.
Import using the @acme/x convention and do not change the ts config.
EXAMPLE MOBILE APP TRPC QUERY:
<code>
import { useQuery } from "@tanstack/react-query";

const { data: projects, isLoading } = useQuery(
	trpc.budget.getProjectSummary.queryOptions({
		projectId,
	}),
);
</code>

EXAMPLE MUTATION:
<code>
import { useMutation } from "@tanstack/react-query";

const updateMutation = useMutation(
	trpc.budget.updateProject.mutationOptions({
	onSuccess: () => {
		void queryClient.invalidateQueries(
			trpc.budget.getProjects.queryOptions(),
		);
		void queryClient.invalidateQueries(
			trpc.budget.getProjectSummary.queryOptions({
				projectId,
			}),
		);
		router.back();
		},
	}),
);

updateMutation.mutate({
	id: projectId,
	data: {
		...data,
		startDate: startDate,
		endDate: endDate,
	},
});
</code>

You MUST INVALIDATE related queries after running a mutation! This will make the dependent content refresh.

When making database queries, use:
<code>
db.select().from(user).innerJoin(account, eqi(account.userId, user.id)).where(eqi(user.id, userIdInput))
</code>
As this throws errors when you might be comparing IDs that will never match.


When you get a request from the user, follow these steps:
- Plan out what you need to do, with requirements
- Start by editing the database schema, adding in all of the tables (CALL new_task AND USE THE database-nerd MODE )
- Add TRPC endpoints
- Edit the mobile app, calling TRPC endpoints
- Make sure you follow my instructions on adding trpc endpoints
- Make sure you you invalidate the right queries
- Generate mock data in the SQL database

When using Drizzle ORM for database operations:
- For string searches, use the 'like' function: like(column, pattern)
- For array operations, use 'inArray': inArray(column, values)
- Import these functions explicitly from '@acme/db'

If you ever get stuck with something potentially being undefined, do:
import { assert } from "@acme/utils";

assert(!!value, "value should be defined")

WHENEVER YOU ARE DOING A DATABASE OPERATION, CALL THE database-nerd TO DO IT IN A new_task!
`;

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
import {
	boolean,
	BuilderConfig,
	Command,
	command,
	getCommandNameWithParents,
	number,
	positional,
	run,
	string,
} from '@drizzle-team/brocli';

const getOptionTypeText = (option: BuilderConfig) => {
	let result = '';

	switch (option.type) {
		case 'boolean':
			result = '';
			break;
		case 'number': {
			if ((option.minVal ?? option.maxVal) !== undefined) {
				let text = '';

				if (option.isInt) text = text + `integer `;

				if (option.minVal !== undefined) text = text + `[${option.minVal};`;
				else text = text + `(∞;`;

				if (option.maxVal !== undefined) text = text + `${option.maxVal}]`;
				else text = text + `∞)`;

				result = text;
				break;
			}

			if (option.isInt) {
				result = 'integer';
				break;
			}

			result = 'number';
			break;
		}
		case 'string': {
			if (option.enumVals) {
				result = '[ ' + option.enumVals.join(' | ') + ' ]';
				break;
			}

			result = 'string';
			break;
		}
		case 'positional': {
			result = `${option.isRequired ? '<' : '['}${option.enumVals ? option.enumVals.join('|') : option.name}${
				option.isRequired ? '>' : ']'
			}`;
			break;
		}
	}

	if (option.isRequired && option.type !== 'positional') result = '!' + result.length ? ' ' : '' + result;
	return result;
};

const globalFlags = {
	createTicket: boolean('create-ticket').desc('create a support ticket for any CLI error'),
	debug: boolean().desc('output debug logs to stderr'),
	dnsResolver: string('dns-resolver').enum('native', 'https'),
	experimental: boolean().desc('enable experimental features'),
	netId: string('network-id').desc('use the specified docker network instead of a generated one'),
	workdir: string().desc('path to a Supabase project directory'),
};

const mockHandler = (opts: any) => {
	console.log('Command received options:');
	console.log(opts);
};

const commands: Command[] = [];

commands.push(command({
	name: 'bootstrap',
	shortDesc: 'Bootstrap a Supabase project from a starter template',
	options: {
		...globalFlags,
		password: string().alias('p').desc('Password to your remote Postgres database.'),
	},
	handler: mockHandler,
	metadata: {
		category: 'Quick Start',
	},
}));

commands.push(command({
	name: 'db',
	shortDesc: 'Manage Postgres databases',
	subcommands: [
		command({
			name: 'diff',
			shortDesc: 'Diffs the local database for schema changes',
			options: {
				...globalFlags,
				dbUrl: string('db-url').desc(
					'Diffs against the database specified by the connection string (must be percent-encoded).',
				),
				file: string().alias('f').desc('Saves schema diff to a new migration file.'),
				linked: boolean().desc('Diffs local migration files against the linked project.'),
				local: boolean().desc('Diffs local migration files against the local database.').default(true),
				schema: string('schema').alias('s').desc('Comma separated list of schema to include.'), // strings again
				useMigra: boolean('use-migra').desc('Use migra to generate schema diff.').default(true),
				usePgSchema: boolean('use-pg-schema').desc('Use pg-schema-diff to generate schema diff.'),
				usePgAdmin: boolean('use-pgadmin').desc('Use pgAdmin to generate schema diff.'),
			},
			handler: mockHandler,
		}),
		command({
			name: 'dump',
			shortDesc: 'Dumps data or schemas from the remote database',
			options: {
				...globalFlags,
				dataOnly: boolean('data-only').desc('Dumps only data records.'),
				dbUrl: string('db-url').desc(
					'Dumps from the database specified by the connection string (must be percent-encoded).',
				),
				dryRun: boolean('dry-run').desc('Prints the pg_dump script that would be executed.'),
				exclude: string().alias('x').desc('List of schema.tables to exclude from data-only dump.'), // strings
				file: string().alias('f').desc('File path to save the dumped contents.'),
				keepComments: boolean('keep-comments').desc('Keeps commented lines for pg_dump output.'),
				linked: boolean().desc('Dumps from the linked project.').default(true),
				local: boolean().desc('Dumps from the local database.'),
				password: string().alias('p').desc('Password to your remote Postgres database.'),
				roleOnly: string('role-only').desc('Dumps only cluster roles.'),
				schema: string().alias('s').desc('Comma separated list of schema to include'),
				useCopy: boolean('use-copy').desc('Uses copy statemetns in place of inserts.'),
			},
			handler: mockHandler,
		}),
		command({
			name: 'lint',
			shortDesc: 'Checks local database for typing error',
			options: {
				...globalFlags,
				dbUrl: string('db-url').desc(
					'Lints the database specified by the connection string (myst be percent-encoded).',
				),
				level: string().enum('warning', 'error').desc('Error level to emit.').default('warning'),
				local: boolean().desc('Lints the local database for schema errors.').default(true),
				schema: string().alias('s').desc('Comma separated list of schema to include.'), // strings
			},
			handler: mockHandler,
		}),
		command({
			name: 'pull',
			shortDesc: 'Pull schema from the remote database',
			options: {
				...globalFlags,
				dbUrl: string('db-url').desc(
					'Pulls from the database specified by the connection string (must be percent-encoded).',
				),
				likned: boolean().desc('Pulls from the linked project.').default(true),
				local: boolean().desc('Pulls from the local database.'),
				password: string().alias('p').desc('Password to your remote Postgres database.'),
				schema: string().alias('s').desc('Comma separated list of schema to include.'),
			},
			handler: mockHandler,
		}),
		command({
			name: 'push',
			shortDesc: 'Push new migrations to the remote database',
			options: {
				...globalFlags,
				dbUrl: string('db-url').desc(
					'Pushes to the database specified by the connection string (must be percent-encoded).',
				),
				dryRun: boolean('dry-run').desc("Pint the migrations that would be applied, but don't actually apply them."),
				includeAll: boolean('include-all').desc('Include all migrations not found on remote history table.'),
				includeRoles: boolean('include-roles').desc('Include custom roles from supabase/roles.sql.'),
				includeSeed: boolean('include-seed').desc('Include seed data from supabase/seed.sql.'),
				likned: boolean().desc('Pushes to the linked project.').default(true),
				local: boolean().desc('Pushes to the local database.'),
				password: string().alias('p').desc('Password to your remote Postgres database.'),
			},
			handler: mockHandler,
		}),
		command({
			name: 'reset',
			shortDesc: 'Resets the local database to current migrations',
			options: {
				...globalFlags,
				dbUrl: string('db-url').desc(
					'Resets the database specified by the connection string (must be percent-encoded).',
				),
				linked: boolean().desc('Resets the linked project with local migrations.'),
				local: boolean().desc('Resets the local database with local migrations.').default(true),
				ver: boolean().desc('Reset up to the specified version.'),
			},
			handler: mockHandler,
		}),
		command({
			name: 'start',
			shortDesc: 'Starts local Postgres database',
			options: globalFlags,
			handler: mockHandler,
		}),
	],
	metadata: {
		category: 'Local Development',
	},
}));

commands.push(
	command({
		name: 'gen',
		shortDesc: 'Run code generation tools',
		subcommands: [
			command({
				name: 'keys',
				shortDesc: 'Generate keys for preview branch',
				options: {
					...globalFlags,
					output: string().alias('o').enum('env', 'json', 'toml', 'yaml').desc('Output format of key variables.')
						.default('env'),
					override: string('override-name').desc('Override specific variable names.'), // strings
					projectRef: string('project-ref').desc('Project ref of the Supabase project.'),
				},
				handler: mockHandler,
			}),
			command({
				name: 'types',
				shortDesc: 'Generate types from Postgres schema',
				subcommands: [
					command({
						name: 'typecsript',
						shortDesc: 'Generate types for TypeScript',
						options: {
							...globalFlags,
							dbUrl: string('db-url').desc('Generate types from a database url.'),
							linked: boolean().desc('Generate types from the linked project'),
							local: boolean().desc('Generate types from the local dev database'),
							pgV9Compat: boolean('postgres-v9-compat').desc(
								'Generate types compatible with PostgREST v9 and below. Only use together with --db-url.',
							),
							projectId: string('project-id').desc('Generate types from a project ID.'),
							schema: string().alias('s').desc('Comma separated list of schema to include.'),
						},
						handler: mockHandler,
						metadata: {
							examples: [
								`supabase gen types typescript --local`,
								`supabase gen types typescript --linked`,
								`supabase gen types typescript --project-id abc-def-123 --schema public --schema private`,
								`supabase gen types typescript --db-url 'postgresql://...' --schema public --schema auth`,
							],
						},
					}),
				],
			}),
		],
		metadata: {
			category: 'Local Development',
		},
	}),
);

commands.push(command({
	name: 'init',
	shortDesc: 'Initialize a local project',
	options: {
		...globalFlags,
		force: boolean().desc('Overwrite existing supabase/config.toml.'),
		oriole: boolean('use-orioledb').desc('Use OrioleDB storage engine for Postgres.'),
		intellij: boolean('with-intellij-settings').desc('Generate IntelliJ IDEA settings for Deno.'),
		vscode: boolean('with-vscode-settings').desc('Generate VS Code settings for Deno.'),
	},
	handler: mockHandler,
	metadata: {
		category: 'Local Development',
	},
}));

const inspectFlags = {
	...globalFlags,
	dbUrl: string('db-url').desc('Inspect the database specified by the connection string (must be percent-encoded).'),
	linked: boolean().desc('Inspect the linked project.').default(true),
	local: boolean().desc('Inspect the local database.'),
};

commands.push(command({
	name: 'inspect',
	shortDesc: 'Tools to inspect your Supabase project',
	subcommands: [
		command({
			name: 'db',
			desc: 'Tools to inspect your Supabase database',
			subcommands: [
				command({
					name: 'bloat',
					desc: 'Estimates space allocated to a relation that is full of dead tuples',
					options: inspectFlags,
					handler: mockHandler,
				}),
				command({
					name: 'blocking',
					desc: 'Show queries that are holding locks and the queries that are waiting for them to be released',
					options: inspectFlags,
					handler: mockHandler,
				}),
				command({
					name: 'cache-hit',
					desc: 'Show cache hit rates for tables and indices',
					options: inspectFlags,
					handler: mockHandler,
				}),
				command({
					name: 'calls',
					desc: 'Show queries from pg_stat_statements ordered by total times called',
					options: inspectFlags,
					handler: mockHandler,
				}),
				command({
					name: 'index-sizes',
					desc: 'Show index sizes of individual indexes',
					options: inspectFlags,
					handler: mockHandler,
				}),
				command({
					name: 'index-usage',
					desc: 'Show information about the efficiency of indexes',
					options: inspectFlags,
					handler: mockHandler,
				}),
				command({
					name: 'locks',
					desc: 'Show queries which have taken out an exclusive lock on a relation',
					options: inspectFlags,
					handler: mockHandler,
				}),
				command({
					name: 'long-running-queries',
					desc: 'Show currently running queries running for longer than 5 minutes',
					options: inspectFlags,
					handler: mockHandler,
				}),
				command({
					name: 'outliers',
					desc: 'Show queries from pg_stat_statements ordered by total execution time',
					options: inspectFlags,
					handler: mockHandler,
				}),
				command({
					name: 'replication-slots',
					desc: 'Show information about replication slots on the database',
					options: inspectFlags,
					handler: mockHandler,
				}),
				command({
					name: 'role-connections',
					desc: 'Show number of active connections for all database roles',
					options: inspectFlags,
					handler: mockHandler,
				}),
				command({
					name: 'seq-scans',
					desc: 'Show number of sequential scans recorded against all tables',
					options: inspectFlags,
					handler: mockHandler,
				}),
				command({
					name: 'table-index-sizes',
					desc: 'Show index sizes of individual tables',
					options: inspectFlags,
					handler: mockHandler,
				}),
				command({
					name: 'table-record-counts',
					desc: 'Show estimated number of rows per table',
					options: inspectFlags,
					handler: mockHandler,
				}),
				command({
					name: 'table-sizes',
					desc: 'Show table sizes of individual tables without their index sizes',
					options: inspectFlags,
					handler: mockHandler,
				}),
				command({
					name: 'total-index-sizes',
					desc: 'Show total size of all indexes',
					options: inspectFlags,
					handler: mockHandler,
				}),
				command({
					name: 'total-table-sizes',
					desc: 'Show total table sizes, including table index sizes',
					options: inspectFlags,
					handler: mockHandler,
				}),
				command({
					name: 'unused-indexes',
					desc: 'Show indexes with low usage',
					options: inspectFlags,
					handler: mockHandler,
				}),
				command({
					name: 'vacuum-stats',
					desc: 'Show statistics related to vacuum operations per table',
					options: inspectFlags,
					handler: mockHandler,
				}),
			],
		}),
		command({
			name: 'report',
			desc: 'Generate a CSV output for all inspect commands',
			options: { ...inspectFlags, outdir: string('output-dir').desc('Path to save CSV files in') },
			handler: mockHandler,
		}),
	],
	metadata: {
		category: 'Local Development',
	},
}));

commands.push(command({
	name: 'link',
	shortDesc: 'Link to a Supabase project',
	options: {
		...globalFlags,
		password: string().alias('p').desc('Password to your remote Postgres database.'),
		projectRef: string('project-ref').desc('Project ref of the Supabase project.'),
	},
	handler: mockHandler,
	metadata: {
		category: 'Local Development',
	},
}));

commands.push(command({
	name: 'login',
	shortDesc: 'Authenticate using an access token',
	options: {
		...globalFlags,
		name: string().desc('Name that will be used to store token in your settings').default(
			'built-in token name generator',
		),
		noBrowser: boolean('no-browser').desc('Do not open browser automatically'),
		token: string().desc('Use provided token instead of automatic login flow'),
	},
	handler: mockHandler,
	metadata: {
		category: 'Local Development',
	},
}));

commands.push(command({
	name: 'logout',
	shortDesc: 'Log out and delete access tokens locally',
	options: globalFlags,
	handler: mockHandler,
	metadata: {
		category: 'Local Development',
	},
}));

commands.push(command({
	aliases: ['migration', 'migrations'],
	shortDesc: 'Manage database migration scripts',
	subcommands: [
		command({
			name: 'fetch',
			desc: 'Fetch migration files from history table',
			options: {
				...globalFlags,
				dbUrl: string('db-url').desc(
					'Fetches migrations from the database specified by the connection string (must be percent-encoded).',
				),
				linked: boolean().desc('Fetches migration history from the linked project.').default(true),
				local: boolean().desc('Fetches migration history from the local database.'),
			},
			handler: mockHandler,
		}),
		command({
			name: 'list',
			desc: 'List local and remote migrations',
			options: {
				...globalFlags,
				dbUrl: string('db-url').desc(
					'Lists migrations of the database specified by the connection string (must be percent-encoded).',
				),
				linked: boolean().desc('Lists migrations applied to the linked project.').default(true),
				local: boolean().desc('Lists migrations applied to the local database.'),
				password: string().alias('p').desc('Password to your remote Postgres database.'),
			},
			handler: mockHandler,
		}),
		command({
			name: 'new',
			desc: 'Create an empty migration script',
			options: {
				...globalFlags,
				migrationName: positional('migration name').required(),
			},
			handler: mockHandler,
		}),
		command({
			name: 'repair',
			desc: 'Repair the migrations to a single file',
			options: {
				...globalFlags,
				dbUrl: string('db-url').desc(
					'Repairs migrations of the database specified by the connection string (must be percent-encoded).',
				),
				linked: boolean().desc('Repairs the migration history of the linked project.').default(true),
				local: boolean().desc('Repairs the migration history of the local database.'),
				password: string().alias('p').desc('Password to your remote Postgres database.'),
				status: string().enum('applied', 'reverted'),
			},
			handler: mockHandler,
		}),
		command({
			name: 'squash',
			desc: 'Squash migrations to a single file',
			options: {
				...globalFlags,
				dbUrl: string('db-url').desc(
					'Squashes migrations of the database specified by the connection string (must be percent-encoded).',
				),
				linked: boolean().desc('Squashes the migration history of the linked project.'),
				local: boolean().desc('Squashes the migration history of the local database.').default(true),
				password: string().alias('p').desc('Password to your remote Postgres database.'),
				version: string('ver').desc('Squash up to the specified version.'),
			},
			handler: mockHandler,
		}),
		command({
			name: 'up',
			desc: 'Apply pending migrations to local database',
			options: {
				...globalFlags,
				dbUrl: string('db-url').desc(
					'Applies migrations to the database specified by the connection string (must be percent-encoded).',
				),
				includeAll: boolean('include-all').desc('Include all migrations not found on remote history table.'),
				linked: boolean().desc('Applies pending migrations to the linked project.'),
				local: boolean().desc('Applies pending migrations to the local database.').default(true),
			},
			handler: mockHandler,
		}),
	],
	metadata: {
		category: 'Local Development',
	},
}));

commands.push(command({
	name: 'start',
	shortDesc: 'Start containers for Supabase local development',
	options: {
		...globalFlags,
		exclude: string().alias('x').desc('Names of containers to not start.'), // strings
		ignoreHealthCheck: boolean('ignore-health-check').desc('Ignore unhealthy services and exit 0'),
	},
	handler: mockHandler,
	metadata: {
		category: 'Local Development',
	},
}));

commands.push(command({
	name: 'status',
	shortDesc: 'Show status of local Supabase containers',
	options: {
		...globalFlags,
		output: string().alias('o').enum('env', 'pretty', 'json', 'toml', 'yaml').desc('Output format of status variables.')
			.default('pretty'),
		overrideName: string('override-name'),
	},
	handler: mockHandler,
	metadata: {
		category: 'Local Development',
	},
}));

commands.push(command({
	name: 'stop',
	shortDesc: 'Stop all local Supabase containers',
	options: {
		...globalFlags,
		noBackup: boolean('no-backup').desc('Deletes all data volumes after stopping.'),
		projectId: string('project-id').desc('Local project ID to stop.'),
	},
	handler: mockHandler,
	metadata: {
		category: 'Local Development',
	},
}));

commands.push(command({
	name: 'test',
	shortDesc: 'Run tests on local Supabase containers',
	subcommands: [
		command({
			name: 'db',
			desc: 'Tests local database with pgTAP',
			options: {
				...globalFlags,
				dbUrl: string('db-url').desc(
					'Tests the database specified by the connection string (must be percent-encoded).',
				),
				linked: boolean().desc('Runs pgTAP tests on the linked project.'),
				local: boolean().desc('Runs pgTAP tests on the local database.').default(true),
			},
			handler: mockHandler,
		}),
		command({
			name: 'new',
			desc: 'Create a new test file',
			options: {
				...globalFlags,
				template: string().alias('t').enum('pgtap').desc('Template framework to generate').default('pgtap'),
			},
			handler: mockHandler,
		}),
	],
	metadata: {
		category: 'Local Development',
	},
}));

commands.push(command({
	name: 'unlink',
	shortDesc: 'Unlink a Supabase project',
	options: globalFlags,
	handler: mockHandler,
	metadata: {
		category: 'Local Development',
	},
}));

const globalsWithRef = {
	...globalFlags,
	projectRef: string('project-ref').desc('Project ref of the Supabase project.'),
};

commands.push(command({
	name: 'branches',
	shortDesc: 'Manage Supabase preview branches',
	subcommands: [
		command({
			name: 'create',
			desc: 'Create a preview branch',
			options: {
				...globalsWithRef,
				region: string().desc('Select a region to deploy the branch database.'),
				name: positional(),
			},
			handler: mockHandler,
		}),
		command({
			name: 'delete',
			desc: 'Delete a preview branch',
			options: {
				...globalsWithRef,
				branchId: positional('branch-id'),
			},
			handler: mockHandler,
		}),
		command({
			name: 'disable',
			desc: 'Disable a preview branch',
			options: globalsWithRef,
			handler: mockHandler,
		}),
		command({
			name: 'get',
			desc: 'Retrieve details of a preview branch',
			options: {
				...globalsWithRef,
				branchId: positional('branch-id'),
			},
			handler: mockHandler,
		}),
		command({
			name: 'list',
			desc: 'List all preview branches',
			options: globalsWithRef,
			handler: mockHandler,
		}),
		command({
			name: 'update',
			desc: 'Update a preview branch',
			options: {
				...globalsWithRef,
				branchId: positional('branch-id'),
				gitBranch: string('git-branch').desc('Change the associated git branch.'),
				name: string().desc('Rename the preview branch.'),
				resetOnPush: boolean('reset-on-push').desc('Reset the preview branch on git push.'),
			},
			handler: mockHandler,
		}),
	],
	metadata: {
		category: 'Management APIs',
	},
}));

const domainsFlags = {
	...globalsWithRef,
	includeRawOutput: boolean('include-raw-output').desc('Include raw output (useful for debugging).'),
};

commands.push(command({
	name: 'domains',
	shortDesc: 'Manage custom domain names for Supabase projects',
	desc: `Manage custom domain names for Supabase projects.\n
Use of custom domains and vanity subdomains is mutually exclusive.`,
	subcommands: [
		command({
			name: 'activate',
			shortDesc: 'Activate the custom hostname for a project',
			desc: `Activates the custom hostname configuration for a project.\n
This reconfigures your Supabase project to respond to requests on your custom hostname.
After the custom hostname is activated, your project's auth services will no longer function on the Supabase-provisioned subdomain.`,
			options: domainsFlags,
			handler: mockHandler,
		}),
		command({
			name: 'create',
			shortDesc: 'Create a custom hostname',
			desc: `Create a custom hostname for your Supabase project.\n
Expects your custom hostname to have a CNAME record to your Supabase project's subdomain.`,
			options: {
				...domainsFlags,
				customHostname: string('custom-hostname').desc('The custom hostname to use for your Supabase project.'),
			},
			handler: mockHandler,
		}),
		command({
			name: 'delete',
			shortDesc: 'Deletes the custom hostname config for your project',
			options: domainsFlags,
			handler: mockHandler,
		}),
		command({
			name: 'get',
			shortDesc: 'Get the current custom hostname config',
			desc: 'Retrieve the custom hostname config for your project, as stored in the Supabase platform.',
			options: domainsFlags,
			handler: mockHandler,
		}),
		command({
			name: 'reverify',
			shortDesc: 'Re-verify the custom hostname config for your project',
			options: domainsFlags,
			handler: mockHandler,
		}),
	],
	metadata: {
		category: 'Management APIs',
	},
}));

commands.push(command({
	name: 'encryption',
	shortDesc: 'Manage encryption keys of Supabase projects',
	subcommands: [
		command({
			name: 'get-root-key',
			shortDesc: 'Get the root encryption key of a Supabase project',
			options: globalsWithRef,
			handler: mockHandler,
		}),
		command({
			name: 'update-root-key',
			shortDesc: 'Update root encryption key of a Supabase project',
			options: globalsWithRef,
			handler: mockHandler,
		}),
	],
	metadata: {
		category: 'Management APIs',
	},
}));

commands.push(command({
	name: 'functions',
	shortDesc: 'Manage Supabase Edge functions',
	subcommands: [
		command({
			name: 'delete',
			shortDesc: 'Delete a Function from Supabase',
			desc: 'Delete a Function from the linked Supabase project. This does NOT remove the Function locally.',
			options: {
				...globalFlags,
				projectRef: string('project-ref').desc('Project ref of the Supabase project.'),
				functionName: positional('Function name'),
			},
			handler: mockHandler,
		}),
		command({
			name: 'deploy',
			shortDesc: 'Deploy a Function to Supabase',
			options: {
				...globalFlags,
				projectRef: string('project-ref').desc('Project ref of the Supabase project.'),
				importMap: string('import-map').desc('Path to import map file.'),
				noVerifyJWT: boolean('no-verify-jwt').desc('Disable JWT verification for the Function.'),
				functionName: positional('Function name'),
			},
			handler: mockHandler,
		}),
		command({
			name: 'download',
			shortDesc: 'Download a Function from Supabase',
			options: {
				...globalFlags,
				projectRef: string('project-ref').desc('Project ref of the Supabase project.'),
				legacyBundle: boolean().desc('Use legacy bundling mechanism.'),
				functionName: positional('Function name').required(),
			},
			handler: mockHandler,
		}),
		command({
			name: 'list',
			shortDesc: 'List all Functions in Supabase',
			options: {
				...globalFlags,
				projectRef: string('project-ref').desc('Project ref of the Supabase project.'),
			},
			handler: mockHandler,
		}),
		command({
			name: 'new',
			shortDesc: 'Create a new Function locally',
			options: {
				...globalFlags,
				functionName: positional('Function name').required(),
			},
			handler: mockHandler,
		}),
		command({
			name: 'serve',
			shortDesc: 'Serve all Functions locally',
			options: {
				...globalFlags,
				envFile: string('env-file').desc('Path to an env file to be populated to the Function environment.'),
				importMap: string('import-map').desc('Path to import map file.'),
				inspect: boolean().desc('Alias of --inspect-mode brk.'),
				inspectMain: boolean('Allow inspectiong the main worker.'),
				inspectMode: string('inspect-mode').enum('run', 'brk', 'wait').desc(
					'Activate inspector capability for debugging.',
				),
				noVerifyJWT: boolean('no-verify-jwt').desc('Disable JWT verification for the Function.'),
			},
			handler: mockHandler,
		}),
	],
	metadata: {
		category: 'Management APIs',
	},
}));

commands.push({
	name: 'network-bans',
	shortDesc: 'Manage network bans',
	subcommands: [
		command({
			name: 'get',
			shortDesc: 'Get the current network bans',
			options: globalsWithRef,
			handler: mockHandler,
		}),
		command({
			name: 'remove',
			shortDesc: 'Remove a network ban',
			options: {
				...globalsWithRef,
				dbUnbanIp: string('db-unban-ip').desc('IP to allow DB connections from.'), // strings
			},
			handler: mockHandler,
		}),
	],
	metadata: {
		category: 'Management APIs',
	},
});

commands.push({
	name: 'network-restrictions',
	shortDesc: 'Manage network restrictions',
	subcommands: [
		command({
			name: 'get',
			shortDesc: 'Get the current network restrictions',
			options: globalsWithRef,
			handler: mockHandler,
		}),
		command({
			name: 'update',
			shortDesc: 'Update network restrictions',
			options: {
				...globalsWithRef,
				bypassCidrChecks: boolean('bypass-cidr-checks').desc('Bypass some of the CIDR validation checks.'),
				dbAllowCidr: string('db-allow-cidr').desc('CIDR to allow DB connections from.'), // strings
			},
			handler: mockHandler,
		}),
	],
	metadata: {
		category: 'Management APIs',
	},
});

commands.push({
	name: 'orgs',
	shortDesc: 'Manage Supabase organizations',
	subcommands: [
		command({
			name: 'create',
			shortDesc: 'Create an organization',
			desc: 'Create an organization for the logged-in user.',
			options: globalFlags,
			handler: mockHandler,
		}),
		command({
			name: 'list',
			shortDesc: 'List all organizations',
			desc: 'List all organizations the logged-in user belongs.',
			options: globalFlags,
			handler: mockHandler,
		}),
	],
	metadata: {
		category: 'Management APIs',
	},
});

commands.push({
	name: 'postgres-config',
	shortDesc: 'Manage Postgres database config',
	subcommands: [
		command({
			name: 'get',
			shortDesc: 'Get the current Postgres database config overrides',
			options: globalsWithRef,
			handler: mockHandler,
		}),
		command({
			name: 'update',
			shortDesc: 'Update Postgres database config',
			options: {
				...globalsWithRef,
				replaceExistingOverrides: boolean('replace-existing-overrides').desc(
					'If true, replaces all existing overrides with the ones provided. If false, merges existing overrides with the ones provided.',
				).default(false),
			},
			handler: mockHandler,
		}),
	],
	metadata: {
		category: 'Management APIs',
	},
});

commands.push({
	name: 'projects',
	shortDesc: 'Manage Supabase projects',
	subcommands: [
		command({
			name: 'api-keys',
			shortDesc: 'List all API keys for a Supabase project',
			options: globalsWithRef,
			handler: mockHandler,
		}),
		command({
			name: 'create',
			shortDesc: 'Create a project on Supabase',
			options: {
				...globalsWithRef,
				projectName: positional('project name'),
				dbPassword: string('db-password').desc('Database password of the project.'),
				orgId: string('org-id').desc('Organization ID to create the project in.'),
				region: string().desc('Select a region close to you for the best performance.'),
			},
			handler: mockHandler,
		}),
		command({
			name: 'delete',
			shortDesc: 'Delete a Supabase project',
			options: {
				...globalFlags,
				ref: positional().required(),
			},
			handler: mockHandler,
		}),
		command({
			name: 'list',
			shortDesc: 'List all Supabase projects',
			options: globalFlags,
			handler: mockHandler,
		}),
	],
	metadata: {
		category: 'Management APIs',
	},
});

commands.push(command({
	name: 'secrets',
	shortDesc: 'Manage Supabase secrets',
	subcommands: [
		command({
			name: 'list',
			desc: 'List all secrets on Supabase',
			options: globalsWithRef,
			handler: mockHandler,
		}),
		command({
			name: 'set',
			desc: 'Set a secret(s) on Supabase',
			options: {
				...globalsWithRef,
				secret: positional('NAME=VALUE').required(), // Have to make it an array...
				envFile: string('env-file').desc('Read secrets from a .env file.'),
			},
			handler: mockHandler,
		}),
		command({
			name: 'unset',
			desc: 'Unset a secret(s) on Supabase',
			options: {
				...globalsWithRef,
				name: positional('NAME'),
			},
			handler: mockHandler,
		}),
	],
	metadata: {
		category: 'Management APIs',
	},
}));

commands.push(command({
	name: 'services',
	shortDesc: 'Show versions of all Supabase services',
	options: globalFlags,
	handler: mockHandler,
	metadata: {
		category: 'Management APIs',
	},
}));

commands.push(command({
	name: 'snippets',
	shortDesc: 'Manage Supabase SQL snippets',
	subcommands: [
		command({
			name: 'download',
			shortDesc: 'Download contents of a SQL snippet',
			options: {
				...globalFlags,
				snippetId: positional('snippet-id').required(),
			},
			handler: mockHandler,
		}),
		command({
			name: 'list',
			shortDesc: 'List all SQL snippets',
			options: globalFlags,
			handler: mockHandler,
		}),
	],
	metadata: {
		category: 'Management APIs',
	},
}));

commands.push(command({
	name: 'ssl-enforcement',
	shortDesc: 'Manage SSL enforcement configuration',
	subcommands: [
		command({
			name: 'get',
			shortDesc: 'Get the current SSL enforcement configuration',
			options: globalsWithRef,
			handler: mockHandler,
		}),
		command({
			name: 'update',
			shortDesc: 'Update SSL enforcement configuration',
			options: {
				...globalsWithRef,
				set: boolean('set-db-ssl-enforcement').required().desc( // No need for two separate flags, BroCLI can do --flag false
					'Whether the DB should enable (true) or disable (false) SSL enforcement for all external connections.',
				),
			},
			handler: mockHandler,
		}),
	],
	metadata: {
		category: 'Management APIs',
	},
}));

const ssoFlags = {
	...globalsWithRef,
	output: string().alias('o').enum('pretty', 'json', 'toml', 'yaml').default('pretty'),
};

commands.push({
	name: 'sso',
	shortDesc: 'Manage Single Sign-On (SSO) authentication for projects',
	subcommands: [
		command({
			name: 'add',
			shortDesc: 'Add a new SSO identity provider',
			desc: 'Add and configure a new connection to a SSO identity provider to your Supabase project.',
			options: {
				...ssoFlags,
				attributeMappingFile: string('attribute-mapping-file').desc(
					'File containing a JSON mapping between SAML attributes to custom JWT claims.',
				),
				domains: string().desc('Comma separated list of email domains to associate with the added identity provider.'), // strings
				metadataFile: string('metadata-file').desc(
					'File containing a SAML 2.0 Metadata XML document describing the identity provider.',
				),
				metadataUrl: string('metadata-url').desc(
					'URL pointing to a SAML 2.0 Metadata XML document describing the identity provider.',
				),
				skipUrlValidation: boolean('skip-url-validation').desc(
					'Whether local validation of the SAML 2.0 Metadata URL should not be performed.',
				),
				type: string().alias('t').enum('saml').desc('Type of identity provider (according to supported protocol).'),
			},
			handler: mockHandler,
		}),
		command({
			name: 'info',
			shortDesc: 'Returns the SAML SSO settings required for the identity provider',
			desc:
				'Returns all of the important SSO information necessary for your project to be registered with a SAML 2.0 compatible identity provider.',
			options: ssoFlags,
			handler: mockHandler,
		}),
		command({
			name: 'list',
			shortDesc: 'List all SSO identity providers for a project',
			desc: 'List all connections to a SSO identity provider to your Supabase project.',
			options: ssoFlags,
			handler: mockHandler,
		}),
		command({
			name: 'remove',
			shortDesc: 'Remove an existing SSO identity provider',
			desc:
				'Remove a connection to an already added SSO identity provider. Removing the provider will prevent existing users from logging in. Please treat this command with care.',
			options: {
				...ssoFlags,
				providerId: positional('provider-id').required(),
			},
			handler: mockHandler,
		}),
		command({
			name: 'show',
			shortDesc: 'Show information about an SSO identity provider',
			desc:
				`Provides the information about an established connection to an identity provider.\nYou can use --metadata to obtain the raw SAML 2.0 Metadata XML document stored in your project's configuration.`,
			options: {
				...ssoFlags,
				providerId: positional('provider-id').required(),
				metadata: boolean().desc('Show SAML 2.0 XML Metadata only'),
			},
			handler: mockHandler,
		}),
		command({
			name: 'update',
			shortDesc: 'Update information about an SSO identity provider',
			desc: 'Update the configuration settings of a already added SSO identity provider.',
			options: {
				...ssoFlags,
				providerId: positional('provider-id').required(),
				addDomains: string('add-domains').desc(
					'Add this comma separated list of email domains to the identity provider.',
				), // strings
				attributeMappingFile: string('attribute-mapping-file').desc(
					'File containing a JSON mapping between SAML attributes to custom JWT claims.',
				),
				domains: string().desc('Comma separated list of email domains to associate with the added identity provider.'), // strings
				metadataFile: string('metadata-file').desc(
					'File containing a SAML 2.0 Metadata XML document describing the identity provider.',
				),
				metadataUrl: string('metadata-url').desc(
					'URL pointing to a SAML 2.0 Metadata XML document describing the identity provider.',
				),
				removeDomains: string().desc('Remove this comma separated list of email domains from the identity provider.'), // strings
				skipUrlValidation: boolean('skip-url-validation').desc(
					'Whether local validation of the SAML 2.0 Metadata URL should not be performed.',
				),
			},
			handler: mockHandler,
		}),
	],
	metadata: {
		category: 'Management APIs',
	},
});

const storageFlags = {
	...globalFlags,
	linked: boolean().desc('Connects to Storage API of the linked project.').default(true),
	local: boolean().desc('Connects to Storage API of the local database.'),
};

commands.push(command({
	name: 'storage',
	shortDesc: 'Manage Supabase Storage objects',
	subcommands: [
		command({
			name: 'cp',
			shortDesc: 'Copy objects from src to dst path',
			options: {
				...storageFlags,
				src: positional().required(),
				dst: positional().required(),
				cacheControl: string('cache-control').desc('Custom Cache-Control header for HTTP upload.').default(
					'max-age=3600',
				),
				contentType: string('content-type').desc('Custom Content-Type header for HTTP upload.').default('auto-detect'),
				jobs: number().alias('j').int().min(1).desc('Maximum number of parallel jobs.').default(1),
				recursive: boolean().alias('r').desc('Recursively copy a directory.'),
			},
			handler: mockHandler,
		}),
		command({
			name: 'ls',
			shortDesc: 'List objects by path prefix',
			options: {
				...storageFlags,
				recursive: boolean().alias('r').desc('Recursively list a directory.'),
			},
			handler: mockHandler,
		}),
		command({
			name: 'mv',
			shortDesc: 'Move objects from src to dst path',
			options: {
				...storageFlags,
				file: positional().required(),
				recursive: boolean().alias('r').desc('Recursively move a directory.'),
			},
			handler: mockHandler,
		}),
		command({
			name: 'rm',
			shortDesc: 'Remove objects by file path',
			options: {
				...storageFlags,
				file: positional().required(),
				recursive: boolean().alias('r').desc('Recursively remove a directory.'),
			},
			handler: mockHandler,
		}),
	],
	metadata: {
		category: 'Management APIs',
	},
}));

commands.push(command({
	name: 'vanity-subdomains',
	shortDesc: 'Manage vanity subdomains for Supabase projects',
	desc: `Manage vanity subdomains for Supabase projects.\n
Usage of vanity subdomains and custom domains is mutually exclusive.`,
	subcommands: [
		command({
			name: 'activate',
			shortDesc: 'Activate a vanity subdomain',
			desc: `Activate a vanity subdomain for your Supabase project.\n
This reconfigures your Supabase project to respond to requests on your vanity subdomain.
After the vanity subdomain is activated, your project's auth services will no longer function on the {project-ref}.{supabase-domain} hostname.`,
			options: {
				...globalsWithRef,
				desiredSubdomain: string('desired-subdomain').desc(
					'The desired vanity subdomain to use for your Supabase project.',
				),
			},
			handler: mockHandler,
		}),
		command({
			name: 'check-availability',
			shortDesc: 'Checks if a desired subdomain is available for use',
			options: {
				...globalsWithRef,
				desiredSubdomain: string('desired-subdomain').desc(
					'The desired vanity subdomain to use for your Supabase project.',
				),
			},
			handler: mockHandler,
		}),
		command({
			name: 'delete',
			shortDesc: `Deletes a project's vanity subdomain`,
			desc: 'Deletes the vanity subdomain for a project, and reverts to using the project ref for routing.',
			options: globalsWithRef,
			handler: mockHandler,
		}),
		command({
			name: 'get',
			shortDesc: 'Get the current vanity subdomain',
			options: globalsWithRef,
			handler: mockHandler,
		}),
	],
	metadata: {
		category: 'Management APIs',
	},
}));

commands.push(
	command({
		name: 'completion',
		shortDesc: 'Generate the autocompletion script for the specified shell',
		desc: `Generate the autocompletion script for supabase for the specified shell.
See each sub-command's help for details on how to use the generated script.`,
		subcommands: [
			command({
				name: 'bash',
				shortDesc: 'Generate the autocompletion script for bash',
				desc: `Generate the autocompletion script for the bash shell.

This script depends on the 'bash-completion' package.
If it is not installed already, you can install it via your OS's package manager.

To load completions in your current shell session:

        source <(supabase completion bash)

To load completions for every new session, execute once:

#### Linux:

        supabase completion bash > /etc/bash_completion.d/supabase

#### macOS:

        supabase completion bash > $(brew --prefix)/etc/bash_completion.d/supabase

You will need to start a new shell for this setup to take effect.`,
				options: {
					...globalFlags,
					noDescriptions: boolean('no-descriptions').desc('disable completion descriptions'),
				},
				handler: mockHandler,
			}),
			command({
				name: 'fish',
				shortDesc: 'Generate the autocompletion script for fish',
				desc: `Generate the autocompletion script for the fish shell.

To load completions in your current shell session:

        supabase completion fish | source

To load completions for every new session, execute once:

        supabase completion fish > ~/.config/fish/completions/supabase.fish

You will need to start a new shell for this setup to take effect.`,
				options: {
					...globalFlags,
					noDescriptions: boolean('no-descriptions').desc('disable completion descriptions'),
				},
				handler: mockHandler,
			}),
			command({
				name: 'powershell',
				shortDesc: 'Generate the autocompletion script for powershell',
				desc: `Generate the autocompletion script for powershell.

To load completions in your current shell session:

        supabase completion powershell | Out-String | Invoke-Expression

To load completions for every new session, add the output of the above command
to your powershell profile.`,
				options: {
					...globalFlags,
					noDescriptions: boolean('no-descriptions').desc('disable completion descriptions'),
				},
				handler: mockHandler,
			}),
			command({
				name: 'zsh',
				shortDesc: 'Generate the autocompletion script for zsh',
				desc: `Generate the autocompletion script for the zsh shell.

If shell completion is not already enabled in your environment you will need
to enable it.  You can execute the following once:

        echo "autoload -U compinit; compinit" >> ~/.zshrc

To load completions in your current shell session:

        source <(supabase completion zsh)

To load completions for every new session, execute once:

#### Linux:

        supabase completion zsh > "\${fpath[1]}/_supabase"

#### macOS:

        supabase completion zsh > $(brew --prefix)/share/zsh/site-functions/_supabase

You will need to start a new shell for this setup to take effect.`,
				options: {
					...globalFlags,
					noDescriptions: boolean('no-descriptions').desc('disable completion descriptions'),
				},
				handler: mockHandler,
			}),
		],
		metadata: {
			category: 'Additional Commands',
		},
	}),
);

run(commands, {
	name: 'supabase',
	description: 'Supabase CLI 1.176.6',
	omitKeysOfUndefinedOptions: true,
	version: '1.176.6',
	theme: (event) => {
		// Slighlty adjusted default handler to support categories attached in metadata
		if (event.type === 'global_help') {
			const cliName = event.name;
			const desc = event.description;
			const commands = event.commands.filter((c) => !c.hidden);

			if (desc?.length) {
				console.log(`${desc}\n`);
			}

			console.log('Usage:');
			console.log(`  ${cliName ? cliName + ' ' : ''}[command]`);

			if (commands.length) {
				const categorized: Record<string, Command[]> = {};
				commands.forEach((c) => {
					if (c.metadata && typeof c.metadata === 'object' && typeof c.metadata.category === 'string') {
						categorized[c.metadata.category] = categorized[c.metadata.category]
							? [...categorized[c.metadata.category]!, c]
							: [c];
					} else {
						categorized['Other Commands'] = categorized['Other Commands']
							? [...categorized['Other Commands'], c]
							: [c];
					}
				});

				Object.entries(categorized).forEach(([category, commands]) => {
					console.log(`\n${category}:`);
					const padding = 3;
					const maxLength = commands.reduce((p, e) => e.name.length > p ? e.name.length : p, 0);
					const paddedLength = maxLength + padding;

					const data = commands.map((c) =>
						`  ${c.name.padEnd(paddedLength)}${
							(() => {
								const desc = c.shortDesc ?? c.desc;

								if (!desc?.length) return '';

								const split = desc.split('\n');
								const first = split.shift()!;

								const final = [first, ...split.map((s) => ''.padEnd(paddedLength + 2) + s)].join('\n');

								return final;
							})()
						}`
					)
						.join('\n');
					console.log(data);
				});
			} else {
				console.log('\nNo available commands.');
			}

			console.log('\nFlags:');
			console.log(`  -h, --help      help${cliName ? ` for ${cliName}` : ''}`);
			console.log(`  -v, --version   version${cliName ? ` for ${cliName}` : ''}`);
			console.log('\n');

			return true;
		}

		return false;
	},
	hook: (event, command) => {
		if (event === 'before') {
			console.log('Supabase CLI\n');
			console.log(`Running command: turso ${getCommandNameWithParents(command)}\n`);
		}

		if (event === 'after') console.log('\nTask completed succesfully!\n');
	},
});

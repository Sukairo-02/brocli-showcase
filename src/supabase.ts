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
					name: 'table-index-sizes',
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
		}),
		command({
			name: 'new',
			desc: 'Create a new test file',
			options: {
				...globalFlags,
				template: string().alias('t').enum('pgtap').desc('Template framework to generate').default('pgtap'),
			},
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

run(commands, {
	name: 'supabase',
	description: 'Supabase CLI 1.176.6',
	omitKeysOfUndefinedOptions: true,
	version: '1.176.6',
	hook: (event, command) => {
		if (event === 'before') {
			console.log('Supabase CLI\n');
			console.log(`Running command: turso ${getCommandNameWithParents(command)}\n`);
		}

		if (event === 'after') console.log('\nTask completed succesfully!\n');
	},
});

import { boolean, BuilderConfig, Command, command, positional, run, string } from '@drizzle-team/brocli';
import { getCommandNameWithParents } from '@drizzle-team/brocli';

const commands: Command[] = [];

const globalFlags = {
	config: string().alias('c').desc('Path to the directory with config file'),
};

const universalHandler = (opts: any) => {
	console.log('Command received options:');
	console.log(opts);
};

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

commands.push(command({
	name: 'auth',
	desc: 'Authenticate with Turso',
	options: globalFlags,
	subcommands: [
		command({
			name: 'api-tokens',
			desc: `API tokens are revocable non-expiring tokens that authenticate holders as the user who created them.
They can be used to implement automations with the turso CLI or the platform API.`,
			shortDesc: 'Manage your API tokens',
			options: globalFlags,
			subcommands: [
				command({
					name: 'list',
					desc: `API tokens are revocable non-expiring tokens that authenticate holders as the user who minted them.
They can be used to implement automations with the turso CLI or the platform API.`,
					shortDesc: 'List API tokens.',
					options: globalFlags,
					handler: universalHandler,
				}),
				command({
					name: 'mint',
					desc: `API tokens are revocable non-expiring tokens that authenticate holders as the user who minted them.
They can be used to implement automations with the turso CLI or the platform API.`,
					shortDesc: 'Mint an API token.',
					options: { ...globalFlags, apiTokenName: positional('api-token-name').required() },
					handler: universalHandler,
				}),
				command({
					name: 'revoke',
					desc: `API tokens are revocable non-expiring tokens that authenticate holders as the user who minted them.
They can be used to implement automations with the turso CLI or the platform API.`,
					shortDesc: 'Revoke an API tokens.',
					options: { ...globalFlags, apiTokenName: positional('api-token-name').required() },
					handler: universalHandler,
				}),
			],
		}),
		command({
			name: 'login',
			desc: 'Login to the platform.',
			options: {
				...globalFlags,
				headless: boolean().desc(
					`Give users a link to start the process by themselves. Useful when the CLI can't interact with a web browser.`,
				),
			},
			handler: universalHandler,
		}),
		command({
			name: 'logout',
			desc: 'Log out currently logged in user.',
			options: globalFlags,
			handler: universalHandler,
		}),
		command({
			name: 'signup',
			desc: 'Login to the platform.',
			options: {
				...globalFlags,
				headless: boolean().desc(
					`Give users a link to start the process by themselves. Useful when the CLI can't interact with a web browser.`,
				),
			},
			handler: universalHandler,
		}),
		command({
			name: 'token',
			desc: `Shows the token used to authenticate you to Turso platform API.
To authenticate to your databases, use turso db tokens create`,
			shortDesc: 'Shows the token used to authenticate you to Turso platform API.',
			options: globalFlags,
			handler: universalHandler,
		}),
		command({
			name: 'whoami',
			desc: `Show the currently logged in user.`,
			options: globalFlags,
			handler: universalHandler,
		}),
	],
}));

commands.push(command({
	name: 'config',
	desc: 'Manage your CLI configuration',
	options: globalFlags,
	subcommands: [
		command({
			name: 'cache',
			desc: 'Manage your CLI cache',
			options: globalFlags,
			subcommands: [
				command({
					name: 'clear',
					desc: 'Clear your CLI local cache',
					options: globalFlags,
					handler: universalHandler,
				}),
			],
		}),
		command({
			name: 'path',
			desc: 'Get the path to the CLI configuration file',
			options: globalFlags,
			handler: universalHandler,
		}),
		command({
			name: 'set',
			desc: 'Set a configuration value',
			options: globalFlags,
			subcommands: [
				command({
					name: 'autoupdate',
					desc: 'Configure autoupdate behavior',
					options: {
						...globalFlags,
						value: positional('value').enum('on', 'off').required(),
					},
					handler: universalHandler,
				}),
				command({
					name: 'token',
					desc: 'Configure the token used by turso',
					options: {
						...globalFlags,
						token: positional('jwt').required(),
					},
					handler: universalHandler,
				}),
			],
		}),
	],
}));

commands.push(command({
	name: 'contact',
	desc: 'Reach out to the makers of Turso for help or feedback',
	options: globalFlags,
	subcommands: [
		command({
			name: 'bookmeeting',
			desc: 'Book a meeting with the Turso team.',
			handler: universalHandler,
		}),
		command({
			name: 'feedback',
			desc: `Tell us how can we help you, how we can improve, or what you'd like to see next.`,
			handler: universalHandler,
		}),
	],
}));

commands.push(command({
	name: 'db',
	desc: 'Manage databases',
	options: globalFlags,
	subcommands: [
		command({
			name: 'config',
			desc: 'Manage db config',
			options: globalFlags,
			subcommands: [
				command({
					name: 'attach',
					desc: 'Manage attach config of a database',
					options: globalFlags,
					subcommands: [
						command({
							name: 'allow',
							desc: 'Allows this database to be attached by other databases',
							options: globalFlags,
							handler: universalHandler,
						}),
						command({
							name: 'disallow',
							desc: 'Disallows this database to be attached by other databases',
							options: globalFlags,
							handler: universalHandler,
						}),
						command({
							name: 'show',
							desc: 'Shows the attach status of a database',
							options: { ...globalFlags, dbName: positional('database-name').required() },
							handler: universalHandler,
						}),
					],
				}),
			],
		}),
		command({
			name: 'create',
			desc: 'Create a database',
			options: {
				...globalFlags,
				csvSeparator: string('csv-separator').desc('CSV separator character. Must be a single character.').default(','),
				csvTableName: string('csv-table-name').desc('name of the table in the csv file'),
				enableExt: boolean('enable-extensions').desc(
					`Enables experimental support for SQLite extensions.\nIf you would like to see some extension included, run turso account feedback.\nWarning: extensions support is experimental and subject to change`,
				),
				fromCSV: string('from-csv').desc('create the database from a csv file'),
				fromDB: string('from-db').desc('create the database from a local SQLite dump'),
				fromLink: string('from-db-url').desc('create the database from a remote SQLite dump'),
				fromFile: string('from-file').desc('create the database from a local SQLite3-compatible file'),
				group: string().desc('create the database in the specified group'),
				location: string().desc('Location ID. If no ID is specified, closest location to you is used by default.'),
				schema: string().desc('Schema to use for the database'),
				timestamp: string().desc(
					`Set a point in time in the past to copy data from the selected database. Must be used with the 'from-db' flag. Must be in RFC3339 format like '2023-09-29T10:16:13-03:00'`,
				),
				type: string().desc('Type of the database to create. Possible values: regular, schema.').default('regular'),
				wait: boolean().alias('w').desc('Wait for the database to be ready to receive requests.'),
				dbName: positional('database-name'),
			},
			handler: universalHandler,
		}),
		command({
			name: 'destroy',
			desc: 'Destroy a database.',
			options: {
				...globalFlags,
				dbName: positional('database-name').required(),
				yes: boolean().alias('y').desc('Confirms the destruction of all locations of the database.'),
			},
			handler: universalHandler,
		}),
		command({
			name: 'inspect',
			desc: 'Inspect database.',
			options: {
				...globalFlags,
				queries: boolean().desc('Display database queries statistics'),
				verbose: boolean().desc('Show detailed information'),
				dbName: positional('database-name').required(),
			},
			handler: universalHandler,
		}),
		command({
			name: 'list',
			desc: 'List databases.',
			options: globalFlags,
			handler: universalHandler,
		}),
		command({
			name: 'locations',
			desc: 'List available database locations.',
			options: {
				...globalFlags,
				latencies: boolean('show-latencies').alias('l').desc(
					`Display latencies from your current location to each of Turso's locations`,
				),
			},
			handler: universalHandler,
		}),
		command({
			name: 'replicate',
			desc: 'Replicate a database.',
			options: {
				...globalFlags,
				wait: string().alias('w').desc('Wait for the replica to be ready to receive requests.'),
				dbName: positional('database-name').required(),
				locCode: positional('location-code').required(),
			},
			handler: universalHandler,
		}),
		command({
			name: 'shell',
			desc: `Start a SQL shell.\
			When database-name is provided, the shell will connect the closest replica of the specified database.\
			When the --instance flag is provided with a specific instance name, the shell will connect to that instance directly.`,
			shortDesc: 'Start a SQL shell.',
			options: {
				...globalFlags,
				attach: string().desc('list of database names with attach claim to be added to the token'),
				instance: string().desc('Connect to the database at the specified instance.'),
				location: string().desc('Connect to the database at the specified location.'),
				proxy: string().desc('Proxy to use for the connection.'),
				urlOrName: positional('database-name | replica-url').required(),
				sql: positional(),
			},
			handler: universalHandler,
		}),
		command({
			name: 'show',
			desc: 'Show information from a database.',
			options: {
				...globalFlags,
				http: string('http-url').desc('Show HTTP URL for the database HTTP API.'),
				instance: string('instance-url').desc(
					'Show URL for the HTTP API of a selected instance of a database. Instance is selected by instance name.',
				),
				instances: string('instance-urls').desc('Show URL for the HTTP API of all existing instances'),
				url: string().desc('Show URL for the database HTTP API.'),
				dbName: positional('database-name').required(),
			},
			handler: universalHandler,
		}),
		command({
			name: 'tokens',
			desc: 'Manage db tokens',
			subcommands: [
				command({
					name: 'create',
					desc: 'Creates a bearer token to authenticate requests to the database',
					options: {
						...globalFlags,
						attach: string().desc('list of database names with attach claim to be added to the token'),
						expiration: string().alias('e').desc(
							'Token expiration. Possible values are never (default) or expiration time in days (e.g. 7d).',
						).default('never'),
						group: boolean().desc('create a token that is valid for all databases in the group'),
						readonly: boolean('read-only').alias('r').desc('Token with read-only access'),
						dbName: positional('database-name').required(),
					},
					handler: universalHandler,
				}),
				command({
					name: 'invalidate',
					desc: 'Rotates the keys used to create and verify database tokens making existing tokens invalid',
					options: {
						...globalFlags,
						yes: boolean().alias('y').desc('Confirms the invalidation of all existing db tokens.'),
						dbName: positional('database-name').required(),
					},
					handler: universalHandler,
				}),
			],
		}),
		command({
			name: 'update',
			desc: 'Updates the database to the latest turso version',
			options: {
				...globalFlags,
				group: string().desc(
					'Update database to use groups. Only effective if the database is not already using groups.',
				),
				yes: boolean().alias('y').desc('Confirms the update of the database.'),
				dbName: positional('database-name').required(),
			},
			handler: universalHandler,
		}),
		command({
			name: 'wakeup',
			desc: 'Wake up a database',
			options: {
				...globalFlags,
				dbName: positional('database-name').required(),
			},
			handler: universalHandler,
		}),
	],
}));

run(commands, {
	cliName: 'turso',
	omitKeysOfUndefinedOptions: true,
	theme: (event) => {
		if (event.type === 'commandHelp') {
			const command = event.command;
			const commandName = getCommandNameWithParents(command);
			const cliName = event.cliName;
			const desc = command.desc ?? command.shortDesc;

			if (desc !== undefined) {
				console.log(`\n${desc}`);
			}

			const opts = Object.values(command.options ?? {} as Exclude<typeof command.options, undefined>).filter((opt) =>
				!opt.config.isHidden
			);
			const positionals = opts.filter((opt) => opt.config.type === 'positional');
			const options = opts.filter((opt) => opt.config.type !== 'positional');

			console.log('\nUsage:');
			if (command.handler) {
				console.log(
					`  ${cliName ? cliName + ' ' : ''}${commandName}${
						positionals.length
							? ' '
								+ positionals.map(({ config: p }) => getOptionTypeText(p)).join(' ')
							: ''
					} [flags]`,
				);
			} else console.log(`  ${cliName ? cliName + ' ' : ''}${commandName} [command]`);

			if (command.aliases) {
				console.log(`\nAliases:`);
				console.log(`  ${command.aliases.join(', ')}`);
			}

			if (command.subcommands) {
				console.log('\nAvailable Commands:');
				const padding = 3;
				const maxLength = command.subcommands.reduce((p, e) => e.name.length > p ? e.name.length : p, 0);
				const paddedLength = maxLength + padding;

				const data = command.subcommands.map((s) =>
					`  ${s.name.padEnd(paddedLength)}${(s.shortDesc ?? s.desc)?.split('\n').shift()!}`
				)
					.join('\n');
				console.log(data);
			}

			if (options.length) {
				const aliasLength = options.reduce((p, e) => {
					const currentLength = e.config.aliases.reduce((pa, a) => pa + a.length, 0)
						+ ((e.config.aliases.length - 1) * 2) + 1; // Names + coupling symbols ", " + ending coma

					return currentLength > p ? currentLength : p;
				}, 0);
				const paddedAliasLength = aliasLength > 0 ? aliasLength + 1 : 0;
				const nameLength = options.reduce((p, e) => {
					const typeLen = getOptionTypeText(e.config).length;
					const length = typeLen > 0 ? e.config.name.length + 1 + typeLen : e.config.name.length;

					return length > p ? length : p;
				}, 0) + 3;

				const preDescPad = paddedAliasLength + nameLength + 2;

				const data = options.map(({ config: opt }) =>
					`  ${`${opt.aliases.length ? opt.aliases.join(', ') + ',' : ''}`.padEnd(paddedAliasLength)}${
						`${opt.name}${
							(() => {
								const typeText = getOptionTypeText(opt);
								return typeText.length ? ' ' + typeText : '';
							})()
						}`.padEnd(nameLength)
					}${
						(() => {
							if (!opt.description?.length) return '';
							const split = opt.description.split('\n');
							const first = split.shift()!;
							const def = opt.default !== undefined ? ` (default: ${JSON.stringify(opt.default)})` : '';

							const final = [first, ...split.map((s) => ''.padEnd(preDescPad) + s)].join('\n') + def;

							return final;
						})()
					}`
				).join('\n');

				console.log('\nFlags:');
				console.log(data);
			}

			console.log('\nGlobal flags:');
			console.log(`  -h, --help      help for ${commandName}`);
			console.log(`  -v, --version   version${cliName ? ` for ${cliName}` : ''}`);

			if (command.subcommands?.length) {
				console.log(
					`\nUse "${
						cliName ? cliName + ' ' : ''
					}${commandName} [command] --help" for more information about a command.\n`,
				);
			}

			return true;
		}

		if (event.type === 'globalHelp') {
			const cliName = event.cliName;
			console.log('Turso CLI');
			console.log('\nUsage:');
			console.log(`  ${cliName ? cliName + ' ' : ''}[command]`);

			if (event.commands) {
				console.log('\nAvailable Commands:');
				const padding = 3;
				const maxLength = event.commands.reduce((p, e) => e.name.length > p ? e.name.length : p, 0);
				const paddedLength = maxLength + padding;

				const data = event.commands.map((s) =>
					`  ${s.name.padEnd(paddedLength)}${(s.shortDesc ?? s.desc)?.split('\n').shift()!}`
				)
					.join('\n');
				console.log(data);
			}

			console.log('\nFlags:');
			console.log(`  -h, --help      help${cliName ? ` for ${cliName}` : ''}`);
			console.log(`  -v, --version   version${cliName ? ` for ${cliName}` : ''}`);
			console.log('\n');

			return true;
		}

		return false;
	},
	version: 'turso version v0.96.0-brocli-showcase',
	hook: (event, command) => {
		if (event === 'before') {
			console.log('Turso CLI\n');
			console.log(`Running command: turso ${getCommandNameWithParents(command)}\n`);
		}

		if (event === 'after') console.log('\nTask completed succesfully!\n');
	},
});

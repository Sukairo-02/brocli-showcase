import { boolean, BuilderConfig, Command, command, positional, run, string } from '@drizzle-team/brocli';

const commands: Command[] = [];

const globalFlags = {
	config: string().alias('c').desc('Path to the directory with config file'),
};

const universalHandler = (name: string) => (opts: any) => {
	console.log(`turso ${name}:`);
	console.log(opts);
};

commands.push(command({
	name: 'auth',
	desc: 'Authenticate with Turso',
	options: globalFlags,
	subcommands: [
		command({
			name: 'api-tokens',
			desc: 'Manage your API tokens',
			options: globalFlags,
			subcommands: [
				command({
					name: 'list',
					desc: `API tokens are revocable non-expiring tokens that authenticate holders as the user who minted them.
They can be used to implement automations with the turso CLI or the platform API.`,
					shortDesc: 'List API tokens.',
					options: globalFlags,
					handler: universalHandler('auth api-tokens list'),
				}),
				command({
					name: 'mint',
					desc: `API tokens are revocable non-expiring tokens that authenticate holders as the user who minted them.
They can be used to implement automations with the turso CLI or the platform API.`,
					shortDesc: 'Mint an API token.',
					options: { ...globalFlags, apiTokenName: positional('api-token-name').required() },
					handler: universalHandler('auth api-tokens mint'),
				}),
				command({
					name: 'revoke',
					desc: `API tokens are revocable non-expiring tokens that authenticate holders as the user who minted them.
They can be used to implement automations with the turso CLI or the platform API.`,
					shortDesc: 'Revoke an API tokens.',
					options: { ...globalFlags, apiTokenName: positional('api-token-name').required() },
					handler: universalHandler('auth api-tokens revoke'),
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
			handler: universalHandler('auth login'),
		}),
		command({
			name: 'logout',
			desc: 'Log out currently logged in user.',
			options: globalFlags,
			handler: universalHandler('auth logout'),
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
			handler: universalHandler('auth signup'),
		}),
		command({
			name: 'token',
			desc: `Shows the token used to authenticate you to Turso platform API.
To authenticate to your databases, use turso db tokens create`,
			shortDesc: 'Shows the token used to authenticate you to Turso platform API.',
			options: globalFlags,
			handler: universalHandler('auth token'),
		}),
		command({
			name: 'whoami',
			desc: `Show the currently logged in user.`,
			options: globalFlags,
			handler: universalHandler('auth whoami'),
		}),
	],
}));

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
				result = '[' + option.enumVals.join('|') + ']';
				break;
			}

			result = 'string';
			break;
		}
		case 'positional': {
			result = `<${option.enumVals ? option.enumVals.join('|') : option.name}>`;
			break;
		}
	}

	if (option.isRequired) result = '!' + result;
	return result;
};

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
					handler: universalHandler('config cache clear'),
				}),
			],
		}),
		command({
			name: 'path',
			desc: 'Get the path to the CLI configuration file',
			options: globalFlags,
			handler: universalHandler('config path'),
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
					handler: universalHandler('config set autoupdate'),
				}),
				command({
					name: 'token',
					desc: 'Configure the token used by turso',
					options: {
						...globalFlags,
						token: positional('jwt').required(),
					},
					handler: universalHandler('config set token'),
				}),
			],
		}),
	],
}));

run(commands, {
	cliName: 'turso',
	omitKeysOfUndefinedOptions: true,
	theme: (event) => {
		if (event.type === 'commandHelp') {
			const command = event.command;
			const cliName = event.cliName;
			const desc = command.desc ?? command.shortDesc;

			console.log('Turso CLI');

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
					`  ${cliName ? cliName + ' ' : ''}${command.name}${
						positionals.length
							? ' '
								+ positionals.map(({ config: p }) => getOptionTypeText(p)).join(' ')
							: ''
					}`,
				);
			} else console.log(`  ${cliName ? cliName + ' ' : ''}${command.name} [command]`);

			if (command.subcommands) {
				console.log('\nAvailable Commands:');
				const padding = 2;
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
				const nameLength = options.reduce((p, e) => e.config.name.length > p ? e.config.name.length : p, 0) + 1;
				const typeLength = options.reduce((p, e) => {
					const len = getOptionTypeText(e.config).length;

					return len > p ? len : p;
				}, 0);
				const paddedTypeLength = typeLength > 0 ? typeLength + 2 : typeLength;

				const data = options.map(({ config: opt }) =>
					`  ${`${opt.aliases.length ? opt.aliases.join(', ') + ',' : ''}`.padEnd(paddedAliasLength)}${
						opt.name.padEnd(nameLength)
					}${getOptionTypeText(opt).padEnd(paddedTypeLength)}${
						opt.description ? opt.description.split('\n').shift() : ''
					}`
				).join('\n');

				console.log('\nFlags:');
				console.log(data);
			}

			console.log('\n', 'Global flags:');
			console.log(`  -h, --help      help${cliName ? ` for ${cliName}` : ''}`);
			console.log(`  -v, --version   version${cliName ? ` for ${cliName}` : ''}`);

			return true;
		}

		if (event.type === 'globalHelp') {
			const cliName = event.cliName;
			console.log('Turso CLI');
			console.log('\nUsage:');
			console.log(`  ${cliName ? cliName + ' ' : ''}[command]`);

			if (event.commands) {
				console.log('\nAvailable Commands:');
				const padding = 2;
				const maxLength = event.commands.reduce((p, e) => e.name.length > p ? e.name.length : p, 0);
				const paddedLength = maxLength + padding;

				const data = event.commands.map((s) =>
					`  ${s.name.padEnd(paddedLength)}${(s.shortDesc ?? s.desc)?.split('\n').shift()!}`
				)
					.join('\n');
				console.log(data);
			}

			console.log('\n', 'Flags:');
			console.log(`  -h, --help      help${cliName ? ` for ${cliName}` : ''}`);
			console.log(`  -v, --version   version${cliName ? ` for ${cliName}` : ''}`);

			return true;
		}

		return false;
	},
	version: 'turso version v0.96.0-brocli-showcase',
	hook: (event) => {
		if (event === 'before') console.log('Turso CLI\n');
	},
});

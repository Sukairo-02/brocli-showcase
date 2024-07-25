import { boolean, Command, command, positional, run, string } from '@drizzle-team/brocli';

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
				console.log('\n', desc);
			}

			const opts = Object.values(command.options ?? {} as Exclude<typeof command.options, undefined>);
			const positionals = opts.filter((opt) => opt.config.type === 'positional');
			const options = opts.filter((opt) => opt.config.type !== 'positional');

			console.log('\nUsage:');
			if (command.handler) {
				console.log(
					`  ${cliName ? cliName + ' ' : ''}${command.name}${
						positionals.length
							? ' '
								+ positionals.map(({ config: p }) => `<${p.enumVals ? p.enumVals.join('|') : p.name}>`).join(' ')
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
				console.log('Flags:');
			}

			return true;
		}

		if (event.type === 'globalHelp') {
			const cliName = event.cliName;
			console.log('Turso CLI\n');
			console.log('Usage:');
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

			return true;
		}

		return false;
	},
	version: 'turso version v0.96.0-brocli-showcase',
	hook: (event) => {
		if (event === 'before') console.log('Turso CLI\n');
	},
});

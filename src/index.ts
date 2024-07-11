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
	description: 'Authenticate with Turso',
	options: globalFlags,
	handler: universalHandler('auth'),
	help: `Authenticate with Turso

Usage:
  turso auth [command]

Available Commands:
  api-tokens  Manage your API tokens
  login       Login to the platform.
  logout      Log out currently logged in user.
  signup      Create a new Turso account.
  token       Shows the token used to authenticate you to Turso platform API.
  whoami      Show the currently logged in user.

Flags:
  -h, --help   help for auth

Global Flags:
  -c, --config-path string   Path to the directory with config file

Use "turso auth [command] --help" for more information about a command.`,
	subcommands: [
		command({
			name: 'api-tokens',
			description: 'Manage your API tokens',
			options: globalFlags,
			handler: universalHandler('auth api-tokens'),
			help: `API tokens are revocable non-expiring tokens that authenticate holders as the user who created them.
They can be used to implement automations with the turso CLI or the platform API.

Usage:
  turso auth api-tokens [command]

Available Commands:
  list        List API tokens.
  mint        Mint an API token.
  revoke      Revoke an API token.

Flags:
  -h, --help   help for api-tokens

Global Flags:
  -c, --config-path string   Path to the directory with config file

Use "turso auth api-tokens [command] --help" for more information about a command.`,
			subcommands: [
				command({
					name: 'list',
					description:
						`API tokens are revocable non-expiring tokens that authenticate holders as the user who minted them.
They can be used to implement automations with the turso CLI or the platform API.`,
					options: globalFlags,
					handler: universalHandler('auth api-tokens list'),
					help: `API tokens are revocable non-expiring tokens that authenticate holders as the user who minted them.
They can be used to implement automations with the turso CLI or the platform API.

Usage:
  turso auth api-tokens list [flags]

Flags:
  -h, --help   help for list

Global Flags:
  -c, --config-path string   Path to the directory with config file`,
				}),
				command({
					name: 'mint',
					description:
						`API tokens are revocable non-expiring tokens that authenticate holders as the user who minted them.
They can be used to implement automations with the turso CLI or the platform API.`,
					options: { ...globalFlags, apiTokenName: positional('api-token-name').required() },
					handler: universalHandler('auth api-tokens mint'),
					help: `API tokens are revocable non-expiring tokens that authenticate holders as the user who minted them.
They can be used to implement automations with the turso CLI or the platform API.

Usage:
  turso auth api-tokens mint <api-token-name> [flags]

Flags:
  -h, --help   help for mint

Global Flags:
  -c, --config-path string   Path to the directory with config file`,
				}),
				command({
					name: 'revoke',
					description:
						`API tokens are revocable non-expiring tokens that authenticate holders as the user who minted them.
They can be used to implement automations with the turso CLI or the platform API.`,
					options: { ...globalFlags, apiTokenName: positional('api-token-name').required() },
					handler: universalHandler('auth api-tokens revoke'),
					help: `API tokens are revocable non-expiring tokens that authenticate holders as the user who minted them.
They can be used to implement automations with the turso CLI or the platform API.

Usage:
  turso auth api-tokens revoke <api-token-name> [flags]

Flags:
  -h, --help   help for revoke

Global Flags:
  -c, --config-path string   Path to the directory with config file`,
				}),
			],
		}),
		command({
			name: 'login',
			description: 'Login to the platform.',
			options: {
				...globalFlags,
				headless: boolean().desc(
					`Give users a link to start the process by themselves. Useful when the CLI can't interact with a web browser.`,
				),
			},
			handler: universalHandler('auth login'),
			help: `Login to the platform.

Usage:
  turso auth login [flags]

Flags:
      --headless   Give users a link to start the process by themselves. Useful when the CLI can't interact with a web browser.
  -h, --help       help for login

Global Flags:
  -c, --config-path string   Path to the directory with config file`,
		}),
		command({
			name: 'logout',
			description: 'Log out currently logged in user.',
			options: globalFlags,
			handler: universalHandler('auth logout'),
			help: `Log out currently logged in user.

Usage:
  turso auth logout [flags]

Flags:
  -a, --all    Invalidate all sessions for the current user
  -h, --help   help for logout

Global Flags:
  -c, --config-path string   Path to the directory with config file`,
		}),
		command({
			name: 'signup',
			description: 'Login to the platform.',
			options: {
				...globalFlags,
				headless: boolean().desc(
					`Give users a link to start the process by themselves. Useful when the CLI can't interact with a web browser.`,
				),
			},
			handler: universalHandler('auth signup'),
			help: `Create a new Turso account.

Usage:
  turso auth signup [flags]

Flags:
      --headless   Give users a link to start the process by themselves. Useful when the CLI can't interact with a web browser.
  -h, --help       help for signup

Global Flags:
  -c, --config-path string   Path to the directory with config file`,
		}),
		command({
			name: 'token',
			description: `Shows the token used to authenticate you to Turso platform API.
To authenticate to your databases, use turso db tokens create`,
			options: globalFlags,
			handler: universalHandler('auth token'),
			help: `Shows the token used to authenticate you to Turso platform API.
To authenticate to your databases, use turso db tokens create

Usage:
  turso auth token [flags]

Flags:
  -h, --help   help for token

Global Flags:
  -c, --config-path string   Path to the directory with config file`,
		}),
		command({
			name: 'Show the currently logged in user.',
			description: `Shows the token used to authenticate you to Turso platform API.
To authenticate to your databases, use turso db tokens create`,
			options: globalFlags,
			handler: universalHandler('auth whoami'),
			help: `Show the currently logged in user.

Usage:
  turso auth whoami [flags]

Flags:
  -h, --help   help for whoami

Global Flags:
  -c, --config-path string   Path to the directory with config file`,
		}),
	],
}));

commands.push(command({
	name: 'config',
	description: 'Manage your CLI configuration',
	options: globalFlags,
	handler: universalHandler('config'),
	help: `Manage your CLI configuration

Usage:
  turso config [command]

Available Commands:
  cache       Manage your CLI cache
  path        Get the path to the CLI configuration file
  set         Set a configuration value

Flags:
  -h, --help   help for config

Global Flags:
  -c, --config-path string   Path to the directory with config file

Use "turso config [command] --help" for more information about a command.`,
	subcommands: [
		command({
			name: 'cache',
			description: 'Manage your CLI cache',
			options: globalFlags,
			handler: universalHandler('config cache'),
			help: `Manage your CLI cache

Usage:
  turso config cache [command]

Available Commands:
  clear       Clear your CLI local cache

Flags:
  -h, --help   help for cache

Global Flags:
  -c, --config-path string   Path to the directory with config file

Use "turso config cache [command] --help" for more information about a command.`,
			subcommands: [
				command({
					name: 'clear',
					description: 'Clear your CLI local cache',
					options: globalFlags,
					handler: universalHandler('config cache clear'),
					help: `Clear your CLI local cache

Usage:
  turso config cache clear [flags]

Flags:
  -h, --help   help for clear

Global Flags:
  -c, --config-path string   Path to the directory with config file`,
				}),
			],
		}),
		command({
			name: 'path',
			description: 'Get the path to the CLI configuration file',
			options: globalFlags,
			handler: universalHandler('config path'),
			help: `Get the path to the CLI configuration file

Usage:
  turso config path [flags]

Flags:
  -h, --help   help for path

Global Flags:
  -c, --config-path string   Path to the directory with config file`,
		}),
		command({
			name: 'set',
			description: 'Set a configuration value',
			options: globalFlags,
			handler: universalHandler('config set'),
			help: `Set a configuration value

Usage:
  turso config set [command]

Available Commands:
  autoupdate  Configure autoupdate behavior
  token       Configure the token used by turso

Flags:
  -h, --help   help for set

Global Flags:
  -c, --config-path string   Path to the directory with config file

Use "turso config set [command] --help" for more information about a command.`,
			subcommands: [
				command({
					name: 'autoupdate',
					description: 'Configure autoupdate behavior',
					options: {
						...globalFlags,
						value: positional('value').enum('on', 'off').required(),
					},
					handler: universalHandler('config set autoupdate'),
					help: `Configure autoupdate behavior

Usage:
  turso config set autoupdate <on|off> [flags]

Flags:
  -h, --help   help for autoupdate

Global Flags:
  -c, --config-path string   Path to the directory with config file`,
				}),
				command({
					name: 'token',
					description: 'Configure the token used by turso',
					options: {
						...globalFlags,
						token: positional('jwt').required(),
					},
					handler: universalHandler('config set token'),
					help: `Configure the token used by turso

Usage:
  turso config set token <jwt> [flags]

Flags:
  -h, --help   help for token

Global Flags:
  -c, --config-path string   Path to the directory with config file`,
				}),
			],
		}),
	],
}));

run(commands, {
	omitKeysOfUndefinedOptions: true,
	help: (calledFor) => {
		if (Array.isArray(calledFor)) {
			console.log(
				`Usage:
  turso [command]

Available Commands:
  auth         Authenticate with Turso
  config       Manage your CLI configuration
  contact      Reach out to the makers of Turso for help or feedback
  db           Manage databases
  dev          starts a local development server for Turso
  group        Manage your database groups
  help         Help about any command
  org          Manage your organizations
  plan         Manage your organization plan
  quickstart   New to Turso? Start here!
  relax        Sometimes you feel like you're working too hard... relax!
  update       Update the CLI to the latest version

Flags:
  -c, --config-path string   Path to the directory with config file
  -h, --help                 help for turso
  -v, --version              version for turso

Use "turso [command] --help" for more information about a command.
                `,
			);
		}
	},
	version: 'turso version v0.96.0-brocli-showcase',
	hook: (event) => {
		if (event !== 'pre') return;

		console.log('Turso CLI\n');
	},
});

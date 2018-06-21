// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  poeditor_live: true,
  poeditor_url: '{{.POEDITOR_URL}}',
  poeditor_api_token: '{{.POEDITOR_API_TOKEN}}',
  poeditor_project_id: '{{.POEDITOR_PROJECT_ID}}'
};

# Frontend

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 10.0.0-next.4.

- [Frontend](#frontend)
  - [Getting started](#getting-started)
    - [Install dependencies](#install-dependencies)
    - [Run locally](#run-locally)
  - [Docker](#docker)
    - [Build the docker image](#build-the-docker-image)
    - [Run the docker image](#run-the-docker-image)
  - [Documentation](#documentation)
  - [Testing](#testing)
    - [Playwright Integration Tests](#Playwright-integration-tests)
      - [Already running development server](#already-running-development-server)
      - [Standalone](#standalone)
  - [OpenAPI generator](#openapi-generator)
    - [Configuration](#configuration)
    - [Workaround for windows machines using a company proxy](#workaround-for-windows-machines-using-a-company-proxy)
  - [Generate lists of licenses from used libraries](#generate-lists-of-licenses-from-used-libraries)

## Getting started

### Install dependencies

Some of the npm packages we are using are only available in our internal artifact storage. It is therefore necessary
to [configure npm to use Artifactory](https://wiki.telekom.de/display/ONAPO/Frontend#Frontend-ConfigurenpmtousetheArtifactory).

Once you have done that, please run

```sh
# depending on when you read this, legacy-peer-deps
# may not be needed anymore
npm install --legacy-peer-deps
```

to install the required node packages.

### Run locally

Use the `npm` to launch the portal-ui in development mode.

```bash
npm start
```

Note: When the process has issues binding to port `80`, use

```sh
sudo setcap 'cap_net_bind_service=+ep' `readlink -f \`which node\``
```

to allow the node process to bind to that port.

## Docker

### Build the docker image

Run

```bash
npm run build -- --prod --base-href=/portal-ui/
```

to get a production build of the project, this will be used in the `docker build`.

In the configuration of nginx (the `nginx.template`) we have a few environment variables that need to be set.

```bash
export NGINX_PORT=80
export BFF_URL=http://taasos-portal-smo-portal-bff:9080/
export WIREMOCK_URL=http://wiremock:8080/
export COLLECTOR_URL=http://jaeger-smo-collector.istio-system:9411
export GRAFANA_URL=http://ap-grafana.onap
export HELP_URL=http://ran-do-help.onap.svc.cluster.local:80
export KEYCLOAK_URL=https://keycloak-smo-dev.tnaplab.telekom.de
export KEYCLOAK_REALM=TAAS
export KEYCLOAK_INTERNAL_URL=http://keycloak-smo-http.keycloak
export NAME_SERVER_IP=169.254.25.10  # obtained by doing a `cat /etc/resolv.conf` on any pod in the target cluster
```

Finally, build the image with

```bash
docker build -t portal-ui .
```

### Run the docker image

```bash
docker run -e "NGINX_PORT=80" -e "BFF_URL=http:portal-bff:9080/" -e "WIREMOCK_URL=http://wiremock:8080/" -p 8080:80 portal-ui
```

Note that this will not work on its own, because the referenced containers (`BFF` and `WIREMOCK`) are most likely not available in your local environment. You would have to run them as well, or pass in other urls (like `example.com`) to get the container running locally. Obviously this does not get you very far though.

## Documentation

Navigate in console to Code/dt-portal/frontend. There you can run `npm run compodoc` to generate
the compodoc documentation.

To generate the documentation and provide a clickable version on the server, run `compodoc-4200`.

## Testing

To start the tests, run `ng test`. It is possible to run with Chromium or Firefox.
Therefore one can run:

```bash
ng test --browsers FirefoxHeadless
```

or

```bash
ng test --browsers ChromiumHeadless
```

Output is in console.

### Playwright integration tests

Please find additional documentation of Playwright integration test [here](https://wiki.telekom.de/x/AQMG4) 


```sh
+-------------------+      +------------------------------+      +---------------+
|     Playwright    | ---> |     Local Webpack Server     | ---> |    Wiremock   |
| (E2E Test Runner) |      | (with e2e.proxy.config.json) |      | (API Mocking) |
+-------------------+      +------------------------------+      +---------------+
                                                          |
                                                          |      +-----------------+
                                                          -----> |    Keycloak     |
                                                                 | (Auth Provider) |
                                                                 +-----------------+
```

A one-time setup command is required to install playwrights dependencies:

```sh
npx playwright install --with-deps
```

There are two ways to run the tests:

#### Already running development server

For local development, it's best to launch the local webpack development server
separately to keep it running while developing.
The following command will launch the server with a configuration
to make requests against the local wiremock.

```sh
$ npm run start:e2e
...
Application bundle generation complete. [19.475 seconds]

Watch mode enabled. Watching for file changes...
NOTE: Raw file sizes do not reflect development server per-request transformations.
  ➜  Local:   http://localhost:4200/
  ➜  Network: http://192.168.178.53:4200/
  ➜  Network: http://10.42.0.0:4200/
  ➜  Network: http://10.42.0.1:4200/
  ➜  Network: http://172.21.0.1:4200/
  ➜  Network: http://172.24.0.1:4200/
  ➜  press h + enter to show help
```

Now that the server is running, you can run the e2e test suite against it, using:

```sh
$ npm run e2e
Running 6 tests using 4 workers
[setup] › e2e/setup/auth.setup.ts:29:6 › Login and save authentication state
Authentication state has been saved.
  6 passed (28.4s)

To open last HTML report run:

  npx playwright show-report
```

#### Standalone

The same test command will launch the server and docker containers in the background,
run the tests and then terminate the server.

```sh
$ npm run e2e
Running 6 tests using 4 workers
[setup] › e2e/setup/auth.setup.ts:29:6 › Login and save authentication state
Authentication state has been saved.
  6 passed (28.4s)

To open last HTML report run:

  npx playwright show-report
```

Run all tests

```sh
npm run e2e
```

Run individual tests

```sh
# runs test for `*create*.spec.ts` files
npm run e2e create
```

#### Smoke Tests

You can run locally smoke tests against the portal in the Kubernetes clusters. Prerequisites are a existing connection to the cluster and credential of a portal account.

Provided clusters are: `do`, `do1`, `preLab1` and `preLab2`

The credentials must be set in environment variables and can be provided in one command:

```shell
TEST_USERNAME='e2e-admin' TEST_PASSWORD='*******' npm run smoke:[cluster]
```
e.g.
```shell
TEST_USERNAME='e2e-admin' TEST_PASSWORD='*******' npm run smoke:do
```
If either variable is missing the run fails immediately with a message naming it, rather
than attempting a login that cannot succeed. The lowercase `test_username` /
`test_password` spelling is still accepted for backwards compatibility.

You can run this commands on Mac, Windows and Linux machines. Please keep in mind that the `preLab[X]` cluster are not available from the Mac machines.

The used ports of the jump host are:

Mac/Linux: `17385` (`do`, `do1`)
Win/Linux: `9097` (`preLab1`, `preLab2`)

`E2E_SOCKS_PROXY` overrides the tunnel for the Linux projects:

```shell
# dev VM already inside the network — connect directly, no tunnel needed
E2E_SOCKS_PROXY=none TEST_USERNAME='e2e-admin' TEST_PASSWORD='*******' npm run smoke:do

# tunnel on a non-standard port/host
E2E_SOCKS_PROXY=socks5://127.0.0.1:1080 npm run smoke:do
```

Unset means "use the jump-host default above". The value is applied to both the test
browser and the Keycloak login browser, so the two cannot diverge. Mac and Windows
projects keep their fixed tunnel; you can still align those ports in the configuration
files under `e2e/setup`.

The test cases for the smoke tests are tagged with `@smokeTest`

Example test:
```js
test(
    'Gitlab main branch link is visible',
    { tag: '@smokeTest' },
    async ({ page }) => {
      const ranTemplatesPage = new RanTemplatesListPage(page);
      await ranTemplatesPage.goto();
      await expect(
        page.getByRole('link', { name: 'Open GitLab main branch in a' })
      ).toBeVisible();
    }
  );
```

#### Tooling to write Playwright Integration Tests

##### Playwright Code Generator
You can develop Playwright tests with Playwright Code Generator, documentation [see](https://playwright.dev/docs/codegen#generate-tests-with-the-playwright-inspector)

Record browser activities to generate Playwright test cases.
Run
```shell
npx playwright codegen --lang="en" --browser=firefox
```

##### Create Wiremock Stub

You can create mock data by your own or you use theTesla Mock Generator App.

The Mock Generator App is a Python-based CLI tool that processes .har files and generates Wiremock compatible JSON request-response stubs from them. The program continuously monitors the e2e/wiremock/input/ directory for new .har files, processes them to generate stubs, and moves the processed files to a e2e/wiremock/input/history folder to avoid duplicate processing. The folders will be created if they not existing.

The Mock Generator App is running as a background process.

Run to start
```shell
./e2e/scripts/run_mockGenerator.sh
Starting mock-generator ... done
Attaching to mock-generator
mock-generator | Listening for new HAR files in the input directory..
```
How to create .har files for Mock Generator App [see](https://gitlab.devops.telekom.de/tnap/development/tesla-team/exploration/mock-generator#mock-generator-app)

You can reload the Wiremock stubs with
```shell
./reload-stubs.sh          
--2026-01-11 11:19:56--  http://localhost:8085/__admin/mappings/reset
Resolving localhost (localhost)... 127.0.0.1, ::1
Connecting to localhost (localhost)|127.0.0.1|:8085... connected.
HTTP request sent, awaiting response... 
  HTTP/1.1 200 OK
```

## OpenAPI generator

For generating client APIs we are using [openapi-generator](https://github.com/OpenAPITools/openapi-generator).

The OpenApi files are generated as a pre-step to the overall `start` goal that is invoked when running
`npm start`. As such, all OpenApi files are freshly generated on each build.

To manually generate the OpenApi files run:

```bash
npm run openapi
```

Directory structure for openapi:

```sh
$ tree openapi
openapi
├── input
│   ├── api.yaml             # complete portal-bff openapi definition
│   ├── api_community.yaml   # portal-ng bff definition
│   └── api_tnap.yaml        # TaaSOS portal-bff definition
└── openapi-merge.json       # api.yaml is merged based on this config

1 directory, 4 files
```

### Configuration

The `openapi-generator-cli` package is configured via the `openapitools.json`.
All available properties can be found at the [openapi generator page](https://openapi-generator.tech/docs/generators/typescript-angular/) for the `typescript-angular` generator.

### Workaround for windows machines using a company proxy

Add a private repository in `openapitools.json` like this

```json
{
  "$schema": "./node_modules/@openapitools/openapi-generator-cli/config.schema.json",
  "generator-cli": {
    "version": "7.0.0",
    "repository": {
      "downloadUrl": "https://{username}:{password}@artifactory.devops.telekom.de/artifactory/maven-central/org/openapitools/openapi-generator-cli/7.0.0/openapi-generator-cli-7.0.0.jar"
    },
    "generators": { ... }
  }
}
```

Important: Global variables as for instance in `.npmrc` are not working here!

### CI pipeline: download JAR before generation

The project now runs `bash ./openapi/scripts/prepare-generator-jar.sh` in `preopenapi`.
This script downloads the required OpenAPI Generator JAR to
`node_modules/@openapitools/openapi-generator-cli/versions/<version>.jar` before generation starts.

For CI, configure credentials via variables (recommended):

- `OPENAPI_GENERATOR_USER` (fallback: `ART_USERNAME`)
- `OPENAPI_GENERATOR_TOKEN` (fallback: `ART_PASSWORD`)
- optional: `OPENAPI_GENERATOR_JAR_URL` (overrides `generator-cli.repository.downloadUrl`)

Example for CI jobs:

```bash
npm ci --legacy-peer-deps
npm run openapi
```

Because `openapi` has a `preopenapi` script, the JAR is prepared automatically before the generator runs.

### Local usage without variables

If `OPENAPI_GENERATOR_USER`, `OPENAPI_GENERATOR_TOKEN`, and `OPENAPI_GENERATOR_JAR_URL` are not set locally,
the prepare script behaves as follows:

- If the required JAR already exists in `node_modules/@openapitools/openapi-generator-cli/versions/`, it is reused.
- If the JAR is missing, it falls back to Maven Central and downloads
  `org/openapitools/openapi-generator-cli/<version>/openapi-generator-cli-<version>.jar`.

So local execution still works with `npm run openapi` even without CI credentials.

## Generate lists of licenses from used libraries

```bash
npm run licences
```

The lists can be found in home directory of the project

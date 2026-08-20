import { defineConfig, devices } from '@playwright/test';
import { clusterLaunchOptions } from './e2e/setup/cluster-env';

/*
 * Parallel on CI too, not just locally (where Playwright's own default is already "50%"
 * of the cores). Expressed as a percentage rather than a fixed count so it scales with
 * whatever runner picks the job up.
 *
 * Capped well below 100% on purpose: each worker drives its own Firefox, but all of them
 * share ONE `ng serve` (:4200) and ONE WireMock (:8085), and the dev server compiles and
 * serves on a single Node process. Past roughly half the cores the workers mostly queue
 * behind that shared server, so wall-clock stops improving while slow responses start
 * pushing specs into `expect.timeout`.
 *
 * `PW_WORKERS` overrides it for a one-off run (e.g. bisecting a suspected ordering bug
 * with `PW_WORKERS=1`). A plain count must be passed as a number — Playwright validates
 * `workers` as "number or percentage", and the numeric *string* an env var gives you is
 * neither, so `PW_WORKERS=1` would otherwise fail config validation rather than run.
 *
 * The NaN check is the important part: `Number('abc')` is NaN, which Playwright accepts as
 * a number and then reports as "Running N tests using NaN workers" — it runs nothing at all
 * and still exits 0. A typo in a CI variable would turn the whole e2e job into a silent
 * no-op that reports success, so reject it here instead.
 */
function resolveWorkers(): number | string {
  const override = process.env.PW_WORKERS;
  if (!override) {
    return '50%';
  }
  if (override.endsWith('%')) {
    return override;
  }
  const count = Number(override);
  if (!Number.isInteger(count) || count < 1) {
    throw new Error(
      `PW_WORKERS must be a positive integer or a percentage (e.g. "4" or "50%"), got "${override}".`
    );
  }
  return count;
}

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  workers: resolveWorkers(),
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /*
   * Per-test budget. Must stay well above `expect.timeout` and the longest in-spec wait
   * (30s in the treeview specs), otherwise a slow assertion hits the test timeout first
   * and the failure is reported as a bare "Test timeout exceeded" instead of the locator diff.
   */
  timeout: 60_000,
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    // baseURL: 'http://localhost:3000',

    /* Keep failure evidence for local runs too, where there is no retry. See https://playwright.dev/docs/trace-viewer */
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    /*
     * Pinned here rather than per spec: several specs assert dates/numbers the app formats
     * through the browser locale and timezone, so leaving these to the runner's machine
     * makes those assertions pass or fail depending on where they run.
     */
    locale: 'en',
    timezoneId: 'Europe/Bratislava',
  },
  // For expect calls
  expect: {
    timeout: 10000,
  },

  /* Configure projects for major browsers */
  projects: [
    // Setup project that runs auth
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    { name: 'setupDoMac', testMatch: /.*\.setupDoMac\.ts/ },
    { name: 'setupDoOneMac', testMatch: /.*\.setupDoOneMac\.ts/ },
    { name: 'setupDoWin', testMatch: /.*\.setupDoWin\.ts/ },
    { name: 'setupDoOneWin', testMatch: /.*\.setupDoOneWin\.ts/ },
    { name: 'setupPreLabOneWin', testMatch: /.*\.setupPreLabOneWin\.ts/ },
    { name: 'setupPreLabTwoWin', testMatch: /.*\.setupPreLabTwoWin\.ts/ },
    { name: 'setupDoLinux', testMatch: /.*\.setupDoLinux\.ts/ },
    { name: 'setupDoOneLinux', testMatch: /.*\.setupDoOneLinux\.ts/ },
    { name: 'setupPreLabOneLinux', testMatch: /.*\.setupPreLabOneLinux\.ts/ },
    { name: 'setupPreLabTwoLinux', testMatch: /.*\.setupPreLabTwoLinux\.ts/ },
    {
      name: 'local',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'playwright/.auth/user.json',
        baseURL: 'http://localhost:4200',
      },
      // *.mvp.spec.ts belongs to the local-mvp project: treeview.component.html picks
      // the tree mode from the session's permissions, so the two views can only be tested
      // under different storage states.
      grepInvert: [/@mvpOperator/],
      dependencies: ['setup'],
    },
    {
      name: 'local-mvp',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'playwright/.auth/mvpOperator_user.json',
        baseURL: 'http://localhost:4200',
      },
      dependencies: ['setup'],
      grep: [/@mvpOperator/],
    },
    /*
     * The cluster projects below run against LIVE clusters, so each one is pinned to
     * `grep: /@smokeTest/`. Without it a direct `npx playwright test --project=do-mac`
     * would fire the whole WireMock-oriented suite at a real environment; the tag filter
     * must not live only in e2e/scripts/smokeTest.sh, which is just one entry point.
     */
    {
      name: 'do-mac',
      use: {
        ...devices['Desktop Firefox'],
        launchOptions: {
          proxy: {
            server: 'socks5://127.0.0.1:17385',
          },
        },
        headless: true,
        ignoreHTTPSErrors: true,
        storageState: 'playwright/.auth/doMac_user.json',
        baseURL: 'https://portal-do-dev-argo.tnaplab.telekom.de',
      },
      grep: /@smokeTest/,
      dependencies: ['setupDoMac'],
    },
    {
      name: 'do1-mac',
      use: {
        ...devices['Desktop Firefox'],
        launchOptions: {
          proxy: {
            server: 'socks5://127.0.0.1:17385',
          },
        },
        headless: true,
        ignoreHTTPSErrors: true,
        storageState: 'playwright/.auth/doOneMac_user.json',
        baseURL: 'https://portal-do1-dev-argo.tnaplab.telekom.de',
      },
      grep: /@smokeTest/,
      dependencies: ['setupDoOneMac'],
    },
    {
      name: 'do-win',
      use: {
        ...devices['Desktop Firefox'],
        headless: true,
        ignoreHTTPSErrors: true,
        storageState: 'playwright/.auth/doWin_user.json',
        baseURL: 'https://portal-do-dev-argo.tnaplab.telekom.de',
      },
      grep: /@smokeTest/,
      dependencies: ['setupDoWin'],
    },
    {
      name: 'do1-win',
      use: {
        ...devices['Desktop Firefox'],
        headless: true,
        ignoreHTTPSErrors: true,
        storageState: 'playwright/.auth/doOneWin_user.json',
        baseURL: 'https://portal-do1-dev-argo.tnaplab.telekom.de',
      },
      grep: /@smokeTest/,
      dependencies: ['setupDoOneWin'],
    },
    {
      name: 'preLab1-win',
      use: {
        ...devices['Desktop Firefox'],
        headless: true,
        ignoreHTTPSErrors: true,
        storageState: 'playwright/.auth/preLabOneWin_user.json',
        baseURL: 'https://portal-1.pre-lab.rando.tenant.das-schiff.telekom.de/',
      },
      grep: /@smokeTest/,
      dependencies: ['setupPreLabOneWin'],
    },
    {
      name: 'preLab2-win',
      use: {
        ...devices['Desktop Firefox'],
        headless: true,
        ignoreHTTPSErrors: true,
        storageState: 'playwright/.auth/preLabTwoWin_user.json',
        baseURL: 'https://portal-2.pre-lab.rando.tenant.das-schiff.telekom.de/',
      },
      grep: /@smokeTest/,
      dependencies: ['setupPreLabTwoWin'],
    },
    /*
     * Linux mirrors the mac setup: e2e/scripts/smokeTest.sh resolves `${CLUSTER}-linux`,
     * and Linux devs reach the clusters through the same local socks5 tunnel as mac —
     * unless E2E_SOCKS_PROXY overrides it (`none` for a dev VM already inside the
     * network). The matching auth.setupDo*Linux.ts launches its own browser and reads
     * the same helper, so both routes stay in sync.
     */
    {
      name: 'do-linux',
      use: {
        ...devices['Desktop Firefox'],
        ...clusterLaunchOptions(17385),
        headless: true,
        ignoreHTTPSErrors: true,
        storageState: 'playwright/.auth/doLinux_user.json',
        baseURL: 'https://portal-do-dev-argo.tnaplab.telekom.de',
      },
      grep: /@smokeTest/,
      dependencies: ['setupDoLinux'],
    },
    {
      name: 'do1-linux',
      use: {
        ...devices['Desktop Firefox'],
        ...clusterLaunchOptions(17385),
        headless: true,
        ignoreHTTPSErrors: true,
        storageState: 'playwright/.auth/doOneLinux_user.json',
        baseURL: 'https://portal-do1-dev-argo.tnaplab.telekom.de',
      },
      grep: /@smokeTest/,
      dependencies: ['setupDoOneLinux'],
    },
    {
      name: 'preLab1-linux',
      use: {
        ...devices['Desktop Firefox'],
        // The pre-lab tunnel listens on a different port than do/do1 — see
        // e2e/setup/auth.setupPreLabOneWin.ts, which already tunnels through 9097.
        ...clusterLaunchOptions(9097),
        headless: true,
        ignoreHTTPSErrors: true,
        storageState: 'playwright/.auth/preLabOneLinux_user.json',
        baseURL: 'https://portal-1.pre-lab.rando.tenant.das-schiff.telekom.de/',
      },
      grep: /@smokeTest/,
      dependencies: ['setupPreLabOneLinux'],
    },
    {
      name: 'preLab2-linux',
      use: {
        ...devices['Desktop Firefox'],
        ...clusterLaunchOptions(9097),
        headless: true,
        ignoreHTTPSErrors: true,
        storageState: 'playwright/.auth/preLabTwoLinux_user.json',
        baseURL: 'https://portal-2.pre-lab.rando.tenant.das-schiff.telekom.de/',
      },
      grep: /@smokeTest/,
      dependencies: ['setupPreLabTwoLinux'],
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: !process.env.remote
    ? {
        timeout: 4 * 60 * 1000,
        command: 'npm run start:e2e',
        url: 'http://localhost:4200',
        reuseExistingServer: !process.env.CI,
        stdout: 'pipe',
      }
    : undefined,
});

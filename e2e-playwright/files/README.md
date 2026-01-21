# Testing Hub - End-to-End Tests

This repository contains the end-to-end (E2E) automated tests for the Testing Hub application.
The tests are written using **Playwright** for browser automation and **Cucumber.js** for Behavior-Driven Development (BDD).

## How to run E2E tests locally

This guide describes how to set up and run the `testinghub-e2e-testing` automated tests on a local machine.

### Software Requirements

Before you begin, ensure you have the following software installed on your system:

*   **Node.js**: Version 18.x or higher is recommended. You can verify your version by running `node -v` in your terminal.
*   **Git**: For cloning the project repository.
*   **A code editor**: Such as Visual Studio Code.

> **NOTE**: All executions in this setup must be done with root privileges or admin rights. In Windows, remember to open terminals and IDEs with administrator rights. In Ubuntu, add the `sudo -E` flag to your commands.

### Setup Instructions

Follow these steps to prepare your local environment for running the tests.

#### 1. Clone the Repository

First, clone the `testinghub-e2e-testing` repository to your local machine.

```bash
git clone https://bitbucket.biscrum.com/scm/testinghub/testinghub-e2e-testing.git
cd testinghub-e2e-testing
```

#### 2. Install Project Dependencies

This project uses npm to manage its dependencies. It is recommended to use `npm ci` which provides faster and more reliable builds, but for a first-time local setup, `npm install` will also work.

Run one of the following commands from the root of the project directory:

```bash
npm install
```

or for a clean install matching `package-lock.json`:

```bash
npm ci
```

This will install all the necessary packages defined in `package-lock.json` into the `node_modules` directory.

#### 3. Configure Environment Variables

The tests require specific environment variables for authentication and to target the correct application environment.

1.  Create a new file named `.env` in the root of the project directory.
2.  Copy the contents from `.env.template` into your new `.env` file.
3.  Fill in the required values. You will need to get the credentials for the test account from the openshift secrets (testinghub-cd/secrets/x2thubtestaccount).

Your `.env` file should look like this:

```
X2_ACC=your_test_account_email@example.com
X2_PASS=your_test_account_password
GOOGLE_KEY=your_mfa_google_authenticator_key
THUB_ENV=dev # or staging, qa, test
```

*   `X2_ACC`: The email for the test account.
*   `X2_PASS`: The password for the test account.
*   `GOOGLE_KEY`: The secret key for the Multi-Factor Authentication (MFA) TOTP generation.
*   `THUB_ENV`: The Testing Hub environment to run the tests against (e.g., `dev`, `staging`, `qa`).

**Note**: The `.env` file is listed in `.gitignore`, so your credentials will not be accidentally committed to the repository.

#### 4. Install Playwright Browsers

Playwright requires specific browser binaries to run the tests. Install them by running:

```bash
npx playwright install
```
#### 5. Modify the context in the hooks.ts
Modify the context in  tests/support/hooks.ts to be like:

```typescript
context = await chromium.launchPersistentContext(tempProfilePath, {
    channel: 'msedge',
    headless: false,
    ignoreHTTPSErrors: true,
  });
```
You can use either headless as `false` if you want to see the browser UI or `true` if not.

### Running Tests

Once the setup is complete, you can run the tests using npm scripts.

#### Running All Tests

To run all tests, execute:
```bash
npm run test:e2e
```

#### Running Specific Tests with Tags

You can run a subset of tests by specifying Cucumber tags. For example, to run only the tests tagged with @BreadcrumbsNavigation, use the following command:
```bash
npm run test:e2e -- --tags "@BreadcrumbsNavigation"
```

#### JUnit XML Report**: `test-results/reports/cucumber_report.xml`

Additionally, Playwright-specific outputs like videos and traces (on retry) for failed tests are stored in the `test-results/` directory, which can be invaluable for debugging.


### Test Data Preparation (CI/CD)

In the CI/CD pipeline (Jenkinsfile), a dedicated stage named `stagePrepareTestData` is responsible for setting up the necessary test data before running the E2E tests. This stage is executed for all environments except `prod`.

The process involves:

1.  **Triggering a CronJob**: It creates a unique OpenShift Job (e.g., `load-test-data-job-BUILD_NUMBER`) from a predefined CronJob (`load-test-data-job`) in the target namespace (e.g., `testinghub-dev`, `testinghub-staging`). This Job is designed to insert or prepare the required test data in the application's backend.
    ```groovy
    oc create job ${jobName} --from=cronjob/${cronJobName} --namespace ${targetNamespace}
    ```
2.  **Waiting for Completion**: The pipeline then waits for this newly created OpenShift Job to complete successfully, with a timeout of 15 minutes.
    ```groovy
    oc wait --for=condition=complete job/${jobName} --namespace ${targetNamespace} --timeout=15m
    ```
3.  **Cleanup**: After the test data preparation Job finishes (successfully or with failure), the pipeline ensures that the temporary Job is deleted from the OpenShift cluster.
    ```groovy
    oc delete job ${jobName} --namespace ${targetNamespace} --ignore-not-found=true
    ```
<br> </br>
<br> </br>
<br> </br>


## E2E Test Repository Structure & Notes

This guide outlines the structure of the `testinghub-e2e-testing` repository, explaining where key components are located and their purpose.

### 1. Overall Folder Structure

The project follows a standard structure for Playwright and Cucumber, separating test definitions from their technical implementation.

```
testinghub-e2e-testing/
├── tests/
│   ├── acceptance/
│   │   ├── features/         # (A) Test scenarios in Gherkin
│   │   └── step_definitions/ # (B) Implementation of the steps
│   └── support/
│       ├── hooks.ts          # (C) Setup, teardown, and data preparation logic
│       └── ...               # Other helper files (world, login, etc.)
├── .env.template             # Template for environment variables
├── cucumber.js               # Configuration for Cucumber.js
├── package.json              # Project dependencies and scripts
└── playwright.config.ts      # Configuration for Playwright
```

Each important section is detailed below.

### 2. (A) Scenario Definitions (`/features`)

Test scenarios are defined in the `tests/acceptance/features/` folder.

*   **.feature files**: Each file contains one or more test scenarios written in Gherkin, a human-readable language.
*   **Given-When-Then syntax**: Tests are structured using keywords like `Given`, `When`, `Then`, `And`, and `But` to describe the application's expected behavior.

Example (`BreadcrumbsNavigation.feature`):

```gherkin
Feature: Breadcrumbs Navigation

  Scenario: Verify navigation from Project Overview to Home via breadcrumbs
    Given User navigates to the project overview page of project with id 34624
    When User clicks on the home breadcrumbs
    Then User should see the Projects Cards section
```

### 3. (B) Step Implementation (`/step_definitions`)

The `tests/acceptance/step_definitions/` folder contains the TypeScript (`.ts`) files that implement the code executed for each step defined in the `.feature` files.

*   **Gherkin-to-Code Connection**: Cucumber.js maps each Gherkin line (e.g., `Given User navigates to the home page`) to a function in these files.
*   **Playwright Logic**: Inside these functions is where Playwright commands are used to interact with the browser (clicking, filling forms, navigating, etc.).

Example (`homePage.steps.ts`):

```typescript
import { Given, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

Given('User navigates to the home page', async function () {
  await this.page.goto('https://testinghub.example.com/');
});

Then('User should see the Projects Cards section', async function () {
  const projectCardsSection = this.page.locator('#project-cards');
  await expect(projectCardsSection).toBeVisible();
});
```

### 4. (C) `hooks.ts` - Setup, Teardown

The `tests/support/hooks.ts` file is crucial for preparing and cleaning up the test environment. "Hooks" are functions that run automatically before or after scenarios.

Its main responsibilities are:

*   **`BeforeAll`**: This runs once before the entire test suite begins. It is responsible for:
    *   Launching a persistent browser context (Microsoft Edge).
    *   Performing a single login with MFA. This authenticated state is saved to a temporary profile and reused across all tests, which significantly speeds up the test run.
*   **`AfterAll`**: Runs once after all tests have finished. It closes the browser context and cleans up the temporary profile directory.
*   **`Before`**: Runs before each individual scenario. It creates a new page (tab) within the already authenticated browser context.
*   **`After`**: Runs after each individual scenario. It is used for:
    *   Taking a screenshot if the scenario failed, which is essential for debugging.
    *   Closing the page to ensure a clean state for the next test.

In summary, `hooks.ts` ensures that every test runs in a predictable and controlled environment, handling repetitive tasks like login and browser management efficiently.

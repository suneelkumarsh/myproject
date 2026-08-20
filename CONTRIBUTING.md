# Contributing Guidelines

These guidelines are mandatory for all developers contributing to this portal.

## Governance and Ownership

- Changes and additions to this file are welcome.
- Team Tesla is responsible for updates to `CONTRIBUTING.md` and `developer-instructions.md`.
- Changes must be submitted via merge requests and can be discussed with Team Tesla beforehand.

## 1. Repository and Code Location

- Only internal company GitLab repositories may be used.
- Code remains property of Deutsche Telekom and and must remain inside Deutsche Telekom. Remote storage is therefor only allowed on Telekom servers (gitlab.devops.telekom.de, artifactory.devops.telekom.de).
It is within your personal responsibility that Telekom code used locally on your machine for the purpose of SW development IS NOT leaked to a 3rd party or any external server.

## 2. Branch Flow

The following branch naming conventions must be used:

- `main`
- `feature/[JiraTicketNumber]-[meaningful-title-from-jira-ticket]`
- `release/[major-version].[minor-version]`
- `fix/[JiraTicketNumber]-[meaningful-title-from-jira-ticket]`
- `bugfix/[JiraTicketNumber]-[meaningful-title-from-jira-ticket]`

Examples:

- `feature/ABC-123_add-user-permission-checks`
- `bugfix/ABC-456_fix-template-permission-guard`

Release branch is optional. Releases are created from `main` as long as main only contains bug fixes for that release. A release branch must be created once new features are added to `main` that would thus otherwise land in the release.

When a fix is needed in an active release branch, changes may be cherry-picked from `main` only if they are explicitly required for that release.
Cherry-pick only the minimal, relevant commits (for example urgent fixes), avoid pulling unrelated feature commits, and verify that tests pass on the release branch after cherry-picking.

## 3. Commits

- Commit messages must follow the Conventional Commits pattern.
- Recommended format: `type(scope): short summary`.
- Supported types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `build`, `ci`, `perf`, `revert`.
- Use `!` after type or scope for breaking changes (example: `feat(api)!: remove legacy endpoint`).
- Keep the summary short and imperative (for example: `fix(auth): handle expired token`).
- If needed, add a body with context and a footer for references (for example Jira ticket IDs).
- Developers should push their code at least once per day to minimize delivery risk if a developer becomes unavailable.

## 4. Merge Request Rules

### 4.1 General requirements

- Merge request titles must start with `[JiraTicketNumber]`.
- A merge request description must include at least:
  - a summary of the changes,
  - additional screenshots where functionally or UI-wise meaningful.
- Every merge request requires two team approvals.
- Enable `Squash commits` and `Delete source branch` in merge requests.
- Keep merge requests as small as possible.
- Reviews with too many files or hundreds of changed lines should be avoided.
- A merge request should be created as a draft with the first commit so pipeline quality checks start early.
- Changed code in a merge request must be covered by unit tests with at least 80% coverage.

### 4.2 Code review

- Reviewers open review threads for the code lines that need changes
- After making code changes that are meant to address code review comments, answer in the thread that you have
  addressed the changes
- Review threads are closed by the reviewer, not by the author of the MR!
- If reviewers think that your code changes do not address the original intent of the review comments, then reviewers should
  write that in the thread and state their reasoning why they think it is not yet addressed
- Review discussions do not happen via other channels like Slack or Teams, but are all done on the MR. This let's us later reason
  about why the code was written in the way it was!

## 5. Quality, Build, and Tests

- Every final merge request must contain runnable code.
- The code in the target branch must remain runnable after merge.
- SonarQube issues that cause the quality gate to fail must be fixed before merge.
- Unit tests and Playwright tests must be available and pass without errors before merge.

## 6. Validation in the Development Environment

- Merged code must be tested by the developer in the respective development integration environment (the doX-dev|rcX-dev kubernetes cluster)

## 7. End-User Documentation

- User help pages must be updated for changed or new user-facing functionality
- User help repository: https://gitlab.devops.telekom.de/tnap/development/apps/portal/rando-help/rando-help

## 8. Security and Secrets

- Passwords, tokens, or any other secrets must never be included in source code.

## 9. Deployment and Runtime Context

- The produced code runs in Docker containers within Kubernetes pods in the target environment.
- Deployments use Helm charts, and those charts are maintained in separate GitLab repositories.
- Required environment-specific configuration must be provided via environment variables.
- These variables are overridden in Helm charts and later deployment stages by Flux or Argo.

## 10. Mandatory Compliance

- These rules are mandatory for all contributors.
- Any exception must be agreed in advance with team leads or responsible architects.

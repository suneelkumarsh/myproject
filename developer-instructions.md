# Portal UI Developer Instructions

## Governance and Ownership
- Changes and additions to these instructions are welcome.
- Team Tesla is responsible for updates to this instructions file and to `CONTRIBUTING.md`.
- Changes must be submitted via merge requests and can be discussed with Team Tesla beforehand.

## Scope
These instructions apply to all code changes in this repository.

## Angular Version and Dependencies
- Keep the current Angular major/minor line unchanged (currently Angular 19.2.3).
- Do not upgrade Angular packages, RxJS, or TypeScript versions unless explicitly requested.
- Prefer solutions compatible with the existing toolchain and project scripts.

## State Management and Reactivity
- Prefer Angular Signals for new component-local state and derived state.
- Use `signal`, `computed`, and `effect` for new local UI logic where appropriate.
- When consuming RxJS streams in components, prefer bridging with `toSignal` where it improves readability.
- Use `BehaviorSubject` where a stream must hold and replay a current value (especially shared/service state).
- Prefer encapsulation for subjects in services:
  - keep subjects private where possible,
  - expose readonly observables/signals for consumers,
  - avoid exposing mutable subjects directly unless existing patterns require it.

## RxJS Subscription Lifecycle
- Always clean up subscriptions.
- For new Angular code, prefer `DestroyRef` + `takeUntilDestroyed` from `@angular/core/rxjs-interop`.
- Prefer `async` pipe over manual `subscribe()` in components for template-bound observable data.
- When touching legacy code using an unsubscribe service or `takeUntil`, keep behavior stable and do not introduce leaks.
- Avoid manual `Subscription` arrays unless there is a clear reason.

## Angular Template Syntax
- In new or touched templates, prefer modern Angular control flow syntax:
  - `@if` instead of `*ngIf`
  - `@for` instead of `*ngFor`
- Use `track` expressions in `@for` for stable rendering whenever feasible.

## Change Detection and Template Performance
- Prefer `ChangeDetectionStrategy.OnPush` for new components where feasible.
- Do not call component methods/functions directly from templates.
- Move template-facing derived values to signals/computed properties or readonly view-model fields.

## Accessibility and WCAG
- Accessibility has high priority for all user-facing changes.
- New or changed pages/components should follow WCAG principles (perceivable, operable, understandable, robust).
- Prefer semantic HTML and ensure keyboard accessibility for interactive elements.
- Provide accessible names/labels for controls, inputs, and icon-only actions.
- Ensure sufficient color contrast and visible focus states.
- Add or update tests for critical accessibility-related behavior where practical.

## CSS Usage and Styling
- Reuse existing styles from central stylesheets first (for example global/shared styles in the project) before adding new local styles.
- Keep style definitions consistent with the existing design language and tokens/variables.
- Add component-level style extensions only when a local concern cannot be covered cleanly by central styles.
- Avoid duplicating style rules that already exist centrally.
- For UI changes, prefer using existing UI elements from `@portal-mfe/tnap-ui-kit` wherever possible before introducing custom implementations.

## Unit Testing
- Add or update unit tests for every new or changed business-relevant code path.
- For newly added code, target at least 80% unit test coverage.
- Tests should be deterministic, isolated, and focused on behavior.
- Use existing Angular/Karma/Jasmine conventions in this repository.

## Playwright E2E Testing
- For new user-facing functionality, add Playwright tests under the `e2e` folder.
- Follow existing structure in `e2e/tests` and existing naming conventions (`*.spec.ts`, setup patterns).
- Cover critical user paths and regressions introduced by the change.
- For new template elements used in Playwright selectors, add stable `qa_` CSS classes (for example `qa_save-button`) to make E2E tests easier to author and maintain.

## Change Scope and Safety
- Keep changes minimal and consistent with existing project architecture.
- Preserve existing behavior unless the task explicitly asks for behavior changes.
- Prefer incremental refactoring over broad rewrites.
- Update or add tests together with code changes.

## Architecture and Design Patterns
- Keep business logic in services, not in components.
- Components should focus on presentation, user interaction wiring, and delegating logic to services.
- Use established design patterns where they improve maintainability and testability (for example facade/service abstraction, adapter, strategy, and repository-like API wrappers where applicable).
- Prefer consistency with existing project patterns over introducing new abstractions.

## API Access and OpenAPI
- Use API services generated from the OpenAPI Generator for backend communication.
- Do not create custom ad-hoc HTTP API calls when an OpenAPI-generated client/service exists.
- Keep generated API clients as the source of truth for request/response contracts.
- Add handwritten wrappers/facades only for orchestration, mapping, or UI-facing composition on top of generated clients.

## Authorization and Permissions
- User actions on pages must be protected by appropriate permissions.
- Define and maintain permissions in `src/app/permissions.config.ts`.
- For every new user-facing action (for example create, edit, delete, approve, reject, execute), verify that a matching permission exists and is enforced in the UI flow.
- For permission checks in templates, use `hasPermissionsGuard` and `HasPermissionPipe` from `@portal-mfe/auth`.
- If the required permission is unclear or missing, ask the responsible developer/product owner for the expected permission mapping before implementation.
- After clarification, add missing permission constants to `src/app/permissions.config.ts` and wire them into the affected page/action.

## Internationalization (i18n)
- All constant user-facing texts in templates (labels, headers, buttons, hints, messages) must be translated via i18n pipe/translation keys.
- Do not hardcode German or English UI strings directly in templates.
- Extend the corresponding translation files under `src/assets/i18n` for both German and English whenever new UI text is introduced or changed.
- Keep translation keys consistent with the existing naming conventions and feature/module structure.

## Output Expectations for Code Changes
- Explain why a chosen pattern was used if multiple valid options exist.
- Call out any trade-offs, migration constraints, or follow-up tasks.

## Do and Don't Examples

### Signals and Local UI State
Do:
- Use signals for local mutable UI state and computed state.

Don't:
- Add a new local `BehaviorSubject` in a component when a signal is enough.

### BehaviorSubject Usage
Do:
- Use `BehaviorSubject` in services for shared state that needs a current value.
- Keep subjects private and expose readonly streams/signals.

Don't:
- Expose mutable subjects publicly from services unless an existing pattern requires it.

### Subscription Cleanup
Do:
- Use `DestroyRef` with `takeUntilDestroyed` in new Angular code.
- Prefer `async` pipe when binding observable values in templates.
- Keep existing unsubscribe-service patterns stable in touched legacy files.

Don't:
- Leave raw `subscribe()` calls without teardown.
- Subscribe in components only to mirror observable values for direct template rendering.
- Introduce new manual subscription arrays without a strong reason.

### Angular Template Control Flow
Do:
- Prefer `@if` and `@for` in new or edited templates.
- Add `track` in `@for` when a stable identity is available.

Don't:
- Introduce new `*ngIf` or `*ngFor` in touched templates without a project-specific reason.

### Change Detection and Template Calls
Do:
- Prefer `ChangeDetectionStrategy.OnPush` for new components where practical.
- Expose precomputed values to templates via signals/computed/read-only fields.

Don't:
- Call methods/functions from templates.
- Use default change detection for new components without a clear reason.

### Business Logic Placement
Do:
- Put data mapping, orchestration, and domain decisions in services.
- Keep components thin and delegate reusable logic to services.

Don't:
- Implement complex business rules directly in components.
- Duplicate domain logic across multiple components.

### Design Pattern Usage
Do:
- Reuse existing patterns already used in the codebase.
- Introduce a pattern only when it clearly reduces duplication or complexity.

Don't:
- Introduce new patterns only for stylistic reasons.
- Create deep abstraction layers that hide simple logic.

### UI Component Reuse
Do:
- Prefer UI elements from `@portal-mfe/tnap-ui-kit` for new or changed UI controls where they fit the requirement.
- Use custom UI elements only when no suitable `@portal-mfe/tnap-ui-kit` component exists or a documented requirement cannot be fulfilled otherwise.

Don't:
- Rebuild UI controls from scratch when equivalent components are already available in `@portal-mfe/tnap-ui-kit`.

### Shared Component Strategy
Do:
- Consider creating a shared component when similar UI or logic is reused across multiple features.
- Evaluate whether the functionality belongs in a shared library (e.g. @portal-mfe/tnap-ui-kit) before implementing locally.
- Ensure new shared components are generic, reusable, and properly documented.

Don't:
- Duplicate similar components or logic across the codebase.
- Add feature-specific or tightly coupled implementations into shared libraries.

### Object-Oriented Design
Do:
- Follow established OOP principles such as encapsulation, single responsibility, and clear separation of concerns.
- Design classes and modules with maintainability, readability, and extensibility in mind.
- Prefer composition over inheritance where it improves flexibility and testability.

Don't:
- Create tightly coupled or overly complex class hierarchies.
- Mix multiple responsibilities within a single class or module.

### Accessibility (A11y)
Do:
- Use semantic elements (`button`, `a`, `nav`, `main`, `table`) before adding ARIA roles.
- Ensure all interactive controls are reachable and usable via keyboard.
- Provide accessible names for icon-only buttons and inputs (`aria-label`, `aria-labelledby`, or visible label text).
- Keep visible focus indicators and ensure sufficient color contrast.
- Use `aria-live` only for dynamic status messages that need to be announced.

Don't:
- Use clickable `div`/`span` as buttons without proper semantics and keyboard handling.
- Remove focus outlines without replacing them with an accessible focus style.
- Rely on color alone to convey state (error/success/selection).
- Add redundant or conflicting ARIA attributes when native HTML already provides semantics.

Examples (Angular template):

Good:
```html
<button type="button" aria-label="Refresh data" (click)="reload()">
  <i class="bi-arrow-clockwise" aria-hidden="true"></i>
</button>
```

Bad:
```html
<button type="button" (click)="reload()">
  <i class="bi-arrow-clockwise"></i>
</button>
```

Good:
```html
<button type="button" class="link-like" (click)="openDetails()">Details</button>
```

Bad:
```html
<div class="link-like" (click)="openDetails()">Details</div>
```

Good:
```html
<span class="status status-error">
  <i class="bi-exclamation-circle" aria-hidden="true"></i>
  Error
</span>
```

Bad:
```html
<span class="status status-error"></span>
```

### Testing Requirements
Do:
- Add or update unit tests for changed behavior.
- Target at least 80% unit test coverage for newly added code.
- Add Playwright tests under `e2e` for new user-facing flows.
- Add stable `qa_` classes to new template elements that are relevant for Playwright interaction or assertions.

Don't:
- Merge business-relevant changes without corresponding unit tests.
- Add UI features without regression coverage in e2e when user-facing behavior changes.
- Depend on brittle Playwright selectors based only on layout, text content, or generated class names when a `qa_` class can be used.

### Dependency and Version Safety
Do:
- Keep Angular on 19.2.3 unless explicitly requested otherwise.

Don't:
- Upgrade Angular, RxJS, or TypeScript as part of unrelated feature work.

### API Access and OpenAPI
Do:
- Use OpenAPI-generated services/clients for API calls.
- Keep custom service code focused on mapping/orchestration around generated clients.

Don't:
- Add new handcrafted API calls with `HttpClient` when generated clients already cover the endpoint.
- Duplicate API contract types manually when generated models exist.

### Authorization and Permissions
Do:
- Protect new user actions with explicit permission checks.
- Reuse existing permission constants from `src/app/permissions.config.ts` when possible.
- Use `hasPermissionsGuard` and `HasPermissionPipe` from `@portal-mfe/auth` for template-level permission checks.
- Ask the developer/product owner for required permissions when the mapping is unknown.
- Add new permission constants to `src/app/permissions.config.ts` when required and use them consistently in the related UI flow.

Don't:
- Introduce new actionable UI controls without permission protection.
- Hardcode permission strings directly in components/templates when a constant can be defined in `src/app/permissions.config.ts`.
- Introduce custom ad-hoc template permission checks when `hasPermissionsGuard` or `HasPermissionPipe` already cover the use case.
- Assume permission mappings without confirmation if requirements are unclear.

### Internationalization (i18n)
Do:
- Translate constant template texts via translation keys and pipe.
- Update both German and English JSON translation files in `src/assets/i18n`.

Don't:
- Hardcode visible UI texts directly in templates.
- Add new keys to only one language file.

## Pull Request Review Profile

### Objective
- Ensure every change is safe, testable, maintainable, and aligned with project standards.

### Must-pass Review Gates
- Scope and behavior:
  - Changes are minimal and focused on the requested outcome.
  - No unintended behavior changes are introduced.
- Angular and reactivity:
  - New local UI state uses Signals where appropriate.
  - `BehaviorSubject` is used only when current-value replay/shared stream state is needed.
  - Mutable subjects are not exposed publicly unless required by existing patterns.
- Subscription lifecycle:
  - No unguarded `subscribe()` in production code.
  - New code uses `DestroyRef` + `takeUntilDestroyed`.
  - `async` pipe is preferred over manual component subscriptions for template-bound observables.
  - Touched legacy teardown patterns remain correct and leak-free.
- Template conventions:
  - New or modified templates use `@if` and `@for`.
  - `@for` includes `track` whenever a stable key exists.
  - No template function calls are introduced.
- Change detection:
  - New components prefer `ChangeDetectionStrategy.OnPush` unless an explicit reason is documented.
- Testing:
  - Unit tests are added/updated for business-relevant changes.
  - Newly added code targets at least 80% unit test coverage.
  - User-facing changes include Playwright regression coverage in `e2e/tests`.
  - New template elements relevant to Playwright coverage include stable `qa_` classes for robust selectors.
- UI consistency and reuse:
  - New or changed UI elements use `@portal-mfe/tnap-ui-kit` components wherever feasible.
  - Custom UI components are introduced only with a clear functional/design reason.
- API access:
  - API communication uses OpenAPI-generated services/clients.
  - No unnecessary handcrafted API calls are introduced when generated clients exist.
- Authorization and permissions:
  - New user actions are protected by explicit permission checks.
  - Required permissions are defined centrally in `src/app/permissions.config.ts`.
  - Template-level permission checks use `hasPermissionsGuard` and `HasPermissionPipe` from `@portal-mfe/auth`.
  - Missing or unclear permission mappings are clarified with the developer/product owner before implementation.
- Internationalization (i18n):
  - Constant template texts are translated via keys/pipe instead of hardcoded strings.
  - German and English translation files under `src/assets/i18n` are updated together.
- Dependency safety:
  - Angular, RxJS, and TypeScript versions remain unchanged unless explicitly requested.

### Review Output Format
- Findings first, ordered by severity, each with file references.
- Then open questions or assumptions.
- Then a brief change summary and residual risks.

### Severity Levels
- Blocker:
  - Must be fixed before merge.
  - Examples: build/test broken, data loss risk, security vulnerability, clear behavioral regression in critical flow.
- High:
  - High risk of user-visible defect or production issue.
  - Should be fixed before merge unless explicitly accepted with rationale.
- Medium:
  - Important maintainability, correctness edge case, or test gap.
  - Can be merged only with explicit follow-up task.
- Low:
  - Minor improvement, readability, or non-critical consistency issue.
  - Optional for current PR; track as follow-up when useful.

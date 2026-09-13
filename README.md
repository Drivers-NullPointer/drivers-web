# DriversWeb

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.3.2.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

For a headless full-suite run with coverage, use `npm run test:coverage -- --browsers=ChromeHeadless`.
The pre-push hook runs the full coverage suite; do not bypass it. For dispatch-only tests,
use `npx ng test --watch=false --browsers=ChromeHeadless --code-coverage=false --ts-config=tsconfig.dispatch-spec.json --include="src/app/home/dispatch/**/*.spec.ts"`.
The include pattern must match the restricted TypeScript configuration.

## Backend contracts

Contract checks against the local Kotlin backend cover these integration boundaries:

- `/auth/login` returns user identity; `/auth/refresh` returns only `token` and nullable
  `refreshToken`. Panel roles are verified through `/admin/session`, not inferred from refresh data.
- `/auth/verify-account` returns plain text, not a JSON login response.
  Password reset and reset-email requests complete with an empty response body.
- Pagination uses zero-based `page`, `limit`, `totalElements`, and `totalPages`.
  Sort fields and sort order use uppercase enum names.
- Driver edits use `PUT /admin/drivers/{id}` with multipart data: date-only
  `birthdate` (`YYYY-MM-DD`) and the optional image part named `file`.
- Vehicle catalogs return arrays containing `id` and `name`; models also contain `makeId`.
  Vehicle creation/update uses numeric `modelId`/`colorId` and `year`; updates use `PUT`.
  Admin driver creation and direct vehicle deletion are not exposed by the backend.
- Trip dates are nullable serialized strings. `driverReceivedAt` is optional: older
  backend revisions do not return it. Assignment is not proof of delivery to the app,
  and an app receipt is not proof the driver read the trip.

These are source-contract checks, not a live deployment smoke test. The local backend's
receipt/GPS changes were uncommitted during review; backend deployment must be verified separately.

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

# Repository Guidelines

## Project Structure & Module Organization
- `src/main.js` bootstraps the Vue 3 app with the `@` alias; feature views live under `src/views/` and shared widgets under `src/components/`.
- API clients sit in `src/api/` (`http.js` for axios config, `tasks.js` / `github.js` for feature calls) and reusable hooks land in `src/utils/`.
- Use `src/assets/` for bundled media, `public/` for static files, `image/` for reference captures, and treat `dist/` as build output only.

## Build, Test, and Development Commands
- `npm run dev` starts the webpack dev server on `http://localhost:5173` with HMR.
- `npm run build` emits a production bundle to `dist/` for release checks or deployment packaging.
- `npm run lint` (or `npm run lint:fix`) enforces the ESLint + Prettier rules defined in `eslint.config.mjs` and `.prettierrc`.
- `npm run test` runs the Vitest suite once; `npm run test:watch` keeps it hot while iterating.
- `npm run type-check` runs `vue-tsc --noEmit` against the JS/Vue sources using `tsconfig.json`.

## Coding Style & Naming Conventions
- Prefer `<script setup>` + `<style lang="less" scoped>` with two-space indentation and hyphenated template bindings (e.g., `:selected-keys`).
- Components/views use PascalCase filenames; utilities/composables use camelCase; group imports from packages before local `@/` paths.
- Let Prettier handle formatting; avoid manual tweaks that fight the configured rules.

## Testing Guidelines
- Place component specs in `src/__tests__/` or alongside the component as `*.spec.js`, using Vitest + Vue Test Utils helpers.
- Aim for ≥70% coverage on new logic; include CLI coverage output or highlight gaps in the PR if thresholds are missed.
- When backends are unavailable, document the manual scenarios you validated (e.g., “Dashboard list refresh via `npm run dev`”).

## Commit & Pull Request Guidelines
- Keep commits focused, present tense, and follow the `type: summary` style (e.g., `fix: handle fofa modal reset`).
- PRs should cite linked issues, include before/after screenshots for UI touches (assets under `image/`), and list verification steps.
- Rebase onto `main` before requesting review and flag environment/config changes prominently.
- 沟通：Issue、PR、代码评审中请使用中文回答，保持上下文一致。

## Configuration & Security Notes
- Configure API hosts via `.env` (`VUE_APP_API_BASE_URL`, `VUE_APP_API_TIMEOUT`) and update `.env.example` whenever keys change.
- Centralise error/401 handling in `src/api/http.js`; raise user-facing issues with `message.error` instead of silent failures.
- Auth state persists in `localStorage` via `src/utils/auth.js`; always verify logout clears storage and never commit real secrets.

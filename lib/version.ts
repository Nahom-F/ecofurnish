// Single source of truth for the app version — bump it with
// `npm version patch|minor|major` (or by hand) in package.json and
// everywhere that imports this constant picks it up automatically.
import packageJson from "@/package.json";

export const APP_VERSION: string = packageJson.version;

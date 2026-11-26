import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import clerkNext from "@clerk/eslint-plugin/next";
import eslintConfigPrettier from "eslint-config-prettier";

// Parent-relative imports would bypass the @/-based boundary patterns below, so every
// no-restricted-imports block repeats this one (flat config replaces, never merges, options).
const noParentImports = {
  group: ["../*"],
  message: "Use the @/ alias instead of a parent-relative import.",
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: { "@clerk/next": clerkNext },
    rules: {
      "@clerk/next/require-auth-protection": [
        "error",
        {
          protected: ["src/app/dashboard/**", "src/features/**"],
          public: [
            "src/app/(auth)/**",
            "src/app/(home)/**",
            // The landing page's feature, same reasoning as the route
            // it serves: it renders for signed-out visitors by
            // definition.
            "src/features/home/**",
            // Changing language needs no session - the landing page and
            // the sign-in screen both offer the switcher, so requiring
            // auth here would break it for exactly the visitors most
            // likely to need it.
            "src/features/locale/**",
          ],
          resources: {
            routeHandlers: true,
            serverFunctions: true,
            serverComponentEntrypoints: true,
          },
        },
      ],
    },
  },
  {
    // Type-only imports say so (`import type`), so a reader knows what exists at runtime.
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [noParentImports] }],
      // Packages first, a blank line, then @/ and relative imports; autofixable.
      "import/order": [
        "error",
        {
          groups: [
            ["builtin", "external"],
            ["internal", "parent", "sibling", "index"],
          ],
          pathGroups: [{ pattern: "@/**", group: "internal" }],
          "newlines-between": "always",
        },
      ],
      "import/no-cycle": ["error", { ignoreExternal: true }],
    },
  },
  {
    files: ["src/shared/**/*.{ts,tsx}"],
    // messages.ts is the single intentional i18n aggregator that merges feature JSON catalogues.
    ignores: ["src/shared/config/i18n/messages.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            noParentImports,
            {
              group: ["@/features/*", "@/app/*"],
              message:
                "src/shared/ must stay domain-free and never import from features/ or app/.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/features/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            noParentImports,
            {
              group: ["@/app/*"],
              message:
                "src/features/ must not depend on Next.js route modules in src/app/.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/shared/components/ui/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".agents/**",
  ]),
  // Must stay last: only turns off formatting-related rules that would
  // conflict with Prettier, doesn't touch correctness rules.
  eslintConfigPrettier,
]);

export default eslintConfig;

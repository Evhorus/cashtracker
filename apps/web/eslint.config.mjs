import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import clerkNext from "@clerk/eslint-plugin/next";
import eslintConfigPrettier from "eslint-config-prettier";

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
    files: ["src/shared/**/*.{ts,tsx}"],
    // messages.ts is the single intentional i18n aggregator that merges feature JSON catalogues.
    ignores: ["src/shared/config/i18n/messages.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
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

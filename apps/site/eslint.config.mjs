// eslint-config-next 16 ships native flat config arrays (Linter.Config[]) for
// its "core-web-vitals" and "typescript" submodules — they are no longer
// legacy-format configs. Routing them through FlatCompat.extends() (the
// pattern documented for eslint-config-next <16) makes @eslint/eslintrc try
// to validate an array as a legacy config object, which throws
// "Converting circular structure to JSON" while formatting that validation
// error (a self-referencing eslint-plugin-react flat config can't be
// JSON.stringify'd). Importing the flat arrays directly avoids that path.
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default [
  ...nextCoreWebVitals,
  ...nextTypescript,
  { ignores: [".next/**", ".velite/**", "public/static/**"] },
];

require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
    root: true,
    extends: ['@layerzerolabs/eslint-config-next/recommended'],
    plugins: [
        'import'
      ],
    rules: {
        // @layerzerolabs/eslint-config-next defines rules for turborepo-based projects
        // that are not relevant for this particular project
        'turbo/no-undeclared-env-vars': 'off',
        'import/no-unresolved': 'warn',
        'import/order': 'error',
        'import/no-duplicates': 'error', 
        'import/no-unused-modules': 'warn', 
    },
};

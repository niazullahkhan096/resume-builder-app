module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json', // Path to your tsconfig.json
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:jest/recommended',
    ],
    plugins: ['@typescript-eslint', 'jest'],
    env: {
        node: true,
        jest: true,
        es2020: true,
    },
    rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': 'warn',
        'jest/expect-expect': 'off', // Disable rule for missing assertions in tests
    },
};

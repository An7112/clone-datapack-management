module.exports = {
    'rootDir': '.',
    'verbose': true,
    'collectCoverageFrom': [
        'src/**/*.{js,jsx,ts,tsx}',
        '!src/**/*.d.ts',
    ],
    'setupFiles': [
        'react-app-polyfill/jsdom',
        'jest-canvas-mock',
    ],
    'setupFilesAfterEnv': [],
    'testMatch': [
        '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
        '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}',
    ],
    'testEnvironment': 'jest-environment-jsdom-fourteen',
    'transform': {
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
        '^.+\\.css$': 'webpack-config/config/jest/cssTransform.js',
        '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': 'webpack-config/config/jest/fileTransform.js',
    },
    'transformIgnorePatterns': [
        '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|ts|tsx)$',
        '^.+\\.module\\.(css|sass|scss)$',
    ],
    'modulePaths': [
        'src',
    ],
    'moduleNameMapper': {
        '^react-native$': 'react-native-web',
        '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
        '\\.worker.js':'<rootDir>/__mocks__/workerMock.js',
        '@/(.*)': '<rootDir>/src/$1',
    },
    'moduleFileExtensions': [
        'web.js',
        'js',
        'web.ts',
        'ts',
        'web.tsx',
        'tsx',
        'json',
        'web.jsx',
        'jsx',
        'node',
    ],
    'watchPlugins': [
        'jest-watch-typeahead/filename',
        'jest-watch-typeahead/testname',
    ],
};
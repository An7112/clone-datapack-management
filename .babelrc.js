module.exports = function (api) {
    api.cache(true);

    const presets = [
        [
            "@babel/preset-env",
            {
                "useBuiltIns": "entry",
                "corejs": 3,
                "loose": true
            }
        ],
        "react-app"
    ];
    const plugins = [
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-private-methods',
        ["@babel/plugin-proposal-private-property-in-object", { "loose": false }],
        '@babel/plugin-proposal-nullish-coalescing-operator',
        [
            'import',
            {
                'libraryName': '@ant-design/icons',
                camel2DashComponentName: false,
                'customName': (transformedMethodName) => {
                    if (transformedMethodName === 'default') {
                        return '@ant-design/icons/es/components/Icon';
                    }
                    return `@ant-design/icons/${transformedMethodName}`;
                },
            },
            'icon',
        ],
        [
            "import",
            {
                "libraryName": "antd", "libraryDirectory": "lib",
                "style": true
            }
        ],
        [
            "@babel/plugin-transform-runtime",
            {
                "absoluteRuntime": false,
                "corejs": 3,
                "helpers": true,
                "regenerator": true,
                "useESModules": false
            }
        ],
    ];

    return {
        presets,
        plugins
    };
}
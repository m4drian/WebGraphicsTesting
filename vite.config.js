import topLevelAwait from 'vite-plugin-top-level-await';

export default{
    root: ".",
    publicDir: "./public",
    build: {
        outDir: "./build"
    },
    plugins: [topLevelAwait()]
};
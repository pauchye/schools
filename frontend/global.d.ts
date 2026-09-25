// CSS is imported for its side effect only (webpack's style-loader), never
// as a value.
declare module '*.css'

// webpack's CommonJS-style require(), used for the bundled JSON data files
// instead of ES `import` so they stay easy to spot as static data loads.
declare function require(id: string): any

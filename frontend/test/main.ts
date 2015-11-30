declare var require: any;

console.log('START TESTS', new Date().toLocaleTimeString().toString());

const testsContext = require.context('.', true, /Tests\.ts$/);
testsContext.keys().forEach(testsContext);

// const componentsContext = require.context('../src/', true, /\.ts$/);
// for (let fileName of componentsContext.keys()) {
//     if (fileName.indexOf('main.ts') === -1) {
//         componentsContext(fileName);
//     }
// }

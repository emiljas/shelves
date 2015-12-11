declare var require: any;

const testsContext = require.context('.', true, /Tests\.ts$/);
testsContext.keys().forEach(testsContext);

const workersContext = require.context('.', true, /\.worker\.ts$/);
workersContext.keys().forEach(workersContext);

const componentsContext = require.context('../src/', true, /\.ts$/);
for (let fileName of componentsContext.keys()) {
    if (fileName.indexOf('main.ts') === -1) {
        componentsContext(fileName);
    }
}

declare var require: any;

const testsContext = require.context('.', true, /Tests\.ts$/);

testsContext.keys().forEach(testsContext);

const componentsContext = require.context('../src/', true, /.ts$/);

componentsContext.keys().forEach(componentsContext);

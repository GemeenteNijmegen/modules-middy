import { GemeenteNijmegenTsPackage } from '@gemeentenijmegen/projen-project-type';

const project = new GemeenteNijmegenTsPackage({
  defaultReleaseBranch: 'main',  
  depsUpgradeOptions: {
    workflowOptions: {
      branches: ['main'],
    },
  },
  devDeps: ['@gemeentenijmegen/projen-project-type'],
  name: '@gemeentenijmegen/middy',
  projenrcTs: true,
  repository: 'https://github.com/GemeenteNijmegen/modules-middy.git',
  deps: [
    '@middy/core',
    '@gemeentenijmegen/utils',
    '@types/aws-lambda',
    'zod',
    '@types/http-errors',
    'http-errors',
  ],
});

project.synth();
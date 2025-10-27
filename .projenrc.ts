import { GemeenteNijmegenTsPackage } from '@gemeentenijmegen/projen-project-type';

const project = new GemeenteNijmegenTsPackage({
  defaultReleaseBranch: 'main',
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

// Manually add resolutions to package.json / temporarily fix dependency issues
project.package.addField('resolutions', {
  '@types/aws-lambda': '8.10.145',
});

project.synth();
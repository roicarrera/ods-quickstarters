module.exports = {
  default: {
    timeout: 60000, // 60 segundos
    requireModule: ['ts-node/register'],
    require: [
      'tests/acceptance/step_definitions/*.ts',
      'tests/support/*.ts'
    ],
    paths: ['tests/acceptance/features/'],
    format: [
      'progress-bar',
      'html:test-results/reports/cucumber-report.html',
      '@cucumber/pretty-formatter',
      'json:test-results/reports/cucumber_report.json',
      'junit:test-results/reports/cucumber_report.xml'
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    tags: 'not @skip and not @wip'
  }
};

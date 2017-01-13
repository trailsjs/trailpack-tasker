'use strict'

const _ = require('lodash')
const smokesignals = require('smokesignals')

const App = {
  pkg: {
    name: require('../package').name + '-test'
  },
  api: {
    models: {},
    controllers: {},
    services: {},
    tasks: {
      TestTask: require('./TestTask'),
      TestTask2: require('./TestTask2'),
      TestTask3: require('./TestTask3'),
      OtherTestTask: require('./OtherTestTask'),
      ErrorTestTask: require('./ErrorTestTask'),
      MultiAckTest: require('./MultiAckTest')
    }
  },
  config: {
    log: {
      logger: new smokesignals.Logger('error')
    },
    main: {
      packs: [
        require('../')
      ]
    },
    tasker: {
      profiles: {
        testProfile: {
          tasks: ['TestTask', 'TestTask2', 'TestTask3', 'ErrorTestTask', 'MultiAckTest']
        },
        otherProfile: {
          tasks: ['OtherTestTask']
        }
      },
      worker: 'testProfile',
      exchange: 'my-test-exchange-name'
    }
  }
}
_.defaultsDeep(App, smokesignals.FailsafeConfig)
module.exports = App

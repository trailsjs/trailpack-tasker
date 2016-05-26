'use strict'

const _ = require('lodash')
const smokesignals = require('smokesignals')

module.exports = _.defaultsDeep({
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
      OtherTestTask: require('./OtherTestTask')
    }
  },
  config: {
    log: {
      logger: new smokesignals.Logger('error')
    },
    main: {
      packs: [
        smokesignals.Trailpack,
        require('trailpack-core'),
        require('../')
      ]
    },
    tasker: {
      profiles: {
        testProfile: {
          tasks: ['TestTask', 'TestTask2', 'TestTask3']
        },
        otherProfile: {
          tasks: ['OtherTestTask']
        }
      },
      worker: 'testProfile',
      exchange: 'my-test-exchange-name'
    }
  }
}, smokesignals.FailsafeConfig)

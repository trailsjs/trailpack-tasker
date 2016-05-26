'use strict'

const Task = require('../lib/Task')

module.exports = class TestTask extends Task {

  constructor (app, message) {
    super(app, message)
  }
  run () {

    this.app.log.info('got a message in test task', this.message.body)
    this.app.testValue = this.message.body.testValue

    if (!this.app.callCount) {
      this.app.callCount = 1
    }
    else {
      this.app.callCount++
    }
    this.message.ack()
  }

}

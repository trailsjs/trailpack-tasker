'use strict'

const Task = require('../lib/Task')

module.exports = class TestTask3 extends Task {

  constructor (app, message) {
    super(app, message)
  }

  run () {
    // TODO if services are singletons, and multiple tasks are prefetched
    // this might not work
    this.app.testValue = this.message.body.testValue

    if (!this.app.callCount) {
      this.app.callCount = 1
    }
    else {
      this.app.callCount++
    }
    setTimeout(() => {
      try {
        if (this.interrupted) {
          this.app.log.verbose('task was interrupted, not acking')
        }
        else {
          this.app.log.verbose('task was not interrupted, acking')
          this.ack()
        }
      }
      catch (e) {
        this.app.log.verbose('Problem acking task3', e)
      }
    }, 2000)
  }

  interrupt (message) {
    this.app.log.info('interrupt called with task id: ' + message.body.taskId)
    if (this.id === message.body.taskId) {
      try {
        // mark this task as interrupted
        this.interrupted = true
        // interruptCount is used for unit testing purposes
        if (!this.app.interruptCount) {
          this.app.interruptCount = 1
        }
        else {
          this.app.interruptCount++
        }
        this.app.log.info('rejecting original message')
        // reject the task
        this.reject()
        // ack the interrupt message
        message.ack()
      }
      catch (e) {
        this.app.log.info('An error in interrupt code', e)
      }
    }
    else {
      this.app.log.info('interrupt not meant for me :(')
    }
  }

}

'use strict'

module.exports = class Task {
  constructor (app, message) {
    this.app = app
    this.message = message
    this.id = message.body.taskId
  }

  run () {
    throw new Error('Subclasses must override Task.run')
  }

  interrupt (msg) {
    this.app.log.debug('Task Interrupt:', msg)
  }

  finalize (results) {
    this.app.log.debug('Task Finalize:', results)
  }
}

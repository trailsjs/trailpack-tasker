const Service = require('trails-service')

module.exports = class Task extends Service {
  constructor (app, payload) {
    super(app)

    this.payload = payload
    this.id = Math.round(Math.random() * Math.pow(2, 31)).toString(36)
  }

  run () {
    throw new Error('Subclasses must override Task.run')
  }

  interrupt (msg) {
    this.log.debug('Task Interrupt:', msg)
  }

  finalize (results) {
    this.log.debug('Task Finalize:', results)
  }
}

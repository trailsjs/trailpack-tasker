'use strict'

const amqp = require('amqplib')
const Trailpack = require('trailpack')
const lib = require('./lib')

module.exports = class TaskerTrailpack extends Trailpack {

  /**
   * TODO document method
   */
  validate () {

  }

  /**
   * TODO document method
   */
  configure () {
  }

  /**
   * Establish connection to the RabbitMQ exchange, listen for tasks.
   */
  initialize () {
    const config = this.app.config.tasker
    return amqp.connect(config.rabbitmq.uri)
      .then(connection => {
        this.connection = connection

      })
  }

  constructor (app) {
    super(app, {
      config: require('./config'),
      api: require('./api'),
      pkg: require('./package')
    })
  }
}

exports.Task = lib.Task

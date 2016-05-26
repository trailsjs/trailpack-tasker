'use strict'

const Trailpack = require('trailpack')
const lib = require('./lib')
const _ = require('lodash')
const rabbit = require('wascally')
const uuid = require('node-uuid')
const joi = require('joi')
const config = require('./lib/config')

rabbit.shutdown = function(app){
  rabbit.clearAckInterval()
  return rabbit.closeAll()
}

module.exports = class TaskerTrailpack extends Trailpack {

  /**
   * TODO document method
   */
  validate() {
    this.app.config.tasker = _.defaultsDeep(this.app.config.tasker, config.defaults)
    this.app.log.info('tasker config', this.app.config.tasker)
    return new Promise((resolve, reject) => {
      joi.validate(this.app.config.tasker, config.schema, (err, value) => {
        if (err) return reject(new Error('Tasker Configuration: ' + err))

        return resolve(value)
      })
    })
  }

  /**
   * configure rabbitmq exchanges, queues, bindings and handlers
   */
  configure() {
    const taskerConfig = this.app.config.tasker

    const profileName = taskerConfig.worker

    if (!profileName || !taskerConfig.profiles[profileName]) {
      // dont bind queues if this is not a worker process
      return
    }

    const profile = taskerConfig.profiles[profileName]

    const exchangeName = this.app.config.tasker.exchange || 'tasker-work-x'
    const workQueueName = 'tasker-work-q'
    const interruptQueueName = 'tasker-interrupt-q'


    taskerConfig.exchanges = [{
      name: exchangeName,
      type: 'topic',
      autoDelete: false
    }]

    taskerConfig.queues = [{
      name: workQueueName,
      autoDelete: false,
      subscribe: true
    }, {
      name: interruptQueueName,
      autoDelete: false,
      subscribe: true
    }]

    taskerConfig.bindings = [{
      exchange: exchangeName,
      target: workQueueName,
      keys: profile.tasks
    }, {
      exchange: exchangeName,
      target: interruptQueueName,
      keys: profile.tasks.map(task => { return task + '.interrupt' })
    }]

    this.app.tasker = {
      handlers: {}
    }

    profile.tasks.forEach(task => {
      this.app.tasker.handlers[task] = []
      const applogger = this.app.log
      // set up the task handler
      rabbit.handle(task, message => {
        const handler = new this.app.api.tasks[task](this.app, message)
        // add the current handler into the list of active handlers, so we know who should handle an interrupt call
        this.app.tasker.handlers[task].push(handler)
        try {
          handler.run()
        }
        catch (e) {
          applogger.error('Error thrown from handler.run', e, 'task: ', task)
        }
      })

      rabbit.handle(task + '.interrupt', message => {
        try {
          const taskId = message.body.taskId
          const activeHandler = _.find(this.app.tasker.handlers[task], handler => {
            return handler.id = taskId
          })

          if (!activeHandler) {
            applogger.info('Failed to interrupt task, no active handler found for task ' +
                task + ' and id ' + taskId)
            return message.reject()
          }

          activeHandler.interrupt(message)
        }
        catch (e) {
          applogger.error('Error thrown from handler.interrupt', e, 'task: ', task)
          message.nack()
        }
      })
    })

    this.app.tasker.publish = function (routingKey, data) {
      const taskId = uuid.v1()
      data.taskId = taskId
      return rabbit.publish(exchangeName, routingKey, data)
        .then(() => {
          return taskId
        })
    }

    this.app.tasker.cancelTask = function(task, taskId) {
      return rabbit.publish(exchangeName, task + '.interrupt', {
        taskId
      })
    }

  }

  /**
   * Establish connection to the RabbitMQ exchange, listen for tasks.
   */
  initialize() {
    return Promise.resolve(rabbit.configure(this.app.config.tasker))
  }

  constructor(app) {
    super(app, {
      config: require('./config'),
      api: require('./api'),
      pkg: require('./package')
    })
  }
}

exports.Task = lib.Task

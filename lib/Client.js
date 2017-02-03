'use strict'

const uuid = require('uuid')

module.exports = class Client  {

  constructor (app, rabbit, exchangeName) {
    this.app = app
    this.rabbit = rabbit
    this.exchangeName = exchangeName
    this.activeTasks = new Map()
  }

  publish (routingKey, data) {
    const taskId = uuid.v1()
    data.taskId = taskId
    return this.rabbit.publish(this.exchangeName, routingKey, data)
      .then(() => {
        return taskId
      })
  }

  cancelTask (taskName, taskId) {
    this.app.log.info('cancelling task', taskName, taskId, this.exchangeName)

    return this.rabbit.publish(this.exchangeName, `${taskName}.interrupt`, {
      taskId
    })
  }

}

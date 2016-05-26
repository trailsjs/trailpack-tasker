'use strict'

const assert = require('assert')
const rabbit = require('wascally')

describe('Trailpack', () => {
  let pack

  before(() => {
    pack = global.app.packs.tasker
  })

  after(() => {
    // give wascally time to run batch acks
    setTimeout(() => {
      rabbit.shutdown(global.app)
    }, 500)
  })

  it('should be loaded into the app.packs collection', () => {
    assert(pack)
  })

  it('should allow for publishing', done => {
    const testValue = 12378123
    global.app.tasker.publish('TestTask', { testValue })
    setTimeout(() => {
      assert.equal(global.app.callCount, 1)
      assert.equal(global.app.testValue, testValue)
      done()
    }, 10)
  })

  it('should only listen to tasks in its own profile', done => {
    const testValue = 3451324
    // OtherTestTask is in a different profile
    global.app.tasker.publish('OtherTestTask', { testValue })
    setTimeout(() => {
      assert.equal(global.app.callCount, 1)
      done()
    }, 10)
  })

  it('should listen to multiple tasks in its own profile', done => {
    const testValue = 893495872394
    global.app.tasker.publish('TestTask2', { testValue })
    setTimeout(() => {
      assert.equal(global.app.callCount, 2)
      assert.equal(global.app.testValue, testValue)
      done()
    }, 10)
  })

  it('should return a publish id, to be used for cancelling', () => {
    const testValue = 893495872394
    return global.app.tasker.publish('TestTask2', { testValue })
      .then(data => {
        global.app.log.info(data)
      })
  })

  it('should emit a cancel event', done => {
    const task = 'TestTask3'
    return global.app.tasker.publish(task, {})
      .then(taskId => {
        setTimeout(() => {
          return global.app.tasker.cancelTask(task, taskId)
            .then(() => {
              setTimeout(() => {
                assert.equal(global.app.interruptCount, 1)
                done()
              }, 500)
            })
        }, 100)
      })
  })
})

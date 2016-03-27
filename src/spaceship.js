import {SpaceplaneElement} from './elements'
import {log} from './utils'
import $ from 'jquery'

/**
 * 航天飞船
 */
export class Spaceship {
  runTimer = null
  powerTimer = null
  framePersecond = 10 // 每秒运行N帧

  constructor(id, config) {
    this.id = id
    this.cfg = $.extend({
      speed: 20,
      decPower: 5,
      addPower: 1,
      sender: null,
      accepter: null,
    }, config)
    this.accepterRemove = this.cfg.accepter.accept((msg) => {
      if (msg.type === 1 && msg.id == this.id) {
        log(`${this.id}号飞船收到消息`, msg, 'blue')
        switch(msg.command) {
        case 'run':
          this.run()
          break
        case 'stop':
          this.stop()
          break
        case 'destory':
          this.destory()
          break
        }
      }
    })
  }

  sendStatus() {
    if (this.cfg.sender) {
      this.cfg.sender.send({
        type: 2,
        id: this.id,
        status: this.status,
        power: this.power,
      })
    }
  }

  launch(planet, radius=100) {
    this.el = new SpaceplaneElement(planet, this.id + '号', radius, this.cfg.speed)
    this.planet = planet
    this.world = planet.world
    this.radius = radius
    this.power = 100
    this.status = 'stop'

    this.el.on('run.start', () => {
      this.status = 'run'
    }).on('run.step', () => {
      if (this.power < this.cfg.decPower) {
        this.stop()
        return
      }
      this.power -= this.cfg.decPower
      this.el.setPower(this.power)
    }).on('stop', () => {
      this.status = 'stop'
    })

    this.world.append(this.el)

    this.powerTimer = setInterval(() => {
      // 太阳能充能
      if (this.power + this.cfg.addPower < 100) {
        this.power += this.cfg.addPower
      } else {
        this.power = 100
      }
      this.el.setPower(this.power)

      // 定时发送自身状态
      this.sendStatus()
    }, 1000)
  }

  run() {
    this.el.run()
  }

  stop() {
    this.el.speedCut()
  }

  destory() {
    this.status = 'destory'
    this.sendStatus()
    this.el.remove()
    clearInterval(this.powerTimer)
    this.accepterRemove()
  }
}

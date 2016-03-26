import {SpaceplaneSprite} from './sprite'
import {log, random, nextTick} from './utils'
import $ from 'jquery'

/**
 * 航天飞船
 */
export class Spaceplane {
  runTimer = null
  powerTimer = null
  framePersecond = 10 // 每秒运行N帧

  constructor(id, config) {
    this.id = id
    this.sprite = new SpaceplaneSprite(this.id + '号')
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
          this.startRun()
          break
        case 'stop':
          this.stopRun()
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
    this.planet = planet
    this.canvas = planet.canvas
    this.radius = radius
    this.power = 100
    this.status = 'stop'

    this.sprite
    .moveTo(this.planet.x, this.planet.y - this.radius)
    .transform('scale', '0, 0')
    .css('transition', 'transform 0.5s linear')
    this.canvas.append(this.sprite)

    // 起飞动画
    nextTick(() => {
      this.sprite
      .transform('scale', '1, 1')
      .css('transformOrigin', `0 ${radius}px 0`) // 设置旋转中心到星球上
    })
    nextTick(() => {
      // 设置一帧动画耗时
      this.css('transition', `transform ${1/this.framePersecond}s linear`)
    })

    this.powerTimer = setInterval(() => {
      // 太阳能充能
      if (this.power + this.cfg.addPower < 100) {
        this.power += this.cfg.addPower
      } else {
        this.power = 100
      }
      this.sprite.setPower(this.power)

      // 定时发送自身状态
      this.sendStatus()
    }, 1000)
  }

  startRun() {
    if (this.runTimer) {
      return
    }
    var index = 0
    var run = () => {
      if (index++ % this.framePersecond === 0) {
        if (this.power < this.cfg.decPower) {
          this.stopRun()
          return
        }
        this.power -= this.cfg.decPower
        this.sprite.setPower(this.power)
      }
      this.sprite.css('box-shadow',
          `${-12-random(-3, 3)}px ${random(-1, 1)}px 12px -8px red`)
      this.surroundRun(this.cfg.speed/this.framePersecond)
    }
    this.status = 'run'
    run()
    this.runTimer = setInterval(run, 1000/this.framePersecond)
  }

  runTo(x, y, rotate) {
    this.sprite.moveTo(x, y, rotate)
  }

  surroundRun(diff) {
    var rotate = diff / this.radius / Math.PI
    this.runTo(this.sprite.x, this.sprite.y, this.sprite.rotate + rotate)
  }

  stopRun() {
    this.status = 'stop'
    this.sprite.css('box-shadow', 'none')
    if (this.runTimer) {
      clearInterval(this.runTimer)
      this.runTimer = null
    }
  }

  destory() {
    this.status = 'destory'
    this.sendStatus()
    this.stopRun()
    clearInterval(this.powerTimer)
    this.accepterRemove()
    this.sprite.remove()
    delete this
  }
}

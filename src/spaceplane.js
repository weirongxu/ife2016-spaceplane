import {SpaceplaneSprite, ShadowSprite} from './sprite'
import {log} from './utils'
import $ from 'jquery'

/**
 * 航天飞船
 */
export class Spaceplane {
  runTimer = null

  constructor(id, accepter, config) {
    this.id = id
    this.sprite = new SpaceplaneSprite(this.id + '号')
    this.cfg = $.extend({
      speed: 20,
      decPower: 0.05,
      addPower: 0.01,
    }, config)
    this.accepter = accepter
    this.accepterRemove = this.accepter.accept((msg) => {
      if (msg.id == this.id) {
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

  launch(planet, radius=100) {
    this.planet = planet
    this.canvas = planet.canvas
    this.canvas.append(this.sprite)
    this.radius = radius
    this.power = 1

    this.sprite
    .moveTo(this.planet.x, this.planet.y - this.radius)
    // .css('transition', 'transform 1s linear, left 1s linear, top 1s linear')

    setInterval(() => {
      if (this.power < 1) {
        this.power += this.cfg.addPower
        this.sprite.setPower(this.power)
      }
    }, 1000)
  }

  startRun() {
    if (this.runTimer) {
      return
    }
    var run = () => {
      if (this.power < this.cfg.decPower) {
        this.stopRun()
        return
      }
      this.power -= this.cfg.decPower
      this.sprite.setPower(this.power)
      this.surroundRun(this.cfg.speed)
    }
    run()
    this.runTimer = setInterval(run, 1000)
  }

  runTo(x, y, rotate) {
    (new ShadowSprite(this.sprite))
    .prependTo(this.canvas)

    this.sprite.moveTo(x, y, rotate)
  }

  surroundRun(diff, timer=1000) {
    // XXX 这个实现不太好
    if (diff > 5) {
      this.surroundRun(diff/2, timer/2)
      setTimeout(() => {
        this.surroundRun(diff/2, timer/2)
      }, timer/2)
    } else {
      var diffAngle = diff / this.radius
      var startAngle = Math.asin((this.sprite.y - this.planet.y) / this.radius)
      if (this.sprite.x < this.planet.x) {
        startAngle = Math.PI - startAngle
      }
      var endAngle = (startAngle + diffAngle)
      var endY = this.planet.y + Math.sin(endAngle) * this.radius
      var endX = this.planet.x + Math.cos(endAngle) * this.radius

      this.runTo(endX, endY, this.sprite.rotate + diffAngle / 2 / Math.PI)
    }
  }

  stopRun() {
    if (this.runTimer) {
      clearInterval(this.runTimer)
      this.runTimer = null
    }
  }

  destory() {
    this.stopRun()
    this.sprite.remove()
    this.accepterRemove()
  }
}

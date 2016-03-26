import {Sprite} from './sprite'
import {log, random, nextTick} from './utils'
import $ from 'jquery'

/**
 * 卫星
 */
export class Satellite {
  runTimer = null
  sprite = new Sprite()

  constructor(planet, radius, speed) {
    this.planet = planet
    this.canvas = planet.canvas
    this.radius = radius
    this.speed = speed
    this.sprite = new Sprite()
    this.sprite
    .size(30, 30)
    .moveTo(this.planet.x, this.planet.y - this.radius)
    .css({
      borderRadius: '100%',
      backgroundColor: 'black',
      boxShadow: '0px 0px 20px -2px white',
      transformOrigin: `0 ${radius}px 0`,  // 设置旋转中心到星球上
      transition: `transform 1s linear`, // 设置一帧动画耗时
    })
    this.canvas.append(this.sprite)
  }

  run() {
    var run = () => {
      this.surroundRun(this.speed)
    }
    this.runTimer = setInterval(run, 1000)
    run()
  }

  runTo(x, y, rotate) {
    this.sprite.moveTo(x, y, rotate)
  }

  surroundRun(diff) {
    var rotate = diff / this.radius / Math.PI
    this.sprite.moveTo(this.sprite.x, this.sprite.y, this.sprite.rotate + rotate)
  }

  stop() {
    if (this.runTimer) {
      clearInterval(this.runTimer)
      this.runTimer = null
    }
  }
}

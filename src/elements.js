import {Element} from './canvas'

export class PlanetElement extends Element {
  constructor(size) {
    super()
    this.width = this.height = this._size = size * 2
    this.img = new Image()
    this.img.src = 'imgs/planet.png'
  }

  draw() {
    this.ctx.translate(-this.width/2, -this.height/2)
    this.ctx.drawImage(this.img, 0, 0, this.width, this.height)
    return this
  }
}

export class SatelliteElement extends PlanetElement {
  runTimer = null

  constructor(planet, radius, speed) {
    super(30)
    this.planet = planet
    this.radius = radius
    this.speed = speed
    this.x = this.planet.x
    this.y = this.planet.y
    this.r = 0

    this.img = new Image()
    this.img.src = 'imgs/satellite.png'
  }

  draw() {
    this.ctx.rotate(this.r)
    this.ctx.translate(0, this.radius)
    this.ctx.translate(-this.width/2, -this.height/2)
    this.ctx.drawImage(this.img, 0, 0, this.width, this.height)
    return this
  }

  run() {
    var run = () => {
      this.surroundRun(this.speed)
    }
    this.runTimer = setInterval(run, 1000)
    run()
  }

  surroundRun(diff) {
    var r = diff / this.radius * Math.PI
    this.moveTo(this.x, this.y, this.r + r, 1000)
  }

  stop() {
    if (this.runTimer) {
      clearInterval(this.runTimer)
      this.runTimer = null
    }
  }
}

export class SpaceplaneElement extends Element {
  framePersecond = 10
  width = 70
  height = 25
  runTimer = null

  constructor(planet, name, radius, speed) {
    super()
    this.name = name
    this.setPower(100)
    this.planet = planet
    this.radius = radius
    this.speed = speed
    this.realSpeed = 0 // 真实速度
    this.accel = this.speed / 12 // 加速度

    this.x = this.planet.x
    this.y = this.planet.y
    this.r = 0

    this.img = new Image()
    this.img.src = 'imgs/spaceship.png'
    this.imgFire = new Image()
    this.imgFire.src = 'imgs/spaceship-fire.png'
  }

  draw() {
    this.ctx.rotate(this.r)
    this.ctx.translate(0, - this.radius)
    this.ctx.translate(-this.width/2, -this.height/2)
    if (this.runTimer) {
      this.ctx.drawImage(this.imgFire, 0, 0, this.width, this.height)
    } else {
      this.ctx.save()
      this.ctx.translate(-10, 0)
      this.ctx.drawImage(this.img, 0, 0, this.width, this.height)
      this.ctx.restore()
    }
    this.ctx.textBaseline = 'bottom'
    this.ctx.textAlign = 'center'
    this.ctx.fillStyle = 'white'
    this.ctx.fillText(`${this.name}-${(this._power).toFixed()}%`, this.width/2, 0)
    return this
  }

  getPower() {
    return this._power
  }

  setPower(power) {
    this._power = power
    this.emit('update.power', power)
  }

  run() {
    this.clearRunTimer()
    this.emit('run.start')
    this.accel = Math.abs(this.accel)

    var index = 0
    var run = () => {
      // 模拟加速度
      if (this.realSpeed + this.accel < this.speed) {
        this.realSpeed += this.accel
      }
      if (this.realSpeed <= 0) {
        this.stop()
      }
      if (index++ % this.framePersecond === 0) {
        this.emit('run.step')
      }
      this.surroundRun(this.realSpeed/this.framePersecond, 1000/this.framePersecond)
    }

    this.runTimer = setInterval(run.bind(this), 1000/this.framePersecond)
    run()
  }

  surroundRun(diff, time) {
    var r = diff / this.radius * Math.PI
    this.moveTo(this.x, this.y, this.r + r, time)
  }

  speedCut() {
    // 模拟减速运动
    this.accel = -Math.abs(this.accel)
  }

  stop() {
    this.emit('stop')
    this.clearRunTimer()
  }

  clearRunTimer() {
    if (this.runTimer) {
      clearInterval(this.runTimer)
      this.runTimer = null
    }
  }

  remove() {
    this.clearRunTimer()
    super.remove()
  }
}

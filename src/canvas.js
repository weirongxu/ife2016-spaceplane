import {map} from './utils'
import {EventEmitter} from './utils'

export class World {
  elements = {}

  constructor(viewport, canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.viewport = viewport
    this.canvas.width = this.width = viewport.clientWidth
    this.canvas.height = this.height = viewport.clientHeight
  }

  has(element) {
    return element.id in this.elements
  }

  prepend(element) {
    if (! this.has(element)) {
      element.world = this
      element.ctx = this.ctx
      this.elements[element.id] = element
      // this.$dom.prepend(element.DOM)
    }
  }

  append(element) {
    if (! this.has(element)) {
      element.world = this
      element.ctx = this.ctx
      this.elements[element.id] = element
      // this.$dom.append(element.DOM)
    }
  }

  remove(element) {
    delete this.elements[element.id]
  }

  run() {
    this.render()
    setTimeout(() => {
      this.fresh()
    }, 30)
  }

  fresh() {
    // this.run()
    window.requestAnimationFrame(this.run.bind(this))
  }

  render() {
    // this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    map(this.elements, (it) => {
      this.ctx.save()
      it.render()
      this.ctx.restore()
    })
  }
}

export class Element extends EventEmitter {
  static ID = 0
  childs = []
  x = 0
  y = 0
  r = 0
  width = 1
  height = 1
  animateTimers = []

  constructor() {
    super()
    this.id = ++ Element.ID
  }

  draw() {
    return this
  }

  render() {
    // this.ctx.translate(this.x - this.width/2, this.y - this.height/2)
    this.ctx.translate(this.x, this.y)
    this.ctx.rotate(this.rotate)
    this.ctx.save()
    this.draw()
    this.ctx.restore()
    this.renderChild()
  }

  renderChild() {
    this.childs.forEach((it) => {
      this.ctx.save()
      it.render()
      this.ctx.restore()
    })
    return this
  }

  moveTo(x, y, r=this.r, time=0) {
    if (time) {
      this.clearAnimate()
      var count = Math.ceil(time / 30)
      var perTime = time / count
      var diffX = (x - this.x) / count
      var diffY = (y - this.y) / count
      var diffR = (r - this.r) / count
      for (var i=0; i < count; ++i) {
        (() => {
          var _x = this.x + i * diffX
          var _y = this.y + i * diffY
          var _r = this.r + i * diffR
          this.animateTimers.push(setTimeout(() => {
            this.animateTimers.unshift()
            this.x = _x
            this.y = _y
            this.r = _r
          }, perTime * i))
        })()
      }
    } else {
      [this.x, this.y, this.r] = [x, y, r]
    }
  }

  clearAnimate() {
    var timer
    while(this.animateTimers.length) {
      timer = this.animateTimers.shift()
      clearTimeout(timer)
    }
  }

  remove() {
    this.world.remove(this)
  }

  prepend(element) {
    this.childs.unshift(element)
  }

  append(element) {
    this.childs.push(element)
  }

  prependTo(target) {
    target.prepend(this)
    return this
  }

  appendTo(target) {
    target.append(this)
    return this
  }
}

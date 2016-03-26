import {EventEmitter} from './utils'
import $ from 'jquery'

export class Sprite extends EventEmitter {
  static ID = 0
  _transform = {}

  constructor(x=0, y=0) {
    super()
    // this.pos = pos
    this.id = ++ Sprite.ID

    this.DOM = document.createElement('div')
    this.$dom = $(this.DOM)
    this.$dom[0].dataset.id = this.id
    this.$dom[0].dataset.type = this.constructor.name
    this.css({
      position: 'absolute',
    })
    .moveTo(x, y)
  }

  render() {
    return this
  }

  css(...args) {
    this.$dom.css(...args)
    return this
  }

  move(offsetX, offsetY, offsetTotate) {
    this.moveTo(this.x + offsetX, this.y + offsetY, this.rotate + offsetTotate)
    return this
  }

  moveTo(x, y, rotate=0) {
    this.x = x
    this.y = y
    this.rotate = rotate

    this.css({
      left: this.x + 'px',
      top: this.y + 'px',
    })
    .transform('rotate', `${this.rotate}turn`)
    return this
  }

  size(w, h) {
    this.width = w
    this.height = h
    this.css({
      width: w + 'px',
      height: h + 'px',
    })
    return this
  }

  axisCenter() {
    this
    .transform('translate', '-50%, -50%')
    .css('transformOrigin', '0 0 0')
    return this
  }

  text(text) {
    this.$dom.text(text)
    return this
  }

  animate(...args) {
    this.$dom.animate(...args)
    return this
  }

  transform(name, value) {
    this._transform[name] = value
    var transformCss = []
    for (name in this._transform) {
      transformCss.push(`${name}(${this._transform[name]})`)
    }
    this.css('transform', transformCss.join(' '))
    return this
  }

  remove() {
    this.$dom.remove()
  }

  prepend(elem) {
    elem.render()
    this.$dom.prepend(elem.DOM)
  }

  append(elem) {
    elem.render()
    this.$dom.append(elem.DOM)
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

export class PlanetSprite extends Sprite {
  constructor(size, ...args) {
    super(...args)
    this._size = size
  }

  render() {
    super.render()
    .size(this._size, this._size)
    .css({
      backgroundColor: '#009DAD',
      borderRadius: '100%',
    })
    .axisCenter()
    return this
  }
}

export class SpaceplaneSprite extends Sprite {
  rotate = 0

  constructor(name, ...args) {
    super(...args)

    this.name = name
    this.setPower(100)
  }

  render() {
    super.render()
    .size(70, 25)
    .css({
      borderRadius: '20px',
      overflow: 'hidden',
      backgroundColor: 'gray',
    })
    .axisCenter()
    .transform('rotate', `${this.rotate}turn`)

    // 飞船提示
    this.hint = (new Sprite)
    .css({
      width: '100%',
      height: '100%',
      lineHeight: this.height + 'px',
      textAlign: 'center',
      fontSize: '12px',
      fontWeight: 'bold',
      zIndex: 2,
      padding: '0 5px',
      borderRadius: '40px',
      borderRight: '8px solid blue',
    })
    .text(`${this.name}-${(this._power).toFixed()}%`)
    .appendTo(this)

    // 监控能量变化
    this.on('update.power', () => {
      this.hint.text(`${this.name}-${(this._power).toFixed()}%`)
    })

    return this
  }

  getPower() {
    return this._power
  }

  setPower(power) {
    this._power = power
    this.emit('update.power', power)
  }
}

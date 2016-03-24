import $ from 'jquery'

export class Canvas {
  elements = {}

  constructor(DOM) {
    this.DOM = DOM
    this.$dom = $(DOM)
    this.width = this.$dom.width()
    this.height = this.$dom.height()
  }

  has(elem) {
    return elem.id in this.elements
  }

  prepend(elem) {
    if (! this.has(elem)) {
      elem.canvas = this
      elem.render()
      this.elements[elem.id] = elem
      this.$dom.prepend(elem.DOM)
    }
  }

  append(elem) {
    if (! this.has(elem)) {
      elem.canvas = this
      elem.render()
      this.elements[elem.id] = elem
      this.$dom.append(elem.DOM)
    }
  }
}

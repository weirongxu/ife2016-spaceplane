import {log} from './utils'

// 发送器
export class Sender {
  constructor(medium) {
    this.medium = medium
  }

  send(msg) {
    log('广播消息', msg)
    return this.medium.send(msg)
  }
}

// 接收器
export class Accepter {
  listeners = []

  constructor(medium) {
    this.medium = medium
    this.medium.add(this)
  }

  emit(msg) {
    this.listeners.forEach((listener) => {
      listener(msg)
    })
  }

  accept(cb) {
    this.listeners.push(cb)
    return () => {
      this.remove(cb)
    }
  }

  remove(target) {
    this.listeners.splice(this.listeners.indexOf(target), 1)
  }
}

var statusTable = [
  'run', 'stop', 'destory'
]

/**
 * 将整形转换为2进制表示的字符串
 * @param {Number} size 长度
 * @return {String}
 */
Number.prototype.binary = function(size=4) {
  var num = this.toString(2)
  while (num.length < size) num = '0' + num
  return num
}

Number.prototype.binarySplit = function(...lengths) {
  var allLength = lengths.reduce((a, b) => a + b, 0)
  var str = this.binary(allLength).split('')
  var numbers = []
  lengths.forEach((len) => {
    numbers.push(parseInt(str.splice(0, len).join(''), 2))
  })
  return numbers
}

function binary(num, size=4) {
  return num.binary(size)
}

/**
 * msg格式说明
 * {
 *   type: 0 // 0 表示发射命令, 1表示控制飞船命令, 2表示飞船将自身状态发给数据处理中心
 *   ...
 * }
 * 发射命令
 * {
 *   type: 0
 *   id: id // 飞船id
 *   powerType: 1, // 发动机类型
 *   energyType: 1, // 充能类型
 * }
 * 二进制表示
 * 0000       0000      0000 00
 * energyType powerType id   type
 *
 * 控制飞船命令
 * {
 *   type: 1
 *   id: id // 飞船id
 *   command: 'run' // 飞船执行的命令
 * }
 * 二进制表示
 * 0000    0000  00
 * command id    type
 *
 * 飞船将自身状态
 * {
 *   type: 2
 *   id: id // 飞船id
 *   status: 'run' // 飞船飞行状态
 *   power: 100 // 飞船能量百分比
 * }
 * 二进制表示
 * 00000000 0000   0000 00
 * power    status id   type
 */
// 发送适配器
export function senderAdapter(sender) {
  var send = sender.send.bind(sender)
  sender.send = (msg) => {
    log('广播适配', msg)

    var msgStr = `${msg.id.binary(4)}${msg.type.binary(2)}`
    switch(msg.type) {
    case 0:
      msgStr = `${msg.energyType.binary(4)}${msg.powerType.binary(4)}` + msgStr
      break
    case 1:
      msgStr = `${statusTable.indexOf(msg.command).binary(4)}` + msgStr
      break
    case 2:
      msgStr = `${msg.power.binary(8)}${statusTable.indexOf(msg.status).binary(4)}` + msgStr
      break
    }

    var msgInt = parseInt(msgStr, 2)

    // 自动重传
    var trySend = () => {
      send(msgInt)
      .then(() => {
        log('发送成功', msgInt, 'green')
      }, () => {
        log('重传', msgInt, 'red')
        trySend()
      })
    }
    trySend()
  }
  return sender
}

// 接收适配器
export function acceptAdapter(accepter) {
  var emit = accepter.emit.bind(accepter)
  accepter.emit = (msg) => {
    var type = msg & parseInt('11', 2)
    var msgObj
    switch(type) {
      case 0:
        var [energyType, powerType, id, _type] = msg.binarySplit(4, 4, 4, 2)
        msgObj = {
          type,
          id,
          energyType,
          powerType,
        }
        break
      case 1:
        var [command, id, _type] = msg.binarySplit(4, 4, 2)
        msgObj = {
          type,
          id,
          command: statusTable[command],
        }
        break
      case 2:
        var [power, status, id, _type] = msg.binarySplit(8, 4, 4, 2)
        msgObj = {
          type,
          id,
          status: statusTable[status],
          power,
        }
        break
    }
    emit(msgObj)
  }
  return accepter
}

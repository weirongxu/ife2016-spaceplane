import {Mediator} from './medium'
import {Spaceplane} from './spaceplane'
import {log} from './utils'
import $ from 'jquery'
import {Sender, Accepter} from './message.js'

// 飞船编号
var spaceplaneList = [
  1,
  2,
  3,
  4,
]

var $ctrlList = $('.spaceplane-list')
$ctrlList.html(`
  <ul>
    ${spaceplaneList.map((id) =>`
      <li data-id="${id}">
        对${id}号下达命令
        <button data-command="run">开始飞行</button>
        <button data-command="stop">停止飞行</button>
        <button data-command="destory">销毁</button>
      </li>
    `).join('')}
  </ul>
`)

function launchCenter(planet, accepter) {
  accepter.accept((msg) => {
    if (msg.type === 0) {
      log('发射中心接受命令', msg, 'blue')
      var id = msg.id
      var spaceplane = new Spaceplane(id, {accepter})
      spaceplane.launch(planet, id * 50 + 30)
    }
  })
}

export function center(planet) {
  // 新建介质
  var medium = new Mediator()
  var sender = new Sender(medium)
  var accepter = new Accepter(medium)

  // 控制面板
  $('.creater').html(`
    <button class="create">新的飞船起飞</button>
  `)

  // 新建发射中心
  launchCenter(planet, accepter)

  // 绑定事件
  $('.creater .create').on('click', () => {
    if (spaceplaneList.length) {
      var id = spaceplaneList.shift()
      sender.send({
        type: 0,
        id: id,
      })
      $ctrlList.find(`[data-id="${id}"]`).show()
    }
  })

  spaceplaneList.forEach((id) => {
    $ctrlList.find(`[data-id="${id}"]`).on('click', function(event) {
      var command = event.target.dataset.command
      sender.send({
        type: 1,
        id: id,
        command: command,
      })
      if (command === 'destory') {
        $(this).hide()
        spaceplaneList.push(id)
      }
    })
  })
}

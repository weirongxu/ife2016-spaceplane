import {Mediator, BUS} from './medium'
import {Spaceplane} from './spaceplane'
import {log} from './utils'
import $ from 'jquery'
import {Sender, Accepter, senderAdapter, acceptAdapter} from './message.js'

// 飞船编号
var spaceplaneList = [
  1,
  2,
  3,
  4,
]

var powerTable = {
  1: {
    name: '前进号',
    speed: 30,
    power: 5,
    default: true,
  },
  2: {
    name: '奔腾号',
    speed: 50,
    power: 7,
  },
  3: {
    name: '超越号',
    speed: 80,
    power: 9,
  },
  4: {
    name: '核动力号',
    speed: 200,
    power: 10,
  },
  5: {
    name: '光速号',
    speed: 500,
    power: 12,
  },
  6: {
    name: '曲率驱动号',
    speed: 1000,
    power: 14,
  },
}

var energyTable = {
  1: {
    name: '劲量型',
    power: 2,
    default: true,
  },
  2: {
    name: '光能型',
    power: 2,
  },
  3: {
    name: '永久型',
    power: 4,
  },
}


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

// 发射中心
function launchCenter(planet, sender, accepter) {
  accepter.accept((msg) => {
    if (msg.type == 0) {
      log('发射中心接受命令', msg, 'blue')
      var id = msg.id
      var powerType = powerTable[msg.powerType]
      var energyType = energyTable[msg.energyType]

      var spaceplane = new Spaceplane(id, {
        sender,
        accepter,
        speed: powerType.speed,
        decPower: powerType.power,
        addPower: energyType.power,
      })
      spaceplane.launch(planet, id * 50 + 30)
    }
  })
}

// 数据处理中心
function dataCenter(planet, accepter) {
  $('.data-table').show()
  $('.data-table>tbody').html(`
    ${spaceplaneList.map((id) => `
      <tr data-id='${id}'></tr>
    `).join('')}
  `)

  function dataRow(id) {
    return $(`.data-table [data-id="${id}"]`)
  }
  accepter.accept((msg) => {
    if (msg.type === 0) {
      var id = msg.id
      var powerType = powerTable[msg.powerType]
      var energyType = energyTable[msg.energyType]
      dataRow(id).show()
      dataRow(id).html(`
        <td>${id}号</td>
        <td>${powerType.name}</td>
        <td>${energyType.name}</td>
        <td class="status">停止中</td>
        <td class="power">100%</td>
      `)
    } else if (msg.type === 2) {
      var id = msg.id
      if (msg.status === 'destory') {
        dataRow(id).hide()
      } else {
        dataRow(id).find('.status').html(
            `${{run: '飞行中', 'stop': '停止中', }[msg.status]}`)
        dataRow(id).find('.power').html(`${msg.power}%`)
      }
    }
  })
}

// 指挥中心 第二阶段
export function center(planet) {
  // 新建介质
  var medium = new BUS()
  var sender = senderAdapter(new Sender(medium))
  var accepter = acceptAdapter(new Accepter(medium))

  // 新建发射中心
  launchCenter(planet, sender, accepter)

  // 数据处理中心
  dataCenter(planet, accepter)

  var map = (obj, cb) => {
    var ret = []
    for (var key in obj) {
     ret.push(cb(key, obj[key]))
    }
    return ret
  }
  // 控制面板
  $('.creater').html(`
    <button class="create">新的飞船起飞</button>
    <div>动力系统:</div>
    <div>
      ${map(powerTable, (id, o) => `
        <label>
          <input type="radio" name="powerType" ${o.default ? 'checked' : ''} value="${id}"/>
          ${o.name} (速率${o.speed}px/s, 能耗${o.power}%/s)
          <br/>
        </label>
      `).join('')}
    </div>
    <div>能源系统:</div>
    <div>
      ${map(energyTable, (id, o) => `
        <label>
          <input type="radio" name="energyType" ${o.default ? 'checked' : ''} value="${id}"/>
          ${o.name} (补充能源速度${o.power}%/s)
          <br/>
        </label>
      `).join('')}
    </div>
  `)

  $('.creater .create').on('click', () => {
    if (spaceplaneList.length) {
      var id = spaceplaneList.shift()
      sender.send({
        type: 0,
        id: id,
        powerType: parseInt($('.creater').find('[name="powerType"]:checked').val(), 10),
        energyType: parseInt($('.creater').find('[name="energyType"]:checked').val(), 10),
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

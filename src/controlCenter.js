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

// 发射中心1
function launchCenter1(planet, accepter) {
  accepter.accept((msg) => {
    if (msg.command == 'launch') {
      log('发射中心接受命令', msg, 'blue')
      var id = msg.id
      var spaceplane = new Spaceplane(id, accepter)
      spaceplane.launch(planet, id * 50)
    }
  })
}

// 指挥中心 第一阶段
export function center1(planet) {
  // 新建介质
  var medium = new Mediator()
  var sender = new Sender(medium)
  var accepter = new Accepter(medium)

  // 新建发射中心
  launchCenter1(planet, accepter)

  // 控制面板
  $('.control-center').html(`
    <button class="create">新的飞船起飞</button>
    <div class="control-list"></div>
  `)

  $('.control-center .create').on('click', () => {
    if (spaceplaneList.length) {
      // 获取飞船 id
      var id = spaceplaneList.shift()

      sender.send({
        id: id,
        command: 'launch',
      })

      // 控制面板
      var $control = $(`
        <div>
          对${id}号下达命令
          <button class="run">开始飞行</button>
          <button class="stop">停止飞行</button>
          <button class="destory">销毁</button>
        </div>
      `)
      $control.find('.run').on('click', () => {
        sender.send({
          id: id,
          command: 'run',
        })
      })
      $control.find('.stop').on('click', () => {
        sender.send({
          id: id,
          command: 'stop',
        })
      })
      $control.find('.destory').on('click', () => {
        sender.send({
          id: id,
          command: 'destory',
        })
        $control.remove()
        spaceplaneList.push(id)
      })

      $('.control-list').append($control)
    }
  })
}

// 发射中心2
function launchCenter2(planet, accepter) {
  var speedTable = {
    1: 30,
    2: 50,
    3: 80,
  }

  var powerTable = {
    1: 0.05,
    2: 0.07,
    3: 0.09,
  }

  var energyTable = {
    1: 0.02,
    2: 0.03,
    3: 0.04,
  }

  accepter.accept((msg) => {
    if (msg.command == 'launch') {
      log('发射中心接受命令', msg, 'blue')
      var id = msg.id
      var spaceplane = new Spaceplane(id, accepter, {
        speed: speedTable[msg.powerType],
        decPower: powerTable[msg.powerType],
        addPower: energyTable[msg.energyType],
      })
      spaceplane.launch(planet, id * 50)
    }
  })
}


// 指挥中心 第二阶段
export function center2(planet) {
  // 新建介质
  var medium = new BUS()
  var sender = senderAdapter(new Sender(medium))
  var accepter = acceptAdapter(new Accepter(medium))

  // 新建发射中心
  launchCenter2(planet, accepter)

  // 控制面板
  var $ctrl = $('.control-center')
  $ctrl.html(`
    <button class="create">新的飞船起飞</button>
    <div>
      <label>
        <input type="radio" name="powerType" checked value="1"/> 前进号 (速率30px/s, 能耗5%/s)
      </label>
      <label>
        <input type="radio" name="powerType"  value="2"/> 奔腾号 (速率50px/s, 能耗7%/s)
      </label>
      <label>
        <input type="radio" name="powerType" value="3"/> 超越号 (速率80px/s, 能耗9%/s)
      </label>
    </div>
    <div>
      <label>
        <input type="radio" name="energyType" checked value="1"/> 劲量型 (补充能源速度2%/s)
      </label>
      <label>
        <input type="radio" name="energyType" value="2"/> 光能型 (补充能源速度3%/s)
      </label>
      <label>
        <input type="radio" name="energyType" value="3"/> 永久型 (补充能源速度4%/s)
      </label>
    </div>
    <div class="control-list"></div>
  `)

  $('.control-center .create').on('click', () => {
    if (spaceplaneList.length) {
      // 获取飞船 id
      var id = spaceplaneList.shift()

      sender.send({
        id: id,
        command: 'launch',
        powerType: parseInt($ctrl.find('[name="powerType"]:checked').val(), 10),
        energyType: parseInt($ctrl.find('[name="powerType"]:checked').val(), 10),
      })

      // 控制面板
      var $control = $(`
        <div>
          对${id}号下达命令
          <button class="run">开始飞行</button>
          <button class="stop">停止飞行</button>
          <button class="destory">销毁</button>
        </div>
      `)
      $control.find('.run').on('click', () => {
        sender.send({
          id: id,
          command: 'run',
        })
      })
      $control.find('.stop').on('click', () => {
        sender.send({
          id: id,
          command: 'stop',
        })
      })
      $control.find('.destory').on('click', () => {
        sender.send({
          id: id,
          command: 'destory',
        })
        $control.remove()
        spaceplaneList.push(id)
      })

      $('.control-list').append($control)
    }
  })
}

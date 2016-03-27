import './style/index.scss'
import {World} from './canvas'
import {PlanetElement, SatelliteElement} from './elements'
import {center as center1} from './controlCenter1'
import {center as center2} from './controlCenter2'

// 创建场景
var world = new World(document.body, document.getElementById('canvas'))

// 新建星球
var planet = new PlanetElement(50)
planet.moveTo(world.width/2, world.height/2) // 星球居中
world.on('resize', () => {
  planet.moveToCenter()
})
world.append(planet)

// 新建卫星
var satellite = new SatelliteElement(planet, 290, 40)
world.append(satellite)
satellite.run()

// 新建指挥中心在星球上
if (location.hash.replace('#', '') === 'center1') {
  center1(planet)
} else {
  center2(planet)
}

// 启动场景
window.addEventListener('resize', () => {
  world.resize()
})
world.run()

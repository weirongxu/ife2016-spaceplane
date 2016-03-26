import './style/index.scss'
import {Canvas} from './canvas'
import {PlanetSprite} from './sprite'
import {center as center1} from './controlCenter1'
import {center as center2} from './controlCenter2'

// 创建场景
var canvas = new Canvas(document.getElementById('canvas'))
// 新建星球
var planet = new PlanetSprite(100)
planet.moveTo(canvas.width/2, canvas.height/2) // 星球居中
canvas.append(planet)

// 新建指挥中心在新球上
if (location.hash.replace('#', '') === 'center1') {
  center1(planet)
} else {
  center2(planet)
}

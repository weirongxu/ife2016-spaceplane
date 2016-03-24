import './style/index.scss'
import {Canvas} from './canvas'
import {PlanetSprite} from './sprite'
import * as center from './controlCenter'

// 创建场景
var canvas = new Canvas(document.getElementById('canvas'))
// 新建星球
var planet = new PlanetSprite(50)
planet.moveTo(canvas.width/2, canvas.height/2) // 星球居中
canvas.append(planet)

// 新建指挥中心在新球上
var hash = location.hash.replace('#', '') || 'center1'
center[hash](planet)

import * as TOOLS from './glxp/tools.class.js'
import RAF from './raf'

import MotionField from './motionfield/motionfield'
import Scene from './glxp/scene'

const framecounter = new TOOLS.FrameRateUI()

RAF.suscribe('fps', framecounter.update.bind(framecounter))
RAF.suscribe('motion field', MotionField.update.bind(MotionField))
RAF.suscribe('scene', Scene.render.bind(Scene))

// console.log("YO !");

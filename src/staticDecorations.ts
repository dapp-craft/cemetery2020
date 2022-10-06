import * as utils from '@dcl/ecs-scene-utils'
import { openPhotosUI } from './photosUI'

export function addStaticStuff() {
  /// --- Set up a system ---
  let cementery = new Entity()

  cementery.addComponent(new GLTFShape('models/Base.glb'))
  cementery.addComponent(
    new Transform({
      position: new Vector3(0, 0, 0),
    })
  )

  engine.addEntity(cementery)


  ///////// SOUND

  let sound1 = new Entity()
  sound1.addComponent(
    new AudioSource(new AudioClip('sounds/Horror Ambient Background 1.mp3'))
  ).loop = false
  sound1.addComponent(
    new Transform({
      position: new Vector3(40, 20),
    })
  )

  sound1.addComponent(
    new utils.Interval(17500, () => {
      sound1.getComponent(AudioSource).playOnce()
    })
  )
  engine.addEntity(sound1)

  let sound2 = new Entity()
  sound2.addComponent(
    new AudioSource(new AudioClip('sounds/Horror Ambient Background 2.mp3'))
  ).loop = false
  sound2.addComponent(
    new Transform({
      position: new Vector3(35, 0, 5),
    })
  )

  sound2.addComponent(
    new utils.Interval(22500, () => {
      sound2.getComponent(AudioSource).playOnce()
    })
  )
  engine.addEntity(sound2)

  let sound3 = new Entity()
  sound3.addComponent(
    new AudioSource(new AudioClip('sounds/Horror Ambient Background 3.mp3'))
  ).loop = false
  sound3.addComponent(
    new Transform({
      position: new Vector3(15, 0, 15),
    })
  )

  sound3.addComponent(
    new utils.Interval(20000, () => {
      sound3.getComponent(AudioSource).playOnce()
    })
  )
  engine.addEntity(sound3)

  let sound4 = new Entity()
  sound4.addComponent(
    new AudioSource(new AudioClip('sounds/Horror Ambient Background 4.mp3'))
  ).loop = false
  sound4.addComponent(
    new Transform({
      position: new Vector3(65, 0, 5),
    })
  )

  sound4.addComponent(
    new utils.Interval(16000, () => {
      sound4.getComponent(AudioSource).playOnce()
    })
  )
  engine.addEntity(sound4)

  let sound5 = new Entity()
  sound5.addComponent(
    new AudioSource(new AudioClip('sounds/Horror Ambient Background 5.mp3'))
  ).loop = false
  sound5.addComponent(
    new Transform({
      position: new Vector3(90, 0, 15),
    })
  )

  sound5.addComponent(
    new utils.Interval(26000, () => {
      sound5.getComponent(AudioSource).playOnce()
    })
  )
  engine.addEntity(sound5)

  //   let music1 = new Entity()
  //   music1.addComponent(
  //     new AudioSource(new AudioClip('sounds/SpookyHouse1.mp3'))
  //   ).loop = false
  //   music1.addComponent(
  //     new Transform({
  //       position: new Vector3(110, 0, 75),
  //     })
  //   )
  //   music1.getComponent(AudioSource).volume = 0.3

  //   music1.addComponent(
  //     new utils.Interval(60000, () => {
  //       let song = Math.random()
  //       if (song > 0.23) {
  //         music1.getComponent(AudioSource).playOnce()
  //       } else if (song > 0.5) {
  //         music2.getComponent(AudioSource).playOnce()
  //       } else if (song > 0.75) {
  //         music3.getComponent(AudioSource).playOnce()
  //       } else {
  //         music4.getComponent(AudioSource).playOnce()
  //       }
  //     })
  //   )
  //   engine.addEntity(music1)

  //   let music2 = new Entity()
  //   music2.addComponent(
  //     new AudioSource(new AudioClip('sounds/SpookyHouse6.mp3'))
  //   ).loop = false
  //   music2.addComponent(
  //     new Transform({
  //       position: new Vector3(10, 0, 75),
  //     })
  //   )
  //   music2.getComponent(AudioSource).volume = 0.3

  //   // music2.addComponent(new utils.Interval(
  //   // 	50000,
  //   // 	()=> {
  //   // 		music2.getComponent(AudioSource).playOnce()
  //   // 	}))
  //   engine.addEntity(music2)

  //   // music4.addComponent(new utils.Interval(
  //   // 	50000,
  //   // 	()=> {
  //   // 		music4.getComponent(AudioSource).playOnce()
  //   // 	}))
  //   engine.addEntity(music4)

  let emptyCrypts = new Entity()

  emptyCrypts.addComponent(new GLTFShape('models/tombs.glb'))
  emptyCrypts.addComponent(
    new Transform({
      position: new Vector3(0, 0, 0),
    })
  )

  engine.addEntity(emptyCrypts)

  //////// BATS

  const bats = new Entity()
  //const gltfShape_fog = new GLTFShape('models/fogMaze.glb')
  const batShape = new GLTFShape('models/Bat.glb')
  bats.addComponentOrReplace(batShape)
  bats.addComponent(
    new Transform({
      position: new Vector3(55 + 8, 3, 29.2),
      //scale: new Vector3(0.75, .75, .75)
    })
  )

  let batAnim = new AnimationState('Bat.005Actions.001', { speed: 0.3 })
  bats.addComponent(new Animator().addClip(batAnim))
  batAnim.play()

  engine.addEntity(bats)

  let corpse = new Entity()
  corpse.addComponent(new GLTFShape('models/Corpse.glb'))
  corpse.addComponent(
    new Transform({
      position: new Vector3(8.5, 0.1, 41),
    })
  )
  engine.addEntity(corpse)

  corpse.addComponent(
    new OnPointerDown(
      (e) => {
        openPhotosUI()
      },
      {
        hoverText: 'Inspect photos',
        distance: 6,
      }
    )
  )

//fog
function spawnplane(x: number, y: number, z: number) {

const plane = new Entity()


plane.addComponent(new Transform({ position: new Vector3(x, y, z) }))
let uvs = [
	0, 0,
	1, 0,
	1, 1,
	0, 1,


	0, 0,
	0, 0,
	0, 0,
	0, 0,
]

plane.addComponent(new PlaneShape())
plane.getComponent(PlaneShape).uvs = uvs
plane.addComponent(new Billboard())
plane.getComponent(Transform).scale.set(10, 10, 5)

const myTexture = new Texture("images/EpicMilk.png")
//Create a material
const myMaterial = new Material()
myMaterial.castShadows = false  
myMaterial.albedoTexture = myTexture
myMaterial.albedoColor = new Color4(0, 1, 1, 0.100)
myMaterial.transparencyMode = 2
myMaterial.metallic = 1
myMaterial.roughness = 0

//Assign the material to the entity
plane.addComponent(myMaterial)
engine.addEntity(plane)
return plane
}
            //0,
            //"smoke",
            const plane1 = spawnplane (
                40.658287048339844,
                0.5,
                8.18860912322998
            )
        
            //1,
            //"smoke.001",
            const plane1 = spawnplane (
                36.23768997192383,
                0.5,
                8.18860912322998
            )
        
            //2,
            //"smoke.002",
            const plane1 = spawnplane (
                31.007688522338867,
                0.5,
                8.18860912322998
            )
        
            //3,
            //"smoke.003",
            const plane1 = spawnplane (
                25.279590606689453,
                0.5,
                8.18860912322998
            )
        
            //4,
            //"smoke.004",
            const plane1 = spawnplane (
                40.658287048339844,
                0.5,
                12.297895431518555
            )
        
            //5,
            //"smoke.005",
            const plane1 = spawnplane (
                36.23768997192383,
                0.5,
                12.297895431518555
            )
        
            //6,
            //"smoke.006",
            const plane1 = spawnplane (
                31.007688522338867,
                0.5,
                12.297895431518555
            )
        
            //7,
            //"smoke.007",
            const plane1 = spawnplane (
                25.279590606689453,
                0.5,
                12.297895431518555
            )
        
            //8,
            //"smoke.008",
            const plane1 = spawnplane (
                40.658287048339844,
                0.5,
                16.78075408935547
            )
        
            //9,
            //"smoke.009",
            const plane1 = spawnplane (
                36.23768997192383,
                0.5,
                16.78075408935547
            )
        
            //10,
            //"smoke.010",
            const plane1 = spawnplane (
                31.007688522338867,
                0.5,
                16.78075408935547
            )
        
            //11,
            //"smoke.011",
            const plane1 = spawnplane (
                25.279590606689453,
                0.5,
                16.78075408935547
            )
        
            //12,
            //"smoke.012",
            const plane1 = spawnplane (
                40.658287048339844,
                0.5,
                21.637184143066406
            )
        
            //13,
            //"smoke.013",
            const plane1 = spawnplane (
                36.23768997192383,
                0.5,
                21.637184143066406
            )
        
            //14,
            //"smoke.014",
            const plane1 = spawnplane (
                31.007688522338867,
                0.5,
                21.637184143066406
            )
        
            //15,
            //"smoke.015",
            const plane1 = spawnplane (
                25.279590606689453,
                0.5,
                21.637184143066406
            )
        
            //16,
            //"smoke.016",
            const plane1 = spawnplane (
                40.658287048339844,
                0.5,
                25.808732986450195
            )
        
            //17,
            //"smoke.017",
            const plane1 = spawnplane (
                36.23768997192383,
                0.5,
                25.808732986450195
            )
        
            //18,
            //"smoke.018",
            const plane1 = spawnplane (
                31.007688522338867,
                0.5,
                25.808732986450195
            )
        
            //19,
            //"smoke.019",
            const plane1 = spawnplane (
                25.279590606689453,
                0.5,
                25.808732986450195
            )
        
            //20,
            //"smoke.020",
            const plane1 = spawnplane (
                40.658287048339844,
                0.5,
                30.789688110351562
            )
        
            //21,
            //"smoke.021",
            const plane1 = spawnplane (
                36.23768997192383,
                0.5,
                30.789688110351562
            )
        
            //22,
            //"smoke.022",
            const plane1 = spawnplane (
                31.007688522338867,
                0.5,
                30.789688110351562
            )
        
            //23,
            //"smoke.023",
            const plane1 = spawnplane (
                25.279590606689453,
                0.5,
                30.789688110351562
            )
        
            //24,
            //"smoke.024",
            const plane1 = spawnplane (
                40.658287048339844,
                0.5,
                36.08195114135742
            )
        
            //25,
            //"smoke.025",
            const plane1 = spawnplane (
                36.23768997192383,
                0.5,
                36.08195114135742
            )
        
            //26,
            //"smoke.026",
            const plane1 = spawnplane (
                31.007688522338867,
                0.5,
                36.08195114135742
            )
        
            //27,
            //"smoke.027",
            const plane1 = spawnplane (
                25.279590606689453,
                0.5,
                36.08195114135742
            )
        
            //28,
            //"smoke.028",
            const plane1 = spawnplane (
                40.658287048339844,
                0.5,
                41.56100082397461
            )
        
            //29,
            //"smoke.029",
            const plane1 = spawnplane (
                36.23768997192383,
                0.5,
                41.56100082397461
            )
        
            //30,
            //"smoke.030",
            const plane1 = spawnplane (
                31.007688522338867,
                0.5,
                41.56100082397461
            )
        
            //31,
            //"smoke.031",
            const plane1 = spawnplane (
                25.279590606689453,
                0.5,
                41.56100082397461
            )
        
            //32,
            //"smoke.032",
            const plane1 = spawnplane (
                40.658287048339844,
                0.5,
                38.67204666137695
            )
        
            //33,
            //"smoke.033",
            const plane1 = spawnplane (
                36.23768997192383,
                0.5,
                38.67204666137695
            )
        
            //34,
            //"smoke.034",
            const plane1 = spawnplane (
                31.007688522338867,
                0.5,
                38.67204666137695
            )
        
            //35,
            //"smoke.035",
            const plane1 = spawnplane (
                25.279590606689453,
                0.5,
                38.67204666137695
            )
        
            //36,
            //"smoke.036",
            const plane1 = spawnplane (
                40.658287048339844,
                0.5,
                42.781333923339844
            )
        
            //37,
            //"smoke.037",
            const plane1 = spawnplane (
                36.23768997192383,
                0.5,
                42.781333923339844
            )
        
            //38,
            //"smoke.038",
            const plane1 = spawnplane (
                31.007688522338867,
                0.5,
                42.781333923339844
            )
        
            //39,
            //"smoke.039",
            const plane1 = spawnplane (
                25.279590606689453,
                0.5,
                42.781333923339844
            )
        
            //40,
            //"smoke.040",
            const plane1 = spawnplane (
                40.658287048339844,
                0.5,
                47.264190673828125
            )
        
            //41,
            //"smoke.041",
            const plane1 = spawnplane (
                36.23768997192383,
                0.5,
                47.264190673828125
            )
        
            //42,
            //"smoke.042",
            const plane1 = spawnplane (
                31.007688522338867,
                0.5,
                47.264190673828125
            )
        
            //43,
            //"smoke.043",
            const plane1 = spawnplane (
                25.279590606689453,
                0.5,
                47.264190673828125
            )
        
            //44,
            //"smoke.044",
            const plane1 = spawnplane (
                40.658287048339844,
                0.5,
                52.12062072753906
            )
        
            //45,
            //"smoke.045",
            const plane1 = spawnplane (
                36.23768997192383,
                0.5,
                52.12062072753906
            )
        
            //46,
            //"smoke.046",
            const plane1 = spawnplane (
                31.007688522338867,
                0.5,
                52.12062072753906
            )
        
            //47,
            //"smoke.047",
            const plane1 = spawnplane (
                25.279590606689453,
                0.5,
                52.12062072753906
            )
        
            //48,
            //"smoke.048",
            const plane1 = spawnplane (
                40.658287048339844,
                0.5,
                56.292171478271484
            )
        
            //49,
            //"smoke.049",
            const plane1 = spawnplane (
                36.23768997192383,
                0.5,
                56.292171478271484
            )
        
            //50,
            //"smoke.050",
            const plane1 = spawnplane (
                31.007688522338867,
                0.5,
                56.292171478271484
            )
        
            //51,
            //"smoke.051",
            const plane1 = spawnplane (
                25.279590606689453,
                0.5,
                56.292171478271484
            )
        
            //52,
            //"smoke.052",
            const plane1 = spawnplane (
                40.658287048339844,
                0.5,
                61.27312469482422
            )
        
            //53,
            //"smoke.053",
            const plane1 = spawnplane (
                36.23768997192383,
                0.5,
                61.27312469482422
            )
        
            //54,
            //"smoke.054",
            const plane1 = spawnplane (
                31.007688522338867,
                0.5,
                61.27312469482422
            )
        
            //55,
            //"smoke.055",
            const plane1 = spawnplane (
                25.279590606689453,
                0.5,
                61.27312469482422
            )
        
            //56,
            //"smoke.056",
            const plane1 = spawnplane (
                40.658287048339844,
                0.5,
                66.56539154052734
            )
        
            //57,
            //"smoke.057",
            const plane1 = spawnplane (
                36.23768997192383,
                0.5,
                66.56539154052734
            )
        
            //58,
            //"smoke.058",
            const plane1 = spawnplane (
                31.007688522338867,
                0.5,
                66.56539154052734
            )
        
            //59,
            //"smoke.059",
            const plane1 = spawnplane (
                25.279590606689453,
                0.5,
                66.56539154052734
            )
        
            //60,
            //"smoke.060",
            const plane1 = spawnplane (
                40.658287048339844,
                0.5,
                72.04444122314453
            )
        
            //61,
            //"smoke.061",
            const plane1 = spawnplane (
                36.23768997192383,
                0.5,
                72.04444122314453
            )
        
            //62,
            //"smoke.062",
            const plane1 = spawnplane (
                31.007688522338867,
                0.5,
                72.04444122314453
            )
        
            //63,
            //"smoke.063",
            const plane1 = spawnplane (
                25.279590606689453,
                0.5,
                72.04444122314453
            )
        
            //64,
            //"smoke.064",
            const plane1 = spawnplane (
                61.74565887451172,
                0.5,
                8.18860912322998
            )
        
            //65,
            //"smoke.065",
            const plane1 = spawnplane (
                57.32505798339844,
                0.5,
                8.18860912322998
            )
        
            //66,
            //"smoke.066",
            const plane1 = spawnplane (
                52.09505844116211,
                0.5,
                8.18860912322998
            )
        
            //67,
            //"smoke.067",
            const plane1 = spawnplane (
                46.36695861816406,
                0.5,
                8.18860912322998
            )
        
            //68,
            //"smoke.068",
            const plane1 = spawnplane (
                61.74565887451172,
                0.5,
                12.297895431518555
            )
        
            //69,
            //"smoke.069",
            const plane1 = spawnplane (
                57.32505798339844,
                0.5,
                12.297895431518555
            )
        
            //70,
            //"smoke.070",
            const plane1 = spawnplane (
                52.09505844116211,
                0.5,
                12.297895431518555
            )
        
            //71,
            //"smoke.071",
            const plane1 = spawnplane (
                46.36695861816406,
                0.5,
                12.297895431518555
            )
        
            //72,
            //"smoke.072",
            const plane1 = spawnplane (
                61.74565887451172,
                0.5,
                16.78075408935547
            )
        
            //73,
            //"smoke.073",
            const plane1 = spawnplane (
                57.32505798339844,
                0.5,
                16.78075408935547
            )
        
            //74,
            //"smoke.074",
            const plane1 = spawnplane (
                52.09505844116211,
                0.5,
                16.78075408935547
            )
        
            //75,
            //"smoke.075",
            const plane1 = spawnplane (
                46.36695861816406,
                0.5,
                16.78075408935547
            )
        
            //76,
            //"smoke.076",
            const plane1 = spawnplane (
                61.74565887451172,
                0.5,
                21.637184143066406
            )
        
            //77,
            //"smoke.077",
            const plane1 = spawnplane (
                57.32505798339844,
                0.5,
                21.637184143066406
            )
        
            //78,
            //"smoke.078",
            const plane1 = spawnplane (
                52.09505844116211,
                0.5,
                21.637184143066406
            )
        
            //79,
            //"smoke.079",
            const plane1 = spawnplane (
                46.36695861816406,
                0.5,
                21.637184143066406
            )
        
            //80,
            //"smoke.080",
            const plane1 = spawnplane (
                61.74565887451172,
                0.5,
                25.808732986450195
            )
        
            //81,
            //"smoke.081",
            const plane1 = spawnplane (
                57.32505798339844,
                0.5,
                25.808732986450195
            )
        
            //82,
            //"smoke.082",
            const plane1 = spawnplane (
                52.09505844116211,
                0.5,
                25.808732986450195
            )
        
            //83,
            //"smoke.083",
            const plane1 = spawnplane (
                46.36695861816406,
                0.5,
                25.808732986450195
            )
        
            //84,
            //"smoke.084",
            const plane1 = spawnplane (
                61.74565887451172,
                0.5,
                30.789688110351562
            )
        
            //85,
            //"smoke.085",
            const plane1 = spawnplane (
                57.32505798339844,
                0.5,
                30.789688110351562
            )
        
            //86,
            //"smoke.086",
            const plane1 = spawnplane (
                52.09505844116211,
                0.5,
                30.789688110351562
            )
        
            //87,
            //"smoke.087",
            const plane1 = spawnplane (
                46.36695861816406,
                0.5,
                30.789688110351562
            )
        
            //88,
            //"smoke.088",
            const plane1 = spawnplane (
                61.74565887451172,
                0.5,
                36.08195114135742
            )
        
            //89,
            //"smoke.089",
            const plane1 = spawnplane (
                57.32505798339844,
                0.5,
                36.08195114135742
            )
        
            //90,
            //"smoke.090",
            const plane1 = spawnplane (
                52.09505844116211,
                0.5,
                36.08195114135742
            )
        
            //91,
            //"smoke.091",
            const plane1 = spawnplane (
                46.36695861816406,
                0.5,
                36.08195114135742
            )
        
            //92,
            //"smoke.092",
            const plane1 = spawnplane (
                61.74565887451172,
                0.5,
                41.56100082397461
            )
        
            //93,
            //"smoke.093",
            const plane1 = spawnplane (
                57.32505798339844,
                0.5,
                41.56100082397461
            )
        
            //94,
            //"smoke.094",
            const plane1 = spawnplane (
                52.09505844116211,
                0.5,
                41.56100082397461
            )
        
            //95,
            //"smoke.095",
            const plane1 = spawnplane (
                46.36695861816406,
                0.5,
                41.56100082397461
            )
        
            //96,
            //"smoke.096",
            const plane1 = spawnplane (
                61.74565887451172,
                0.5,
                38.67204666137695
            )
        
            //97,
            //"smoke.097",
            const plane1 = spawnplane (
                57.32505798339844,
                0.5,
                38.67204666137695
            )
        
            //98,
            //"smoke.098",
            const plane1 = spawnplane (
                52.09505844116211,
                0.5,
                38.67204666137695
            )
        
            //99,
            //"smoke.099",
            const plane1 = spawnplane (
                46.36695861816406,
                0.5,
                38.67204666137695
            )
        
            //100,
            //"smoke.100",
            const plane1 = spawnplane (
                61.74565887451172,
                0.5,
                42.781333923339844
            )
        
            //101,
            //"smoke.101",
            const plane1 = spawnplane (
                57.32505798339844,
                0.5,
                42.781333923339844
            )
        
            //102,
            //"smoke.102",
            const plane1 = spawnplane (
                52.09505844116211,
                0.5,
                42.781333923339844
            )
        
            //103,
            //"smoke.103",
            const plane1 = spawnplane (
                46.36695861816406,
                0.5,
                42.781333923339844
            )
        
            //104,
            //"smoke.104",
            const plane1 = spawnplane (
                61.74565887451172,
                0.5,
                47.264190673828125
            )
        
            //105,
            //"smoke.105",
            const plane1 = spawnplane (
                57.32505798339844,
                0.5,
                47.264190673828125
            )
        
            //106,
            //"smoke.106",
            const plane1 = spawnplane (
                52.09505844116211,
                0.5,
                47.264190673828125
            )
        
            //107,
            //"smoke.107",
            const plane1 = spawnplane (
                46.36695861816406,
                0.5,
                47.264190673828125
            )
        
            //108,
            //"smoke.108",
            const plane1 = spawnplane (
                61.74565887451172,
                0.5,
                52.12062072753906
            )
        
            //109,
            //"smoke.109",
            const plane1 = spawnplane (
                57.32505798339844,
                0.5,
                52.12062072753906
            )
        
            //110,
            //"smoke.110",
            const plane1 = spawnplane (
                52.09505844116211,
                0.5,
                52.12062072753906
            )
        
            //111,
            //"smoke.111",
            const plane1 = spawnplane (
                46.36695861816406,
                0.5,
                52.12062072753906
            )
        
            //112,
            //"smoke.112",
            const plane1 = spawnplane (
                61.74565887451172,
                0.5,
                56.292171478271484
            )
        
            //113,
            //"smoke.113",
            const plane1 = spawnplane (
                57.32505798339844,
                0.5,
                56.292171478271484
            )
        
            //114,
            //"smoke.114",
            const plane1 = spawnplane (
                52.09505844116211,
                0.5,
                56.292171478271484
            )
        
            //115,
            //"smoke.115",
            const plane1 = spawnplane (
                46.36695861816406,
                0.5,
                56.292171478271484
            )
        
            //116,
            //"smoke.116",
            const plane1 = spawnplane (
                61.74565887451172,
                0.5,
                61.27312469482422
            )
        
            //117,
            //"smoke.117",
            const plane1 = spawnplane (
                57.32505798339844,
                0.5,
                61.27312469482422
            )
        
            //118,
            //"smoke.118",
            const plane1 = spawnplane (
                52.09505844116211,
                0.5,
                61.27312469482422
            )
        
            //119,
            //"smoke.119",
            const plane1 = spawnplane (
                46.36695861816406,
                0.5,
                61.27312469482422
            )
        
            //120,
            //"smoke.120",
            const plane1 = spawnplane (
                61.74565887451172,
                0.5,
                66.56539154052734
            )
        
            //121,
            //"smoke.121",
            const plane1 = spawnplane (
                57.32505798339844,
                0.5,
                66.56539154052734
            )
        
            //122,
            //"smoke.122",
            const plane1 = spawnplane (
                52.09505844116211,
                0.5,
                66.56539154052734
            )
        
            //123,
            //"smoke.123",
            const plane1 = spawnplane (
                46.36695861816406,
                0.5,
                66.56539154052734
            )
        
            //124,
            //"smoke.124",
            const plane1 = spawnplane (
                61.74565887451172,
                0.5,
                72.04444122314453
            )
        
            //125,
            //"smoke.125",
            const plane1 = spawnplane (
                57.32505798339844,
                0.5,
                72.04444122314453
            )
        
            //126,
            //"smoke.126",
            const plane1 = spawnplane (
                52.09505844116211,
                0.5,
                72.04444122314453
            )
        
            //127,
            //"smoke.127",
            const plane1 = spawnplane (
                46.36695861816406,
                0.5,
                72.04444122314453
            )
        
            //128,
            //"smoke.128",
            const plane1 = spawnplane (
                82.40267181396484,
                0.5,
                8.18860912322998
            )
        
            //129,
            //"smoke.129",
            const plane1 = spawnplane (
                77.98207092285156,
                0.5,
                8.18860912322998
            )
        
            //130,
            //"smoke.130",
            const plane1 = spawnplane (
                72.75206756591797,
                0.5,
                8.18860912322998
            )
        
            //131,
            //"smoke.131",
            const plane1 = spawnplane (
                67.02397155761719,
                0.5,
                8.18860912322998
            )
        
            //132,
            //"smoke.132",
            const plane1 = spawnplane (
                82.40267181396484,
                0.5,
                12.297895431518555
            )
        
            //133,
            //"smoke.133",
            const plane1 = spawnplane (
                77.98207092285156,
                0.5,
                12.297895431518555
            )
        
            //134,
            //"smoke.134",
            const plane1 = spawnplane (
                72.75206756591797,
                0.5,
                12.297895431518555
            )
        
            //135,
            //"smoke.135",
            const plane1 = spawnplane (
                67.02397155761719,
                0.5,
                12.297895431518555
            )
        
            //136,
            //"smoke.136",
            const plane1 = spawnplane (
                82.40267181396484,
                0.5,
                16.78075408935547
            )
        
            //137,
            //"smoke.137",
            const plane1 = spawnplane (
                77.98207092285156,
                0.5,
                16.78075408935547
            )
        
            //138,
            //"smoke.138",
            const plane1 = spawnplane (
                72.75206756591797,
                0.5,
                16.78075408935547
            )
        
            //139,
            //"smoke.139",
            const plane1 = spawnplane (
                67.02397155761719,
                0.5,
                16.78075408935547
            )
        
            //140,
            //"smoke.140",
            const plane1 = spawnplane (
                82.40267181396484,
                0.5,
                21.637184143066406
            )
        
            //141,
            //"smoke.141",
            const plane1 = spawnplane (
                77.98207092285156,
                0.5,
                21.637184143066406
            )
        
            //142,
            //"smoke.142",
            const plane1 = spawnplane (
                72.75206756591797,
                0.5,
                21.637184143066406
            )
        
            //143,
            //"smoke.143",
            const plane1 = spawnplane (
                67.02397155761719,
                0.5,
                21.637184143066406
            )
        
            //144,
            //"smoke.144",
            const plane1 = spawnplane (
                82.40267181396484,
                0.5,
                25.808732986450195
            )
        
            //145,
            //"smoke.145",
            const plane1 = spawnplane (
                77.98207092285156,
                0.5,
                25.808732986450195
            )
        
            //146,
            //"smoke.146",
            const plane1 = spawnplane (
                72.75206756591797,
                0.5,
                25.808732986450195
            )
        
            //147,
            //"smoke.147",
            const plane1 = spawnplane (
                67.02397155761719,
                0.5,
                25.808732986450195
            )
        
            //148,
            //"smoke.148",
            const plane1 = spawnplane (
                82.40267181396484,
                0.5,
                30.789688110351562
            )
        
            //149,
            //"smoke.149",
            const plane1 = spawnplane (
                77.98207092285156,
                0.5,
                30.789688110351562
            )
        
            //150,
            //"smoke.150",
            const plane1 = spawnplane (
                72.75206756591797,
                0.5,
                30.789688110351562
            )
        
            //151,
            //"smoke.151",
            const plane1 = spawnplane (
                67.02397155761719,
                0.5,
                30.789688110351562
            )
        
            //152,
            //"smoke.152",
            const plane1 = spawnplane (
                82.40267181396484,
                0.5,
                36.08195114135742
            )
        
            //153,
            //"smoke.153",
            const plane1 = spawnplane (
                77.98207092285156,
                0.5,
                36.08195114135742
            )
        
            //154,
            //"smoke.154",
            const plane1 = spawnplane (
                72.75206756591797,
                0.5,
                36.08195114135742
            )
        
            //155,
            //"smoke.155",
            const plane1 = spawnplane (
                67.02397155761719,
                0.5,
                36.08195114135742
            )
        
            //156,
            //"smoke.156",
            const plane1 = spawnplane (
                82.40267181396484,
                0.5,
                41.56100082397461
            )
        
            //157,
            //"smoke.157",
            const plane1 = spawnplane (
                77.98207092285156,
                0.5,
                41.56100082397461
            )
        
            //158,
            //"smoke.158",
            const plane1 = spawnplane (
                72.75206756591797,
                0.5,
                41.56100082397461
            )
        
            //159,
            //"smoke.159",
            const plane1 = spawnplane (
                67.02397155761719,
                0.5,
                41.56100082397461
            )
        
            //160,
            //"smoke.160",
            const plane1 = spawnplane (
                82.40267181396484,
                0.5,
                38.67204666137695
            )
        
            //161,
            //"smoke.161",
            const plane1 = spawnplane (
                77.98207092285156,
                0.5,
                38.67204666137695
            )
        
            //162,
            //"smoke.162",
            const plane1 = spawnplane (
                72.75206756591797,
                0.5,
                38.67204666137695
            )
        
            //163,
            //"smoke.163",
            const plane1 = spawnplane (
                67.02397155761719,
                0.5,
                38.67204666137695
            )
        
            //164,
            //"smoke.164",
            const plane1 = spawnplane (
                82.40267181396484,
                0.5,
                42.781333923339844
            )
        
            //165,
            //"smoke.165",
            const plane1 = spawnplane (
                77.98207092285156,
                0.5,
                42.781333923339844
            )
        
            //166,
            //"smoke.166",
            const plane1 = spawnplane (
                72.75206756591797,
                0.5,
                42.781333923339844
            )
        
            //167,
            //"smoke.167",
            const plane1 = spawnplane (
                67.02397155761719,
                0.5,
                42.781333923339844
            )
        
            //168,
            //"smoke.168",
            const plane1 = spawnplane (
                82.40267181396484,
                0.5,
                47.264190673828125
            )
        
            //169,
            //"smoke.169",
            const plane1 = spawnplane (
                77.98207092285156,
                0.5,
                47.264190673828125
            )
        
            //170,
            //"smoke.170",
            const plane1 = spawnplane (
                72.75206756591797,
                0.5,
                47.264190673828125
            )
        
            //171,
            //"smoke.171",
            const plane1 = spawnplane (
                67.02397155761719,
                0.5,
                47.264190673828125
            )
        
            //172,
            //"smoke.172",
            const plane1 = spawnplane (
                82.40267181396484,
                0.5,
                52.12062072753906
            )
        
            //173,
            //"smoke.173",
            const plane1 = spawnplane (
                77.98207092285156,
                0.5,
                52.12062072753906
            )
        
            //174,
            //"smoke.174",
            const plane1 = spawnplane (
                72.75206756591797,
                0.5,
                52.12062072753906
            )
        
            //175,
            //"smoke.175",
            const plane1 = spawnplane (
                67.02397155761719,
                0.5,
                52.12062072753906
            )
        
            //176,
            //"smoke.176",
            const plane1 = spawnplane (
                82.40267181396484,
                0.5,
                56.292171478271484
            )
        
            //177,
            //"smoke.177",
            const plane1 = spawnplane (
                77.98207092285156,
                0.5,
                56.292171478271484
            )
        
            //178,
            //"smoke.178",
            const plane1 = spawnplane (
                72.75206756591797,
                0.5,
                56.292171478271484
            )
        
            //179,
            //"smoke.179",
            const plane1 = spawnplane (
                67.02397155761719,
                0.5,
                56.292171478271484
            )
        
            //180,
            //"smoke.180",
            const plane1 = spawnplane (
                82.40267181396484,
                0.5,
                61.27312469482422
            )
        
            //181,
            //"smoke.181",
            const plane1 = spawnplane (
                77.98207092285156,
                0.5,
                61.27312469482422
            )
        
            //182,
            //"smoke.182",
            const plane1 = spawnplane (
                72.75206756591797,
                0.5,
                61.27312469482422
            )
        
            //183,
            //"smoke.183",
            const plane1 = spawnplane (
                67.02397155761719,
                0.5,
                61.27312469482422
            )
        
            //184,
            //"smoke.184",
            const plane1 = spawnplane (
                82.40267181396484,
                0.5,
                66.56539154052734
            )
        
            //185,
            //"smoke.185",
            const plane1 = spawnplane (
                77.98207092285156,
                0.5,
                66.56539154052734
            )
        
            //186,
            //"smoke.186",
            const plane1 = spawnplane (
                72.75206756591797,
                0.5,
                66.56539154052734
            )
        
            //187,
            //"smoke.187",
            const plane1 = spawnplane (
                67.02397155761719,
                0.5,
                66.56539154052734
            )
        
            //188,
            //"smoke.188",
            const plane1 = spawnplane (
                82.40267181396484,
                0.5,
                72.04444122314453
            )
        
            //189,
            //"smoke.189",
            const plane1 = spawnplane (
                77.98207092285156,
                0.5,
                72.04444122314453
            )
        
            //190,
            //"smoke.190",
            const plane1 = spawnplane (
                72.75206756591797,
                0.5,
                72.04444122314453
            )
        
            //191,
            //"smoke.191",
            const plane1 = spawnplane (
                67.02397155761719,
                0.5,
                72.04444122314453
            )
        
            //192,
            //"smoke.192",
            const plane1 = spawnplane (
                103.27486419677734,
                0.5,
                8.18860912322998
            )
        
            //193,
            //"smoke.193",
            const plane1 = spawnplane (
                98.85426330566406,
                0.5,
                8.18860912322998
            )
        
            //194,
            //"smoke.194",
            const plane1 = spawnplane (
                93.62425994873047,
                0.5,
                8.18860912322998
            )
        
            //195,
            //"smoke.195",
            const plane1 = spawnplane (
                87.89616394042969,
                0.5,
                8.18860912322998
            )
        
            //196,
            //"smoke.196",
            const plane1 = spawnplane (
                103.27486419677734,
                0.5,
                12.297895431518555
            )
        
            //197,
            //"smoke.197",
            const plane1 = spawnplane (
                98.85426330566406,
                0.5,
                12.297895431518555
            )
        
            //198,
            //"smoke.198",
            const plane1 = spawnplane (
                93.62425994873047,
                0.5,
                12.297895431518555
            )
        
            //199,
            //"smoke.199",
            const plane1 = spawnplane (
                87.89616394042969,
                0.5,
                12.297895431518555
            )
        
            //200,
            //"smoke.200",
            const plane1 = spawnplane (
                103.27486419677734,
                0.5,
                16.78075408935547
            )
        
            //201,
            //"smoke.201",
            const plane1 = spawnplane (
                98.85426330566406,
                0.5,
                16.78075408935547
            )
        
            //202,
            //"smoke.202",
            const plane1 = spawnplane (
                93.62425994873047,
                0.5,
                16.78075408935547
            )
        
            //203,
            //"smoke.203",
            const plane1 = spawnplane (
                87.89616394042969,
                0.5,
                16.78075408935547
            )
        
            //204,
            //"smoke.204",
            const plane1 = spawnplane (
                103.27486419677734,
                0.5,
                21.637184143066406
            )
        
            //205,
            //"smoke.205",
            const plane1 = spawnplane (
                98.85426330566406,
                0.5,
                21.637184143066406
            )
        
            //206,
            //"smoke.206",
            const plane1 = spawnplane (
                93.62425994873047,
                0.5,
                21.637184143066406
            )
        
            //207,
            //"smoke.207",
            const plane1 = spawnplane (
                87.89616394042969,
                0.5,
                21.637184143066406
            )
        
            //208,
            //"smoke.208",
            const plane1 = spawnplane (
                103.27486419677734,
                0.5,
                25.808732986450195
            )
        
            //209,
            //"smoke.209",
            const plane1 = spawnplane (
                98.85426330566406,
                0.5,
                25.808732986450195
            )
        
            //210,
            //"smoke.210",
            const plane1 = spawnplane (
                93.62425994873047,
                0.5,
                25.808732986450195
            )
        
            //211,
            //"smoke.211",
            const plane1 = spawnplane (
                87.89616394042969,
                0.5,
                25.808732986450195
            )
        
            //212,
            //"smoke.212",
            const plane1 = spawnplane (
                103.27486419677734,
                0.5,
                30.789688110351562
            )
        
            //213,
            //"smoke.213",
            const plane1 = spawnplane (
                98.85426330566406,
                0.5,
                30.789688110351562
            )
        
            //214,
            //"smoke.214",
            const plane1 = spawnplane (
                93.62425994873047,
                0.5,
                30.789688110351562
            )
        
            //215,
            //"smoke.215",
            const plane1 = spawnplane (
                87.89616394042969,
                0.5,
                30.789688110351562
            )
        
            //216,
            //"smoke.216",
            const plane1 = spawnplane (
                103.27486419677734,
                0.5,
                36.08195114135742
            )
        
            //217,
            //"smoke.217",
            const plane1 = spawnplane (
                98.85426330566406,
                0.5,
                36.08195114135742
            )
        
            //218,
            //"smoke.218",
            const plane1 = spawnplane (
                93.62425994873047,
                0.5,
                36.08195114135742
            )
        
            //219,
            //"smoke.219",
            const plane1 = spawnplane (
                87.89616394042969,
                0.5,
                36.08195114135742
            )
        
            //220,
            //"smoke.220",
            const plane1 = spawnplane (
                103.27486419677734,
                0.5,
                41.56100082397461
            )
        
            //221,
            //"smoke.221",
            const plane1 = spawnplane (
                98.85426330566406,
                0.5,
                41.56100082397461
            )
        
            //222,
            //"smoke.222",
            const plane1 = spawnplane (
                93.62425994873047,
                0.5,
                41.56100082397461
            )
        
            //223,
            //"smoke.223",
            const plane1 = spawnplane (
                87.89616394042969,
                0.5,
                41.56100082397461
            )
        
            //224,
            //"smoke.224",
            const plane1 = spawnplane (
                103.27486419677734,
                0.5,
                38.67204666137695
            )
        
            //225,
            //"smoke.225",
            const plane1 = spawnplane (
                98.85426330566406,
                0.5,
                38.67204666137695
            )
        
            //226,
            //"smoke.226",
            const plane1 = spawnplane (
                93.62425994873047,
                0.5,
                38.67204666137695
            )
        
            //227,
            //"smoke.227",
            const plane1 = spawnplane (
                87.89616394042969,
                0.5,
                38.67204666137695
            )
        
            //228,
            //"smoke.228",
            const plane1 = spawnplane (
                103.27486419677734,
                0.5,
                42.781333923339844
            )
        
            //229,
            //"smoke.229",
            const plane1 = spawnplane (
                98.85426330566406,
                0.5,
                42.781333923339844
            )
        
            //230,
            //"smoke.230",
            const plane1 = spawnplane (
                93.62425994873047,
                0.5,
                42.781333923339844
            )
        
            //231,
            //"smoke.231",
            const plane1 = spawnplane (
                87.89616394042969,
                0.5,
                42.781333923339844
            )
        
            //232,
            //"smoke.232",
            const plane1 = spawnplane (
                103.27486419677734,
                0.5,
                47.264190673828125
            )
        
            //233,
            //"smoke.233",
            const plane1 = spawnplane (
                98.85426330566406,
                0.5,
                47.264190673828125
            )
        
            //234,
            //"smoke.234",
            const plane1 = spawnplane (
                93.62425994873047,
                0.5,
                47.264190673828125
            )
        
            //235,
            //"smoke.235",
            const plane1 = spawnplane (
                87.89616394042969,
                0.5,
                47.264190673828125
            )
        
            //236,
            //"smoke.236",
            const plane1 = spawnplane (
                103.27486419677734,
                0.5,
                52.12062072753906
            )
        
            //237,
            //"smoke.237",
            const plane1 = spawnplane (
                98.85426330566406,
                0.5,
                52.12062072753906
            )
        
            //238,
            //"smoke.238",
            const plane1 = spawnplane (
                93.62425994873047,
                0.5,
                52.12062072753906
            )
        
            //239,
            //"smoke.239",
            const plane1 = spawnplane (
                87.89616394042969,
                0.5,
                52.12062072753906
            )
        
            //240,
            //"smoke.240",
            const plane1 = spawnplane (
                103.27486419677734,
                0.5,
                56.292171478271484
            )
        
            //241,
            //"smoke.241",
            const plane1 = spawnplane (
                98.85426330566406,
                0.5,
                56.292171478271484
            )
        
            //242,
            //"smoke.242",
            const plane1 = spawnplane (
                93.62425994873047,
                0.5,
                56.292171478271484
            )
        
            //243,
            //"smoke.243",
            const plane1 = spawnplane (
                87.89616394042969,
                0.5,
                56.292171478271484
            )
        
            //244,
            //"smoke.244",
            const plane1 = spawnplane (
                103.27486419677734,
                0.5,
                61.27312469482422
            )
        
            //245,
            //"smoke.245",
            const plane1 = spawnplane (
                98.85426330566406,
                0.5,
                61.27312469482422
            )
        
            //246,
            //"smoke.246",
            const plane1 = spawnplane (
                93.62425994873047,
                0.5,
                61.27312469482422
            )
        
            //247,
            //"smoke.247",
            const plane1 = spawnplane (
                87.89616394042969,
                0.5,
                61.27312469482422
            )
        
            //248,
            //"smoke.248",
            const plane1 = spawnplane (
                103.27486419677734,
                0.5,
                66.56539154052734
            )
        
            //249,
            //"smoke.249",
            const plane1 = spawnplane (
                98.85426330566406,
                0.5,
                66.56539154052734
            )
        
            //250,
            //"smoke.250",
            const plane1 = spawnplane (
                93.62425994873047,
                0.5,
                66.56539154052734
            )
        
            //251,
            //"smoke.251",
            const plane1 = spawnplane (
                87.89616394042969,
                0.5,
                66.56539154052734
            )
        
            //252,
            //"smoke.252",
            const plane1 = spawnplane (
                103.27486419677734,
                0.5,
                72.04444122314453
            )
        
            //253,
            //"smoke.253",
            const plane1 = spawnplane (
                98.85426330566406,
                0.5,
                72.04444122314453
            )
        
            //254,
            //"smoke.254",
            const plane1 = spawnplane (
                93.62425994873047,
                0.5,
                72.04444122314453
            )
        
            //255,
            //"smoke.255",
            const plane1 = spawnplane (
                87.89616394042969,
                0.5,
                72.04444122314453
            )
}

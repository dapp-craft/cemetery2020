import * as utils from '@dcl/ecs-scene-utils'
import { fog_data } from './fog/fog_data'
import { spawnFog } from './fog/spawnFog'
import { openPhotosUI } from './photosUI'

export function addStaticStuff() {
    //--- Set up a system ---
    let cementery = new Entity()

    cementery.addComponent(new GLTFShape('modelsBase.glb'))
    cementery.addComponent(
        new Transform({
            position: new Vector3(0, 0, 0),
        })
    )

    engine.addEntity(cementery)


    /////// SOUND

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



    for (const data of fog_data) {
        spawnFog(data)
    }
}

import * as ui from '../../node_modules/@dcl/ui-utils/index'
import utils from '../../node_modules/decentraland-ecs-utils/index'
import { TriggerSphereShape } from '../../node_modules/decentraland-ecs-utils/triggers/triggerSystem'
import { Dialog } from '../../node_modules/@dcl/ui-utils/utils/types'
import { Grave } from '../grave'
import {
  ghost1Talk,
  ghost2Talk,
  ghost3Talk,
  ghost4Talk,
  ghost5Talk,
  ghost6Talk,
  missionBrief,
  missionEnd,
  thanks,
} from './dialog'
import { NPC } from './npc'
import { HalloweenState, halloweenTheme, quest } from '../halloweenQuests/quest'
import { updateProgression } from '../halloweenQuests/progression'

export enum GhostState {
  Wondering,
  Talking,
  Following,
  Returning,
  Going,
  Gone,
}

@Component('lerpData')
export class LerpData {
  path: Vector3[]
  origin: number = 0
  target: number = 1
  fraction: number = 0
  lastPos: Vector3
  nextPos: Vector3
  constructor(path: Vector3[]) {
    this.path = path
  }
}

export let followingGhost: Ghost = null

export let ghostsArray: Ghost[] = []

export let activeGraves: Grave[] = []

let sharedVanishTimerEntity = new Entity()
engine.addEntity(sharedVanishTimerEntity)

let sharedDialogTimerEntity = new Entity()
engine.addEntity(sharedDialogTimerEntity)

let sharedDialog = new ui.DialogWindow(
  { path: 'images/portraits/main-ghost.png' },
  true
)
sharedDialog.panel.height = 150

export class Ghost extends Entity {
  public script: Dialog[]
  hasDialogOpen: boolean
  inCooldown: boolean
  public home: Grave
  private idleAnim: AnimationState
  private vanishAnim: AnimationState
  private lastPlayedAnim: AnimationState
  private endAnimTimer: Entity
  state: GhostState = GhostState.Wondering
  constructor(
    position: TranformConstructorArgs,
    model: GLTFShape,
    path: Vector3[],
    script: Dialog[],
    vanishAnim: string,
    reactDistance?: number
  ) {
    super()
    this.addComponent(model)
    this.addComponent(new Transform(position))

    this.getComponent(Transform).lookAt(path[2])
    engine.addEntity(this)

    this.addComponent(new Animator())

    this.idleAnim = this.getComponent(Animator).getClip('idle1')
    this.lastPlayedAnim = this.idleAnim
    this.idleAnim.play()

    this.vanishAnim = this.getComponent(Animator).getClip(vanishAnim)

    this.script = script

    this.addComponent(new LerpData(path))

    this.endAnimTimer = new Entity()
    engine.addEntity(this.endAnimTimer)

    this.addComponent(
      new OnPointerDown(
        (e) => {
          if (!quest.isChecked(1)) return

          if (this.state == GhostState.Wondering && !followingGhost) {
            this.startFollowing()
          } else if (followingGhost == this) {
            this.stopFollowing()
          }
        },
        {
          button: ActionButton.PRIMARY,
          hoverText: 'Follow You',
          showFeedback: false,
        }
      )
    )

    // trigger when player walks near
    this.addComponent(
      new utils.TriggerComponent(
        new TriggerSphereShape(
          reactDistance ? reactDistance : 6,
          Vector3.Zero()
        ),
        1,
        1,
        null,
        null,
        () => {
          if (
            this.inCooldown ||
            sharedDialog.isDialogOpen ||
            followingGhost != null
          ) {
            return
          }

          this.talk(this.script, 0, 2)
        }
      )
    )
  }
  talk(script: Dialog[], startIndex: number, duration?: number) {
    this.inCooldown = true
    sharedDialog.openDialogWindow(script, startIndex)
    sharedDialog.panel.visible = true
    this.hasDialogOpen = true
    this.addComponentOrReplace(
      new utils.Delay(5000, () => {
        this.inCooldown = false
      })
    )
    if (duration) {
      sharedDialogTimerEntity.addComponentOrReplace(
        new utils.Delay(duration * 1000, () => {
          if (followingGhost != null || !this.hasDialogOpen) return
          this.hasDialogOpen = false
          sharedDialog.closeDialogWindow()
        })
      )
    }
  }
  playAnimation(animationName: string, noLoop?: boolean, duration?: number) {
    this.lastPlayedAnim.stop()
    if (this.endAnimTimer.hasComponent(utils.Delay)) {
      this.endAnimTimer.removeComponent(utils.Delay)
    }
    let newAnim = this.getComponent(Animator).getClip(animationName)

    log('playing anim : ', animationName)

    if (noLoop) {
      newAnim.looping = false
      if (duration) {
        this.endAnimTimer.addComponentOrReplace(
          new utils.Delay(duration * 1000, () => {
            newAnim.stop()
            if (this.idleAnim) {
              this.idleAnim.play()
              this.lastPlayedAnim = this.idleAnim
            }
          })
        )
      }
    }

    newAnim.stop()
    newAnim.play()
    this.lastPlayedAnim = newAnim
  }
  startFollowing() {
    this.state = GhostState.Following
    this.getComponent(utils.TriggerComponent).enabled = false
    this.getComponent(OnPointerDown).hoverText = 'Stop Following'
    followingGhost = this
    this.talk(this.script, 0, 2)

    this.lastPlayedAnim.stop()
    let followAnim = this.getComponent(Animator).getClip('idle2')
    this.lastPlayedAnim = followAnim
    followAnim.play()

    this.addComponentOrReplace(
      new AudioSource(new AudioClip('sounds/ghost-follow.mp3'))
    )
    //this.getComponent(AudioSource).volume = 2
    this.getComponent(AudioSource).loop = false
    this.getComponent(AudioSource).playOnce()

    OpenAllGraves()
  }
  stopFollowing() {
    let path = this.getComponent(LerpData)
    followingGhost = null
    this.state = GhostState.Returning
    path.fraction = 0
    path.lastPos = this.getComponent(Transform).position.clone()
    path.nextPos = path.path[1] // get closest path point

    this.getComponent(Transform).lookAt(path.nextPos)
    this.getComponent(utils.TriggerComponent).enabled = true
    this.getComponent(OnPointerDown).hoverText = 'Follow You'
    sharedDialog.closeDialogWindow()
    this.hasDialogOpen = false

    this.lastPlayedAnim.stop()
    this.idleAnim.play()

    CloseAllGraves()
  }
  goHome(destination: Grave) {
    log('FOUND HOME')
    // say something
    this.state = GhostState.Going
    this.talk(this.script, 1, 2)

    this.getComponent(LerpData).fraction = 0

    this.getComponent(Transform).lookAt(
      destination.getComponent(Transform).position
    )

    this.getComponent(LerpData).lastPos = this.getComponent(
      Transform
    ).position.clone()

    // this.getComponent(LerpData).nextPos = this.getComponent(
    //   Transform
    // ).position.clone()

    this.getComponent(LerpData).nextPos = destination
      .getComponent(Transform)
      .position.clone()

    this.addComponentOrReplace(
      new AudioSource(new AudioClip('sounds/ghost-accepted.mp3'))
    )
    //this.getComponent(AudioSource).volume = 2
    this.getComponent(AudioSource).loop = false
    this.getComponent(AudioSource).playOnce()

    this.home = destination
  }
  vanish() {
    this.state = GhostState.Gone
    followingGhost = null

    this.lastPlayedAnim.stop()
    this.vanishAnim.play()

    this.addComponentOrReplace(
      new AudioSource(new AudioClip('sounds/ghost-dive.mp3'))
    )
    //this.getComponent(AudioSource).volume = 2
    this.getComponent(AudioSource).loop = false
    this.getComponent(AudioSource).playOnce()

    sharedVanishTimerEntity.addComponentOrReplace(
      new utils.Delay(3000, () => {
        log('Removing ghost')
        this.home.activate()
        engine.removeEntity(this)
        counterIncrease()
        CloseAllGraves()
        sharedDialog.closeDialogWindow()
      })
    )
  }
  refusePlace() {
    this.talk(this.script, 2, 2)

    this.endAnimTimer.addComponentOrReplace(
      new utils.Delay(2000, () => {
        if (followingGhost != this) return
        this.talk(this.script, 0)
      })
    )

    this.addComponentOrReplace(
      new AudioSource(new AudioClip('sounds/ghost-denied.mp3'))
    )
    //this.getComponent(AudioSource).volume = 2
    this.getComponent(AudioSource).loop = false
    this.getComponent(AudioSource).playOnce()
  }
}

const MOVE_SPEED = 3

const player = Camera.instance

const ghostPaths = [
  [
    new Vector3(10, 1, 10),
    new Vector3(35, 1, 10),
    new Vector3(10, 1, 35),
    new Vector3(35, 1, 35),
    new Vector3(30, 1, 40),
    new Vector3(50, 1, 15),
  ],
  [
    new Vector3(36.86669921875, 1.3, 19.005111694335938),
    new Vector3(81.7373046875, 1.3, 19.419326782226562),
    new Vector3(79.082763671875, 1.3, 29.23333740234375),
    new Vector3(69.2646484375, 1.3, 45.42523193359375),
    new Vector3(52.8699951171875, 1.3, 75.66563415527344),
    new Vector3(32.208740234375, 1.3, 50.01548767089844),
  ],
  [
    new Vector3(39.551513671875, 1.3, 44.1265869140625),
    new Vector3(68.6109619140625, 1.3, 37.26177978515625),
    new Vector3(109.7174072265625, 1.3, 50.99623107910156),
    new Vector3(92.7772216796875, 1.3, 68.10420227050781),
    new Vector3(66.876953125, 1.3, 54.42950439453125),
  ],
  [
    new Vector3(89.4342041015625, 1.3, 8.731460571289062),
    new Vector3(87.6187744140625, 1.3, 31.036895751953125),
    new Vector3(60.4107666015625, 1.3, 31.164169311523438),
  ],
  [
    new Vector3(108.52978515625, 1.3, 9.524887084960938),
    new Vector3(90.803955078125, 1.3, 16.572250366210938),
    new Vector3(52.53955078125, 1.3, 5.392143249511719),
    new Vector3(50.767822265625, 1.3, 37.85466003417969),
    new Vector3(17.159423828125, 1.3, 39.723907470703125),
  ],
  [
    new Vector3(84.9725341796875, 1.3, 37.562164306640625),
    new Vector3(63.8221435546875, 1.3, 15.966148376464844),
    new Vector3(20.00726318359375, 1.3, 11.857383728027344),
    new Vector3(20.757568359375, 1.3, 40.708709716796875),
  ],
]

// Walk System
export class GhostMove {
  update(dt: number) {
    for (let ghost of ghostsArray) {
      let transform = ghost.getComponent(Transform)
      let path = ghost.getComponent(LerpData)
      if (ghost.state == GhostState.Wondering) {
        if (path.fraction < 1) {
          path.fraction += dt / 20
          transform.position = Vector3.Lerp(
            path.path[path.origin],
            path.path[path.target],
            path.fraction
          )
        } else {
          path.origin = path.target
          path.target += 1
          if (path.target >= path.path.length) {
            path.target = 0
          }
          path.fraction = 0
          transform.lookAt(path.path[path.target])
        }
      } else if (ghost.state == GhostState.Following) {
        transform.lookAt(player.position)
        //ghost.dialog.container.visible = true

        // Continue to move towards the player until it is within 2m away
        let distance = Vector3.DistanceSquared(
          transform.position,
          player.position
        ) // Check distance squared as it's more optimized
        if (distance >= 5) {
          let forwardVector = Vector3.Forward().rotate(transform.rotation)
          let increment = forwardVector.scale(dt * (MOVE_SPEED + distance / 10))
          transform.translate(increment)
        }
      } else if (ghost.state == GhostState.Returning) {
        path.fraction += dt / 3
        transform.position = Vector3.Lerp(
          path.lastPos,
          path.nextPos,
          path.fraction
        )
        if (path.fraction >= 1) {
          ghost.state = GhostState.Wondering
          path.target = 2
          path.fraction = 0
          log('Returned to normal path')
        }
      } else if (ghost.state == GhostState.Going) {
        path.fraction += dt / 3
        transform.position = Vector3.Lerp(
          path.lastPos,
          path.nextPos,
          path.fraction
        )

        let distance = Vector3.DistanceSquared(transform.position, path.nextPos) // Check distance squared as it's more optimized
        if (distance <= 4) {
          path.fraction = 1
          ghost.vanish()
        }

        // if (path.fraction >= 1) {
        //   ghost.vanish()
        // }
      }
    }
  }
}

export let mainGhost: NPC

export function addMainGhostNPC(progression: HalloweenState) {
  mainGhost = new NPC(
    {
      position: new Vector3(26, 1.7, 40),
      rotation: Quaternion.Euler(0, 270, 0),
    },
    new GLTFShape('models/NPCs/ghost1.glb'),
    () => {
      if (mainGhost.dialog.isDialogOpen) return

      if (!quest.isChecked(1)) {
        mainGhost.talk(missionBrief, 0)
      } else if (progression.data.ghostsDone) {
        mainGhost.talk(thanks, 0, 3)
      }
      //mainGhost.playAnimation(`Head_Yes`, true, 2.63)
    },
    {
      path: 'images/portraits/main-ghost.png',
    },
    10,
    `idle1`,
    true
  )

  mainGhost.dialog = new ui.DialogWindow(
    { path: 'images/portraits/main-ghost.png' },
    true,
    halloweenTheme
  )
  mainGhost.dialog.leftClickIcon.positionX = 340 - 60
  mainGhost.dialog.text.color = Color4.FromHexString('#8DFF34FF')
}

export let ghostUIBck = new ui.LargeIcon(
  'images/ghost-ui.png',
  0,
  0,
  256,
  256,
  {
    sourceWidth: 512,
    sourceHeight: 512,
  }
)
ghostUIBck.image.visible = false
export let ghostCounter = new ui.UICounter(
  0,
  -55,
  180,
  Color4.FromHexString('#8DFF34FF'),
  50
)

ghostCounter.uiText.visible = false
ghostCounter.uiText.font = ui.SFHeavyFont

export function counterIncrease() {
  ghostCounter.increase()
  if (ghostCounter.read() >= 6) {
    // update quest info
    quest.checkBox(2)
    updateProgression('ghostsDone')
    // remove UI
    ghostUIBck.image.visible = false
    ghostCounter.uiText.visible = false
    // conversation
    mainGhost.talk(missionEnd, 0)
  }
}

export function addGhostsAndCrypts() {
  //mother
  let ghost1 = new Ghost(
    {
      position: new Vector3(40, 1.7, 40),
      rotation: Quaternion.Euler(0, 90, 0),
    },
    new GLTFShape('models/NPCs/ghost3.glb'),
    ghostPaths[0],
    ghost1Talk,
    'Swirl.001',
    4
  )

  // oldtimer
  let ghost2 = new Ghost(
    {
      position: new Vector3(60, 1.7, 40),
      rotation: Quaternion.Euler(0, 90, 0),
    },
    new GLTFShape('models/NPCs/ghost5.glb'),
    ghostPaths[1],
    ghost2Talk,
    'Swirl.001',
    4
  )

  // hippie
  let ghost3 = new Ghost(
    {
      position: new Vector3(80, 1.7, 40),
      rotation: Quaternion.Euler(0, 90, 0),
    },
    new GLTFShape('models/NPCs/ghost4.glb'),
    ghostPaths[2],
    ghost3Talk,
    'Swirl.001',
    4
  )

  // french
  let ghost4 = new Ghost(
    {
      position: new Vector3(80, 1.7, 40),
      rotation: Quaternion.Euler(0, 90, 0),
    },
    new GLTFShape('models/NPCs/ghost6.glb'),
    ghostPaths[3],
    ghost4Talk,
    'Swirl.001',
    4
  )

  // lover
  let ghost5 = new Ghost(
    {
      position: new Vector3(80, 1.7, 40),
      rotation: Quaternion.Euler(0, 90, 0),
    },
    new GLTFShape('models/NPCs/ghost2.glb'),
    ghostPaths[4],
    ghost5Talk,
    'swirl',
    4
  )

  // philosopher
  let ghost6 = new Ghost(
    {
      position: new Vector3(80, 1.7, 40),
      rotation: Quaternion.Euler(0, 90, 0),
    },
    new GLTFShape('models/NPCs/ghost7.glb'),
    ghostPaths[5],
    ghost6Talk,
    'Swirl.001',
    4
  )

  ghostsArray.push(ghost1)
  ghostsArray.push(ghost2)
  ghostsArray.push(ghost3)
  ghostsArray.push(ghost4)
  ghostsArray.push(ghost5)
  ghostsArray.push(ghost6)

  engine.addSystem(new GhostMove())

  /// CRYPTS

  let crypt = new Grave(
    {
      position: new Vector3(91 + 8, 0.15, 8),
      rotation: Quaternion.Euler(0, -90, 0),
    },
    new GLTFShape('models/graves/mother_grave.glb'),
    ghost1,
    'Open_Grave',
    'Close_Grave'
  )

  let crypt2 = new Grave(
    {
      position: new Vector3(81 + 8, 0.2, 15),
      rotation: Quaternion.Euler(0, 90, 0),
    },
    new GLTFShape('models/crypt_machete.glb'),
    null,
    'Machete_Trigger',
    'Trigger_Close'
  )

  let crypt3 = new Grave(
    {
      position: new Vector3(57 + 8, 0.1, 19),
      rotation: Quaternion.Euler(0, 180, 0),
    },
    new GLTFShape('models/graves/oldtimer_grave.glb'),
    ghost2,
    'Open_Grave',
    'Close_Grave'
  )

  let dummyForCat = new Entity()
  dummyForCat.addComponent(
    new Transform({
      position: new Vector3(24 + 8, 0, 16),
    })
  )
  engine.addEntity(dummyForCat)

  let crypt4 = new Grave(
    {
      position: new Vector3(21 + 8, 0, 16),
      rotation: Quaternion.Euler(0, 270, 0),
    },
    new GLTFShape('models/CatCrypt.glb'),
    null,
    'Trigger',
    'Trigger_Close'
  )

  let crypt5 = new Grave(
    {
      position: new Vector3(21 + 8, 0, 52),
      rotation: Quaternion.Euler(0, 90, 0),
    },

    new GLTFShape('models/graves/french_grave.glb'),
    ghost4,
    'Trigger',
    'Trigger_Close'
  )

  let crypt6 = new Grave(
    {
      position: new Vector3(48 + 8, 0.15, 53),
    },
    new GLTFShape('models/graves/love_grave.glb'),
    ghost5,
    'Open_Grave',
    'Close_Grave'
  )

  let crypt7 = new Grave(
    {
      position: new Vector3(35 + 8, 0, 66.3),
      rotation: Quaternion.Euler(0, 180, 0),
      scale: new Vector3(0.7, 0.7, 0.7),
    },
    new GLTFShape('models/CryptZombieHand.glb'),
    null,
    'ZombieHand_Trigger',
    'Trigger_Close'
  )

  let crypt8 = new Grave(
    {
      position: new Vector3(68 + 8, 0, 66),
      rotation: Quaternion.Euler(0, -45, 0),
    },
    new GLTFShape('models/graves/hippie_grave.glb'),
    ghost3,
    'Trigger',
    'Trigger_Close_Armature'
  )

  //   let crypt9 = new Grave(
  //     {
  //       position: new Vector3(77.3 + 8, 0, 52.5),
  //     },
  //     new GLTFShape('models/Crypt01.glb'),
  //     null,
  //     'Trigger',
  //     'Trigger_Close'
  //   )

  let crypt10 = new Grave(
    {
      position: new Vector3(92 + 8, 0, 69),
      rotation: Quaternion.Euler(0, 90, 0),
      scale: new Vector3(0.7, 0.7, 0.7),
    },
    new GLTFShape('models/CryptZombieHand.glb'),
    null,
    'ZombieHand_Trigger',
    'Trigger_Close'
  )

  let crypt11 = new Grave(
    {
      position: new Vector3(21.3 + 8, 0.2, 70),
      rotation: Quaternion.Euler(0, 90, 0),
    },
    new GLTFShape('models/graves/philo_grave.glb'),
    ghost6,
    'Trigger',
    'Close_grave'
  )

  let dummyForCrypt = new Entity()
  dummyForCrypt.addComponent(
    new Transform({
      position: new Vector3(93, 3.45, 23),
    })
  )
  engine.addEntity(dummyForCrypt)

  //   addLabel('Mother', crypt)
  //   addLabel('Old timer', crypt3)
  //   addLabel('French', crypt5)
  //   addLabel('Couple', crypt6)
  //   addLabel('Philosopher', crypt11)
  //   addLabel('60s hippy', crypt8)

  activeGraves.push(crypt)
  activeGraves.push(crypt3)
  activeGraves.push(crypt5)
  activeGraves.push(crypt6)
  activeGraves.push(crypt11)
  activeGraves.push(crypt8)
}

export function OpenAllGraves() {
  for (let grave of activeGraves) {
    if (grave.resident.state != GhostState.Gone) {
      grave.open()
    }
  }
}

export function CloseAllGraves() {
  for (let grave of activeGraves) {
    if (grave.isOpen) {
      grave.close()
    }
  }
}

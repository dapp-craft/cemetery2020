import * as ui from '@dcl/ui-scene-utils'
import * as utils from '@dcl/ecs-scene-utils'
import { TriggerSphereShape } from '@dcl/ecs-scene-utils'
import * as NPCUtils from '@dcl/npc-scene-utils'
import { Dialog } from '@dcl/npc-scene-utils'

import { COLOR_GREEN } from '../../theme/color'

import { Grave } from '../../grave'

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
import { npc_data } from './npc_data'

import { HalloweenState, halloweenTheme, quest } from '../../halloweenQuests/quest'
import { updateProgression } from '../../halloweenQuests/progression'



export enum SkeletonState {
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

export let followingSkeletons: Skeleton[] = []

export let ghostsArray: Skeleton[] = []

export let activeGraves: Grave[] = []

let sharedVanishTimerEntity = new Entity()
engine.addEntity(sharedVanishTimerEntity)

let sharedDialogTimerEntity = new Entity()
engine.addEntity(sharedDialogTimerEntity)

let sharedDialog = new NPCUtils.DialogWindow(
  { path: 'images/portraits/main-ghost.png' },
  true
)
sharedDialog.panel.height = 150

export class Skeleton extends Entity {
  public script: Dialog[]
  public hasDialogOpen: boolean
  public inCooldown: boolean
  public home: Grave
  public state: SkeletonState = SkeletonState.Wondering
  private idleAnim: AnimationState
  private vanishAnim: AnimationState
  private lastPlayedAnim: AnimationState
  private endAnimTimer: Entity
  public followingPoint: Vector3

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
          if (this.state == SkeletonState.Wondering) {
            this.startFollowing()
          } else if (this.state == SkeletonState.Following) {
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
        {
          layer: 0,
          onCameraEnter: () => {
            if (
              this.inCooldown ||
              sharedDialog.isDialogOpen ||
              followingSkeletons.length == 0
            ) {
              return
            }
            this.talk(this.script, 0, 2)
          }
        },
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
          if (followingSkeletons.length != 0 || !this.hasDialogOpen) return
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
    this.state = SkeletonState.Following
    this.getComponent(utils.TriggerComponent).enabled = false
    this.getComponent(OnPointerDown).hoverText = 'Stop Following'


    if (followingSkeletons.length == 0) {
      this.followingPoint = player.position
    } else {
      this.followingPoint = followingSkeletons[followingSkeletons.length - 1].getComponent(Transform).position
    }
    followingSkeletons.push(this)
    log("FOLLOWING POSITION: " + this.followingPoint)

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


    this.followingPoint = null
    let path = this.getComponent(LerpData)
    this.state = SkeletonState.Returning
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


    const index = followingSkeletons.indexOf(this)
    log("INDEX: " + index)
    const last = followingSkeletons.length - 1
    switch (index) {
      case 0:
        followingSkeletons.splice(index, 1)

        if (followingSkeletons.length == 0) {
          CloseAllGraves()
        } else {
          followingSkeletons[0].followingPoint = player.position
        }
        break;

      case last:
        followingSkeletons.splice(index, 1)
        break;

      default:
        followingSkeletons.splice(index, 1)
        followingSkeletons[index].followingPoint = followingSkeletons[index - 1].getComponent(Transform).position
        break;
    }


  }

  goHome(destination: Grave) {
    log('FOUND HOME')
    // say something
    this.state = SkeletonState.Going
    this.talk(this.script, 1, 2)

    this.getComponent(LerpData).fraction = 0

    this.getComponent(Transform).lookAt(
      destination.getComponent(Transform).position
    )

    this.getComponent(LerpData).lastPos = this.getComponent(
      Transform
    ).position.clone()



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

    followingSkeletons.shift()
    followingSkeletons[0].followingPoint = player.position
  }

  vanish() {
    this.state = SkeletonState.Gone

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
        if (this.state == SkeletonState.Following) return
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


// Walk System
export class GhostMove {
  update(dt: number) {
    for (let ghost of ghostsArray) {
      let transform = ghost.getComponent(Transform)
      let path = ghost.getComponent(LerpData)
      if (ghost.state == SkeletonState.Wondering) {
        if (path.fraction < 1) {
          path.fraction += dt / 3
          transform.position = Vector3.Lerp(
            path.path[path.origin],
            path.path[path.target],
            path.fraction
          )
        } else {
          path.origin = path.target
          path.target += 1
          if (path.target >= path.path.length) {
            path.path.reverse()
            path.origin = 0
            path.target = 1
          }
          path.fraction = 0
          transform.lookAt(path.path[path.target])
        }
      } else if (ghost.state == SkeletonState.Following) {
        transform.lookAt(new Vector3(ghost.followingPoint.x, 0, ghost.followingPoint.z))
        //ghost.dialog.container.visible = true
        // Continue to move towards the player until it is within 2m away
        let distance = Vector3.DistanceSquared(
          transform.position,
          new Vector3(ghost.followingPoint.x, 0, ghost.followingPoint.z)
        ) // Check distance squared as it's more optimized
        if (distance >= 3) {
          ghost.getComponent(Animator).getClip('idle1').play()
          let forwardVector = Vector3.Forward().rotate(transform.rotation)
          let increment = forwardVector.scale(dt * (MOVE_SPEED + distance / 10))
          transform.translate(increment)
        } else {
          ghost.getComponent(Animator).getClip('idle2').play()
        }
      } else if (ghost.state == SkeletonState.Returning) {
        ghost.getComponent(Animator).getClip('idle1').play()
        path.fraction += dt / 3
        transform.position = Vector3.Lerp(
          path.lastPos,
          path.nextPos,
          path.fraction
        )
        if (path.fraction >= 1) {
          ghost.state = SkeletonState.Wondering
          path.target = 2
          path.fraction = 0
          log('Returned to normal path')
        }
      } else if (ghost.state == SkeletonState.Going) {
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

export let mainGhost: NPCUtils.NPC

export function addMainGhostNPC(progression: HalloweenState) {
  mainGhost = new NPCUtils.NPC(
    {
      position: new Vector3(65, 0.15, 13),
      rotation: Quaternion.Euler(0, 180, 0),
      scale: new Vector3(1.35, 1.35, 1.35),
    },
    'models/NPCs/skeleton1.glb',
    () => {
      if (mainGhost.dialog.isDialogOpen) return

      if (!quest.isChecked(1)) {
        mainGhost.talk(missionBrief(ghostCounter, ghostUIBck, ghostsArray), 0)
      } else if (progression.data.ghostsDone) {
        mainGhost.talk(thanks, 0, 3)
      }
      //mainGhost.playAnimation(`Head_Yes`, true, 2.63)
    },
    {
      portrait: { path: 'images/portraits/main-ghost.png' },
      reactDistance: 10,
      idleAnim: `idle1`
    },

  )

  mainGhost.dialog = new NPCUtils.DialogWindow(
    { path: 'images/portraits/main-ghost.png' },
    true,
    '',
    halloweenTheme
  )
  mainGhost.dialog.leftClickIcon.positionX = 340 - 60
  mainGhost.dialog.text.color = Color4.FromHexString(COLOR_GREEN)
}

export const ghostUIBck = new ui.LargeIcon(
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
  Color4.FromHexString(COLOR_GREEN),
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
  let ghost1 = new Skeleton(
    {
      position: new Vector3(40, 0, 40),
      rotation: Quaternion.Euler(0, 90, 0),
      scale: new Vector3(1.35, 1.35, 1.35),
    },
    new GLTFShape(npc_data[0].modelPath),
    npc_data[0].patrolPath,
    ghost1Talk,
    'swirl',
    4
  )

  // oldtimer
  let ghost2 = new Skeleton(
    {
      position: new Vector3(60, 0, 40),
      rotation: Quaternion.Euler(0, 90, 0),
      scale: new Vector3(1.35, 1.35, 1.35),
    },
    new GLTFShape(npc_data[1].modelPath),
    npc_data[1].patrolPath,
    ghost2Talk,
    'swirl',
    4
  )

  // hippie
  let ghost3 = new Skeleton(
    {
      position: new Vector3(80, 0, 40),
      rotation: Quaternion.Euler(0, 90, 0),
      scale: new Vector3(1.35, 1.35, 1.35),
    },
    new GLTFShape(npc_data[2].modelPath),
    npc_data[2].patrolPath,
    ghost3Talk,
    'swirl',
    4
  )

  // french
  let ghost4 = new Skeleton(
    {
      position: new Vector3(80, 0, 40),
      rotation: Quaternion.Euler(0, 90, 0),
      scale: new Vector3(1.35, 1.35, 1.35),
    },
    new GLTFShape(npc_data[3].modelPath),
    npc_data[3].patrolPath,
    ghost4Talk,
    'swirl',
    4
  )

  // lover
  let ghost5 = new Skeleton(
    {
      position: new Vector3(80, 0, 40),
      rotation: Quaternion.Euler(0, 90, 0),
      scale: new Vector3(1.35, 1.35, 1.35),
    },
    new GLTFShape(npc_data[4].modelPath),
    npc_data[4].patrolPath,
    ghost5Talk,
    'swirl',
    4
  )

  // philosopher
  let ghost6 = new Skeleton(
    {
      position: new Vector3(80, 0, 40),
      rotation: Quaternion.Euler(0, 90, 0),
      scale: new Vector3(1.35, 1.35, 1.35),
    },
    new GLTFShape(npc_data[5].modelPath),
    npc_data[5].patrolPath,
    ghost6Talk,
    'swirl',
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
    'Trigger',
    'Trigger_Close'
  )

  let crypt2 = new Grave(
    {
      position: new Vector3(81 + 8, 0.2, 15),
      rotation: Quaternion.Euler(0, 90, 0), scale: new Vector3(1.35, 1.35, 1.35),
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
    'Trigger',
    'Trigger_Close'
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
      position: new Vector3(21 + 8, 0.10, 52),
      rotation: Quaternion.Euler(0, 90, 0), scale: new Vector3(1.35, 1.35, 1.35),
    },

    new GLTFShape('models/graves/french_grave.glb'),
    ghost4,
    'Trigger',
    'Trigger_Close'
  )

  let crypt6 = new Grave(
    {
      position: new Vector3(48 + 8, 0.15, 54),
    },
    new GLTFShape('models/graves/love_grave.glb'),
    ghost5,
    'Trigger',
    'Trigger_Close'
  )

  let crypt7 = new Grave(
    {
      position: new Vector3(35 + 8, 0, 66.3),
      rotation: Quaternion.Euler(0, 180, 0),
      scale: new Vector3(0.7, 0.7, 0.7)
    },
    new GLTFShape('models/CryptZombieHand.glb'),
    null,
    'ZombieHand_Trigger',
    'Trigger_Close'
  )

  let crypt8 = new Grave(
    {
      position: new Vector3(68 + 8, 0.15, 66),
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
      scale: new Vector3(0.7, 0.7, 0.7)
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
      scale: new Vector3(1.35, 1.35, 1.35)
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
    if (grave.resident.state != SkeletonState.Gone) {
      grave.open()
    }
  }
}

export function CloseAllGraves() {
  for (let grave of activeGraves) {
    if (grave.resident.state == SkeletonState.Gone) {
      grave.close()
    }
  }
}

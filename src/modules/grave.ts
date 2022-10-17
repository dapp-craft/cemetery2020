import { stuff } from 'src/resources/model_paths'
import { TriggerSphereShape } from '@dcl/ecs-scene-utils'
import * as NPCUtils from '@dcl/npc-scene-utils'

import { COLOR_GREEN } from '../resources/theme/color'

import { npc_data } from './NPC/ghost/npc_data'

import { HalloweenState, halloweenTheme, quest } from './halloweenQuests/quest'
import { graveyard_models, npc_model_paths } from 'src/resources/model_paths'

import {Reward} from './halloweenQuests/loot'
import {Dialog, NPC} from '@dcl/npc-scene-utils';
import * as utils from '@dcl/ecs-scene-utils';
import * as ui from '@dcl/ui-scene-utils';
import {TTHouse} from "./house";

import {nextDay, updateProgression} from './halloweenQuests/progression'
import { haunted_model_paths } from 'src/resources/model_paths'

export let hasKey = false
export let keyUI

export function doorHauntedHouse() {
  let doorHauntedHouse = new Entity()

  doorHauntedHouse.addComponent(new GLTFShape(haunted_model_paths.haunted_house))
  doorHauntedHouse.addComponent(
    new Transform({
      position: new Vector3(90.63, 0.53, 24),
      rotation: Quaternion.Euler(0, 270, 0),
    })
  )
  let doorHauntedHouseAnim = new AnimationState('HauntedHouse_Trigger', {
    looping: false,
  })
  doorHauntedHouse.addComponent(new Animator()).addClip(doorHauntedHouseAnim)

  let openClip = new AudioClip('sounds/open.mp3')

  doorHauntedHouse.addComponent(
    new OnPointerDown(
      (e) => {
        if (!hasKey) {
          ui.displayAnnouncement('You need a key to open this door')
          return
        }
        doorHauntedHouseAnim.play()
        quest.checkBox(3)
        useKey()
        const source = new AudioSource(openClip)
        doorHauntedHouse.addComponentOrReplace(source)
        source.playing = true

        coffin.openAnim.stop()
      },
      {distance: 6, hoverText: 'Open'}
    )
  )

  engine.addEntity(doorHauntedHouse)

  let coffin = new Grave(
    {
      position: new Vector3(93, 3.45, 23),
      rotation: Quaternion.Euler(0, 45, 0),
      scale: new Vector3(1.6, 1.6, 1.6),
    },
    new GLTFShape(haunted_model_paths.coffin),
    null,
    'Trigger',
    'Trigger_Close',
    () => {
      coffin.openAnim.play()
    }
  )
  coffin.openAnim.stop()

  coffin.addComponentOrReplace(
    new OnPointerDown((e) => {
      if (e.hit.length > 6) return
      coffin.openAnim.play()
      updateProgression('w2Found')

      coffin.addComponent(new AudioSource(new AudioClip('sounds/coffin.mp3')))
      //coffin.getComponent(AudioSource).volume = 0.5
      coffin.getComponent(AudioSource).loop = false
      coffin.getComponent(AudioSource).playOnce()

      let r = new Reward(
        coffin,
        'halloween2022',
        {
          position: new Vector3(0.2, 0.8, 0.5),
          scale: new Vector3(0.8, 0.8, 0.8),
        },
        false,
        () => {
          nextDay(3)
        }
      )
    }, { hoverText: 'Open coffin'})
  )
}

export function getKey() {
  if (hasKey) {
    ui.displayAnnouncement('You already have the key')
    return
  }

  let keyTexture = new Texture('images/Key.png')

  hasKey = true
  keyUI = new UIImage(ui.canvas, keyTexture)
  keyUI.hAlign = 'right'
  //keyUI.positionX = -120
  keyUI.vAlign = 'bottom'
  keyUI.positionY = 30
  keyUI.sourceLeft = 0
  keyUI.sourceTop = 0
  keyUI.sourceWidth = 256
  keyUI.sourceHeight = 256
  keyUI.height = 200
  keyUI.width = 200

  ui.displayAnnouncement('You found a key!')

  const keySound = new Entity()
  keySound.addComponent(new Transform())
  keySound.addComponent(new AudioSource(new AudioClip('sounds/key.mp3')))
  keySound.getComponent(AudioSource).volume = 0.5
  keySound.getComponent(AudioSource).loop = false
  engine.addEntity(keySound)
  keySound.setParent(Attachable.AVATAR)
  keySound.getComponent(AudioSource).playOnce()
}

export function useKey() {
  keyUI.visible = false
}


///// Trick or treat

// Cat lover
export function catLoverDialog(npc: NPC, doorHouse: TTHouse) {
  return [
    {
      text: `Pst-pst-pst... KITTY! Whatcha lookin’ at? No, not you. You aren’t a kitty, are ya?`,
      triggeredByNext: () => {
        npc.playAnimation(`HeadShake_No`, true, 1.83)
      },
    },
    {
      text: `You are not a cat right? You don’t look like a cat. Kitties got soft paws, and pointy ears and fluffy tails and warm bellies! My goal is to pet every cat there is!`,
      triggeredByNext: () => {
        npc.playAnimation(`Lengthy`, true, 1.77)
      },
    },
    {
      text: `Soon I will set off on a ‘round the globe journey – I will ride around the world and pet cats. What can be better than that? All alone! Just me and the kitties!
`,
      triggeredByNext: () => {
        npc.playAnimation(`Cocky`, true, 1.83)
      },
    },
    {
      text: `Cats are much better than people.
Well... sure a cat can scratch ye, but people can hurt more. So if ya ain’t a cat — you better leave.
`,
      triggeredByNext: () => {
        npc.playAnimation(`HeadShake_No`, true, 1.83)
      },
    },
    {
      text: `And you are obviously not a cat. Leave.`,
      triggeredByNext: () => {
        npc.playAnimation(`Annoyed_HeadShake`, true, 2.6)
      },
    },
    {
      text: `Wait! Don’t go. Lemme give ya somethin`,
      triggeredByNext: () => {
        npc.playAnimation(`Dismissing`, true, 3.3)
      },
    },
    {
      text: `example`,
      triggeredByNext: () => {
        npc.playAnimation(`HeadShake_No`, true,  1.83)
      },
    },
    {
      text: `And if you meet a cat on the streets, make sure to feed ‘em!Pst-pst-pst! Gather around friends, time for supper! Pst-pst-pst!`,
      triggeredByNext: () => {
        doorHouse.close()
      },
      isEndOfDialog: true,
    },
  ]
}


// second dialog if you are a cat

// Farmer
export function farmerDialog(npc: NPC, doorHouse: TTHouse) {
  return [
    {
      text: `Howdy there! What brings you over to my old shack here?`,
      triggeredByNext: () => {
        npc.playAnimation(`HeadShake_No`, true, 1.83)
      },
    },
    {
      text: `I real don't like these parties... people scambling around wearing this, wearing that`,
      triggeredByNext: () => {
        npc.playAnimation(`Annoyed_HeadShake`, true, 2.6)
      },
    },
    {
      text: `This girl a while back I was hearing... she be crazy yelling her lungs out like they was killing her or something. Chill out, man!`,
      triggeredByNext: () => {
        npc.playAnimation(`Hard Head`, true, 1.67)
      },
    },
    {
      text: `Anyway, thanks for sticking around while I ramble on about stuff. Here, take this little something as a token of my appreciationing.`,
      triggeredByNext: () => {
        doorHouse.close()
        let r = new Reward(npc, 'house1', {
          position: new Vector3(0, 1.5, 2.5),
        })
      },
      isEndOfDialog: true,
    },
  ]
}


// Mayor's Ghost
export function mayorGhostDialog(npc: NPC, doorHouse: TTHouse) {
  return [
    {
      text: `Hey! What's the matter, you look like you just saw a ghost!`,
      triggeredByNext: () => {
        npc.playAnimation(`talk2`, true, 10.3)
      },
    },
    {
      text: `To you this is a pretend fun night of dressing up... me, this is just who I am.`,
      triggeredByNext: () => {
        npc.playAnimation(`deny2`, true, 1.67)
      },
    },
    {
      text: `I've lived ...or rather been here for a very long time, this place is my home.`,
      triggeredByNext: () => {
        npc.playAnimation(`deny3`, true, 4.97)
      },
    },

    {
      text: `And nothing, or no one is going to get in the way of that. No matter how hard they try.`,
      triggeredByNext: () => {
        npc.playAnimation(`talk2`, true, 3.97)
      },
    },

    {
      text: `You want something to dress up like the other guys? Sure why not. Take this and have fun, see ya.`,
      triggeredByNext: () => {
        // give wearable
        let r = new Reward(npc, 'house2', {
          position: new Vector3(0, 1.5, 2.5),
        })
        doorHouse.close()
      },
      isEndOfDialog: true,
    },
  ]
}


// GhostControl

export function ghostControlDialog(npc: NPC, doorHouse: TTHouse) {
  return [
    {
      text: `What, what is it!`,
      triggeredByNext: () => {
        npc.playAnimation(`Lengthy`, true, 1.77)
      },
    },
    {
      text: `Oh... you're one of those. Messing around collecting junk. Listen, I don't have time for this now.`,
      triggeredByNext: () => {
        npc.playAnimation(`Annoyed_HeadShake`, true, 2.6)
      },
    },
    {
      text: `And to be honest, I don't really care much for all of this. My neighbors started organizing this event, calling crowds of people in to visit.`,
      triggeredByNext: () => {
        npc.playAnimation(`Dismissing`, true, 3.3)
      },
    },
    {
      text: `I don't like it one bit. They're weird, so oddly friendly with everyone... it's creepy, that's what it is.`,
      triggeredByNext: () => {
        npc.playAnimation(`Sarcastic`, true, 2.37)
      },
    },
    {
      text: `I don't know you, you don't know me. So what the hell are you doing banging on my door asking me for things.`,
      triggeredByNext: () => {
        npc.playAnimation(`Angry`, true, 2.23)

        let dummyEnt = new Entity()
        dummyEnt.addComponent(
          new utils.Delay(1000, () => {
            doorHouse.close()
          })
        )
        engine.addEntity(dummyEnt)
      },
    },
    {
      text: `Quit wasting our time.`,

      isEndOfDialog: true,
    },
  ]
}

// Castle guy
export function castleGuyDialog(npc: NPC, doorHouse: TTHouse) {
  return [
    {
      text: `Hey there. So you're trick or treating, are you?`,
      triggeredByNext: () => {
        npc.playAnimation(`Happy Hand Gesture`, true, 2.97)
      },
    },
    {
      text: `Are you even aware of the true origins of all this? The celtic pagan ritual of Samhaim, also known as "all hallows eve"?`,
      triggeredByNext: () => {
        npc.playAnimation(`Angry`, true, 2.23)
      },
    },
    {
      text: `The blurring of the lines between the world of the living and the dead as otherwordly spirits seep into our world, the prophecies and the sacrificial rituals and all that must happen as we enter the start of a cold and dark winter?`,
      triggeredByNext: () => {
        npc.playAnimation(`Cocky`, true, 2.93)
      },
    },
    {
      text: `Or are you just here to stuff your face with candy?`,
      triggeredByNext: () => {
        npc.playAnimation(`Lengthy`, true, 1.77)
      },
    },
    {
      text: `Well... fine. Each to his own. Take this.`,
      triggeredByNext: () => {
        doorHouse.close()
        // give wearable
        let r = new Reward(npc, 'house3', {
          position: new Vector3(0, 1.5, 2.5),
        })
      },
      isEndOfDialog: true,
    },
  ]
}

// Locked house
export const lockedHouse: Dialog[] = [
  {
    text: `Go away, busy here!`,
    isEndOfDialog: true,
  },
  {
    text: `Not a good time, get out!`,
    isEndOfDialog: true,
  },
  {
    text: `I hate interruptions, you're not welcome!`,
    isEndOfDialog: true,
  },
]

// Phone ringing
export const phoneVoice: Dialog[] = [
  {
    text: `Listen up, I want to keep this short because there could be people listening in.`,
  },
  {
    text: `I have some information that could be useful to figure out what happened here, and WHO did this.`,
  },
  {
    text: `Meet me at Genesis Plaza, near the 0,0 coordinates, and I'll tell you what I know.`,
    triggeredByNext: () => {
      quest.checkBox(1)
      quest.showCheckBox(2)
      updateProgression('phone')
    },

    isEndOfDialog: true,
  },
]

/////////////////// DAY 2

/////// Main ghost

// Start of mission

export function missionBrief(ghostCounter: ui.UICounter, ghostUIBck: ui.LargeIcon, ghostsArray: Skeleton[]) {
  return [
    {
      text: `Hey there!`,
    },
    {
      text: `Overheard you yesterday, I think ** gah **`,
    },
    {
      text: `I might be able help, maybe`,
    },
    {
      text: `can't concentrate... someone made a mess here, undug some graves`,
    },
    {
      text: `Could you... could you please help us out?`,
    },
    {
      text: `All these loose ghosts, they need to find their resting place. Please guide them back`,
    },
    {
      text: `Then we can have a proper talk`,
      triggeredByNext: () => {
        quest.checkBox(1)
        quest.showCheckBox(2)
        quest.showCheckBox(3)
        //updateProgression('ghostIntro')
        ghostUIBck.image.visible = true
        ghostCounter.uiText.visible = true
        for (let ghost of ghostsArray) {
          ghost.getComponent(OnPointerDown).showFeedback = true
        }
      },
      isEndOfDialog: true,
    },
  ]
}


// When all ghosts are returned
export const missionEnd: Dialog[] = [
  {
    text: `Thank you! Things are so much calmer now.`,
  },
  {
    text: `Ok, so what I wanted to tell you before..`,
  },
  {
    text: `There were strange things going on last night. Someone was trying to bury something, and dug up a lot of graves looking for a spot.`,
  },
  {
    text: `Whoever that was, we chased him out. He left something inside that old shack in the middle of the graveyard.`,
  },
  {
    text: `Take this key for the shack and take a look.`,
    triggeredByNext: () => {
      getKey()
    },
  },
  {
    text: `Hold on to what you find there, I have a feeling that you'll be needing soon.`,
    isEndOfDialog: true,
  },
]

// Thanks
export let thanks: Dialog[] = [
  {
    text: `So much better now, thanks for your help!`,
    isEndOfDialog: true,
  },
]

////// Other Ghosts
export const ghost1Talk: Dialog[] = [
  {
    text: `Ooooh where are my sons!`,
    isEndOfDialog: true,
    isFixedScreen: true,
    portrait: {
      path: 'images/portraits/ghost-mother.png',
      height: 128 + 64,
      width: 128 + 64,
    },
  },
  {
    text: `Kids, mommy is home!`,
    isEndOfDialog: true,
    isFixedScreen: true,
    portrait: {
      path: 'images/portraits/ghost-mother.png',
      height: 128 + 64,
      width: 128 + 64,
    },
  },
  {
    text: `My kids ain't here!`,
    isEndOfDialog: true,
    isFixedScreen: true,
    portrait: {
      path: 'images/portraits/ghost-mother.png',
      height: 128 + 64,
      width: 128 + 64,
    },
  },
]

export const ghost2Talk: Dialog[] = [
  {
    text: `Good heavens! Have gentlemen stopped wearing their ties? Scandalous`,
    isEndOfDialog: true,
    isFixedScreen: true,
    portrait: {
      path: 'images/portraits/ghost-oldtimer.png',
      height: 128 + 64,
      width: 128 + 64,
    },
  },
  {
    text: `I had enough of this topsy-turvy world, not for me.`,
    isEndOfDialog: true,
    isFixedScreen: true,
    portrait: {
      path: 'images/portraits/ghost-oldtimer.png',
      height: 128 + 64,
      width: 128 + 64,
    },
  },
  {
    text: `I refuse to enter that tastelessly improvised shack!`,
    isEndOfDialog: true,
    isFixedScreen: true,
    portrait: {
      path: 'images/portraits/ghost-oldtimer.png',
      height: 128 + 64,
      width: 128 + 64,
    },
  },
]

export const ghost3Talk: Dialog[] = [
  {
    text: `Flying is totally groovy man, I'm not even high.`,
    isEndOfDialog: true,
    isFixedScreen: true,
    portrait: {
      path: 'images/portraits/ghost-hippie.png',
      height: 128 + 64,
      width: 128 + 64,
    },
  },
  {
    text: `I'm off to chill man, keep it fresh.`,
    isEndOfDialog: true,
    isFixedScreen: true,
    portrait: {
      path: 'images/portraits/ghost-hippie.png',
      height: 128 + 64,
      width: 128 + 64,
    },
  },
  {
    text: `No bro, bad mojo in there.`,
    isEndOfDialog: true,
    isFixedScreen: true,
    portrait: {
      path: 'images/portraits/ghost-hippie.png',
      height: 128 + 64,
      width: 128 + 64,
    },
  },
]

export const ghost4Talk: Dialog[] = [
  {
    text: `Je suis tres confus, je ne suis pas mort.`,
    isEndOfDialog: true,
    isFixedScreen: true,
    portrait: {
      path: 'images/portraits/ghost-french.png',
      height: 128 + 64,
      width: 128 + 64,
    },
  },
  {
    text: `Mon dieu, mon corps c'est ici`,
    isEndOfDialog: true,
    isFixedScreen: true,
    portrait: {
      path: 'images/portraits/ghost-french.png',
      height: 128 + 64,
      width: 128 + 64,
    },
  },
  {
    text: `Ce n'est pas moi!`,
    isEndOfDialog: true,
    isFixedScreen: true,
    portrait: {
      path: 'images/portraits/ghost-french.png',
      height: 128 + 64,
      width: 128 + 64,
    },
  },
]

export const ghost5Talk: Dialog[] = [
  {
    text: `I must meet my lover again, I can't bare a world without him.`,
    isEndOfDialog: true,
    isFixedScreen: true,
    portrait: {
      path: 'images/portraits/ghost-lover.png',
      height: 128 + 64,
      width: 128 + 64,
    },
  },
  {
    text: `Reunited at last!`,
    isEndOfDialog: true,
    isFixedScreen: true,
    portrait: {
      path: 'images/portraits/ghost-lover.png',
      height: 128 + 64,
      width: 128 + 64,
    },
  },
  {
    text: `He's not here!`,
    isEndOfDialog: true,
    isFixedScreen: true,
    portrait: {
      path: 'images/portraits/ghost-lover.png',
      height: 128 + 64,
      width: 128 + 64,
    },
  },
]

export const ghost6Talk: Dialog[] = [
  {
    text: `This notion of being a disembodied spirit is perplexing.`,
    isEndOfDialog: true,
    isFixedScreen: true,
    portrait: {
      path: 'images/portraits/ghost-phylo.png',
      height: 128 + 64,
      width: 128 + 64,
    },
  },
  {
    text: `Time to go write about it!`,
    isEndOfDialog: true,
    isFixedScreen: true,
    portrait: {
      path: 'images/portraits/ghost-phylo.png',
      height: 128 + 64,
      width: 128 + 64,
    },
  },
  {
    text: `The physical vessel that I used to inhabit is not here.`,
    isEndOfDialog: true,
    isFixedScreen: true,
    portrait: {
      path: 'images/portraits/ghost-phylo.png',
      height: 128 + 64,
      width: 128 + 64,
    },
  },
]


export class Grave extends Entity {
  onActivate: () => void
  openAnim: AnimationState
  closeAnim: AnimationState
  resident: Skeleton
  isOpen: boolean
  bugs: Entity
  constructor(
    position: TranformConstructorArgs,
    model: GLTFShape,
    resident?: Skeleton | null,
    openAnim?: string,
    closeAnim?: string,
    onActivate?: () => void
  ) {
    super()
    this.addComponent(model)
    this.addComponent(new Transform(position))
    engine.addEntity(this)

    if (onActivate) {
      this.onActivate = onActivate
    }
    this.addComponent(new Animator())
    if (openAnim) {
      this.openAnim = new AnimationState(openAnim, { looping: false })
      this.getComponent(Animator).addClip(this.openAnim)
    }
    if (closeAnim) {
      this.closeAnim = new AnimationState(closeAnim, { looping: false })
      this.getComponent(Animator).addClip(this.closeAnim)
    }

    if (resident) {
      this.resident = resident
      this.bugs = new Entity()
      this.bugs.addComponent(
        new Transform({ position: new Vector3(-0.3, 0, 0.5) })
      )
      this.bugs.addComponent(new GLTFShape(stuff.light_bugs))
      this.bugs.setParent(this)
      this.bugs.getComponent(GLTFShape).visible = false

      this.addComponent(new AudioSource(new AudioClip('sounds/open-grave.mp3')))
      this.getComponent(AudioSource).volume = 2
      this.getComponent(AudioSource).loop = true
      this.getComponent(AudioSource).playing = true

      this.addComponent(
        new OnPointerDown(
          (e) => {
            if (
              this.resident &&
              followingSkeletons &&
              followingSkeletons[0] == this.resident
            ) {
              this.resident.goHome(this)
            } else if (this.resident && followingSkeletons) {
              log('Not my home')
              followingSkeletons[0].refusePlace()
            }
          },
          {
            hoverText: 'Return Ghost',
          }
        )
      )
    }
  }
  activate() {
    if (this.onActivate) {
      this.onActivate()
    }
    this.removeComponent(OnPointerDown)
    this.getComponent(AudioSource).playing = false
    this.removeComponent(AudioSource)
  }
  open() {
    this.closeAnim.stop()
    this.openAnim.stop()
    this.openAnim.play()
    this.isOpen = true
    this.bugs.getComponent(GLTFShape).visible = true
  }
  close() {
    this.openAnim.stop()
    this.closeAnim.stop()
    this.closeAnim.play()
    this.isOpen = false
    this.bugs.getComponent(GLTFShape).visible = false
  }
}




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
    npc_model_paths.skeletonQuestGiver,
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
    new GLTFShape(graveyard_models.motherGrave),
    ghost1,
    'Trigger',
    'Trigger_Close'
  )

  let crypt2 = new Grave(
    {
      position: new Vector3(81 + 8, 0.2, 15),
      rotation: Quaternion.Euler(0, 90, 0), scale: new Vector3(1.35, 1.35, 1.35),
    },
    new GLTFShape(graveyard_models.machete),
    null,
    'Machete_Trigger',
    'Trigger_Close'
  )

  let crypt3 = new Grave(
    {
      position: new Vector3(57 + 8, 0.1, 19),
      rotation: Quaternion.Euler(0, 180, 0),
    },
    new GLTFShape(graveyard_models.oldtimerGrave),
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
    new GLTFShape(graveyard_models.catCrypt),
    null,
    'Trigger',
    'Trigger_Close'
  )

  let crypt5 = new Grave(
    {
      position: new Vector3(21 + 8, 0.10, 52),
      rotation: Quaternion.Euler(0, 90, 0), scale: new Vector3(1.35, 1.35, 1.35),
    },

    new GLTFShape(graveyard_models.frenchGrave),
    ghost4,
    'Trigger',
    'Trigger_Close'
  )

  let crypt6 = new Grave(
    {
      position: new Vector3(48 + 8, 0.15, 54),
    },
    new GLTFShape(graveyard_models.loveGrave),
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
    new GLTFShape(graveyard_models.zombieHand),
    null,
    'ZombieHand_Trigger',
    'Trigger_Close'
  )

  let crypt8 = new Grave(
    {
      position: new Vector3(68 + 8, 0.15, 66),
      rotation: Quaternion.Euler(0, -45, 0),
    },
    new GLTFShape(graveyard_models.hippieGrave),
    ghost3,
    'Trigger',
    'Trigger_Close_Armature'
  )



  let crypt10 = new Grave(
    {
      position: new Vector3(92 + 8, 0, 69),
      rotation: Quaternion.Euler(0, 90, 0),
      scale: new Vector3(0.7, 0.7, 0.7)
    },
    new GLTFShape(graveyard_models.zombieHand),
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
    new GLTFShape(graveyard_models.philoGrave),
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
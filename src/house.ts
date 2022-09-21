import {NPC} from "@dcl/npc-scene-utils";
import * as ui from "@dcl/ui-scene-utils";
import {COLOR_GREEN} from "./theme/color";
import * as utils from "@dcl/ecs-scene-utils";
import {updateProgression} from './halloweenQuests/progression'
import {quest} from "./halloweenQuests/quest";

export let doorCounter = 0

export class TTHouse extends Entity {
  onActivate: () => void
  openAnim: AnimationState
  closeAnim: AnimationState
  openClip = new AudioClip('sounds/open.mp3')
  closeClip = new AudioClip('sounds/close.mp3')
  knockClip = new AudioClip('sounds/knock.mp3')
  locked: boolean = true
  npc: NPC
  firstTime: boolean = true
  isOpen: boolean = false
  inCooldown: boolean = false
  coolDownDuration: number = 10000
  coolDownTimer: Entity

  constructor(
    position: TranformConstructorArgs,
    model: GLTFShape,
    openAnim?: string,
    closeAnim?: string,
    onActivate?: () => void,
    npc?: NPC,
    locked?: boolean
  ) {
    super()
    this.addComponent(model)
    this.addComponent(new Transform(position))
    engine.addEntity(this)
    if (onActivate) {
      this.onActivate = onActivate
    }

    this.coolDownTimer = new Entity()
    this.coolDownTimer.setParent(this)

    this.addComponent(new Animator())

    if (openAnim) {
      this.openAnim = new AnimationState(openAnim, {looping: false})
      this.getComponent(Animator).addClip(this.openAnim)
      this.openAnim.stop()
    }

    if (closeAnim) {
      this.closeAnim = new AnimationState(closeAnim, {looping: false})
      this.getComponent(Animator).addClip(this.closeAnim)
      //this.closeAnim.play()
    }

    if (locked) {
      this.locked = locked
    }

    if (npc) {
      this.npc = npc
      npc.setParent(this)
    }

    this.addComponent(
      new OnPointerDown(
        (e) => {
          if (this.inCooldown) return
          const source = new AudioSource(this.knockClip)
          this.addComponentOrReplace(source)
          source.playing = true
          ui.displayAnnouncement(
            'Nobody Home',
            1,
            Color4.FromHexString(COLOR_GREEN)
          )
        },
        {hoverText: 'Knock'}
      )
    )
  }

  unlock() {
    this.locked = false

    this.addComponentOrReplace(
      new OnPointerDown(
        (e) => {
          if (this.inCooldown) return
          this.activate()
        },
        {hoverText: 'Knock'}
      )
    )
  }

  activate() {
    if (this.isOpen || this.inCooldown) {
      return
    }
    this.closeAnim.stop()
    this.openAnim.stop()
    this.openAnim.play()

    const source = new AudioSource(this.openClip)
    this.addComponentOrReplace(source)
    source.playing = true

    this.isOpen = true
    this.addComponentOrReplace(
      new utils.Delay(500, () => {
        if (this.onActivate) {
          this.onActivate()
        }
      })
    )
    if (this.firstTime) {
      this.firstTime = false
      doorCounter += 1
      log('doors opened ', doorCounter)
      if (doorCounter >= 6) {
        quest.checkBox(0)
        updateProgression('allHouses')
      }
    }
  }

  close() {
    if (!this.isOpen) {
      return
    }
    log('closing door')
    this.openAnim.stop()
    this.closeAnim.stop()
    this.closeAnim.play()
    this.isOpen = false
    this.inCooldown = true

    const source = new AudioSource(this.closeClip)
    this.addComponentOrReplace(source)
    source.playing = true

    this.coolDownTimer.addComponentOrReplace(
      new utils.Delay(this.coolDownDuration, () => {
        this.inCooldown = false
      })
    )
  }
}

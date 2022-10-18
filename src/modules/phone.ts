import { haunted_model_paths } from "src/resources/model_paths"
import * as NPCUtils from '@dcl/npc-scene-utils'
import { COLOR_GREEN } from "src/resources/theme/color"
import { day1GirlDialog } from "./grave"
import { halloweenTheme } from "./halloweenQuests/quest/questCheckBox"

export class Phone extends Entity {
  onPickup: () => void
  anim: AnimationState

  ringing: boolean = true
  ringSound: AudioClip = new AudioClip(`sounds/day1/creepy_girl.mp3`)
  picupSound: AudioClip
  constructor(position: TranformConstructorArgs, onPickup: () => void) {
    super()
    this.addComponent(new GLTFShape(haunted_model_paths.phone))
    this.addComponent(new Transform(position))
    this.addComponent(new Animator())
    engine.addEntity(this)

    this.onPickup = onPickup

    this.addComponent(
      new OnPointerDown(
        (e) => {
          this.activate()
        },
        { hoverText: 'Pick up' }
      )
    )
    this.ringSound.loop = true
    this.addComponent(new AudioSource(this.ringSound))

    // play ringing sound

    this.anim = new AnimationState('Ring', { looping: true })
    this.getComponent(Animator).addClip(this.anim)
    this.anim.playing = true
  }
  ring() {
    this.getComponent(AudioSource).loop = true
    this.getComponent(AudioSource).playing = true
    this.anim.playing = true
  }
  activate() {

    // stop anim
    // stop sound
    // play pickup sound

    
   
    
    let phoneDialog = new NPCUtils.DialogWindow(
      {path: 'images/portraits/phoneCharacter.png'},
      true,
      '',
      halloweenTheme
    ) // + path to portrait
    phoneDialog.openDialogWindow(day1GirlDialog(this.end_of_dialog), 0)

    phoneDialog.leftClickIcon.positionX = 340 - 60
    phoneDialog.text.color = Color4.FromHexString(COLOR_GREEN)
    
  }

  private end_of_dialog(){
    this.anim.playing = false
    this.getComponent(AudioSource).playing = false
    this.ringing = false
    this.onPickup()
  }
}

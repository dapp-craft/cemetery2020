import { haunted_model_paths } from 'src/resources/model_paths'
import * as NPCUtils from '@dcl/npc-scene-utils'
import { COLOR_GREEN } from 'src/resources/theme/color'
import { day1GirlDialog } from './grave'
import { halloweenTheme } from '../halloweenQuests/quest/questCheckBox'
import * as utils from '@dcl/ecs-scene-utils'

export class GirlTalkEvent extends Entity {
  onPickup: () => void

  private ringing: boolean = true
  private ringSound: AudioClip = new AudioClip(`sounds/day1/creepy_girl.mp3`)
  private picupSound: AudioClip

  private ghost_girl: Entity

  constructor(position: TranformConstructorArgs, onPickup: () => void) {
    super()

    this.addComponent(new Transform(position))
    this.addComponent(new Animator())
    engine.addEntity(this)

    this.onPickup = onPickup


    this.ringSound.loop = true
    this.addComponent(new AudioSource(this.ringSound))

    // play ringing sound


    const girl = new Entity()
    girl.addComponentOrReplace(new GLTFShape(haunted_model_paths.girl))
    girl.addComponentOrReplace(new Transform(
      {
        position: new Vector3(7.9517, 0.08, 40.137)
      }
    ))
    girl.addComponentOrReplace(new Animator())
    girl.getComponent(Animator).addClip(new AnimationState('walk', { looping: false }))
    girl.getComponent(Animator).addClip(new AnimationState('stand', { looping: true }))
    engine.addEntity(girl)
    this.ghost_girl = girl
  }


  
  public ring() {


    this.ghost_girl.getComponent(Animator).getClip('walk').play(true)
    utils.setTimeout(16000, () => {
      
      this.getComponent(AudioSource).loop = true
      this.getComponent(AudioSource).playing = true

      let phoneDialog = new NPCUtils.DialogWindow(
        { path: 'images/portraits/phoneCharacter.png' },
        true,
        '',
        halloweenTheme
      ) // + path to portrait
      phoneDialog.openDialogWindow(day1GirlDialog(this.end_of_dialog), 0)
      phoneDialog.leftClickIcon.positionX = 340 - 60
      phoneDialog.text.color = Color4.FromHexString(COLOR_GREEN)

      utils.setTimeout(8000, () => {
        this.ghost_girl.getComponent(Animator).getClip('stand').play(true)
      })
    })
  }


  private end_of_dialog() {

    this.getComponent(AudioSource).playing = false
    this.ringing = false
    this.onPickup()
  }
}

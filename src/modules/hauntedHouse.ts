import {nextDay, updateProgression} from './halloweenQuests/progression'
import {quest} from './halloweenQuests/quest'
import * as ui from '@dcl/ui-scene-utils'
import {Reward} from './halloweenQuests/loot'
import {Grave} from './grave'
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
    })
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

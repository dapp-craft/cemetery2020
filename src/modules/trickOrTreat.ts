import {
  castleGuyDialog,
  catLoverDialog,
  farmerDialog,
  ghostControlDialog,
  lockedHouse,
  mayorGhostDialog,
  phoneVoice,
} from './grave'
import {COLOR_GREEN} from '../resources/theme/color'
import * as NPCUtils from '@dcl/npc-scene-utils'
import {NPC} from '@dcl/npc-scene-utils'
import {quest} from "./halloweenQuests/quest/questTasks";
import {HalloweenState} from "./halloweenQuests/quest/types";
import {halloweenTheme} from "./halloweenQuests/quest/questCheckBox";
import {TTHouse} from './house'
import * as ui from '@dcl/ui-scene-utils'
import * as utils from '@dcl/ecs-scene-utils'
import {Phone} from './phone'
import {Reward} from './halloweenQuests/loot'
import { npc_model_paths, stuff } from 'src/resources/model_paths'


export let catLover: NPC
export let farmer: NPC
export let ghostControlGuy: NPC
export let templeGirl: NPC
export let mayorGhost: NPC

export let doorHouse1: TTHouse
export let doorHouse2: TTHouse
export let doorHouse3: TTHouse
export let doorHouse4: TTHouse
export let doorHouse5: TTHouse
export let doorHouse6: TTHouse
export let doorHouse7: TTHouse
export let doorHouse8: TTHouse
export let doorHouse9: TTHouse
export let doorHouse10: TTHouse


export let bigReveal: boolean = false

export let funMusic1: Entity
export let funMusic2: Entity
export let dramaticMusic: Entity


export function addClosedDoors() {
  doorHouse1 = new TTHouse(
    {
      position: new Vector3(112.8, 0.1, 72.45),
      rotation: Quaternion.Euler(0, 180, 0),
    },
    new GLTFShape(stuff.door_house),
    'Open',
    'Close'
  )

  doorHouse2 = new TTHouse(
    {
      position: new Vector3(112.3, 0.15, 56.53),
      rotation: Quaternion.Euler(0, 180, 0),
    },
    new GLTFShape(stuff.door_house),
    'Open',
    'Close'
  )

  doorHouse3 = new TTHouse(
    {
      position: new Vector3(112.82, 0.05, 40.83),
      rotation: Quaternion.Euler(0, 180, 0),
    },
    new GLTFShape(stuff.door_house),
    'Open',
    'Close'
  )

  doorHouse4 = new TTHouse(
    {
      position: new Vector3(113, 0.05, 25.13),
      rotation: Quaternion.Euler(0, 180, 0),
    },
    new GLTFShape(stuff.door_rectangle),
    'Open',
    'Close'
  )

  doorHouse5 = new TTHouse(
    {
      position: new Vector3(113, 0.05, 9.3),
      rotation: Quaternion.Euler(0, 180, 0),
    },
    new GLTFShape(stuff.door_rectangle),
    'Open',
    'Close'
  )

  doorHouse6 = new TTHouse(
    {
      position: new Vector3(14.9, 0, 7.4),
      rotation: Quaternion.Euler(0, 0, 0),
    },
    new GLTFShape(stuff.door_rectangle),
    'Open',
    'Close'
  )

  doorHouse7 = new TTHouse(
    {
      position: new Vector3(14.9, 0, 23.25),
      rotation: Quaternion.Euler(0, 0, 0),
    },
    new GLTFShape(stuff.door_rectangle),
    'Open',
    'Close'
  )

  doorHouse8 = new TTHouse(
    {
      position: new Vector3(15.18, 0.15, 39.2),
      rotation: Quaternion.Euler(0, 0, 0),
    },
    new GLTFShape(stuff.door_house),
    'Open',
    'Close',
    null,
    null,
    false
  )

  doorHouse9 = new TTHouse(
    {
      position: new Vector3(15.18, 0.15, 54.77),
      rotation: Quaternion.Euler(0, 0, 0),
    },
    new GLTFShape(stuff.door_house),
    'Open',
    'Close'
  )

  doorHouse10 = new TTHouse(
    {
      position: new Vector3(15.18, 0.15, 70.73),
      rotation: Quaternion.Euler(0, 0, 0),
    },
    new GLTFShape(stuff.door_house),
    'Open',
    'Close'
  )
}

export function addHouses(progression: HalloweenState) {
  if (!progression.data.phone) {
    funMusic1 = new Entity()
    funMusic1.addComponent(
      new AudioSource(new AudioClip('sounds/SpookyHouse1.mp3'))
    )
    funMusic1.addComponent(
      new Transform({
        position: new Vector3(15, 0, 25),
      })
    )

    funMusic1.getComponent(AudioSource).volume = 0.5
    funMusic1.getComponent(AudioSource).playing = true
    funMusic1.getComponent(AudioSource).loop = true
    engine.addEntity(funMusic1)

    funMusic2 = new Entity()
    funMusic2.addComponent(
      new AudioSource(new AudioClip('sounds/SpookyHouse5.mp3'))
    )
    funMusic2.addComponent(
      new Transform({
        position: new Vector3(110, 0, 10),
      })
    )

    funMusic2.getComponent(AudioSource).volume = 0.5
    funMusic2.getComponent(AudioSource).playing = true
    funMusic2.getComponent(AudioSource).loop = true
    engine.addEntity(funMusic2)
  }

  if (!progression.data.NPCIntroDay2) {
    // Add all NPCs
    catLover = new NPC(
      {
        position: new Vector3(-1, 0, 0.8),
        rotation: Quaternion.Euler(0, 90, 0),
      },
      npc_model_paths.catLover,
      () => {
        // check for cat wearables
        catLover.talk(catLoverDialog(catLover, doorHouse1), 0)
        catLover.playAnimation(`Cocky`, true, 1.83)
      },
      {
        portrait: {path: 'images/portraits/catguy.png', height: 128, width: 128},
        reactDistance: 12,
        idleAnim: `Weight_Shift`,
        faceUser: false,
        onlyExternalTrigger: true,
        onWalkAway: () => {
          if (catLover.dialog.isDialogOpen) {
            catLover.dialog.closeDialogWindow()
          }
          if (doorHouse1.isOpen) {
            doorHouse1.close()
          }
        }
      },
    )


    catLover.removeComponent(OnPointerDown)
    catLover.dialog = new NPCUtils.DialogWindow(
      {
        path: 'images/portraits/catguy.png',
      },
      true,
      '',
      halloweenTheme
    )
    catLover.dialog.leftClickIcon.positionX = 340 - 60
    catLover.dialog.text.color = Color4.FromHexString(COLOR_GREEN)

    // farmer
    farmer = new NPC(
      {
        position: new Vector3(-1, 0, 0.8),
        rotation: Quaternion.Euler(0, 90, 0),
      },
      npc_model_paths.farmer,
      () => {
        farmer.talk(farmerDialog(farmer, doorHouse7), 0)
        farmer.playAnimation(`Head_Yes`, true, 2.63)
      },
      {
        portrait: {path: 'images/portraits/farmer.png', height: 128, width: 128},
        reactDistance: 12,
        idleAnim: `Weight_Shift`,
        faceUser: false,
        onlyExternalTrigger: true,

        onWalkAway: () => {
          doorHouse7.close()
        }
      }
    )
    farmer.removeComponent(OnPointerDown)
    farmer.dialog = new NPCUtils.DialogWindow(
      {path: 'images/portraits/farmer.png'},
      true,
      '',
      halloweenTheme
    )
    farmer.dialog.leftClickIcon.positionX = 340 - 60
    farmer.dialog.text.color = Color4.FromHexString(COLOR_GREEN)

    // ghost control guy
    ghostControlGuy = new NPC(
      {
        position: new Vector3(-1, 0.05, 0.7),
        rotation: Quaternion.Euler(0, 90, 0),
      },
      npc_model_paths.ghostblaster,
      () => {
        ghostControlGuy.talk(ghostControlDialog(ghostControlGuy, doorHouse6), 0)
        ghostControlGuy.playAnimation(`Relieved`, true, 3.03)
      },

      {
        portrait: {path: 'images/portraits/ghostblaster.png'},
        reactDistance: 12,
        idleAnim: `Idle`,
        faceUser: false,
        onlyExternalTrigger: true,

        onWalkAway: () => {
          if (ghostControlGuy.dialog.isDialogOpen) {
            ghostControlGuy.dialog.closeDialogWindow()
          }
          if (doorHouse6.isOpen) {
            doorHouse6.close()
          }
        }
      }
    )
    ghostControlGuy.removeComponent(OnPointerDown)
    ghostControlGuy.dialog = new NPCUtils.DialogWindow(
      {path: 'images/portraits/ghostblaster.png'},
      true,
      '',
      halloweenTheme
    )
    ghostControlGuy.dialog.leftClickIcon.positionX = 340 - 60
    ghostControlGuy.dialog.text.color = Color4.FromHexString(COLOR_GREEN)

    // ghost trick or treat
    mayorGhost = new NPC(
      {
        position: new Vector3(-1, 0, 0.75),
        rotation: Quaternion.Euler(0, 90, 0),
      },
      npc_model_paths.ghost1,
      () => {
        mayorGhost.talk(mayorGhostDialog(mayorGhost, doorHouse4), 0)
        mayorGhost.playAnimation(`idle1`, true, 9.8)
      },

      {
        portrait: {path: 'images/portraits/main-ghost.png'},
        reactDistance: 12,
        idleAnim: `Idle`,
        faceUser: false,
        onlyExternalTrigger: true,

        onWalkAway: () => {
          if (mayorGhost.dialog.isDialogOpen) {
            mayorGhost.dialog.closeDialogWindow()
          }
          if (doorHouse4.isOpen) {
            doorHouse4.close()
          }
        }
      }
    )
    mayorGhost.removeComponent(OnPointerDown)
    mayorGhost.dialog = new NPCUtils.DialogWindow(
      {path: 'images/portraits/main-ghost.png'},
      true,
      '',
      halloweenTheme
    )
    mayorGhost.dialog.leftClickIcon.positionX = 340 - 60
    mayorGhost.dialog.text.color = Color4.FromHexString(COLOR_GREEN)

    // castle guy
    templeGirl = new NPC(
      {
        position: new Vector3(-1, 0, 0.85),
        rotation: Quaternion.Euler(0, 90, 0),
      },
      npc_model_paths.girl,
      () => {
        templeGirl.talk(castleGuyDialog(templeGirl, doorHouse10), 0)
        templeGirl.playAnimation(`Acknowledging`, true, 1.97)
      },
      {
        portrait: {path: 'images/portraits/girl.png'},
        reactDistance: 12,
        idleAnim: `Weight_Shift`,
        faceUser: false,
        onlyExternalTrigger: true,

        onWalkAway: () => {
          if (templeGirl.dialog.isDialogOpen) {
            templeGirl.dialog.closeDialogWindow()
          }
          if (doorHouse10.isOpen) {
            doorHouse10.close()
          }
        }
      }
    )
    templeGirl.removeComponent(OnPointerDown)
    templeGirl.dialog = new NPCUtils.DialogWindow(
      {path: 'images/portraits/girl.png'},
      true,
      '',
      halloweenTheme
    )
    templeGirl.dialog.leftClickIcon.positionX = 340 - 60
    templeGirl.dialog.text.color = Color4.FromHexString(COLOR_GREEN)
  }

  /// Doors to open

  if (!progression.data.NPCIntroDay2) {
    // day 1

    doorHouse1.onActivate = () => {
      doorHouse1.npc.onActivate()
    }
    doorHouse1.npc = catLover
    catLover.setParent(doorHouse1)
    doorHouse1.unlock()

    doorHouse3.onActivate = () => {
      // TODO sound of locked door
      let lockDialog = new NPCUtils.DialogWindow(
        {
          path: 'images/portraits/closedHouseCharacter.png',
        },
        true,
        '',
        halloweenTheme
      )
      lockDialog.leftClickIcon.positionX = 340 - 60
      lockDialog.text.color = Color4.FromHexString(COLOR_GREEN)

      // path to portrait
      let randomIndex = Math.floor(Math.random() * 3)
      lockDialog.openDialogWindow(lockedHouse, randomIndex)

      log('door locked')

      let dummyEnt = new Entity()
      dummyEnt.addComponent(
        new utils.Delay(2000, () => {
          lockDialog.closeDialogWindow()
        })
      )
      engine.addEntity(dummyEnt)

      return // to stop door from opening
    }

    doorHouse3.addComponentOrReplace(
      new OnPointerDown((e) => {
        const source = new AudioSource(doorHouse3.knockClip)
        doorHouse3.addComponentOrReplace(source)
        source.playing = true
        doorHouse3.onActivate()
      })
    )

    doorHouse4.unlock()
    doorHouse4.npc = mayorGhost
    mayorGhost.setParent(doorHouse4)
    doorHouse4.onActivate = () => {
      doorHouse4.npc.onActivate()
    }

    doorHouse6.unlock()
    doorHouse6.npc = ghostControlGuy
    ghostControlGuy.setParent(doorHouse6)
    doorHouse6.onActivate = () => {
      doorHouse6.npc.onActivate()
    }

    doorHouse7.unlock()
    doorHouse7.npc = farmer
    farmer.setParent(doorHouse7)
    doorHouse7.onActivate = () => {
      doorHouse7.npc.onActivate()
    }

    doorHouse8.unlock()

    doorHouse8.onActivate = () => {
      if (bigReveal) return
      bigReveal = true

      funMusic1.getComponent(AudioSource).playing = false
      funMusic2.getComponent(AudioSource).playing = false

      dramaticMusic = new Entity()
      dramaticMusic.addComponent(
        new AudioSource(new AudioClip('sounds/SpookyHouse10.mp3'))
      )
      dramaticMusic.addComponent(
        new Transform({
          position: new Vector3(13.7, 0.15, 39.14),
        })
      )
      engine.addEntity(dramaticMusic)
      dramaticMusic.getComponent(AudioSource).loop = false
      dramaticMusic.getComponent(AudioSource).volume = 0.5
      dramaticMusic.getComponent(AudioSource).playing = true

      let dummyEnt = new Entity()
      dummyEnt.addComponent(
        new utils.Delay(2000, () => {
          ui.displayAnnouncement(
            'Metaverse Murder Mystery',
            10,
            Color4.Red(),
            70
          )
          phone.ring()
        })
      )
      engine.addEntity(dummyEnt)

      quest.showCheckBox(1)
      //updateProgression('foundBody')

      let phone = new Phone(
        {
          position: new Vector3(10, 1.2, 36),
          rotation: Quaternion.Euler(0, 0, 0),
        },
        () => {
          let phoneDialog = new NPCUtils.DialogWindow(
            {path: 'images/portraits/phoneCharacter.png'},
            true,
            '',
            halloweenTheme
          ) // + path to portrait
          phoneDialog.openDialogWindow(phoneVoice, 0)

          phoneDialog.leftClickIcon.positionX = 340 - 60
          phoneDialog.text.color = Color4.FromHexString(COLOR_GREEN)
        }
      )

      let easterEgg = new Reward(
        phone,
        'egg2',
        {position: new Vector3(14 - 10, 4.2, 40 - 36)},
        true
      )
    }

    doorHouse10.unlock()
    doorHouse10.npc = templeGirl
    templeGirl.setParent(doorHouse10)
    doorHouse10.onActivate = () => {
      doorHouse10.npc.onActivate()
    }
  } else if (progression.data.w2Found) {
    // day 3 onwards
    doorHouse3.unlock()

    doorHouse3.onActivate = () => {
      let easterEgg3 = new Reward(
        doorHouse3,
        'egg3',
        {position: new Vector3(-8, 1.5, 0)},
        true
      )
    }

    doorHouse8.unlock()
  }
}

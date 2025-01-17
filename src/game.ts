import { addGhostsAndCrypts, addMainGhostNPC } from './modules/grave'
import { addClosedDoors, addHouses } from './modules/trickOrTreat'
import {
  checkProgression,
  nextDay,
  playerRealm,
  progression,
  setRealm,
  updateProgression
} from './halloweenQuests/progression'
import { addStaticStuff } from './modules/staticDecorations'
import { doorHauntedHouse, getKey } from './modules/grave'
import { Reward } from './halloweenQuests/loot'
import { updateQuestUI } from "./halloweenQuests/quest/questTasks";
import { addEasterEgg } from './modules/easterEgg2'


export function setUpScene() {
  // avatar modifier
  const modArea = new Entity()
  modArea.addComponent(
    new AvatarModifierArea({
      area: { box: new Vector3(16 * 8, 4, 16 * 5) },
      modifiers: [AvatarModifiers.DISABLE_PASSPORTS],
    })
  )
  modArea.addComponent(
    new Transform({
      position: new Vector3(16 * 4, 0, 16 * 2.5),
    })
  )
  engine.addEntity(modArea)

  // dummy underground loot for faster loading
  let dummyReward = new Reward(modArea, 'dummy', { position: new Vector3(0, -10, 0), scale: new Vector3(2, 2, 2) }, true)

  doorHauntedHouse()
}
//
// Input.instance.subscribe('BUTTON_DOWN', ActionButton.PRIMARY, false, (e) => {
//   log(
//     `new Vector3(`,
//     Camera.instance.position.x,
//     ',',
//     Camera.instance.position.y,
//     ',',
//     Camera.instance.position.z,
//     `),
// 	rotation: Quaternion.Euler(`,
//     0,
//     ',',
//     Camera.instance.rotation.eulerAngles.y,
//     ',',
//     0,
//     `),
//     },`
//   )
// })

function updateSceneByProgression() {

  addHouses(progression)
  addEasterEgg()
  // conditional elements depending on progression
  if (
    progression.data.w1Found &&
    !progression.data.w2Found &&
    progression.day > 1
  ) {
    // day 2
    addMainGhostNPC(progression)

    if (!progression.data.ghostsDone) {
      addGhostsAndCrypts()
    } else {
      getKey()
    }
  }
}

function updateSceneUI() {
  executeTask(async () => {
    const curr_progression = await checkProgression()
    log('checkProgression', curr_progression)
    if (curr_progression == null) return
    progression.data = curr_progression.data
    progression.day = curr_progression.day

    if (progression.data != null) {
      log('updateQuestUI', progression.day, progression.data)
      updateQuestUI(progression.data, progression.day)
      updateSceneByProgression()


    }
  })
}

onSceneReadyObservable.add(() => {
  log('onSceneReadyObservable')

  addStaticStuff()
  addClosedDoors()
  setUpScene()
  updateSceneUI()
})

onRealmChangedObservable.add((realmChange) => {
  log("PLAYER CHANGED ISLAND TO ", realmChange.room)
  executeTask(async () => {
    if (!playerRealm) {
      await setRealm()
      log('playerRealm', playerRealm)
    }
    playerRealm.room = realmChange.room
    playerRealm.serverName = realmChange.serverName
  })
})

// const input = Input.instance
//
// const stages = [
//   'talkBat',
//   'meetGirl',
//
//   'allHouses',
//   'phone',
//   'pumpkinDone',
//   'w1Found',
//
//   'NPCIntroDay2',
//   // 'ghostsDone',
//   // 'w2Found'
// ]
//
// let stage_index = 0
// input.subscribe('BUTTON_DOWN', ActionButton.ACTION_3, false, (e) => {
//   // log('pointer Down', e)
//   log('updateProgression', stages[stage_index])
//   if (updateProgression(stages[stage_index])) {
//     log('updateProgression success', stages[stage_index])
//     stage_index++
//   }
// })
//
// input.subscribe('BUTTON_DOWN', ActionButton.ACTION_4, false, (e) => {
//   const rewardtest = new Entity()
//
//   rewardtest.addComponent(new Transform({ position: new Vector3(115, 1.05, 45.83) }))
//   engine.addEntity(rewardtest)
//
//   let r = new Reward(
//     rewardtest,
//     'w2',
//     {
//       position: new Vector3(0.2, 0.8, 0.5),
//       scale: new Vector3(2, 2, 2)
//     },
//     false,
//     () => {
//       executeTask(async () => {
//         await updateProgression('w2Found')
//         progression.data['w2Found'] = true
//         await nextDay(3)
//       })
//     }
//   )
// })
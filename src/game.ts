import { addGhostsAndCrypts, addMainGhostNPC } from './modules/grave'
import { addClosedDoors, addHouses } from './modules/trickOrTreat'
import { checkProgression, progression } from './modules/halloweenQuests/progression'
import { addStaticStuff } from './modules/staticDecorations'
import { doorHauntedHouse, getKey } from './modules/grave'
import { Reward } from './modules/halloweenQuests/loot'
import {updateQuestUI} from "./modules/halloweenQuests/quest/questTasks";
import {isEqual} from "./modules/halloweenQuests/utils/isEqual";

addStaticStuff()
addClosedDoors()
setUpScene()

export async function setUpScene() {

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
  let dummyReward = new Reward(modArea, 'dummy', { position: new Vector3(0, -10, 0) }, true)
}

Input.instance.subscribe('BUTTON_DOWN', ActionButton.PRIMARY, false, (e) => {
  log(
    `new Vector3(`,
    Camera.instance.position.x,
    ',',
    Camera.instance.position.y,
    ',',
    Camera.instance.position.z,
    `),
	rotation: Quaternion.Euler(`,
    0,
    ',',
    Camera.instance.rotation.eulerAngles.y,
    ',',
    0,
    `),
    },`
  )
})

//test
 onEnterSceneObservable.add((player) => {
  log('player enter')
  updateQuest()

})

async function updateQuest(){
    const curr_progression = await checkProgression()
    progression.data = curr_progression.data
    progression.day = curr_progression.day

    updateQuestUI(progression.data, progression.day)

  addHouses(progression)

  doorHauntedHouse()

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

// TODO quest UI smart wearable code

const updateProgressInterval = 10

async function updateSceneUI() {
    const curr_progression = await checkProgression()
    log(curr_progression, progression)
    if (curr_progression == null) return
    if (progression.data != null && isEqual(progression.data, curr_progression.data)) return
    progression.data = curr_progression.data
    progression.day = curr_progression.day

    if (progression.data) {
        log('UPDATE QUEST UI', progression.day, progression.data)
        updateQuestUI(progression.data, progression.day)
    }
}

class UpdateSceneUISystem implements ISystem {
    private timer = 0

    constructor() { }

    async update(dt: number) {
        this.timer += dt
        if (this.timer > updateProgressInterval) {
            this.timer = 0
            await updateSceneUI()

        }
    }
}

engine.addSystem(new UpdateSceneUISystem())
//// end quest UI smart wearable code
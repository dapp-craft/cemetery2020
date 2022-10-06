import { addGhostsAndCrypts, addMainGhostNPC } from './NPC/ghost/skeleton'
import { addClosedDoors, addHouses } from './trickOrTreat'
import { checkProgression, progression } from './halloweenQuests/progression'
import { addStaticStuff } from './staticDecorations'
import { Coords, initialQuestUI } from './halloweenQuests/quest'
import { doorHauntedHouse, getKey } from './hauntedHouse'
import { Reward } from './halloweenQuests/loot'

addStaticStuff()
addClosedDoors()
setUpScene()

export async function setUpScene() {
  await checkProgression()

  initialQuestUI(progression.data, progression.day, Coords.CemeteryCoords)

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

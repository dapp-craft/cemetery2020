import { getUserData, UserData } from '@decentraland/Identity'
import { getCurrentRealm, isPreviewMode, Realm } from '@decentraland/EnvironmentAPI'
import { IN_PREVIEW, setInPreview, TESTDATA_ENABLED, TESTQUESTSTATE } from './config'
import * as ui from '@dcl/ui-scene-utils'
import * as utils from '@dcl/ecs-scene-utils'
import { quest, updateQuestUI } from './quest/questTasks'
import { Coords, HalloweenState } from './quest/types'
// import {PlayCloseSound} from '@dcl/ui-scene-utils'

export let progression: HalloweenState = { data: null, day: 0}

export let userData: UserData
export let playerRealm: Realm

export const fireBaseServer = 'https://us-central1-halloween-361612.cloudfunctions.net/app/'
//To DO Check local sever
//`http://localhost:5001/decentraland-halloween/us-central1/app/`

export async function setUserData() {
  const data = await getUserData()
  log(data.publicKey)
  userData = data
}

// fetch the player's realm
export async function setRealm() {
  const realm = await getCurrentRealm()
  log(`You are in the realm: ${JSON.stringify(realm.displayName)}`)
  playerRealm = realm
}

export async function checkProgression() {
  setInPreview(await isPreviewMode())
  if (TESTDATA_ENABLED && IN_PREVIEW) {
    progression = TESTQUESTSTATE
    return TESTQUESTSTATE
  }

  if (!userData) {
    await setUserData()
  }
  const url = fireBaseServer + 'halloweenstate/?id=' + userData.userId
  try {
    const response = await fetch(url)
    const curr_progression = await response.json()
    // progression = curr_progression
    return curr_progression
  } catch (e) {
    log('error fetching from token server ', e.message)
    return null
  }
}

export async function updateProgression(stage: string, onlyLocal?: boolean) {
  if (onlyLocal || (TESTDATA_ENABLED && IN_PREVIEW)) {
    progression.data[stage] = true
    return true
  }

  if (!userData) {
    await setUserData()
  }
  if (!playerRealm) {
    await setRealm()
  }

  const url = fireBaseServer + 'halloweenupdate'

  const body = {
    id: userData.userId,
    stage: stage,
    realm: playerRealm.serverName,
    island: playerRealm.room
  }

  log('sending req to: ', url)
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const data = await response.json()
    log('Player progression: ', data)
    if (data.success) {
      // progression.data[stage] = true
    }
    return data.success
  } catch {
    log('error fetching from token server ', url)
  }
}

export async function nextDay(nextDay: number) {
  //PlayEndJingle()

  const congrats = new ui.CenterImage('images/finishedDay' + (nextDay - 1) + '.png', 7, false, 0, 0, 512, 512)

  if (!userData) {
    await setUserData()
  }

  if (userData.hasConnectedWeb3 || IN_PREVIEW) {
    const dummyEnt = new Entity()
    dummyEnt.addComponent(
      new utils.Delay(6000, async () => {
        const poap = await sendpoap('w' + (nextDay - 1))

        if (!poap) {
          const p = new ui.OkPrompt(
            'We ran out of POAP tokens for this event, sorry.',
            () => {
              p.close()
              //TODO: Check
              // PlayCloseSound()
            },
            'Ok',
            true
          )
        } else {
          const p = new ui.OkPrompt(
            "A POAP token for today's event will arrive to your account very soon!",
            () => {
              p.close()
              //TODO: Check
              // PlayCloseSound()
            },
            'Ok',
            true
          )
        }
      })
    )

    engine.addEntity(dummyEnt)
  }

  if (nextDay > progression.day) {
    return false
  }
  const currentCoords = quest.currentCoords

  quest.close()

  updateQuestUI(progression.data, progression.day)

  return true
}

// export const nextDayJingle = new Entity()
// nextDayJingle.addComponent(new Transform())
// nextDayJingle.addComponent(new AudioSource(new AudioClip('sounds/JingleQuestCompleted.mp3')))
// nextDayJingle.getComponent(AudioSource).volume = 0.5
// nextDayJingle.getComponent(AudioSource).loop = false
// engine.addEntity(nextDayJingle)
// nextDayJingle.setParent(Attachable.AVATAR)

// export function PlayEndJingle() {
//   nextDayJingle.getComponent(AudioSource).playOnce()
// }

export async function sendpoap(stage: string) {
  if (TESTDATA_ENABLED && IN_PREVIEW) {
    progression.data[stage] = true
    return true
  }

  if (!userData) {
    await setUserData()
  }
  if (!playerRealm) {
    await setRealm()
  }

  const url = fireBaseServer + 'send-poap'

  const body = {
    id: userData.userId,
    stage: stage,
    realm: playerRealm.serverName,
    island: playerRealm.room
  }

  log('sending req to: ', url)
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const data = await response.json()
    log('Poap status: ', data)

    return data.success
  } catch {
    log('error fetching from token server ', url)
  }
}

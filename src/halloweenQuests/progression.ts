import { getUserData, UserData } from '@decentraland/Identity'
import { getCurrentRealm, isPreviewMode, Realm } from '@decentraland/EnvironmentAPI'
import { IN_PREVIEW, setInPreview, TESTDATA_ENABLED, TESTQUESTSTATE } from './config'
import * as ui from '@dcl/ui-scene-utils'
import { updateQuestUI } from './quest/questTasks'
import { HalloweenState } from './quest/types'

// import {PlayCloseSound} from '@dcl/ui-scene-utils'

export let progression: HalloweenState = { data: null, day: 0 }

export let userData: UserData
export let playerRealm: Realm

export const fireBaseServer =
  'https://us-central1-halloween-361612.cloudfunctions.net/app/'
  //To DO Check local sever
  // `http://localhost:5001/halloween-361612/us-central1/app/` 

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
export async function resetProgression() {


  if (!userData) {
    await setUserData()
    log(userData)
  }

  const url = fireBaseServer + 'halloweenupdate'
  try {
    let body = {
      id: userData.userId,
      clear: true
    }
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    return true
  } catch (e) {
    log('reset progress error', e.message)
    return null
  }
}
export async function checkProgression() {
  setInPreview(await isPreviewMode())
  if (TESTDATA_ENABLED && IN_PREVIEW) {
    progression = TESTQUESTSTATE
    return TESTQUESTSTATE
  }

  if (!userData) {
    await setUserData()
    log('userData',userData)
  }

  if (!playerRealm) {
    await setRealm()
    log('playerRealm',playerRealm)
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
    // progression.data[stage] = true
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
    island: playerRealm.room || 'without_room'
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
  PlayEndJingle()

  const congrats = new ui.CenterImage('images/finishedDay' + (nextDay - 1) + '.png', 7, false, 0, 0, 512, 512)

  if (nextDay > progression.day) {
    return false
  }

  updateQuestUI(progression.data, progression.day)

  return true
}

export const nextDayJingle = new Entity()
nextDayJingle.addComponent(new Transform())
nextDayJingle.addComponent(new AudioSource(new AudioClip('sounds/JingleQuestCompleted.mp3')))
nextDayJingle.getComponent(AudioSource).volume = 0.5
nextDayJingle.getComponent(AudioSource).loop = false
engine.addEntity(nextDayJingle)
nextDayJingle.setParent(Attachable.AVATAR)

export function PlayEndJingle() {
  nextDayJingle.getComponent(AudioSource).playOnce()
}


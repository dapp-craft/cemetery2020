import {getUserData, UserData} from '@decentraland/Identity'
import {getCurrentRealm, isPreviewMode, Realm,} from '@decentraland/EnvironmentAPI'
import {IN_PREVIEW, setInPreview, TESTDATA_ENABLED, TESTQUESTSTATE,} from '../../resources/config'
import {HalloweenState, initialQuestUI, quest} from './quest'
import * as ui from '@dcl/ui-scene-utils'
import * as utils from '@dcl/ecs-scene-utils'
// import {PlayCloseSound} from '@dcl/ui-scene-utils'

export let progression: HalloweenState

export let userData: UserData
export let playerRealm: Realm

export let fireBaseServer =
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
  let realm = await getCurrentRealm()
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
    let response = await fetch(url)
    let json = await response.json()
    log('Player progression: ', json)
    progression = json
    return json
  } catch {
    log('error fetching from token server ', url)
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

  let body = {
    id: userData.userId,
    stage: stage,
    server: playerRealm.serverName,
    realm: playerRealm.layer,
  }

  log('sending req to: ', url)
  try {
    let response = await fetch(url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(body),
    })
    let data = await response.json()
    log('Player progression: ', data)
    if (data.success) {
      progression.data[stage] = true
    }
    return data.success
  } catch {
    log('error fetching from token server ', url)
  }
}

export async function nextDay(nextDay: number) {
  PlayEndJingle()

  let congrats = new ui.CenterImage(
    'images/finishedDay' + (nextDay - 1) + '.png',
    7,
    false,
    0,
    0,
    512,
    512
  )

  if (!userData) {
    await setUserData()
  }

  if (userData.hasConnectedWeb3 || IN_PREVIEW) {
    let dummyEnt = new Entity()
    dummyEnt.addComponent(
      new utils.Delay(6000, async () => {
        let poap = await sendpoap('w' + (nextDay - 1))

        if (!poap) {
          let p = new ui.OkPrompt(
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
          let p = new ui.OkPrompt(
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
  let currentCoords = quest.currentCoords

  quest.close()

  initialQuestUI(progression.data, progression.day, currentCoords)

  return true
}

export const nextDayJingle = new Entity()
nextDayJingle.addComponent(new Transform())
nextDayJingle.addComponent(
  new AudioSource(new AudioClip('sounds/JingleQuestCompleted.mp3'))
)
nextDayJingle.getComponent(AudioSource).volume = 0.5
nextDayJingle.getComponent(AudioSource).loop = false
engine.addEntity(nextDayJingle)
nextDayJingle.setParent(Attachable.AVATAR)

export function PlayEndJingle() {
  nextDayJingle.getComponent(AudioSource).playOnce()
}

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

  let body = {
    id: userData.userId,
    stage: stage,
    server: playerRealm.serverName,
    realm: playerRealm.layer,
  }

  log('sending req to: ', url)
  try {
    let response = await fetch(url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(body),
    })
    let data = await response.json()
    log('Poap status: ', data)

    return data.success
  } catch {
    log('error fetching from token server ', url)
  }
}

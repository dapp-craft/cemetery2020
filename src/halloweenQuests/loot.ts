import * as utils from '@dcl/ecs-scene-utils'
import * as ui from '@dcl/ui-scene-utils'
import { fireBaseServer, nextDay, playerRealm, setRealm, setUserData, updateProgression, userData } from './progression'
import { loot_models } from 'src/resources/model_paths'
import { signedFetch } from '@decentraland/SignedFetch'
import { IN_PREVIEW } from "./config";
import { COLOR_GREEN } from "../resources/theme/color";

let timeout = 2500

let particleGLTF = new GLTFShape(loot_models.particles)
let starGLTF = new GLTFShape(loot_models.star)

@Component('alreadyFoundLoot')
export class AlreadyFoundLoot {
}

export class Reward extends Entity {
  progressionStep: string
  particles: Entity
  openUi: boolean
  onFinished: () => void

  constructor(
    parent: Entity,
    progressionStep: string,
    offset?: TranformConstructorArgs,
    onlyActivateWhenClicked?: boolean,
    onFinished?: () => void,
  ) {
    if (parent.hasComponent(AlreadyFoundLoot)) return

    parent.addComponent(new AlreadyFoundLoot())

    super()
    this.addComponent(starGLTF)

    this.addComponent(
      new Transform(
        offset
          ? offset
          : {
            position: new Vector3(0, 1.7, 0),
            scale: new Vector3(1.8, 1.8, 1.8),
          }
      )
    )
    this.getComponent(Transform).scale.x *= 0.3
    this.getComponent(Transform).scale.y *= 0.3
    this.getComponent(Transform).scale.z *= 0.3

    engine.addEntity(this)
    this.setParent(parent)

    this.progressionStep = progressionStep


    if (onFinished) {
      this.onFinished = onFinished
    }

    this.addComponent(
      new utils.KeepRotatingComponent(Quaternion.Euler(0, 40, 0))
    )

    this.addComponent(
      new OnPointerDown(
        () => {
          if (this.openUi) return
          this.activate()
        },
        {
          hoverText: 'Claim',
        }
      )
    )

    const idleSource = new AudioSource(new AudioClip('sounds/star-idle.mp3'))
    this.addComponentOrReplace(idleSource)
    idleSource.loop = true
    idleSource.playing = true

    this.particles = new Entity()
    this.particles.setParent(parent)
    this.particles.addComponent(particleGLTF)

    this.particles.addComponent(
      new Transform(
        offset
          ? offset
          : {
            position: new Vector3(0, 1.7, 0),
            scale: new Vector3(1.3, 1.3, 1.3),
            rotation: Quaternion.Euler(0, 0, 0),
          }
      )
    )

    this.particles.addComponent(
      new utils.KeepRotatingComponent(Quaternion.Euler(15, 12, 18))
    )
    const meshAnimator = new Animator()
    this.particles.addComponent(meshAnimator)
    let playAnim = new AnimationState('Play')
    meshAnimator.addClip(playAnim)
    playAnim.play()
    engine.addEntity(this.particles)

    if (!onlyActivateWhenClicked) {
      // this.activate()
      const spawnSource = new AudioSource(
        new AudioClip('sounds/star-spawn.mp3')
      )
      this.particles.addComponentOrReplace(spawnSource)
      spawnSource.loop = false
      spawnSource.playing = true

      this.openUi = false
    }
  }

  async activate() {
    this.openUi = true
    let data = await claimToken(
      this.progressionStep,
      this)
    // let data = await claimToken()

    if (data) {
      this.storeData(data)
    }
  }

  storeData(claimData) {
    log('storing data: ', claimData)

  }

  vanish() {
    engine.removeEntity(this.particles)
    engine.removeEntity(this)
    if (this.onFinished) {
      this.onFinished()
    }
    PlayCoinSound()
  }

  runOnFinished() {
    if (this.onFinished) {
      this.onFinished()
    }
  }
}

export enum ClaimState {
  ASSIGNED = 'assigned',
  SUCCESS = 'success',
  SENDING = 'sending',
  REJECTED = 'rejected',
  TROUBLE = 'trouble'
}

export async function claimToken(
  progressionStep: string,
  representation: Reward,
) {
  let p

  try {
    let claimData = await checkServer(
      progressionStep,
      representation,
    )
    if (claimData && claimData.claimState) {
      // claimstate enum w all options, do a switch case
      switch (claimData.claimState) {
        case ClaimState.SUCCESS:
          PlayOpenSound()
          p = new ui.OkPrompt(
            'You already claimed this item',
            () => {
              p.close()
              representation.vanish()
              PlayCloseSound()
            },
            'Ok',
            true
          )
          updateProgression(progressionStep)
          utils.setTimeout(timeout, () => nextDay(2))


          return false
        case ClaimState.ASSIGNED:
          PlayOpenSound()
          p = new ui.OkPrompt(
            'Your item assigned for you.\n Please wait',
            () => {
              p.close()
              representation.vanish()
              PlayCloseSound()
            },
            'Ok',
            true
          )
          updateProgression(progressionStep)
          utils.setTimeout(timeout, () => nextDay(2))


          return false

        case ClaimState.SENDING:
          PlayOpenSound()
          p = new ui.OkPrompt(
            'Your item already sending for you.\n Please wait',
            () => {
              p.close()
              representation.vanish()
              PlayCloseSound()
            },
            'Ok',
            true
          )
          updateProgression(progressionStep)
          utils.setTimeout(timeout, () => nextDay(2))


          return false

        case ClaimState.REJECTED:
          log('Rejected claim response: ', claimData)

          log('rejected')
          PlayOpenSound()
          p = new ui.OkPrompt(
            'Rejected. Please try again',
            () => {
              p.close()
              PlayCloseSound()
              representation.runOnFinished()
              representation.openUi = false
            },
            'Ok',
            true
          )
          return false
      }
    }
    if (claimData && claimData.claimState === undefined) {
      log('unkown error')
      PlayOpenSound()
      p = new ui.OkPrompt(
        'Event did not start or finished, or wearables no stock, or an unexpected error occurred, please try again.',
        () => {
          p.close()
          PlayCloseSound()
          representation.runOnFinished()
          representation.openUi = false
        },
        'Ok',
        true
      )
    }
  } catch (error) {
    log('request error')
    PlayOpenSound()
    p = new ui.OkPrompt(
      'An unexpected error occurred, please try again.',
      () => {
        p.close()
        PlayCloseSound()
        representation.runOnFinished()
        representation.openUi = false
      },
      'Ok',
      true
    )
  }
  return false
}

export async function checkServer(
  stage: string,
  representation: Reward,
) {
  if (!userData) {
    await setUserData()
  }
  if (!playerRealm) {
    await setRealm()
  }


  if (!userData.publicKey) {
    PlayOpenSound()
    let p = new ui.OkPrompt(
      'You need an in-browser Ethereum wallet (eg: Metamask) to claim this item.\n But you can go next without claiming.',
      () => {
        p.close()
        representation.runOnFinished()
        PlayCloseSound()
      },
      'Ok',
      true
    )
    updateProgression(stage)
    utils.setTimeout(2000, () => {
      p.close()
      nextDay(2)
    })
    return
  }

  const url = fireBaseServer + 'startclaimhalloween'

  const body = {
    id: userData.userId,
    stage: stage,
    realm: playerRealm.serverName,
    island: playerRealm.room || 'without_room'
  }

  log(body)

  log('sending req to: ', url)
  try {
    let response = await signedFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    let json = await response.json()
    log('Claim state: ', json)



    return json
  } catch {
    log('error fetching from token server ', url)
  }
}


let claimUI: ui.CustomPrompt

export function openClaimUI(
  data: RewardData[],
  stage: string,
  representation?: Reward,
  failedTransaction?: boolean
) {
  PlayOpenSound()

  if (claimUI && claimUI.background.visible) {
    claimUI.hide()
  }

  claimUI = new ui.CustomPrompt(ui.PromptStyles.DARKLARGE)
  claimUI.addText(
    failedTransaction
      ? 'Retry failed transaction'
      : 'You have a reward to claim!',
    0,
    170,
    Color4.FromHexString(COLOR_GREEN),
    26
  )

  let currentToken = 0

  if (data.length > 1) {
    for (let i = 0; i >= data.length; i++) {
      currentToken = i
    }
  }

  claimUI.addText(data[currentToken].token, 0, 100, Color4.White(), 20) // wearable name

  claimUI.addIcon(data[currentToken].image, 0, 0, 128, 128, {
    sourceHeight: 256,
    sourceWidth: 256,
  })

  if (data.length > 1) {
    claimUI.addText(
      '+ ' +
      (data.length - 1) +
      ' other wearable' +
      (data.length > 2 ? 's ' : ' ') +
      'pending',
      0,
      -60,
      Color4.FromHexString(COLOR_GREEN)
    )
  }
}

export async function makeTransaction(claimData: ClaimData) {
  if (claimData.status == 'successful') {
    let p = new ui.OkPrompt('You have already claimed this reward')
    return
  } else if (claimData.status == 'pending') {
    let p = new ui.OptionPrompt(
      'Claim already pending',
      'You have a pending transaction for this same claim, are you sure you want to continue?',
      () => {
        p.close()
      },
      () => {
        return
      }
    )
  } else if (claimData.status == 'failed') {
    PlayOpenSound()
    let p = new ui.OkPrompt('You are reattempting a failed transaction')
  }


  return
}

export type RewardData = {
  id: string
  user: string
  campaign_id: string
  status: string
  transaction_hash: string
  type: string
  token: string
  value: string
  created_at: string
  updated_at: string
  from_referral: null
  block_number: null
  claim_id: string
  contract: string
  payload: string
  expires_at: string
  signature: string
  airdrop_type: string
  order: number
  priority: number
  campaign_key: string
  assigned_at: string
  image: string
  current_key?: boolean
}

export type ClaimData = {
  id: string
  user: string
  contract: string
  transaction_payload: string
  transaction_payload_hash: string
  status: string
  rewards: RewardData[]
  expires_at: string
  created_at: string
  updated_at: string
}

// Open dialog sound
export const openDialogSound = new Entity()
openDialogSound.addComponent(new Transform())
openDialogSound.addComponent(
  new AudioSource(new AudioClip('sounds/navigationForward.mp3'))
)
openDialogSound.getComponent(AudioSource).volume = 0.5
engine.addEntity(openDialogSound)
openDialogSound.setParent(Attachable.AVATAR)

// Close dialog sound
export const closeDialogSound = new Entity()
closeDialogSound.addComponent(new Transform())
closeDialogSound.addComponent(
  new AudioSource(new AudioClip('sounds/navigationBackward.mp3'))
)
closeDialogSound.getComponent(AudioSource).volume = 0.5
engine.addEntity(closeDialogSound)
closeDialogSound.setParent(Attachable.AVATAR)

export const coinSound = new Entity()
coinSound.addComponent(new Transform())
coinSound.addComponent(
  new AudioSource(new AudioClip('sounds/star-collect.mp3'))
)
coinSound.getComponent(AudioSource).volume = 0.5
coinSound.getComponent(AudioSource).loop = false
engine.addEntity(coinSound)
coinSound.setParent(Attachable.AVATAR)

export function PlayOpenSound() {
  openDialogSound.getComponent(AudioSource).playOnce()
}

export function PlayCloseSound() {
  closeDialogSound.getComponent(AudioSource).playOnce()
}

export function PlayCoinSound() {
  coinSound.getComponent(AudioSource).playOnce()
}

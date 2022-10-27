import * as utils from '@dcl/ecs-scene-utils'
import * as ui from '@dcl/ui-scene-utils'
import { loot_models } from 'src/resources/model_paths'
import { signedFetch } from '@decentraland/SignedFetch'
import { COLOR_GREEN } from "../resources/theme/color";
import { fireBaseServer, playerRealm, userData } from "./progression";

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
  TROUBLE = 'trouble',
  campaign_uninitiated = 'campaign_uninitiated',
  campaign_finished = 'campaign_finished',
  NO_STOCK = 'NO_STOCK'
}

export async function claimToken(
  progressionStep: string,
  representation: Reward,
) {
  let p
  log('claimToekn')

  try {
    let claimData = await checkServer(
      progressionStep,
      representation,
    )
    log('after check server')
    log(claimData)
    if (claimData && claimData.claimState) {
      log('if (claimData && claimData.claimState) ')
      // claimstate enum w all options, do a switch case
      switch (claimData.claimState) {
        case ClaimState.SUCCESS:
          PlayOpenSound()
          openClaimUI(claimData, 'You already claimed this Reward', () => {
            representation.vanish()
            PlayCloseSound()
          })

          return false
        case ClaimState.ASSIGNED:
          PlayOpenSound()
          openClaimUI(claimData, 'Your Reward assigned for you.\n Please wait', () => {
            representation.vanish()
            PlayCloseSound()
          })
          return false

        case ClaimState.SENDING:
          PlayOpenSound()
          openClaimUI(claimData, 'Your Reward already sending for you.\n Please wait', () => {
            representation.vanish()
            PlayCloseSound()
          })
          return false

        case ClaimState.REJECTED:
          log('Rejected claim response: ', claimData)

          log('rejected')
          PlayOpenSound()
          openClaimUI(claimData, 'Rejected. Please try again', () => {
            PlayCloseSound()
            representation.openUi = false
          })
          return false
        case ClaimState.campaign_uninitiated:
          log('campaign_uninitiated: ', claimData)

          log('campaign_uninitiated')
          PlayOpenSound()
          openClaimUI(undefined, 'Event did not start', () => {
            PlayCloseSound()
            representation.openUi = false
          })
          return false
        case ClaimState.campaign_finished:
          log('campaign_finished: ', claimData)

          log('campaign_finished')
          PlayOpenSound()
          openClaimUI(undefined, 'Event finished', () => {
            PlayCloseSound()
            representation.vanish()
          })
          return false
        case ClaimState.TROUBLE:
          log('troubles with rewards API: ', claimData)

          log('troubles with rewards API: ')
          PlayOpenSound()
          openClaimUI(undefined, 'An unexpected error occurred,\n Please try again.', () => {
            PlayCloseSound()
            representation.openUi = false
          })
          return false
        case ClaimState.NO_STOCK:
          log('No stock: ', claimData)

          PlayOpenSound()
          openClaimUI(undefined, 'No Stock, please go next', () => {
            PlayCloseSound()
            representation.vanish()
          })
          return false
      }
    }
    if (claimData && claimData.claimState === undefined) {
      log('unkown error')
      PlayOpenSound()
      openClaimUI(claimData, 'An unexpected error occurred,\n Please try again.', () => {
        PlayCloseSound()
        representation.openUi = false
      })
    }
  } catch (error) {
    log('request error')
    PlayOpenSound()
    openClaimUI(undefined, 'An unexpected error occurred,\n Please try again.', () => {
      PlayCloseSound()
      representation.openUi = false
    })
  }
  return false
}

export async function checkServer(
  stage: string,
  representation: Reward,
) {
  log('checkserver', userData, playerRealm, fireBaseServer)


  log('before guest')
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
    p.background.isPointerBlocker = true
    p.text.isPointerBlocker = true
    // representation.runOnFinished()
    representation.openUi = false
    return
  }
  const url = fireBaseServer + 'startclaimhalloween'
  log('url')
  log('url', url)

  const body = {
    id: userData.userId,
    stage: stage,
    realm: playerRealm.serverName,
    island: playerRealm.room || 'without_room',
    catalyst: playerRealm.domain
  }

  log(body)

  log('sending req to: ', url)
  try {
    let response = await signedFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    log('response', response)
    let text = response.text
    let json = JSON.parse(text)
    log('Claim state: ', text)
    // let json = await response.json()
    return json
  } catch (e) {
    log(e.message)
    log('error fetching from token server ', url)
    PlayOpenSound()
    openClaimUI(undefined, 'Crash Request\nPlease check you internet\nPlease try again later\nor reload page ', () => {
      PlayCloseSound()
      representation.openUi = false
    })
  }
}


let claimUI: ui.CustomPrompt

export function openClaimUI(
  response,
  text,
  onClose
) {
  PlayOpenSound()

  if (claimUI && claimUI.background.visible) {
    claimUI.hide()
  }

  claimUI = new ui.CustomPrompt(ui.PromptStyles.DARKLARGE)
  if (response && response.token) {
    claimUI.addText(
      `${response.token}`,
      0,
      170,
      Color4.FromHexString(COLOR_GREEN),
      26
    )
  }

  log('claimUI')
  claimUI.closeIcon.onChange(onClose)




  claimUI.addText(text, 0, 50, Color4.White(), 20) // wearable name
  if (response && response.image) {
    claimUI.addIcon(response.image, 0, -50, 128, 128, {
      sourceHeight: 1024,
      sourceWidth: 1024,
    })
  }

  let myButton = claimUI.addButton(
    'Ok',
    0,
    -160,
    () => {
      onClose()
      claimUI.hide()
    },
    ui.ButtonStyles.E
  )
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

import { haunted_model_paths } from "src/resources/model_paths"

export class Phone extends Entity {
  onPickup: () => void
  anim: AnimationState

  ringing: boolean = true
  ringSound: AudioClip = new AudioClip(`sounds/ring.mp3`)
  picupSound: AudioClip
  constructor(position: TranformConstructorArgs, onPickup: () => void) {
    super()
    this.addComponent(new GLTFShape(haunted_model_paths.phone))
    this.addComponent(new Transform(position))
    this.addComponent(new Animator())
    engine.addEntity(this)

    this.onPickup = onPickup

    this.addComponent(
      new OnPointerDown(
        (e) => {
          this.activate()
        },
        { hoverText: 'Pick up' }
      )
    )
    this.ringSound.loop = true
    this.addComponent(new AudioSource(this.ringSound))

    // play ringing sound

    this.anim = new AnimationState('Ring', { looping: true })
    this.getComponent(Animator).addClip(this.anim)
    this.anim.playing = true
  }
  ring() {
    this.getComponent(AudioSource).loop = true
    this.getComponent(AudioSource).playing = true
    this.anim.playing = true
  }
  activate() {
    if (!this.ringing) return

    // stop anim
    // stop sound
    // play pickup sound

    this.anim.playing = false
    this.getComponent(Animator).getClip('Ring').stop()
    this.getComponent(AudioSource).playing = false
    this.ringing = false
    this.onPickup()
  }
}

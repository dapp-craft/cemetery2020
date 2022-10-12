import { stuff } from 'src/resources/model_paths'
import { followingSkeletons, Skeleton } from './NPC/ghost/skeleton'

export class Grave extends Entity {
  onActivate: () => void
  openAnim: AnimationState
  closeAnim: AnimationState
  resident: Skeleton
  isOpen: boolean
  bugs: Entity
  constructor(
    position: TranformConstructorArgs,
    model: GLTFShape,
    resident?: Skeleton | null,
    openAnim?: string,
    closeAnim?: string,
    onActivate?: () => void
  ) {
    super()
    this.addComponent(model)
    this.addComponent(new Transform(position))
    engine.addEntity(this)

    if (onActivate) {
      this.onActivate = onActivate
    }
    this.addComponent(new Animator())
    if (openAnim) {
      this.openAnim = new AnimationState(openAnim, { looping: false })
      this.getComponent(Animator).addClip(this.openAnim)
    }
    if (closeAnim) {
      this.closeAnim = new AnimationState(closeAnim, { looping: false })
      this.getComponent(Animator).addClip(this.closeAnim)
    }

    if (resident) {
      this.resident = resident
      this.bugs = new Entity()
      this.bugs.addComponent(
        new Transform({ position: new Vector3(-0.3, 0, 0.5) })
      )
      this.bugs.addComponent(new GLTFShape(stuff.light_bugs))
      this.bugs.setParent(this)
      this.bugs.getComponent(GLTFShape).visible = false

      this.addComponent(new AudioSource(new AudioClip('sounds/open-grave.mp3')))
      this.getComponent(AudioSource).volume = 2
      this.getComponent(AudioSource).loop = true
      this.getComponent(AudioSource).playing = true

      this.addComponent(
        new OnPointerDown(
          (e) => {
            if (
              this.resident &&
              followingSkeletons &&
              followingSkeletons[0] == this.resident
            ) {
              this.resident.goHome(this)
            } else if (this.resident && followingSkeletons) {
              log('Not my home')
              followingSkeletons[0].refusePlace()
            }
          },
          {
            hoverText: 'Return Ghost',
          }
        )
      )
    }
  }
  activate() {
    if (this.onActivate) {
      this.onActivate()
    }
    this.removeComponent(OnPointerDown)
    this.getComponent(AudioSource).playing = false
    this.removeComponent(AudioSource)
  }
  open() {
    this.closeAnim.stop()
    this.openAnim.stop()
    this.openAnim.play()
    this.isOpen = true
    this.bugs.getComponent(GLTFShape).visible = true
  }
  close() {
    this.openAnim.stop()
    this.closeAnim.stop()
    this.closeAnim.play()
    this.isOpen = false
    this.bugs.getComponent(GLTFShape).visible = false
  }
}

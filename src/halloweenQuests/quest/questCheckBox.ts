import resources, { setSection } from '../resources'
import {canvas, SFFont} from '@dcl/ui-scene-utils'

export const halloweenTheme = new Texture('images/HalloweentAtlas.png')

export const questBackground = new UIImage(canvas, halloweenTheme)

export class QuestCheckBox extends Entity {
  label: UIText
  background: UIImage
  image: UIImage
  teleportArrow: UIImage
  checked: boolean
  teleportLocation: string
  private darkTheme: boolean

  constructor(
    texture: Texture,
    darkTheme: boolean,
    label: string,
    posX: number,
    posY: number,
    onCheck?: () => void,
    onUncheck?: () => void,
    large?: boolean,
    startChecked?: boolean,
    teleportLocation?: string
  ) {
    super()

    this.checked = startChecked === true ? true : false
    this.darkTheme = darkTheme

    this.background = new UIImage(questBackground, texture)
    this.background.positionX = posX
    this.background.positionY = posY
    this.background.width = 262
    this.background.height = 45
    this.background.vAlign = 'top'
    if (teleportLocation && !startChecked) {
      // red
      setSection(this.background, resources.questItems.red)
      this.teleportArrow = new UIImage(this.background, texture)
      this.teleportArrow.positionX = -10
      this.teleportArrow.positionY = -10
      this.teleportArrow.width = 24
      this.teleportArrow.height = 20
      this.teleportArrow.hAlign = 'right'
      this.teleportArrow.vAlign = 'top'
      this.teleportArrow.isPointerBlocker = false

      setSection(this.teleportArrow, resources.teleportArrow)
    } else {
      // default
      setSection(this.background, resources.questItems.default)
    }

    if (teleportLocation) {
      this.teleportLocation = teleportLocation
      this.background.onClick = new OnClick(() => {
        log('teleporting!')
        teleportTo(teleportLocation)
      })
    }

    this.image = new UIImage(this.background, texture)
    this.image.vAlign = 'bottom'
    this.image.hAlign = 'left'

    this.image.width = 16
    this.image.height = 16
    this.image.positionX = 15
    this.image.positionY = 14

    this.label = new UIText(this.image)

    this.label.positionX = large ? 40 : 30

    this.label.color = darkTheme ? Color4.White() : Color4.Black()

    this.label.value = label
    this.label.hTextAlign = 'left'
    this.label.vTextAlign = 'center'
    this.label.fontSize = 13
    this.label.font = SFFont
    this.label.isPointerBlocker = false

    // this.image.onClick = new OnClick(() => {
    //   this.checked = !this.checked
    //   if (this.checked == false) {
    //     this.check()
    //   } else {
    //     this.uncheck()
    //   }

    //   this.checked ? onCheck() : onUncheck()
    // })

    if (this.checked === false) {
      this.uncheck()
    } else {
      this.check()
    }
  }

  public hide(): void {
    this.image.visible = false
    this.label.visible = false
    this.background.visible = false
  }

  public show(): void {
    this.image.visible = true
    this.label.visible = true
  }

  public uncheck(): void {
    this.checked = false
    if (this.darkTheme) {
      setSection(this.image, resources.checkboxes.off)
      this.image.width = 16
      this.image.height = 16
      this.label.color = Color4.White()
    } else {
      setSection(this.image, resources.checkboxes.off)

      this.label.color = Color4.Black()
    }

    if (this.teleportLocation) {
      setSection(this.background, resources.questItems.red)
    }

    //  Change text color?
  }

  public check(): void {
    this.checked = true
    if (this.darkTheme) {
      setSection(this.image, resources.checkboxes.on)

      this.label.color = Color4.Gray()
    } else {
      setSection(this.image, resources.checkboxes.on)
      this.image.width = 22
      this.image.height = 19

      this.label.color = Color4.Gray()
    }

    if (this.teleportLocation) {
      setSection(this.background, resources.questItems.default)
    }
  }

  //  Change text color?
}

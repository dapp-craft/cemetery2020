import { canvas } from '@dcl/ui-scene-utils'
import resources, { setSection } from '../resources'
import {halloweenTheme, questBackground, QuestCheckBox} from './questCheckBox'
import { Coords, QuestItem } from './types'

const ITEM_SPACING = 50
const Y_OFFSET = -59
const X_OFFSET = -5


export class QuestUI extends Entity {
  visibleElements: QuestCheckBox[] = []
  elements: QuestItem[] = []
  UIOpenTime: number
  texture: Texture = halloweenTheme
  background: UIImage = questBackground
  day?: number
  title: UIImage
  // currentCoords: Coords

  constructor(list: QuestItem[], day: number, width?: number) {
    super()

    this.UIOpenTime = +Date.now()

    this.background.visible = true

    this.title = new UIImage(this.background, halloweenTheme)
    this.title.vAlign = 'top'
    this.title.positionX = 0
    this.title.positionY = -12
    this.title.width = 58
    this.title.height = 24

    this.setupUI(list, day, width)

    //this.background.height = 55 + 50 * this.visibleElements.length
  }

  public close(): void {
    questBackground.visible = false
    this.title.visible = false

    for (const element of this.visibleElements) {
      element.hide()
    }
  }

  public reopen(): void {
    questBackground.visible = true
    this.title.visible = true

    for (const element of this.visibleElements) {
      element.show()
    }
  }

  public addCheckbox(label: string, checked?: boolean, teleportLocation?: string) {
    const posX = X_OFFSET
    const posY = Y_OFFSET - this.visibleElements.length * ITEM_SPACING

    const checkBox = new QuestCheckBox(
      this.texture,
      false,
      label,
      posX,
      posY,
      null,
      null,
      false,
      checked ? checked : null,
      teleportLocation
      //TODO && teleportLocation !== this.currentCoords
      && teleportLocation !== Coords.Secret
        ? teleportLocation
        : null
    )

    this.visibleElements.push(checkBox)
    //this.items.push({ label: label, checked: checked })

    //this.background.height = 10 + ITEM_SPACING * this.visibleElements.length

    this.setupVisibleUI()

    //this.background.height = 55 + 50 * this.visibleElements.length

    return checkBox
  }

  public checkBox(index) {
    this.visibleElements[index].check()
  }

  public uncheckBox(index) {
    this.visibleElements[index].uncheck()
  }

  public showCheckBox(index) {
    if (this.elements[index].visible) return
    this.elements[index].visible = true
    this.addCheckbox(this.elements[index].label, this.elements[index].checked, this.elements[index].coords)
  }

  public resetBoxes(list: QuestItem[], width?: number, height?: number) {
    for (let i = 0; i < this.visibleElements.length; i++) {
      this.visibleElements[i].hide()
    }
    this.elements = []
    this.visibleElements = []

    for (let i = 0; i < list.length; i++) {
      this.elements.push(list[i])
      if (list[i].visible) {
        this.addCheckbox(list[i].label, list[i].checked)
      }
    }

    if (width) {
      this.background.width = width
    }
    if (height) {
      this.background.height = height
    }
  }

  public setupVisibleUI() {
    switch (this.visibleElements.length) {
      case 1:
        setSection(this.background, resources.questBackgrounds[1])
        this.background.height = 141
        break
      case 2:
        setSection(this.background, resources.questBackgrounds[2])
        this.background.height = 190
        break
      case 3:
        setSection(this.background, resources.questBackgrounds[3])
        this.background.height = 242
        break
      case 4:
        setSection(this.background, resources.questBackgrounds[4])
        this.background.height = 293
        break
      case 5:
        setSection(this.background, resources.questBackgrounds[5])
        this.background.height = 347
        break
      case 6:
        setSection(this.background, resources.questBackgrounds[5])
        this.background.height = 398
        break
    }
  }

  public setupUI(list: QuestItem[], day: number, width?: number) {
    // this.currentCoords = currentCoords
    this.clearCheckBoxes()
    switch (day) {
      case 1:
        setSection(this.title, resources.dayLabels[1])
        break
      case 2:
        setSection(this.title, resources.dayLabels[2])
        break
      case 3:
        setSection(this.title, resources.dayLabels[3])
        break
      case 4:
        setSection(this.title, resources.dayLabels[4])
        break
      case 5:
        setSection(this.title, resources.dayLabels[5])
        break
    }

    for (let i = 0; i < list.length; i++) {
      this.elements.push(list[i])
      if (list[i].visible) {
        this.addCheckbox(list[i].label, list[i].checked, list[i].coords)
      }
    }

    this.setupVisibleUI()

    if (width) {
      this.background.width = width
    } else {
      this.background.width = 280
    }
  }

  public isChecked(index) {
    return this.visibleElements[index].checked
  }

  public clearCheckBoxes() {
    for (const checkBox of this.visibleElements) {
      checkBox.hide()
    }
    this.visibleElements = []
  }
}

setSection(questBackground, resources.backgrounds.promptBackground)
questBackground.hAlign = 'right'
questBackground.vAlign = 'top'
questBackground.width = 280
questBackground.height = 50
questBackground.positionY = -20
questBackground.positionX = 10
questBackground.visible = false

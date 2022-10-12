export const textOffset = new Transform({
  position: new Vector3(0, 2.5, 0),
})

export function addLabel(text: string, parent: IEntity, height?: number) {
  let label = new Entity()
  label.setParent(parent)
  label.addComponent(new Billboard())
  label.addComponent(
    height
      ? new Transform({
        position: new Vector3(0, height, 0),
      })
      : textOffset
  )
  label.addComponent(new TextShape(text))
  label.getComponent(TextShape).fontSize = 5
  label.getComponent(TextShape).color = Color3.Red()

  engine.addEntity(label)
}

export function spawnFog(position: Vector3) {

    const plane = new Entity()


    plane.addComponent(new Transform({ position: position }))
    let uvs = [
        0, 0,
        1, 0,
        1, 1,
        0, 1,


        0, 0,
        0, 0,
        0, 0,
        0, 0,
    ]

    plane.addComponent(new PlaneShape())
    plane.getComponent(PlaneShape).uvs = uvs
    plane.addComponent(new Billboard())
    plane.getComponent(Transform).scale.set(10, 10, 5)

    const myTexture = new Texture("images/EpicMilk.png")
    //Create a material
    const myMaterial = new Material()
    myMaterial.castShadows = false
    myMaterial.albedoTexture = myTexture
    myMaterial.albedoColor = new Color4(0, 1, 1, 0.100)
    myMaterial.transparencyMode = 2
    myMaterial.metallic = 1
    myMaterial.roughness = 0

    //Assign the material to the entity
    plane.addComponent(myMaterial)
    engine.addEntity(plane)
    return plane
}
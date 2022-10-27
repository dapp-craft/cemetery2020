import { Reward } from "src/halloweenQuests/loot"
import { progression, updateProgression } from "src/halloweenQuests/progression"
import { eggTree } from "src/resources/model_paths"




const easterEgg = new Entity()
engine.addEntity(easterEgg)
easterEgg.addComponentOrReplace(new Transform({
    position: new Vector3(0, 0, 0),
    scale: new Vector3(1, 1, 1)
}))
easterEgg.addComponentOrReplace(new GLTFShape(eggTree))



export function addEasterEgg() {
    log('intro2 ' + progression.data.NPCIntroDay2)
    log('egg2 ' + progression.data.egg2)
    if (progression.data.egg2 != undefined || !progression.data.NPCIntroDay2) return

    log('Add easter egg')



    easterEgg.addComponent(new OnPointerDown(
        () => {
            log('eastered!')

            const rewardDummy = new Entity()
            rewardDummy.addComponent(new Transform({ position: new Vector3(62.7, 0, 47) }))
            engine.addEntity(rewardDummy)
            const reward = new Reward(rewardDummy, 'egg2', { position: new Vector3(0, 1, 0), scale: new Vector3(2, 2, 2) }, true, () => {
                executeTask(async () => {
                    if (await updateProgression('egg2')) {
                        progression.data['egg2'] = true
                        progression.progressionChanged = true
                        rewardDummy.getComponent(Transform).position.y = -4
                    }
                })
            })

            easterEgg.removeComponent(OnPointerDown)
        },
        {
            showFeedback: true,
            hoverText: '???',
            distance: 1
        }
    ))
}
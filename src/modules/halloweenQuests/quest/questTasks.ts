import {QuestUI} from './questUI'
import {Coords, HalloweenData, QuestItem} from './types'

export let quest

export class questUITasks{
    data: HalloweenData
    day: number

    day1():QuestItem[] {
        return [
            {
                label: 'Talk with bat',
                checked: this.data.talkBat,
                visible: this.day >= 0,
                coords: Coords.GenesisCoords
            },
            {
                label: 'Visit all 10 houses',
                checked: this.data.allHouses,
                visible: this.data.talkBat,
                coords: Coords.CemeteryCoords
            },
            {
                label: 'Listen Music',
                checked: this.data.phone,
                visible: this.data.talkBat,
                coords: Coords.CemeteryCoords
            },
            {
                label: 'Meet girl near '+Coords.GenesisCoords,
                checked: this.data.meetGirl,
                visible: this.data.phone,
                coords: Coords.GenesisCoords
            },
            {
                label: 'Collect all the candy',
                checked: this.data.pumpkinDone,
                visible: this.data.meetGirl,
                coords: Coords.GenesisCoords
            },
            // {
            //     label: 'Search the wearables building',
            //     checked: this.data.w1Found,
            //     visible: this.data.pumpkinDone,
            //     coords: Coords.GenesisCoords
            // },
            {
                label: 'Return to the girl',
                checked: this.data.w1Found,
                visible: this.data.pumpkinDone,
                coords: Coords.GenesisCoords
            }
        ]
    }

    day2():QuestItem[] {
        return [
            {
                label: 'Talk to Old lady',
                checked: this.data.NPCIntroDay2,
                visible: true,
                coords: Coords.GenesisCoords
            },
            {
                label: 'Talk to blue ghost',
                checked: this.data.ghostsDone,
                visible: this.data.NPCIntroDay2,
                coords: Coords.CemeteryCoords
            },
            {
                label: 'Return ghosts to their graves',
                checked: this.data.ghostsDone,
                visible: this.data.ghostsDone,
                coords: Coords.CemeteryCoords
            },
            {
                label: 'Break into graveyard shack',
                checked: this.data.w2Found,
                visible: this.data.ghostsDone,
                coords: Coords.CemeteryCoords
            }
        ];
    }

    day3():QuestItem[] {
        return [
            {
                label: 'Talk to the old lady',
                checked: this.data.NPCIntroDay3,
                visible: true,
                coords: Coords.GenesisCoords
            },
            {
                label: 'Talk to the archeologist',
                checked: this.data.puzzleDone,
                visible: this.data.NPCIntroDay3,
                coords: Coords.TempleCoords
            },
            {
                label: 'Solve the Temple puzzles',
                checked: this.data.w3Found,
                visible: this.data.puzzleDone,
                coords: Coords.TempleCoords
            }
        ];
    }

    day4():QuestItem[] {
        return [
            {
                label: 'Talk to the old lady',
                checked: this.data.NPCIntroDay4,
                visible: true,
                coords: Coords.GenesisCoords
            },
            {
                label: 'Talk to the farmer',
                checked: this.data.monsterDefeated,
                visible: this.data.NPCIntroDay4,
                coords: Coords.FarmCoords
            },
            {
                label: 'Defeat the monster',
                checked: this.data.monsterDefeated,
                visible: this.data.monsterDefeated,
                coords: Coords.FarmCoords
            },
            {
                label: 'Say farewell to the farmer',
                checked: this.data.w4Found,
                visible: this.data.monsterDefeated,
                coords: Coords.FarmCoords
            }
        ];
    }

    day5():QuestItem[] {
        return [
            {
                label: 'Find the old lady',
                checked: this.data.NPCIntroDay5,
                visible: true,
                coords: Coords.GenesisCoords
            },
            {
                label: 'Visit the cult mansion',
                checked: this.data.waypoint5,
                visible: this.data.NPCIntroDay5,
                coords: Coords.Secret
            },
            {
                label: 'Find a way inside',
                checked: false,
                visible: this.data.waypoint5,
                coords: Coords.Secret
            },
            {
                label: 'Defeat the Cult Leader',
                checked: this.data.ghostDefeated,
                visible: this.data.ghostDefeated,
                coords: Coords.Secret
            },
            {
                label: 'Talk to GhostBlaster crew',
                checked: false,
                visible: this.data.ghostDefeated,
                coords: Coords.Secret
            }
        ];
    }
}

let uiTasks = new questUITasks()

export function updateQuestUI(data: HalloweenData, day: number) {
    if (quest == null) {
        quest = new QuestUI([], day)
    }

    /// limit max day w call to api
    uiTasks.data = data
    uiTasks.day = day

    if (data.w4Found && day >= 5) {
        // day 5
        quest.setupUI(uiTasks.day5(), 5)
    } else if (data.w3Found && day >= 4) {
        // day 4
        quest.setupUI(uiTasks.day4(), 4)
    } else if (data.w2Found && day >= 3) {
        // day 3
        quest.setupUI(uiTasks.day3(), 3)
    } else if (data.w1Found && day >= 2) {
        // day2

        quest.setupUI(uiTasks.day2(), 2)
    } else {
        // not started
        if (day <= 0) return

        // day 1
        quest.setupUI(uiTasks.day1(), 1)
    }
}

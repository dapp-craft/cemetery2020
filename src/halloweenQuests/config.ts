import { HalloweenState } from './quest/types'

export const TESTDATA_ENABLED = false
export let IN_PREVIEW: boolean = false

export function setInPreview(val: boolean) {
  IN_PREVIEW = val
}

export const TESTQUESTSTATE: HalloweenState = {
  data: {
    talkBat: false,
    meetGirl: false,

    // day 1
    allHouses: false,
    phone: false,
    pumpkinDone: false,
    w1Found: false,

    // day 2
    NPCIntroDay2: false,
    ghostsDone: false,
    w2Found: false,

    // day 3
    NPCIntroDay3: false,
    puzzleDone: false,
    w3Found: false,

    // day 4
    NPCIntroDay4: false,
    monsterDefeated: false,
    w4Found: false,

    // day 5
    NPCIntroDay5: false,
    waypoint1: false,
    waypoint2: false,
    waypoint3: false,
    waypoint4: false,
    waypoint5: false,
    ghostDefeated: false,
    w5Found: false
  },
  day: 5
}

export const COLOR_GREEN = "#8DFF34FF";

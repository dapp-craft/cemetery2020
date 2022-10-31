import { HalloweenState } from './quest/types'

export const TESTDATA_ENABLED = false
export let IN_PREVIEW: boolean = false

export function setInPreview(val: boolean) {
  IN_PREVIEW = val
}

export const TESTQUESTSTATE: HalloweenState = {
  data: {
    talkBat: true,
    meetGirl: true,

    // day 1
    allHouses: false,
    phone: false,
    pumpkinDone: false,
    w1Found: true,

    // day 2
    NPCIntroDay2: false,
    ghostsDone: false,
    w2Found: true,

    // day 3
    NPCIntroDay3: false,
    puzzleDone: false,
    w3Found: true,

    // day 4
    NPCIntroDay4: false,
    monsterDefeated: false,
    w4Found: true,

    // day 5
    NPCIntroDay5: true,
    waypoint1: false,
    waypoint2: false,
    waypoint3: false,
    waypoint4: false,
    waypoint5: false,
    ghostDefeated: true,
    w5Found: false,
    talkStar: false
  },
  day: 5
}

export const COLOR_GREEN = "#8DFF34FF";

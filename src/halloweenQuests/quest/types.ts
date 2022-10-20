export enum Coords {
  GenesisCoords = `-66,-66`,
  CemeteryCoords = `-65,-55`,
  TempleCoords = `-55,-55`,
  FarmCoords = `-55,-60`,
  Secret = `-55,-70`
}

export type QuestItem = {
  label: string
  checked: boolean
  visible?: boolean
  coords?: string
}

export type HalloweenData = {
  talkBat: boolean
  // day 1
  allHouses: boolean
  phone: boolean
  meetGirl: boolean
  pumpkinDone: boolean
  w1Found: boolean

  // day 2
  NPCIntroDay2: boolean
  ghostsDone: boolean
  w2Found: boolean

  // day 3
  NPCIntroDay3: boolean
  puzzleDone: boolean
  w3Found: boolean

  // day 4
  NPCIntroDay4: boolean
  monsterDefeated: boolean
  w4Found: boolean

  // day 5
  NPCIntroDay5: boolean // ghost buster
  waypoint1: boolean
  waypoint2: boolean
  waypoint3: boolean
  waypoint4: boolean
  waypoint5: boolean
  ghostDefeated: boolean
  w5Found: false

  // extra
  house1?: boolean
  house2?: boolean
  house3?: boolean
  egg1?: boolean
  egg2?: boolean
  egg3?: boolean
  egg4?: boolean
  egg5?: boolean
}

export type HalloweenState = { data: HalloweenData; day: number }

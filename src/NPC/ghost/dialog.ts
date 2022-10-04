import {updateProgression} from '../../halloweenQuests/progression';
import {Dialog, NPC} from '@dcl/npc-scene-utils';
import * as utils from '@dcl/ecs-scene-utils';
import {Reward} from '../../halloweenQuests/loot';
import {quest} from '../../halloweenQuests/quest';
import * as ui from '@dcl/ui-scene-utils';
import {Ghost} from './ghost';
import {getKey} from '../../hauntedHouse';
import {TTHouse} from "../../house";

///// Trick or treat

// Cat lover
export function catLoverDialog(npc: NPC, doorHouse: TTHouse) {
  return [
    {
      text: `Hey there, I'm a cat guy!`,
      triggeredByNext: () => {
        npc.playAnimation(`HeadShake_No`, true, 1.83)
      },
    },
    {
      text: `To be honest, I don't really have a personality beyond that. Cats are my thing. And that's about it.`,
      triggeredByNext: () => {
        npc.playAnimation(`Lengthy`, true, 1.77)
      },
    },
    {
      text: `The guy writing my lines is kind of stuck. So my character is not very well rounded. ...beyond the fact that I like cats.`,
      triggeredByNext: () => {
        npc.playAnimation(`Cocky`, true, 1.83)
      },
    },
    {
      text: `I love cats. I love every kind of cat`,
      triggeredByNext: () => {
        npc.playAnimation(`HeadShake_No`, true, 1.83)
      },
    },
    {
      text: `I just want to hug them all. But I can't hug every cat.`,
      triggeredByNext: () => {
        npc.playAnimation(`Annoyed_HeadShake`, true, 2.6)
      },
    },
    {
      text: `Can't hug every cat.`,
      triggeredByNext: () => {
        npc.playAnimation(`Dismissing`, true, 3.3)
      },
    },
    {
      text: `I should maybe say something that is more relevant to the story somehow. But anyway, you're not a cat so... see you around`,
      triggeredByNext: () => {
        doorHouse.close()
      },
      isEndOfDialog: true,
    },
  ]
}


// second dialog if you are a cat

// Farmer
export function farmerDialog(npc: NPC, doorHouse: TTHouse) {
  return [
    {
      text: `Howdy there! What brings you over to my old shack here?`,
      triggeredByNext: () => {
        npc.playAnimation(`HeadShake_No`, true, 1.83)
      },
    },
    {
      text: `I real don't like these parties... people scambling around wearing this, wearing that`,
      triggeredByNext: () => {
        npc.playAnimation(`Annoyed_HeadShake`, true, 2.6)
      },
    },
    {
      text: `This girl a while back I was hearing... she be crazy yelling her lungs out like they was killing her or something. Chill out, man!`,
      triggeredByNext: () => {
        npc.playAnimation(`Hard Head`, true, 1.67)
      },
    },
    {
      text: `Anyway, thanks for sticking around while I ramble on about stuff. Here, take this little something as a token of my appreciationing.`,
      triggeredByNext: () => {
        doorHouse.close()
        let r = new Reward(npc, 'house1', {
          position: new Vector3(0, 1.5, 2.5),
        })
      },
      isEndOfDialog: true,
    },
  ]
}


// Mayor's Ghost
export function mayorGhostDialog(npc: NPC, doorHouse: TTHouse) {
  return [
    {
      text: `Hey! What's the matter, you look like you just saw a ghost!`,
      triggeredByNext: () => {
        npc.playAnimation(`talk2`, true, 10.3)
      },
    },
    {
      text: `To you this is a pretend fun night of dressing up... me, this is just who I am.`,
      triggeredByNext: () => {
        npc.playAnimation(`deny2`, true, 1.67)
      },
    },
    {
      text: `I've lived ...or rather been here for a very long time, this place is my home.`,
      triggeredByNext: () => {
        npc.playAnimation(`deny3`, true, 4.97)
      },
    },

    {
      text: `And nothing, or no one is going to get in the way of that. No matter how hard they try.`,
      triggeredByNext: () => {
        npc.playAnimation(`talk2`, true, 3.97)
      },
    },

    {
      text: `You want something to dress up like the other guys? Sure why not. Take this and have fun, see ya.`,
      triggeredByNext: () => {
        // give wearable
        let r = new Reward(npc, 'house2', {
          position: new Vector3(0, 1.5, 2.5),
        })
        doorHouse.close()
      },
      isEndOfDialog: true,
    },
  ]
}


// GhostControl

export function ghostControlDialog(npc: NPC, doorHouse: TTHouse) {
  return [
    {
      text: `What, what is it!`,
      triggeredByNext: () => {
        npc.playAnimation(`Lengthy`, true, 1.77)
      },
    },
    {
      text: `Oh... you're one of those. Messing around collecting junk. Listen, I don't have time for this now.`,
      triggeredByNext: () => {
        npc.playAnimation(`Annoyed_HeadShake`, true, 2.6)
      },
    },
    {
      text: `And to be honest, I don't really care much for all of this. My neighbors started organizing this event, calling crowds of people in to visit.`,
      triggeredByNext: () => {
        npc.playAnimation(`Dismissing`, true, 3.3)
      },
    },
    {
      text: `I don't like it one bit. They're weird, so oddly friendly with everyone... it's creepy, that's what it is.`,
      triggeredByNext: () => {
        npc.playAnimation(`Sarcastic`, true, 2.37)
      },
    },
    {
      text: `I don't know you, you don't know me. So what the hell are you doing banging on my door asking me for things.`,
      triggeredByNext: () => {
        npc.playAnimation(`Angry`, true, 2.23)

        let dummyEnt = new Entity()
        dummyEnt.addComponent(
          new utils.Delay(1000, () => {
            doorHouse.close()
          })
        )
        engine.addEntity(dummyEnt)
      },
    },
    {
      text: `Quit wasting our time.`,

      isEndOfDialog: true,
    },
  ]
}

// Castle guy
export function castleGuyDialog(npc: NPC, doorHouse: TTHouse) {
  return [
    {
      text: `Hey there. So you're trick or treating, are you?`,
      triggeredByNext: () => {
        npc.playAnimation(`Happy Hand Gesture`, true, 2.97)
      },
    },
    {
      text: `Are you even aware of the true origins of all this? The celtic pagan ritual of Samhaim, also known as "all hallows eve"?`,
      triggeredByNext: () => {
        npc.playAnimation(`Angry`, true, 2.23)
      },
    },
    {
      text: `The blurring of the lines between the world of the living and the dead as otherwordly spirits seep into our world, the prophecies and the sacrificial rituals and all that must happen as we enter the start of a cold and dark winter?`,
      triggeredByNext: () => {
        npc.playAnimation(`Cocky`, true, 2.93)
      },
    },
    {
      text: `Or are you just here to stuff your face with candy?`,
      triggeredByNext: () => {
        npc.playAnimation(`Lengthy`, true, 1.77)
      },
    },
    {
      text: `Well... fine. Each to his own. Take this.`,
      triggeredByNext: () => {
        doorHouse.close()
        // give wearable
        let r = new Reward(npc, 'house3', {
          position: new Vector3(0, 1.5, 2.5),
        })
      },
      isEndOfDialog: true,
    },
  ]
}

// Locked house
export const lockedHouse: Dialog[] = [
  {
    text: `Go away, busy here!`,
    isEndOfDialog: true,
  },
  {
    text: `Not a good time, get out!`,
    isEndOfDialog: true,
  },
  {
    text: `I hate interruptions, you're not welcome!`,
    isEndOfDialog: true,
  },
]

// Phone ringing
export const phoneVoice: Dialog[] = [
  {
    text: `Listen up, I want to keep this short because there could be people listening in.`,
  },
  {
    text: `I have some information that could be useful to figure out what happened here, and WHO did this.`,
  },
  {
    text: `Meet me at Genesis Plaza, near the 0,0 coordinates, and I'll tell you what I know.`,
    triggeredByNext: () => {
      quest.checkBox(1)
      quest.showCheckBox(2)
      updateProgression('phone')
    },

    isEndOfDialog: true,
  },
]

/////////////////// DAY 2

/////// Main ghost

// Start of mission

export function missionBrief(ghostCounter: ui.UICounter, ghostUIBck: ui.LargeIcon, ghostsArray: Ghost[]) {
  return [
    {
      text: `Hey there!`,
    },
    {
      text: `Overheard you yesterday, I think ** gah **`,
    },
    {
      text: `I might be able help, maybe`,
    },
    {
      text: `can't concentrate... someone made a mess here, undug some graves`,
    },
    {
      text: `Could you... could you please help us out?`,
    },
    {
      text: `All these loose ghosts, they need to find their resting place. Please guide them back`,
    },
    {
      text: `Then we can have a proper talk`,
      triggeredByNext: () => {
        quest.checkBox(1)
        quest.showCheckBox(2)
        quest.showCheckBox(3)
        //updateProgression('ghostIntro')
        ghostUIBck.image.visible = true
        ghostCounter.uiText.visible = true
        for (let ghost of ghostsArray) {
          ghost.getComponent(OnPointerDown).showFeedback = true
        }
      },
      isEndOfDialog: true,
    },
  ]
}


// When all ghosts are returned
export const missionEnd: Dialog[] = [
  {
    text: `Thank you! Things are so much calmer now.`,
  },
  {
    text: `Ok, so what I wanted to tell you before..`,
  },
  {
    text: `There were strange things going on last night. Someone was trying to bury something, and dug up a lot of graves looking for a spot.`,
  },
  {
    text: `Whoever that was, we chased him out. He left something inside that old shack in the middle of the graveyard.`,
  },
  {
    text: `Take this key for the shack and take a look.`,
    triggeredByNext: () => {
      getKey()
    },
  },
  {
    text: `Hold on to what you find there, I have a feeling that you'll be needing soon.`,
    isEndOfDialog: true,
  },
]

// Thanks
export let thanks: Dialog[] = [
  {
    text: `So much better now, thanks for your help!`,
    isEndOfDialog: true,
  },
]

////// Other Ghosts
export const ghost1Talk: Dialog[] = [
  {
    text: `Ooooh where are my sons!`,
    isEndOfDialog: true,
    isFixedScreen: true,
    portrait: {
      path: 'images/portraits/ghost-mother.png',
      height: 128 + 64,
      width: 128 + 64,
    },
  },
  {
    text: `Kids, mommy is home!`,
    isEndOfDialog: true,
    isFixedScreen: true,
    portrait: {
      path: 'images/portraits/ghost-mother.png',
      height: 128 + 64,
      width: 128 + 64,
    },
  },
  {
    text: `My kids ain't here!`,
    isEndOfDialog: true,
    isFixedScreen: true,
    portrait: {
      path: 'images/portraits/ghost-mother.png',
      height: 128 + 64,
      width: 128 + 64,
    },
  },
]

export const ghost2Talk: Dialog[] = [
  {
    text: `Good heavens! Have gentlemen stopped wearing their ties? Scandalous`,
    isEndOfDialog: true,
    isFixedScreen: true,
    portrait: {
      path: 'images/portraits/ghost-oldtimer.png',
      height: 128 + 64,
      width: 128 + 64,
    },
  },
  {
    text: `I had enough of this topsy-turvy world, not for me.`,
    isEndOfDialog: true,
    isFixedScreen: true,
    portrait: {
      path: 'images/portraits/ghost-oldtimer.png',
      height: 128 + 64,
      width: 128 + 64,
    },
  },
  {
    text: `I refuse to enter that tastelessly improvised shack!`,
    isEndOfDialog: true,
    isFixedScreen: true,
    portrait: {
      path: 'images/portraits/ghost-oldtimer.png',
      height: 128 + 64,
      width: 128 + 64,
    },
  },
]

export const ghost3Talk: Dialog[] = [
  {
    text: `Flying is totally groovy man, I'm not even high.`,
    isEndOfDialog: true,
    isFixedScreen: true,
    portrait: {
      path: 'images/portraits/ghost-hippie.png',
      height: 128 + 64,
      width: 128 + 64,
    },
  },
  {
    text: `I'm off to chill man, keep it fresh.`,
    isEndOfDialog: true,
    isFixedScreen: true,
    portrait: {
      path: 'images/portraits/ghost-hippie.png',
      height: 128 + 64,
      width: 128 + 64,
    },
  },
  {
    text: `No bro, bad mojo in there.`,
    isEndOfDialog: true,
    isFixedScreen: true,
    portrait: {
      path: 'images/portraits/ghost-hippie.png',
      height: 128 + 64,
      width: 128 + 64,
    },
  },
]

export const ghost4Talk: Dialog[] = [
  {
    text: `Je suis tres confus, je ne suis pas mort.`,
    isEndOfDialog: true,
    isFixedScreen: true,
    portrait: {
      path: 'images/portraits/ghost-french.png',
      height: 128 + 64,
      width: 128 + 64,
    },
  },
  {
    text: `Mon dieu, mon corps c'est ici`,
    isEndOfDialog: true,
    isFixedScreen: true,
    portrait: {
      path: 'images/portraits/ghost-french.png',
      height: 128 + 64,
      width: 128 + 64,
    },
  },
  {
    text: `Ce n'est pas moi!`,
    isEndOfDialog: true,
    isFixedScreen: true,
    portrait: {
      path: 'images/portraits/ghost-french.png',
      height: 128 + 64,
      width: 128 + 64,
    },
  },
]

export const ghost5Talk: Dialog[] = [
  {
    text: `I must meet my lover again, I can't bare a world without him.`,
    isEndOfDialog: true,
    isFixedScreen: true,
    portrait: {
      path: 'images/portraits/ghost-lover.png',
      height: 128 + 64,
      width: 128 + 64,
    },
  },
  {
    text: `Reunited at last!`,
    isEndOfDialog: true,
    isFixedScreen: true,
    portrait: {
      path: 'images/portraits/ghost-lover.png',
      height: 128 + 64,
      width: 128 + 64,
    },
  },
  {
    text: `He's not here!`,
    isEndOfDialog: true,
    isFixedScreen: true,
    portrait: {
      path: 'images/portraits/ghost-lover.png',
      height: 128 + 64,
      width: 128 + 64,
    },
  },
]

export const ghost6Talk: Dialog[] = [
  {
    text: `This notion of being a disembodied spirit is perplexing.`,
    isEndOfDialog: true,
    isFixedScreen: true,
    portrait: {
      path: 'images/portraits/ghost-phylo.png',
      height: 128 + 64,
      width: 128 + 64,
    },
  },
  {
    text: `Time to go write about it!`,
    isEndOfDialog: true,
    isFixedScreen: true,
    portrait: {
      path: 'images/portraits/ghost-phylo.png',
      height: 128 + 64,
      width: 128 + 64,
    },
  },
  {
    text: `The physical vessel that I used to inhabit is not here.`,
    isEndOfDialog: true,
    isFixedScreen: true,
    portrait: {
      path: 'images/portraits/ghost-phylo.png',
      height: 128 + 64,
      width: 128 + 64,
    },
  },
]

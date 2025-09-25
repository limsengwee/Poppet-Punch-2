import React from 'react';
import type { Tool, Milestone } from './types';
import { HandSlapToolIcon, HammerIcon, SpiderIcon, KnifeIcon, NeedleIcon, HatIcon, TongueIcon, ShoeIcon, VoodooIcon } from './components/Icons';

export const INITIAL_COINS: number = 480;
export const REWARD_PER_HIT: number = 5;

export const TOOLS: Tool[] = [
  {
    name: 'Hand Slap',
    icon: React.createElement(HandSlapToolIcon),
    prompt: "This tool is handled client-side.",
    cost: 0,
  },
  {
    name: 'Mallet',
    icon: React.createElement(HammerIcon),
    prompt: "Add a large comical cartoon mallet hitting the person on the top of the head. Also add a large, red, throbbing bump on their head where the mallet hit. The style should be exaggerated and funny.",
    cost: 10,
  },
  {
    name: 'Spider Voodoo',
    icon: React.createElement(SpiderIcon),
    prompt: "Superimpose a large, hairy, but cartoony spider crawling on the person's face. Give the person a comically terrified expression with wide eyes.",
    cost: 20,
  },
  {
    name: 'Knife Scar',
    icon: React.createElement(KnifeIcon),
    prompt: "Add a fake, cartoony, 'X' shaped scar with stitches onto the person's cheek. It should look like a harmless prop from a pirate costume, not realistic or gory.",
    cost: 30,
  },
  {
    name: 'Needle Voodoo',
    icon: React.createElement(NeedleIcon),
    prompt: "Superimpose a few cartoony voodoo pins sticking harmlessly out of the person's head. They should look like props, not like they are actually piercing the skin. Keep the tone light and humorous.",
    cost: 40,
  },
  {
    name: 'Cowboy Hat',
    icon: React.createElement(HatIcon),
    prompt: "Place a cowboy hat on the person's head, knocked comically to one side as if they've just been in a cartoon brawl.",
    cost: 50,
  },
  {
    name: 'Tongue Out',
    icon: React.createElement(TongueIcon),
    prompt: "Edit the image so the person's tongue is rolling out of their mouth, long and cartoony, with their eyes looking dizzy and crossed.",
    cost: 60,
  },
    {
    name: 'Shoes Fly Off',
    icon: React.createElement(ShoeIcon),
    prompt: "This is a face portrait. Edit it to create a comedic effect suggesting a powerful impact. Add cartoon motion lines around the head and two shoes flying past the head in the background as if they were knocked off their feet.",
    cost: 70,
  },
  {
    name: 'Classic Voodoo',
    icon: React.createElement(VoodooIcon),
    prompt: "Turn the entire person into a classic voodoo doll. Give them button eyes and stitched lips, maintaining their recognizable facial features but in a cartoon fabric doll style.",
    cost: 100,
  },
];

export const MILESTONES: Milestone[] = [
    { name: '第一击', hitsRequired: 1 },
    { name: '连击', hitsRequired: 5 },
    { name: '狂暴', hitsRequired: 10 },
    { name: '大师', hitsRequired: 20 },
];

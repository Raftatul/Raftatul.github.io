---
title: Godot GAS
date: 2026
summary: "I wanted to see if I could bring the Gameplay Ability System from Unreal Engine to Godot, so I made my own version of it. With this project, I can give abilities to a character at runtime without hard-coding them inside the character."
team: 1
engine: Godot
genre: Prototype
platform: PC
role: Gameplay Programmer
cover: https://i.ytimg.com/vi/QYD6lnw51_Q/maxresdefault.jpg   # replace with images/cover.png when you have one
---

![Godot GAS Demo](https://www.youtube.com/watch?v=QYD6lnw51_Q)

## Overview

For the demo, I made a small test arena with a third-person character. The character doesn't know any ability at the start, he unlock them by entering triggers.

*The character model, animations and ability icons are not mine, they come from the game **Marvel Rivals**. I only used them for this demo.*

## How It Works

The system is a Godot plugin built around 4 parts:

- **Ability System:** A node I add to a character. It holds the character's abilities, effects, attributes and tags.
- **Abilities:** Nodes with virtual functions (activate, end, process...) that I override for each ability. An ability can have a cost and a cooldown, and can be blocked or allowed by tags (for example, the extra jump needs the character to be in the air).
- **Effects:** Resources that change the character. They can be instant, infinite or last for a duration, tick periodically, stack, and scale with the ability level using curves. Cooldowns and costs are effects too.
- **Attributes and Modifiers:** Attributes are values like health or mana. Effects change them through modifiers (add, multiply, divide, override).

Tags are used everywhere to describe the character's state, so abilities and effects can react to each other without hard-coded references. Attributes are synced over the network with RPCs, so the system also works in multiplayer.
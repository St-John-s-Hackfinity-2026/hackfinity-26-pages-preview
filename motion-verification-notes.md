# Motion Verification Notes

- The live preview loads with the countdown showing its actual live values in the hero.
- After scrolling away from the hero, the mission panels render in their base appearance; no timeline card remains cyan-filled merely because it entered the viewport.
- The responsive public registration flow continues to display the expanded additional-member email and contact fields.
- The timeline cards retain their unfilled base state after entering view, confirming the previous permanent scroll-triggered fill is removed. Hover verification continues with a direct card target.
- Direct browser testing confirmed that a phase card fills cyan, emphasizes its icon, and changes its heading color while hovered; moving the pointer away immediately restores its original unfilled appearance.
- Prize-card inspection identified an inline animation transform conflict. The lift is now applied through the card animation state, while scroll-direction transforms remain removed, so hover lift can return cleanly to the base layout.
- Direct browser checks confirmed the champion card lifts to a scale transform with a negative vertical offset on hover, then returns to `transform: none` at its original position after pointer leave.
- Returning to the top of the page restored the countdown to full opacity and its live day/hour/minute/second display.
- Scrolling beyond the hero reduced the countdown to zero opacity and a subtle upward scaled transform while keeping its live component present; returning to the hero restores it as intended.

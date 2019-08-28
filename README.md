# EncumbranceTracker

This [Roll20](http://roll20.net/) script for Dungeons & Dragons 5e games allows for both the basic "Strength x 15" Encumbrance or the Variant Rules, both from the PHB, and allows customization of both the Variant rules and the description of the standard Encumbered condition. Whenever a character sheet's total weight carried exceeds a threshold, the script places a status marker on a character's token to indicate Encumbrance for that character and will show players their character's current Encumbrance along with the requisite effects/penalties. It is currently only for use with the [5e Shaped Sheet](http://github.com/mlenser/roll20-character-sheets/tree/master/5eShaped).

If using the basic encumbrance rules, the Encumbrance Marker will be plain. If using the Variant rules, it will also display a badge with a number corresponding to the appropriate Variant level.

Changes made to a character sheet (adding equipment, currency, etc.) updates all of that character's tokens with the appropriate Encumbrance Marker. Also, characters with any level of encumbrance will have their tokens updated with the corresponding Encumbrance Marker whenever they are dragged to the VTT.

## Encumbrance Marker

The Encumbrance Marker is the status marker used to indicate encumbrance, and defaults to the "snail" status marker. The GM can change the Encumbrance Marker to any status marker desired by using the "Change Marker" button.

Note that because EncumbranceTracker updates status markers automatically, there could be conflict with scripts such as [StatusInfo](https://github.com/RobinKuiper/Roll20APIScripts/tree/master/StatusInfo), [ExhaustionTracker](https://github.com/blawson69/ExhaustionTracker), and others that also modify status markers. If changing the Encumbrance Marker, **make sure you choose a status marker that is not being used by another script.**

## Commands

`!heavy config` Shows the configuration menu where you can switch between Basic and Variant rules, customize the basic encumbrance penalty and the variant levels, and change the Encumbrance Marker. GM only.

`!heavy show` Players can select their character tokens and get a description of their encumbrance level whispered to them.

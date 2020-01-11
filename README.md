# EncumbranceTracker

> **New in v0.2:** EncumbranceTracker has been updated to support the new [custom token markers](https://wiki.roll20.net/Custom_Token_Markers).

This [Roll20](http://roll20.net/) script for Dungeons & Dragons 5e games allows for both the basic "Strength x 15" Encumbrance or the Variant Rules, both from the PHB, and allows customization of both the Variant rules and the description of the standard Encumbered condition. Whenever a character sheet's total weight carried exceeds a threshold, the script places a status marker on a character's token to indicate Encumbrance for that character and will show players their character's current Encumbrance along with the requisite effects/penalties. It is currently only for use with the [5e Shaped Sheet](http://github.com/mlenser/roll20-character-sheets/tree/master/5eShaped).

If using the basic encumbrance rules, the Encumbrance Marker will be plain. If using the Variant rules, it will also display a badge with a number corresponding to the appropriate Variant level.

Changes made to a character sheet (adding equipment, currency, etc.) updates all of that character's tokens with the appropriate Encumbrance Marker. Also, characters with any level of encumbrance will have their tokens updated with the corresponding Encumbrance Marker whenever they are dragged to the VTT.

## Encumbrance Rules

EncumbranceTracker defaults to the basic rules, but you can still modify the encumbrance penalty description if you wish. This will not provide more than one level, however. To use more than one level of encumbrance, you must enable the Variant Rules using the "Switch to Variant Rules" button. Again, it will default to the PHB Variant Rules but you can edit these to your liking. You can also add a level beyond the default, allowing for three levels of encumbrance effects.

Switching between Basic and Variant Rules or changing/adding levels will update all character tokens with new Encumbrance Markers Based on the new levels.

Once you modify any defaults you can reset them easily with the reset link provided.

## Encumbrance Marker

The Encumbrance Marker is the status marker used to indicate encumbrance, and defaults to the "snail" status marker. The GM can change the Encumbrance Marker to any status marker desired. The Config Menu provides a "Choose Marker" button to display all token markers *including custom token markers* for easy selection, or you can use the "set manually" link to provide the name or name::ID combo for any valid status markers.

Note that because EncumbranceTracker updates status markers automatically, there could be conflict with scripts such as [StatusInfo](https://github.com/RobinKuiper/Roll20APIScripts/tree/master/StatusInfo), [ExhaustionTracker](https://github.com/blawson69/ExhaustionTracker), [CombatTracker](https://github.com/vicberg/Combattracker), and others and others that also modify status markers. If changing the Encumbrance Marker, **make sure you choose a status marker that is not being used by another script.**

## Commands

`!heavy config` Shows the configuration menu where you can switch between Basic and Variant rules, customize the basic encumbrance penalty and the variant levels, and change the Encumbrance Marker. GM only.

`!heavy show` Players can select their character tokens and get a description of their encumbrance level whispered to them.

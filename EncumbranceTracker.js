/*
EncumbranceTracker
Monitors a character's Encumbrance levels on the Roll20 5e Shaped Sheet.

On Github:	https://github.com/blawson69
Contact me: https://app.roll20.net/users/1781274/ben-l
Like this script? Buy me a coffee: https://venmo.com/theRealBenLawson
*/

var EncumbranceTracker = EncumbranceTracker || (function () {
    'use strict';

    //---- INFO ----//

    var version = '0.1',
    debugMode = true,
    styles = {
        box:  'background-color: #fff; border: 1px solid #000; padding: 8px 10px; border-radius: 6px; margin-left: -40px; margin-right: 0px;',
        button: 'background-color: #000; border-width: 0px; border-radius: 5px; padding: 5px 8px; color: #fff; text-align: center;',
        textButton: 'background-color: transparent; border: none; padding: 0; color: #8e342a; text-decoration: underline;',
        buttonWrapper: 'text-align: center; margin: 14px 0; clear: both;',
        code: 'font-family: "Courier New", Courier, monospace; background-color: #ddd; color: #000; padding: 2px 4px;',
        block: 'margin: 6px 12px; padding: 3px; border-left: solid 1px #ccc;',
        alert: 'color: #C91010; font-size: 1.5em; font-weight: bold; font-variant: small-caps; text-align: center;'
    },

    checkInstall = function () {
        if (!_.has(state, 'EncumbranceTracker')) state['EncumbranceTracker'] = state['EncumbranceTracker'] || {};
        if (typeof state['EncumbranceTracker'].encumbranceMarker == 'undefined') state['EncumbranceTracker'].encumbranceMarker = 'snail';
        if (typeof state['EncumbranceTracker'].encumberedCharacters == 'undefined') state['EncumbranceTracker'].encumberedCharacters = [];
        if (typeof state['EncumbranceTracker'].encumbranceLevels == 'undefined') setEncumbranceLevelDefaults();
        if (typeof state['EncumbranceTracker'].nonVariantCondition == 'undefined') setNonVariantCondition();
        if (typeof state['EncumbranceTracker'].useVariant == 'undefined') state['EncumbranceTracker'].useVariant = false;
        if (typeof state['EncumbranceTracker'].usingVariantDefault == 'undefined') state['EncumbranceTracker'].usingVariantDefault = true;
        if (typeof state['EncumbranceTracker'].usingNonVariantDefault == 'undefined') state['EncumbranceTracker'].usingNonVariantDefault = true;
        log('--> EncumbranceTracker v' + version + ' <-- Initialized');
        if (debugMode) {
            var d = new Date();
            showAdminDialog('Debug Mode', 'EncumbranceTracker v' + version + ' has loaded at ' + d.toLocaleTimeString());
        }
    },

    //----- INPUT HANDLER -----//

    handleInput = function (msg) {
        if (msg.type == 'api' && msg.content.startsWith('!heavy')) {
            var parms = msg.content.split(/\s+/i);
            if (parms[1]) {
                switch (parms[1]) {
                    case 'set-marker':
                        if (playerIsGM(msg.playerid)) setMarker(msg, msg.content.split(/\s+/i).pop().toLowerCase());
                        break;
                    case 'markers':
                        if (playerIsGM(msg.playerid)) showMarkers();
                        break;
                    case 'toggle-variant':
                        if (playerIsGM(msg.playerid)) toggleVariant();
                        break;
                    case 'edit-nondesc':
                        if (playerIsGM(msg.playerid)) editNonVariantCondition(msg.content);
                        break;
                    case 'edit-level':
                        if (playerIsGM(msg.playerid)) editVariantLevel(msg.content);
                        break;
                    case 'delete-level':
                        if (playerIsGM(msg.playerid)) editVariantLevel(msg.content, 'delete');
                        break;
                    case 'reset-levels':
                        if (playerIsGM(msg.playerid)) setEncumbranceLevelDefaults('reset');
                        break;
                    case 'reset-desc':
                        if (playerIsGM(msg.playerid)) setNonVariantCondition('reset');
                        break;
                    case 'show':
                        showEncumbrance(msg);
                        break;
                    case 'config':
                    case 'help':
                    default:
                    if (playerIsGM(msg.playerid)) showConfig();
                        break;
                }
            }
		}
    },

    //---- PRIVATE FUNCTIONS ----//

    showConfig = function () {
        var message = '', marker_style = 'margin: 5px 10px 0 0; display: block; float: left;';
        if (state['EncumbranceTracker'].useVariant == false) {
            message += '<h4>Basic Encumbrance</h4>Characters are Encumbered once the total weight they carry exceeds 15 times their Strength score. Once encumbered, their token will display the Encumbrance Marker and send the following to chat:';
            message += '<div style="' + styles.block + '">' + state['EncumbranceTracker'].nonVariantCondition + ' <a style="' + styles.textButton + '" href="!heavy edit-nondesc --?{Description}">Edit</a>';
            if (!state['EncumbranceTracker'].usingNonVariantDefault) message += '&nbsp;/&nbsp;<a style="' + styles.textButton + '" href="!heavy reset-desc">Reset</a>';
            message += '</div><div style="' + styles.buttonWrapper + '"><a style="' + styles.button + '" href="!heavy toggle-variant">Switch to Variant rules</a></div>';
        } else {
            if (state['EncumbranceTracker'].usingVariantDefault) {
                message += '<h4>Variant Encumbrance</h4>Below are the current Encumbrance Levels based on the Variant rules from the PHB. You may edit them to your liking, but all calculations must be based on the character\'s Strength score. You can have up to 3 Encumbrance levels.<ol>';
            } else {
                message += '<h4>Custom Encumbrance</h4>Below are your customized Encumbrance Levels. Edit them as you like, but all calculations must be based on the character\'s Strength score. You can have up to 3 Encumbrance levels.<ol>';
            }
            var count = 1;
            _.each(state['EncumbranceTracker'].encumbranceLevels, function (level) {
                message += '<li>If you carry weight in excess of <b>' + level.multiplier + '</b> times your Strength, you are <b>' + level.name + '</b>. ' + level.desc;
                message += '<br><a style="' + styles.textButton + '" href="!heavy edit-level --' + level.multiplier + '$?{Multiplier|' + level.multiplier + '}$?{Name|' + level.name + '}$?{Description|' + level.desc + '}">Edit</a>';
                if (count > 1) message += '&nbsp;/&nbsp;<a style="' + styles.textButton + '" href="!heavy delete-level --' + level.multiplier + '">Delete</a>';
                message += '</li>';
                count++;
            });
            if (_.size(state['EncumbranceTracker'].encumbranceLevels) < 3) message += '<li><a style="' + styles.textButton + '" href="!heavy edit-level --0$?{Multiplier}$?{Name}$?{Description}">Add Level</a></li>';
            message += '</ol>';
            if (!state['EncumbranceTracker'].usingVariantDefault) message += '<a style="' + styles.textButton + '" href="!heavy reset-levels">Reset Levels</a>';
            message += '<div style="' + styles.buttonWrapper + '"><a style="' + styles.button + '" href="!heavy toggle-variant">Turn off Variant rules</a></div>';
        }

        message += '<hr /><h4>Encumbrance Marker</h4>' + getMarker(state['EncumbranceTracker'].encumbranceMarker, marker_style)
        + '"' + state['EncumbranceTracker'].encumbranceMarker + '" is the current status marker being used to indicate Encumbrance.'
        + '<div style="' + styles.buttonWrapper + '"><a style="' + styles.button + '" href="!heavy markers">Change Marker</a></div>';

        showAdminDialog('Config Menu', message);
    },

    editNonVariantCondition = function (msg) {
        var desc = msg.split(/\-\-/i).pop().trim();
        if (desc.length > 0) state['EncumbranceTracker'].nonVariantCondition = desc;
        state['EncumbranceTracker'].usingNonVariantDefault = false;
        showConfig();
    },

    editVariantLevel = function (msg, action = '') {
        var parms = msg.split(/\-\-/i);
        var args = parms[1].split('$');
        if (args[0] == 0) action = 'add';

        switch (action) {
            case 'delete':
                state['EncumbranceTracker'].encumbranceLevels = _.reject(state['EncumbranceTracker'].encumbranceLevels, function (lvl) { return lvl.multiplier == args[0]});
                break;
            case 'add':
                state['EncumbranceTracker'].encumbranceLevels.push({multiplier: parseInt(args[1]), name: args[2].trim(), desc: args[3].trim()});
                break;
            default:
                state['EncumbranceTracker'].encumbranceLevels = _.reject(state['EncumbranceTracker'].encumbranceLevels, function (lvl) { return lvl.multiplier == args[0]});
                state['EncumbranceTracker'].encumbranceLevels.push({multiplier: parseInt(args[1]), name: args[2].trim(), desc: args[3].trim()});
        }

        state['EncumbranceTracker'].encumbranceLevels = _.sortBy(state['EncumbranceTracker'].encumbranceLevels, 'multiplier');
        state['EncumbranceTracker'].usingVariantDefault = false;
        showAdminDialog('Update In Progress', 'Updating all character tokens with Custom Encumbrance rules...');
        updateEncumbrance(true);
        showConfig();
    },

    toggleVariant = function () {
        var type = (state['EncumbranceTracker'].useVariant) ? 'Basic' : 'Variant';
        state['EncumbranceTracker'].useVariant = !state['EncumbranceTracker'].useVariant;
        showAdminDialog('Switch In Progress', 'Updating all character tokens with ' + type + ' Encumbrance rules...');
        updateEncumbrance(true);
        showConfig();
    },

    setMarker = function (msg, marker) {
        var status_markers = ['blue', 'brown', 'green', 'pink', 'purple', 'red', 'yellow', 'all-for-one', 'angel-outfit', 'archery-target', 'arrowed', 'aura', 'back-pain', 'black-flag', 'bleeding-eye', 'bolt-shield', 'broken-heart', 'broken-shield', 'broken-skull', 'chained-heart', 'chemical-bolt', 'cobweb', 'dead', 'death-zone', 'drink-me', 'edge-crack', 'fishing-net', 'fist', 'fluffy-wing', 'flying-flag', 'frozen-orb', 'grab', 'grenade', 'half-haze', 'half-heart', 'interdiction', 'lightning-helix', 'ninja-mask', 'overdrive', 'padlock', 'pummeled', 'radioactive', 'rolling-bomb', 'screaming', 'sentry-gun', 'skull', 'sleepy', 'snail', 'spanner', 'stopwatch', 'strong', 'three-leaves', 'tread', 'trophy', 'white-tower'];
        if (_.find(status_markers, function (tmp) {return tmp === marker; })) {
            var tokens = findObjs({ _type: 'graphic' });
            tokens = _.filter(tokens, function (token) { return token.get('status_' + state['EncumbranceTracker'].encumbranceMarker) != false && token.get('represents') != ''; });
            _.each(tokens, function (token) { token.set('status_' + state['EncumbranceTracker'].encumbranceMarker, false); });
            state['EncumbranceTracker'].encumbranceMarker = marker;
            updateEncumbrance(true);
        } else {
            showAdminDialog('Error', 'The status marker "' + marker + '" is invalid. Please try again.');
        }
        showConfig();
    },

    showMarkers = function () {
        var status_markers = ['blue', 'brown', 'green', 'pink', 'purple', 'yellow', 'snail', 'half-haze', 'back-pain'];
        var message = '<table style="border: 0; width: 100%;" cellpadding="0" cellspacing="2">';
        _.each(status_markers, function(marker) {
            message += '<tr><td>' + getMarker(marker, 'margin-right: 10px;') + '</td><td style="white-space: nowrap; width: 100%;">' + marker + '</td>';
            if (marker == state['EncumbranceTracker'].encumbranceMarker) {
                message += '<td style="text-align: center;">Current</td>';
            } else {
                message += '<td style="text-align: center; white-space: nowrap; padding: 7px;"><a style="' + styles.button + '" href="!heavy set-marker ' + marker + '">Set Marker</a></td>';
            }
            message += '</tr>';
        });
        message += '<tr><td colspan="3" style="text-align: center; padding: 7px;"><a style="' + styles.button + '" href="!heavy config">&#9668; Back</a> &nbsp; <a style="'
        + styles.button + '" href="!heavy set-marker &#63;&#123;Status Marker&#124;&#125;">Different Marker</a></td></tr>';
        message += '</table>';
        showAdminDialog('Choose Encumbrance Marker', message);
    },

    getMarker = function (marker, style = '') {
        let X = '';
        let marker_style = 'width: 24px; height: 24px;';
        var marker_pos = {red:"#C91010",  blue: "#1076C9",  green: "#2FC910",  brown: "#C97310",  purple: "#9510C9",  pink: "#EB75E1",  yellow: "#E5EB75",  dead: "X",  skull: 0, sleepy: 34, "half-heart": 68, "half-haze": 102, interdiction: 136, snail: 170, "lightning-helix": 204, spanner: 238, "chained-heart": 272, "chemical-bolt": 306, "death-zone": 340, "drink-me": 374, "edge-crack": 408, "ninja-mask": 442, stopwatch: 476, "fishing-net": 510, overdrive: 544, strong: 578, fist: 612, padlock: 646, "three-leaves": 680, "fluffy-wing": 714, pummeled: 748, tread: 782, arrowed: 816, aura: 850, "back-pain": 884, "black-flag": 918, "bleeding-eye": 952, "bolt-shield": 986, "broken-heart": 1020, cobweb: 1054, "broken-shield": 1088, "flying-flag": 1122, radioactive: 1156, trophy: 1190, "broken-skull": 1224, "frozen-orb": 1258, "rolling-bomb": 1292, "white-tower": 1326, grab: 1360, screaming: 1394,  grenade: 1428,  "sentry-gun": 1462,  "all-for-one": 1496,  "angel-outfit": 1530,  "archery-target": 1564};

        if (typeof marker_pos[marker] === 'undefined') return false;

        if (Number.isInteger(marker_pos[marker])) {
            marker_style += 'background-image: url(https://roll20.net/images/statussheet.png);'
            + 'background-repeat: no-repeat; background-position: -' + marker_pos[marker] + 'px 0;';
        } else if (marker_pos[marker] === 'X') {
            marker_style += 'color: #C91010; font-size: 32px; font-weight: bold; text-align: center; padding-top: 5px; overflow: hidden;';
            X = 'X';
        } else {
            marker_style += 'background-color: ' + marker_pos[marker] + '; border: 1px solid #fff; border-radius: 50%;';
        }

        marker_style += style;

        return '<div style="' + marker_style + '">' + X + '</div>';
    },

    changeEncumbrance = function (char_id, silent = false) {
        // Updates all PC character tokens and sends an explanation of the current Encumbrance level
        var message = '', char = getObj('character', char_id);
        if (char && char.get('controlledby') != '') {
            var char_str = parseInt(getAttrByName(char_id, 'strength'));
            var weight_total = parseInt(getAttrByName(char_id, 'weight_total'));
            var tokens = findObjs({ represents: char_id });

            if (state['EncumbranceTracker'].useVariant == false) {
                if (weight_total > char_str * 15) {
                    _.each(tokens, function(token) {
                        token.set('status_' + state['EncumbranceTracker'].encumbranceMarker, true);
                    });
                    if (!_.find(state['EncumbranceTracker'].encumberedCharacters, function (x) { return x == char_id; })) state['EncumbranceTracker'].encumberedCharacters.push(char_id);
                    message = 'You are <b>Encumbered.</b> ' + state['EncumbranceTracker'].nonVariantCondition;
                } else {
                    _.each(tokens, function(token) {
                        token.set('status_' + state['EncumbranceTracker'].encumbranceMarker, false);
                    });
                    if (_.find(state['EncumbranceTracker'].encumberedCharacters, function (x) { return x == char_id; })) {
                        state['EncumbranceTracker'].encumberedCharacters = _.reject(state['EncumbranceTracker'].encumberedCharacters, function (x) { return x == char_id; });
                        message = 'You are no longer Encumbered.';
                    }
                }
            } else {
                var char_level, level, levels = _.sortBy(state['EncumbranceTracker'].encumbranceLevels, 'level');
                char_level = _.findLastIndex(levels, function (lvl) { return (weight_total > (char_str * lvl.multiplier)); });

                if (char_level == -1) {
                    _.each(tokens, function(token) {
                        token.set('status_' + state['EncumbranceTracker'].encumbranceMarker, false);
                    });
                    if (_.find(state['EncumbranceTracker'].encumberedCharacters, function (x) { return x == char_id; })) {
                        state['EncumbranceTracker'].encumberedCharacters = _.reject(state['EncumbranceTracker'].encumberedCharacters, function (x) { return x == char_id; });
                        message = 'You are no longer Encumbered.';
                    }
                } else {
                    level = levels[char_level];
                    _.each(tokens, function(token) {
                        token.set('status_' + state['EncumbranceTracker'].encumbranceMarker, (char_level + 1) );
                    });
                    if (!_.find(state['EncumbranceTracker'].encumberedCharacters, function (x) { return x == char_id; })) state['EncumbranceTracker'].encumberedCharacters.push(char_id);
                    message = 'You are <b>' + level.name + ':</b> ' + level.desc;
                }
            }

            // Skip dialog if intended to be silent or if already unencumbered
            if (!silent && message.length > 0) showDialog('Encumbrance', message, char.get('name'), false);
        } else {
            showAdminDialog('Error', 'Invalid character ID!');
        }
    },

    updateEncumbrance = function (silent = false) {
        var chars = findObjs({ _type: 'character' });
        chars = _.filter(chars, function (char) { return char.get('controlledby') != ''; });
        if (chars) {
            state['EncumbranceTracker'].encumberedCharacters = [];
            _.each(chars, function (char) {
                changeEncumbrance(char.get('id'), silent);
            });
        }
    },

    showEncumbrance = function (msg) {
        _.each(msg.selected, function (obj) {
            var message, char, token = getObj(obj._type, obj._id);
            if (token) char = getObj('character', token.get('represents'));
            if (char) {
                var char_str = parseInt(getAttrByName(char.get('id'), 'strength'));
                var weight_total = parseInt(getAttrByName(char.get('id'), 'weight_total'));

                if (state['EncumbranceTracker'].useVariant == false) {
                    if (weight_total > (char_str * 15)) {
                        message = 'You are <b>Encumbered.</b> ' + state['EncumbranceTracker'].nonVariantCondition;
                    } else {
                        message = 'You are not Encumbered.';
                    }
                } else {
                    var char_level, levels = _.sortBy(state['EncumbranceTracker'].encumbranceLevels, 'level');
                    char_level = _.findLastIndex(levels, function (lvl) { return (weight_total > (char_str * lvl.multiplier)); });
                    if (char_level == -1) {
                        message = 'You are not Encumbered.';
                    } else {
                        var level = levels[char_level];
                        message = 'You are <b>' + level.name + ':</b> ' + level.desc;
                    }
                }
                showDialog('Encumbrance', message, char.get('name'), true);
            } else {
                showDialog('Error', 'Invalid token!', char.get('name'), true);
            }
        });
    },

    setNonVariantCondition = function (reset = '') {
        state['EncumbranceTracker'].nonVariantCondition = 'Your speed is reduced to 5 feet.';
        state['EncumbranceTracker'].usingNonVariantDefault = true;
        if (reset == 'reset') showConfig();
    },

    setEncumbranceLevelDefaults = function (reset = '') {
        state['EncumbranceTracker'].encumbranceLevels = [];
        state['EncumbranceTracker'].encumbranceLevels.push({level: 1, multiplier: 5, name: 'Encumbered', desc: 'Your speed is reduced by 10 feet.'});
        state['EncumbranceTracker'].encumbranceLevels.push({level: 2, multiplier: 10, name: 'Heavily Encumbered', desc: 'Your speed is reduced by 20 feet. You have disadvantage on ability checks, attack rolls, and saving throws that use Strength, Dexterity, or Constitution.'});
        state['EncumbranceTracker'].usingVariantDefault = true;
        if (reset == 'reset') {
            showAdminDialog('Update In Progress', 'Updating all character tokens with the default Variant Encumbrance rules...');
            updateEncumbrance(true);
            showConfig();
        }
    },

    showDialog = function (title, content, character = '', silent = false) {
		// Outputs a 5e Shaped dialog box to players/characters
        var prefix = '', char_name = '';
        if (silent && character.length != 0) prefix = '/w "' + character + '" ';
        if (character.length != 0) char_name = ' {{show_character_name=1}} {{character_name=' + character + '}}';
        var message = prefix + '&{template:5e-shaped} {{title=' + title + '}} {{text_big=' + content + '}}' + char_name;
        sendChat('EncumbranceTracker', message, null, {noarchive:true});
	},

    showAdminDialog = function (title, content, character = '') {
		// Whispers a 5e Shaped dialog box to the GM
        if (character != '') character = ' {{show_character_name=1}} {{character_name=' + character + '}}';
        var message = '/w GM &{template:5e-shaped} {{title=' + title + '}} {{text_big=' + content + '}}' + character;
        sendChat('EncumbranceTracker', message, null, {noarchive:true});
	},

    handleEncumbranceChange = function (obj, prev) {
        if (obj.get('name') == 'weight_total') {
            changeEncumbrance(obj.get('characterid'));
        }
    },

    handleTokenChange = function (obj, prev) {
        if (obj.get('represents') && obj.get('represents') != '' && obj.get('represents') != 'undefined') {
            changeEncumbrance(obj.get('represents'), true);
        }
    },

    //---- PUBLIC FUNCTIONS ----//

    registerEventHandlers = function () {
		on('chat:message', handleInput);
        on('change:attribute', handleEncumbranceChange);
        on('change:graphic:statusmarkers', handleTokenChange);
        on('add:graphic', handleTokenChange);
	};

    return {
		checkInstall: checkInstall,
		registerEventHandlers: registerEventHandlers
	};
}());

on("ready", function () {
    EncumbranceTracker.checkInstall();
    EncumbranceTracker.registerEventHandlers();
});

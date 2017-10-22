/*
node-suggestive-search v1.8.5
https://github.com/ivanvaladares/node-suggestive-search/
by Ivan Valadares 
http://ivanvaladares.com 
*/

/**
 * @module node-suggestive-search
 */

const fs = require('fs');
const util = require('util');
const _ = require('lodash');
const EventEmitter = require('events');


// http://semplicewebsites.com/removing-accents-javascript
const latinMap = { "Á": "A", "Ă": "A", "Ắ": "A", "Ặ": "A", "Ằ": "A", "Ẳ": "A", "Ẵ": "A", "Ǎ": "A", "Â": "A", "Ấ": "A", "Ậ": "A", "Ầ": "A", "Ẩ": "A", "Ẫ": "A", "Ä": "A", "Ǟ": "A", "Ȧ": "A", "Ǡ": "A", "Ạ": "A", "Ȁ": "A", "À": "A", "Ả": "A", "Ȃ": "A", "Ā": "A", "Ą": "A", "Å": "A", "Ǻ": "A", "Ḁ": "A", "Ⱥ": "A", "Ã": "A", "Ꜳ": "AA", "Æ": "AE", "Ǽ": "AE", "Ǣ": "AE", "Ꜵ": "AO", "Ꜷ": "AU", "Ꜹ": "AV", "Ꜻ": "AV", "Ꜽ": "AY", "Ḃ": "B", "Ḅ": "B", "Ɓ": "B", "Ḇ": "B", "Ƀ": "B", "Ƃ": "B", "Ć": "C", "Č": "C", "Ç": "C", "Ḉ": "C", "Ĉ": "C", "Ċ": "C", "Ƈ": "C", "Ȼ": "C", "Ď": "D", "Ḑ": "D", "Ḓ": "D", "Ḋ": "D", "Ḍ": "D", "Ɗ": "D", "Ḏ": "D", "ǲ": "D", "ǅ": "D", "Đ": "D", "Ƌ": "D", "Ǳ": "DZ", "Ǆ": "DZ", "É": "E", "Ĕ": "E", "Ě": "E", "Ȩ": "E", "Ḝ": "E", "Ê": "E", "Ế": "E", "Ệ": "E", "Ề": "E", "Ể": "E", "Ễ": "E", "Ḙ": "E", "Ë": "E", "Ė": "E", "Ẹ": "E", "Ȅ": "E", "È": "E", "Ẻ": "E", "Ȇ": "E", "Ē": "E", "Ḗ": "E", "Ḕ": "E", "Ę": "E", "Ɇ": "E", "Ẽ": "E", "Ḛ": "E", "Ꝫ": "ET", "Ḟ": "F", "Ƒ": "F", "Ǵ": "G", "Ğ": "G", "Ǧ": "G", "Ģ": "G", "Ĝ": "G", "Ġ": "G", "Ɠ": "G", "Ḡ": "G", "Ǥ": "G", "Ḫ": "H", "Ȟ": "H", "Ḩ": "H", "Ĥ": "H", "Ⱨ": "H", "Ḧ": "H", "Ḣ": "H", "Ḥ": "H", "Ħ": "H", "Í": "I", "Ĭ": "I", "Ǐ": "I", "Î": "I", "Ï": "I", "Ḯ": "I", "İ": "I", "Ị": "I", "Ȉ": "I", "Ì": "I", "Ỉ": "I", "Ȋ": "I", "Ī": "I", "Į": "I", "Ɨ": "I", "Ĩ": "I", "Ḭ": "I", "Ꝺ": "D", "Ꝼ": "F", "Ᵹ": "G", "Ꞃ": "R", "Ꞅ": "S", "Ꞇ": "T", "Ꝭ": "IS", "Ĵ": "J", "Ɉ": "J", "Ḱ": "K", "Ǩ": "K", "Ķ": "K", "Ⱪ": "K", "Ꝃ": "K", "Ḳ": "K", "Ƙ": "K", "Ḵ": "K", "Ꝁ": "K", "Ꝅ": "K", "Ĺ": "L", "Ƚ": "L", "Ľ": "L", "Ļ": "L", "Ḽ": "L", "Ḷ": "L", "Ḹ": "L", "Ⱡ": "L", "Ꝉ": "L", "Ḻ": "L", "Ŀ": "L", "Ɫ": "L", "ǈ": "L", "Ł": "L", "Ǉ": "LJ", "Ḿ": "M", "Ṁ": "M", "Ṃ": "M", "Ɱ": "M", "Ń": "N", "Ň": "N", "Ņ": "N", "Ṋ": "N", "Ṅ": "N", "Ṇ": "N", "Ǹ": "N", "Ɲ": "N", "Ṉ": "N", "Ƞ": "N", "ǋ": "N", "Ñ": "N", "Ǌ": "NJ", "Ó": "O", "Ŏ": "O", "Ǒ": "O", "Ô": "O", "Ố": "O", "Ộ": "O", "Ồ": "O", "Ổ": "O", "Ỗ": "O", "Ö": "O", "Ȫ": "O", "Ȯ": "O", "Ȱ": "O", "Ọ": "O", "Ő": "O", "Ȍ": "O", "Ò": "O", "Ỏ": "O", "Ơ": "O", "Ớ": "O", "Ợ": "O", "Ờ": "O", "Ở": "O", "Ỡ": "O", "Ȏ": "O", "Ꝋ": "O", "Ꝍ": "O", "Ō": "O", "Ṓ": "O", "Ṑ": "O", "Ɵ": "O", "Ǫ": "O", "Ǭ": "O", "Ø": "O", "Ǿ": "O", "Õ": "O", "Ṍ": "O", "Ṏ": "O", "Ȭ": "O", "Ƣ": "OI", "Ꝏ": "OO", "Ɛ": "E", "Ɔ": "O", "Ȣ": "OU", "Ṕ": "P", "Ṗ": "P", "Ꝓ": "P", "Ƥ": "P", "Ꝕ": "P", "Ᵽ": "P", "Ꝑ": "P", "Ꝙ": "Q", "Ꝗ": "Q", "Ŕ": "R", "Ř": "R", "Ŗ": "R", "Ṙ": "R", "Ṛ": "R", "Ṝ": "R", "Ȑ": "R", "Ȓ": "R", "Ṟ": "R", "Ɍ": "R", "Ɽ": "R", "Ꜿ": "C", "Ǝ": "E", "Ś": "S", "Ṥ": "S", "Š": "S", "Ṧ": "S", "Ş": "S", "Ŝ": "S", "Ș": "S", "Ṡ": "S", "Ṣ": "S", "Ṩ": "S", "Ť": "T", "Ţ": "T", "Ṱ": "T", "Ț": "T", "Ⱦ": "T", "Ṫ": "T", "Ṭ": "T", "Ƭ": "T", "Ṯ": "T", "Ʈ": "T", "Ŧ": "T", "Ɐ": "A", "Ꞁ": "L", "Ɯ": "M", "Ʌ": "V", "Ꜩ": "TZ", "Ú": "U", "Ŭ": "U", "Ǔ": "U", "Û": "U", "Ṷ": "U", "Ü": "U", "Ǘ": "U", "Ǚ": "U", "Ǜ": "U", "Ǖ": "U", "Ṳ": "U", "Ụ": "U", "Ű": "U", "Ȕ": "U", "Ù": "U", "Ủ": "U", "Ư": "U", "Ứ": "U", "Ự": "U", "Ừ": "U", "Ử": "U", "Ữ": "U", "Ȗ": "U", "Ū": "U", "Ṻ": "U", "Ų": "U", "Ů": "U", "Ũ": "U", "Ṹ": "U", "Ṵ": "U", "Ꝟ": "V", "Ṿ": "V", "Ʋ": "V", "Ṽ": "V", "Ꝡ": "VY", "Ẃ": "W", "Ŵ": "W", "Ẅ": "W", "Ẇ": "W", "Ẉ": "W", "Ẁ": "W", "Ⱳ": "W", "Ẍ": "X", "Ẋ": "X", "Ý": "Y", "Ŷ": "Y", "Ÿ": "Y", "Ẏ": "Y", "Ỵ": "Y", "Ỳ": "Y", "Ƴ": "Y", "Ỷ": "Y", "Ỿ": "Y", "Ȳ": "Y", "Ɏ": "Y", "Ỹ": "Y", "Ź": "Z", "Ž": "Z", "Ẑ": "Z", "Ⱬ": "Z", "Ż": "Z", "Ẓ": "Z", "Ȥ": "Z", "Ẕ": "Z", "Ƶ": "Z", "Ĳ": "IJ", "Œ": "OE", "ᴀ": "A", "ᴁ": "AE", "ʙ": "B", "ᴃ": "B", "ᴄ": "C", "ᴅ": "D", "ᴇ": "E", "ꜰ": "F", "ɢ": "G", "ʛ": "G", "ʜ": "H", "ɪ": "I", "ʁ": "R", "ᴊ": "J", "ᴋ": "K", "ʟ": "L", "ᴌ": "L", "ᴍ": "M", "ɴ": "N", "ᴏ": "O", "ɶ": "OE", "ᴐ": "O", "ᴕ": "OU", "ᴘ": "P", "ʀ": "R", "ᴎ": "N", "ᴙ": "R", "ꜱ": "S", "ᴛ": "T", "ⱻ": "E", "ᴚ": "R", "ᴜ": "U", "ᴠ": "V", "ᴡ": "W", "ʏ": "Y", "ᴢ": "Z", "á": "a", "ă": "a", "ắ": "a", "ặ": "a", "ằ": "a", "ẳ": "a", "ẵ": "a", "ǎ": "a", "â": "a", "ấ": "a", "ậ": "a", "ầ": "a", "ẩ": "a", "ẫ": "a", "ä": "a", "ǟ": "a", "ȧ": "a", "ǡ": "a", "ạ": "a", "ȁ": "a", "à": "a", "ả": "a", "ȃ": "a", "ā": "a", "ą": "a", "ᶏ": "a", "ẚ": "a", "å": "a", "ǻ": "a", "ḁ": "a", "ⱥ": "a", "ã": "a", "ꜳ": "aa", "æ": "ae", "ǽ": "ae", "ǣ": "ae", "ꜵ": "ao", "ꜷ": "au", "ꜹ": "av", "ꜻ": "av", "ꜽ": "ay", "ḃ": "b", "ḅ": "b", "ɓ": "b", "ḇ": "b", "ᵬ": "b", "ᶀ": "b", "ƀ": "b", "ƃ": "b", "ɵ": "o", "ć": "c", "č": "c", "ç": "c", "ḉ": "c", "ĉ": "c", "ɕ": "c", "ċ": "c", "ƈ": "c", "ȼ": "c", "ď": "d", "ḑ": "d", "ḓ": "d", "ȡ": "d", "ḋ": "d", "ḍ": "d", "ɗ": "d", "ᶑ": "d", "ḏ": "d", "ᵭ": "d", "ᶁ": "d", "đ": "d", "ɖ": "d", "ƌ": "d", "ı": "i", "ȷ": "j", "ɟ": "j", "ʄ": "j", "ǳ": "dz", "ǆ": "dz", "é": "e", "ĕ": "e", "ě": "e", "ȩ": "e", "ḝ": "e", "ê": "e", "ế": "e", "ệ": "e", "ề": "e", "ể": "e", "ễ": "e", "ḙ": "e", "ë": "e", "ė": "e", "ẹ": "e", "ȅ": "e", "è": "e", "ẻ": "e", "ȇ": "e", "ē": "e", "ḗ": "e", "ḕ": "e", "ⱸ": "e", "ę": "e", "ᶒ": "e", "ɇ": "e", "ẽ": "e", "ḛ": "e", "ꝫ": "et", "ḟ": "f", "ƒ": "f", "ᵮ": "f", "ᶂ": "f", "ǵ": "g", "ğ": "g", "ǧ": "g", "ģ": "g", "ĝ": "g", "ġ": "g", "ɠ": "g", "ḡ": "g", "ᶃ": "g", "ǥ": "g", "ḫ": "h", "ȟ": "h", "ḩ": "h", "ĥ": "h", "ⱨ": "h", "ḧ": "h", "ḣ": "h", "ḥ": "h", "ɦ": "h", "ẖ": "h", "ħ": "h", "ƕ": "hv", "í": "i", "ĭ": "i", "ǐ": "i", "î": "i", "ï": "i", "ḯ": "i", "ị": "i", "ȉ": "i", "ì": "i", "ỉ": "i", "ȋ": "i", "ī": "i", "į": "i", "ᶖ": "i", "ɨ": "i", "ĩ": "i", "ḭ": "i", "ꝺ": "d", "ꝼ": "f", "ᵹ": "g", "ꞃ": "r", "ꞅ": "s", "ꞇ": "t", "ꝭ": "is", "ǰ": "j", "ĵ": "j", "ʝ": "j", "ɉ": "j", "ḱ": "k", "ǩ": "k", "ķ": "k", "ⱪ": "k", "ꝃ": "k", "ḳ": "k", "ƙ": "k", "ḵ": "k", "ᶄ": "k", "ꝁ": "k", "ꝅ": "k", "ĺ": "l", "ƚ": "l", "ɬ": "l", "ľ": "l", "ļ": "l", "ḽ": "l", "ȴ": "l", "ḷ": "l", "ḹ": "l", "ⱡ": "l", "ꝉ": "l", "ḻ": "l", "ŀ": "l", "ɫ": "l", "ᶅ": "l", "ɭ": "l", "ł": "l", "ǉ": "lj", "ſ": "s", "ẜ": "s", "ẛ": "s", "ẝ": "s", "ḿ": "m", "ṁ": "m", "ṃ": "m", "ɱ": "m", "ᵯ": "m", "ᶆ": "m", "ń": "n", "ň": "n", "ņ": "n", "ṋ": "n", "ȵ": "n", "ṅ": "n", "ṇ": "n", "ǹ": "n", "ɲ": "n", "ṉ": "n", "ƞ": "n", "ᵰ": "n", "ᶇ": "n", "ɳ": "n", "ñ": "n", "ǌ": "nj", "ó": "o", "ŏ": "o", "ǒ": "o", "ô": "o", "ố": "o", "ộ": "o", "ồ": "o", "ổ": "o", "ỗ": "o", "ö": "o", "ȫ": "o", "ȯ": "o", "ȱ": "o", "ọ": "o", "ő": "o", "ȍ": "o", "ò": "o", "ỏ": "o", "ơ": "o", "ớ": "o", "ợ": "o", "ờ": "o", "ở": "o", "ỡ": "o", "ȏ": "o", "ꝋ": "o", "ꝍ": "o", "ⱺ": "o", "ō": "o", "ṓ": "o", "ṑ": "o", "ǫ": "o", "ǭ": "o", "ø": "o", "ǿ": "o", "õ": "o", "ṍ": "o", "ṏ": "o", "ȭ": "o", "ƣ": "oi", "ꝏ": "oo", "ɛ": "e", "ᶓ": "e", "ɔ": "o", "ᶗ": "o", "ȣ": "ou", "ṕ": "p", "ṗ": "p", "ꝓ": "p", "ƥ": "p", "ᵱ": "p", "ᶈ": "p", "ꝕ": "p", "ᵽ": "p", "ꝑ": "p", "ꝙ": "q", "ʠ": "q", "ɋ": "q", "ꝗ": "q", "ŕ": "r", "ř": "r", "ŗ": "r", "ṙ": "r", "ṛ": "r", "ṝ": "r", "ȑ": "r", "ɾ": "r", "ᵳ": "r", "ȓ": "r", "ṟ": "r", "ɼ": "r", "ᵲ": "r", "ᶉ": "r", "ɍ": "r", "ɽ": "r", "ↄ": "c", "ꜿ": "c", "ɘ": "e", "ɿ": "r", "ś": "s", "ṥ": "s", "š": "s", "ṧ": "s", "ş": "s", "ŝ": "s", "ș": "s", "ṡ": "s", "ṣ": "s", "ṩ": "s", "ʂ": "s", "ᵴ": "s", "ᶊ": "s", "ȿ": "s", "ɡ": "g", "ᴑ": "o", "ᴓ": "o", "ᴝ": "u", "ť": "t", "ţ": "t", "ṱ": "t", "ț": "t", "ȶ": "t", "ẗ": "t", "ⱦ": "t", "ṫ": "t", "ṭ": "t", "ƭ": "t", "ṯ": "t", "ᵵ": "t", "ƫ": "t", "ʈ": "t", "ŧ": "t", "ᵺ": "th", "ɐ": "a", "ᴂ": "ae", "ǝ": "e", "ᵷ": "g", "ɥ": "h", "ʮ": "h", "ʯ": "h", "ᴉ": "i", "ʞ": "k", "ꞁ": "l", "ɯ": "m", "ɰ": "m", "ᴔ": "oe", "ɹ": "r", "ɻ": "r", "ɺ": "r", "ⱹ": "r", "ʇ": "t", "ʌ": "v", "ʍ": "w", "ʎ": "y", "ꜩ": "tz", "ú": "u", "ŭ": "u", "ǔ": "u", "û": "u", "ṷ": "u", "ü": "u", "ǘ": "u", "ǚ": "u", "ǜ": "u", "ǖ": "u", "ṳ": "u", "ụ": "u", "ű": "u", "ȕ": "u", "ù": "u", "ủ": "u", "ư": "u", "ứ": "u", "ự": "u", "ừ": "u", "ử": "u", "ữ": "u", "ȗ": "u", "ū": "u", "ṻ": "u", "ų": "u", "ᶙ": "u", "ů": "u", "ũ": "u", "ṹ": "u", "ṵ": "u", "ᵫ": "ue", "ꝸ": "um", "ⱴ": "v", "ꝟ": "v", "ṿ": "v", "ʋ": "v", "ᶌ": "v", "ⱱ": "v", "ṽ": "v", "ꝡ": "vy", "ẃ": "w", "ŵ": "w", "ẅ": "w", "ẇ": "w", "ẉ": "w", "ẁ": "w", "ⱳ": "w", "ẘ": "w", "ẍ": "x", "ẋ": "x", "ᶍ": "x", "ý": "y", "ŷ": "y", "ÿ": "y", "ẏ": "y", "ỵ": "y", "ỳ": "y", "ƴ": "y", "ỷ": "y", "ỿ": "y", "ȳ": "y", "ẙ": "y", "ɏ": "y", "ỹ": "y", "ź": "z", "ž": "z", "ẑ": "z", "ʑ": "z", "ⱬ": "z", "ż": "z", "ẓ": "z", "ȥ": "z", "ẕ": "z", "ᵶ": "z", "ᶎ": "z", "ʐ": "z", "ƶ": "z", "ɀ": "z", "ﬀ": "ff", "ﬃ": "ffi", "ﬄ": "ffl", "ﬁ": "fi", "ﬂ": "fl", "ĳ": "ij", "œ": "oe", "ﬆ": "st", "ₐ": "a", "ₑ": "e", "ᵢ": "i", "ⱼ": "j", "ₒ": "o", "ᵣ": "r", "ᵤ": "u", "ᵥ": "v", "ₓ": "x" };
String.prototype.latinize = function () { 
	return this.replace(/[^A-Za-z0-9[\] ]/g, (a) => { return latinMap[a] || a; });
};

/**
 * @class
 * @memberof module:node-suggestive-search
 */
const NodeSuggestiveSearch = class {

	constructor (options) {
		this._db = {};
		this._initialized = false;
		this._options = options;

		if (options !== undefined && options.dataBase !== undefined){
			if (options.dataBase.toLowerCase() == "mongodb" || 
				options.dataBase.toLowerCase() == "nedb") {
				this._db = require(`./plugins/${options.dataBase.toLowerCase()}.js`).init(options);
			} else {
				throw new Error("This module requires MongoDB or NeDB!");
			}
		} else {
			this._db = require('./plugins/memory.js').init();
		}

		this._db.on("initialized", () => {
			this._initialized = true;
			
			this.emit('initialized');
		});

		return this;
	}

	//#region private functions

	_clock (start) {
		if (!start){
			return process.hrtime();
		}
		let end = process.hrtime(start);
		let result = (end[1] / 1000000);
		return result > 1 ? `${result.toFixed(0)}ms` : `${result.toFixed(2)}ms`;
	}

	_checkInitialized () {
		if (!this._initialized) {
			throw new Error("Module not initialized!!");
		}
	}

	//https://en.wikipedia.org/wiki/Levenshtein_distance
	_editDistance (s1, s2) {
		s1 = s1.toLowerCase();
		s2 = s2.toLowerCase();

		let costs = new Array();
		for (let i = 0; i <= s1.length; i++) {
			let lastValue = i;
			for (let j = 0; j <= s2.length; j++) {
				if (i == 0){
					costs[j] = j;
				} else {
					if (j > 0) {
						let newValue = costs[j - 1];
						if (s1.charAt(i - 1) != s2.charAt(j - 1)){
							newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
						}
						costs[j - 1] = lastValue;
						lastValue = newValue;
					}
				}
			}
			if (i > 0){
				costs[s2.length] = lastValue;
			}
		}
		return costs[s2.length];
	}

	_similarity (s1, s2) {
		let longer = s1;
		let shorter = s2;
		if (s1.length < s2.length) {
			longer = s2;
			shorter = s1;
		}
		let longerLength = longer.length;
		if (longerLength == 0) {
			return 1.0;
		}
		return (longerLength - this._editDistance(longer, shorter)) / parseFloat(longerLength);
	}

	//https://en.wikipedia.org/wiki/Soundex
	_soundex (str) {
		let string = str.toUpperCase().replace(/[^A-Z]/g, "");
		string = [
			string.substr(0, 1),
			string.substr(1)
				.replace(/A|E|H|I|O|U|W|Y/g, 0)
				.replace(/B|F|P|V/g, 1)
				.replace(/C|G|J|K|Q|S|X|Z/g, 2)
				.replace(/D|T/g, 3)
				.replace(/L/g, 4)
				.replace(/M|N/g, 5)
				.replace(/R/g, 6)
				.replace(/1{2}|2{2}|3{2}|4{2}|5{2}|6{2}/g, "")
				.replace(/0/g, "")
		].join("").substr(0, 4);

		return string +
			(string.length == 4 ? "" : (new Array(5 - string.length)).join("0"));
	}

	_createWordObject (word) {

		let cleanWord = word.toLowerCase().latinize();
		let objWord = { word, cleanWord, soundex: this._soundex(cleanWord), items: {} };

		for (let i = 2; i <= cleanWord.length && i <= 4; i++) {
			objWord[`p${i}i`] = cleanWord.substr(0, i).toLowerCase();
			objWord[`p${i}e`] = cleanWord.substr(cleanWord.length - i, cleanWord.length).toLowerCase();
		}

		return objWord;
	}

	_createItemObject (itemId, itemName, keywords) {

		let objItem = { itemId, itemName };

		if (keywords !== undefined) {
			objItem.keywords = keywords;
		}

		return objItem;
	}

	_splitWords (text) {

		//todo: reserach for a better strategy for splitting words and dates

		let words = [];
		
		//do not split dates
		let dates = text.match(/([^-/. ]{1,10})([.|/|-])([^-/. ]{1,10})([.|/|-])[^-/. ]{1,10}|([0-9]{1,4})([.|/|-])([^-/. ]{2,10})|([^-/. ]{2,10})([.|/|-])([0-9]{1,4})|([0-9]{1,4})([.|/|-])([0-9]{1,4})/g, "$1");

		if (dates !== null){
			dates = dates.map(item => {
				text = text.replace(item, '');
				return item;
			});
			words = words.concat(dates);			
		}

		//do not split numbers with comma or points separators, followed or not by a measurement unit. ex: 1.5 or 1.5L or 1,5ml
		let units = text.match(/([0-9]+[0-9,.]*[0-9]*[a-zA-Z]{1,10})|\d+([,.]\d{2-3})*([.,]\d*)/g, "$1");

		if (units !== null){
			units = units.map(item => {
				if (item.length <= 20){
					text = text.replace(item, '');
				}
				return item;
			}).filter(item => {
				return item.length <= 20; 
			});

			words = words.concat(units);
		}

		if (dates !== null){
			dates = dates.map(item => {
				text += ' ' + item.replace(/[-/.0-9]/gi, ' ').trim(); //return month names to main text
			});			
		}

		//separate words using this regexp pattern
		words = words.concat(text.replace(/[.,/#!$%^&*;:{}=+\-_`~()?<>"”“]/gi, ' ').split(" "));

		return words.map(item => {
			return item.trim().replace(/^["|']/, '').replace(/["|']$/, ''); //remove quotes
		}).filter(item => {
			return (item.length > 0);
		});
	}

	_matchWordsByItemsIds (wordItems, finalWordItems) {
	
		let maxSimilarity = -1;
		let wordItem = null;

		if (finalWordItems === undefined){

			finalWordItems = {};
			finalWordItems.wordsObjects = [];
			finalWordItems.itemsIds = [];
			finalWordItems.finalWords = _.fill(Array(wordItems.length), "");
			finalWordItems.missingWords = [];

			
			//choosing the best column to start
			wordItems.map((word, index) => {
				word.index = index;
				if (word.results.length > 0 && word.results[0].similarity > maxSimilarity){
					maxSimilarity = word.results[0].similarity;
					wordItem = word;
				}
			});

			if (wordItem !== null){
				wordItem.processed = true;
				wordItem.results = wordItem.results[0];
				finalWordItems.itemsIds = wordItem.results.items;

				finalWordItems.finalWords[wordItem.index] = wordItem.results.word;
				finalWordItems.wordsObjects.push(wordItem);
				return this._matchWordsByItemsIds(wordItems, finalWordItems);
			}else{
				return this._matchWordsByItemsIds(wordItems, finalWordItems);
			}

		}else{
			//choosing the best column to continue
			wordItems.map(word => {
				if (word.results.length > 0 && word.processed === undefined){
					if (word.results[0].similarity > maxSimilarity){
						maxSimilarity = word.results[0].similarity;
						wordItem = word;
					}
				}
			});

			//there are no more words to process
			if (wordItem === null){
				finalWordItems.finalWords = finalWordItems.finalWords.filter((word, index) => {
					if (word === "") {
						finalWordItems.missingWords.push(wordItems[index].word);
					}
					return word !== "";
				});
				return finalWordItems;
			}

			wordItem.processed = true;

			for (let i = 0; i < wordItem.results.length && i < 25; i++){
				//discard if is a repeated suggestion without a repeated query
				if (finalWordItems.finalWords.indexOf(wordItem.results[i].word) > -1 &&
					wordItem.results[i].word !== wordItem.word){ 
					continue;
				}

				let arr = _.intersection(wordItem.results[i].items, finalWordItems.itemsIds);
		
				if (arr.length > 0){	
					wordItem.results = wordItem.results[i];
					finalWordItems.itemsIds = arr;
					finalWordItems.finalWords[wordItem.index] = wordItem.results.word;
					finalWordItems.wordsObjects.push(wordItem);
					return this._matchWordsByItemsIds(wordItems, finalWordItems);
				}
			}
	
			//did not find itemsId for this words, go to the next
			return this._matchWordsByItemsIds(wordItems, finalWordItems);

		}

	}

	_getWordsBySoundexAndParts (word) {

		return new Promise((resolve, reject) => {

			//try to find an word is our dictionary using soundex and parts of the word

			//todo: research a better way to improve the performance of this query

			let _word = word.trim().replace(/^["|']/, '').replace(/["|']$/, ''); //remove quotes

			let queryCriteria = [{ soundex: this._soundex(_word) }];

			let wordWithoutAccents = _word.latinize();

			for (let i = 4; i >= 2; i--) {

				if (wordWithoutAccents.length >= i) {

					let objCriteriaIni = {};
					objCriteriaIni[`p${i}i`] = wordWithoutAccents.substr(0, i).toLowerCase();
					queryCriteria.push(objCriteriaIni);

					let objCriteriaEnd = {};
					objCriteriaEnd[`p${i}e`] = wordWithoutAccents.substr(wordWithoutAccents.length - i, wordWithoutAccents.length).toLowerCase();				
					queryCriteria.push(objCriteriaEnd);
				}

			}

			this._db.findWords({ $or: queryCriteria }).then(foundWords => {

				if (foundWords.length > 0) {

					//before return the result, lets give a similarity rank for each result	
					//and filter top 50 most similar result 
					resolve(
						foundWords.map(obj => {
							obj.similarity = this._similarity(obj.word, _word);
							return obj;
						}).sort((x, y) => {
							return ((x.similarity > y.similarity) ? -1 : 1);
						}).slice(0, 50)
					);

				} else {

					//nothing was found... should we try another method?
					//todo: research for another method
					resolve(null);

				}

			}).catch(err => {
				reject(err);
			});

		});

	}

	_getWordsStartingWith (word, limit) {

		return new Promise((resolve, reject) => {

			let queryCriteria = {};
			let hasCriteria = false;

			//create a search criteria from 4 to 2 letters to try to find words that starts like this one
			for (let i = 4; i >= 2; i--) {
				if (word.length >= i) {

					queryCriteria[`p${i}i`] = word.substr(0, i).toLowerCase();

					hasCriteria = true;
					//lets search with only one criteria
					break;
				}
			}

			if (!hasCriteria) {
				return resolve(null);
			}

			//execute the query
			this._db.findWords(queryCriteria).then(foundWords => {

				if (foundWords.length > 0) {

					//return item that begins with same characters, from smallest to biggest and then alphabetically
					resolve(
						foundWords.filter(objWord => {
							return objWord.cleanWord.indexOf(word.toLowerCase()) == 0;
						}).sort((x, y) => {
							if (x.word.length > y.word.length) {
								return 1;
							} else if (x.word.length < y.word.length) {
								return -1;
							}
							return x.word > y.word;
						}).slice(0, ((limit > 0) ? limit : foundWords.length))
					);

				} else {

					resolve(null);

				}

			}).catch(err => {
				reject(err);
			});

		});

	}

	_populateDatabase (itemsJson, itemId, itemName, keywords) {

		return new Promise((resolve, reject) => {

			//create a dictionary like object
			let itemsArray = [];
			let objWords = {};
			let repeatedObjWords = {};

			this._db.cleanDatabase().then(() => {		
				
				itemsJson.map(item => {

					//validate json object
					if (item[itemId] !== undefined && item[itemName] !== undefined){
						itemsArray.push(this._createItemObject(item[itemId], item[itemName], item[keywords]));
					}

				});

				//insert all items in the database
				this._db.insertItem(itemsArray).then(itemsInserted => {

					itemsInserted.map(itemObject => {

						//get words from each item
						let arrWords = this._splitWords(itemObject.itemName);

						//get keywords
						if (itemObject.keywords){
							arrWords = arrWords.concat(this._splitWords(itemObject.keywords));
						}

						arrWords = _.uniq(arrWords);

						let itemId = itemObject.itemId;

						//associate each word with items. ex: {word, [item1, item2, item3...]}
						arrWords.map(word => {

							let strWord = word.toLowerCase();

							//if there is already this word in our dictionary, associate it with this item
							if (strWord in objWords) {

								objWords[strWord].items[itemId] = true;

							} else {
								//keep the word without accent and lowercase

								let objWord = this._createWordObject(word);

								//add this new item into related items of this word
								objWord.items[itemId] = true;

								objWords[strWord] = objWord;

								if (repeatedObjWords[objWord.cleanWord]) {
									repeatedObjWords[objWord.cleanWord].push(strWord);
								} else {
									repeatedObjWords[objWord.cleanWord] = [strWord];
								}

							}

						});

					});

					
					//lets make this module accent insensitive
					//all the similar words will have the same itemsId
					for (let item in repeatedObjWords) {
						let repeatedWordsArray = repeatedObjWords[item];

						if (repeatedWordsArray.length > 1) {

							let itemsId = {};

							//gather all itemsIds from repeated words
							for (let index = 0; index < repeatedWordsArray.length; index++) {
								let objWord = objWords[repeatedWordsArray[index]];

								for (let idResultItem in objWord.items) {
									if (itemsId[idResultItem] !== null) {
										itemsId[idResultItem] = objWord.items[idResultItem];
									}
								}
							}

							//associate all repeated words with those itemsIds
							for (let index = 0; index < repeatedWordsArray.length; index++) {
								let objWord = objWords[repeatedWordsArray[index]];

								objWord.items = itemsId;
							}
						}
					}


					//create a database compatible JSON array from the above dictionary
					let wordsJson = [];
					for (let item in objWords) {
						//transform the key/value itemsId into an array of the keys
						objWords[item].items = _.keys(objWords[item].items);

						wordsJson.push(objWords[item]);
					}

					//insert all words at once in database
					this._db.insertWord(wordsJson).then(() => {

						//let the database create the indexes but don't wait for it
						this._db.createIndexes();

						//return some information about this process
						resolve({ words: wordsJson.length });

					}).catch(err => {
						reject(err);
					});					

				}).catch(err => {
					reject(err);
				});

			}).catch(err => {
				reject(err);
			});						

		});

	}
	
	//#endregion

	/**
	 * Removes an item and its words from the dictionary database.
	 * @param {String} itemId - Id of the item to be removed.
	 * @returns {Promise(JSON)}
	 */
	removeItem (itemId) {

		this._checkInitialized();

		return new Promise((resolve, reject) => {

			let time = this._clock();

			this._db.findItems({ itemId: itemId }).then(existingItem => {

				if (!existingItem || existingItem.length <= 0) {
					return resolve({ timeElapsed: this._clock(time) });
				}

				let arrWords = this._splitWords(existingItem[0].itemName);

				//remove item from items dictionary
				this._db.removeItem({ itemId: itemId }).then(() => {

					//get each word from dictionary and associate with this new item
					//also check if is a repeating word with different accents
					//make a promise for each word and create an array of promises
					let promises = arrWords.map(word => {

						return new Promise((resolve, reject) => {

							//try to find the exact word in our dictionary
							this._db.findWords({ cleanWord: word.toLowerCase().latinize() }).then(foundWords => {

								if (foundWords === null || foundWords.length <= 0) {

									resolve([]);

								} else {

									resolve(foundWords);

								}

							}).catch(err => {
								reject(err);
							});

						});

					});

					Promise.all(promises).then(promiseFoundWords => {

						//remove this itemId from all found words 
						promiseFoundWords.map(foundWordArr => {
							foundWordArr.map(word => {
								word.items = _.without(word.items, itemId);
							});
						});

						let innerPromises = [];

						//delete words with empty itemId 
						promiseFoundWords.map(foundWordArr => {

							foundWordArr.map(word => {

								if (word.items === undefined || word.items.length <= 0) {
									//remove this word from the database because it does not have any more items associated with it

									let innerPromise = new Promise((resolve, reject) => {

										this._db.removeWords({ word: word.word }).then(numRemoved => {
											resolve(numRemoved);
										}).catch(err => {
											reject(err);
										});

									});

									innerPromises.push(innerPromise);

								} else {

									//update this word 
									let innerPromise = new Promise((resolve)  => {

										this._db.updateWordItems(word.cleanWord, word.items).then(numReplaced => {
												resolve(numReplaced);
											}).catch(err => {
												reject(err);
											});

									});

									innerPromises.push(innerPromise);
								}
							});

						});

						Promise.all(innerPromises).then(() => {

							//todo: test if any operation had failed 

							//return some information about this process
							resolve({ timeElapsed: this._clock(time) });

						});

					}).catch(err => {
						reject(err);
					});

				}).catch(err => {
					reject(err);
				});

			}).catch(err => {
				reject(err);
			});

		});

	}
		
	/**
	 * Insert a new item into the dictionary database from json object.
	 * @param {JSON} itemJson - jSon object {itemId: 0 , itemName: "item name", keywords: "keyword1, keyword2..."}.
	 * @param {String} [itemId="itemID"] - Name of the property that contains the ID.
	 * @param {String} [itemName="itemName"] - Name of the property that contains the Name.
	 * @param {String} [keywords="keywords"] - Name of the property that contains the Keywords.
	 * @returns {Promise(JSON)}
	 */
	insertItem (itemJson, itemId = "itemId", itemName = "itemName", keywords = "keywords") {

		this._checkInitialized();

		return new Promise((resolve, reject) => {

			let time = this._clock();

			//validate json object
			if (itemJson[itemId] === undefined || itemJson[itemName] === undefined){
				return reject(new Error('Item must have itemId and itemName!'));
			}

			let itemObject = this._createItemObject(itemJson[itemId], itemJson[itemName], itemJson[keywords]);

			this.removeItem(itemObject.itemId).then(() => {

				//insert item into items dictionary
				this._db.insertItem([itemObject]).then(insertedItem => {

					itemObject = insertedItem[0];

					//get words from item
					let arrWords = this._splitWords(itemObject.itemName);

					//get keywords
					if (itemObject[keywords] !== undefined){
						arrWords = arrWords.concat(this._splitWords(itemObject.keywords));
					}

					//get each word from dictionary and associate with this new item
					//also check if is a repeating word with different accents
					//make a promise for each word and create an array of promises
					let promises = arrWords.map(word => {

						return new Promise((resolve, reject) => {

							//try to find the exact word in our dictionary
							this._db.findWords({ cleanWord: word.toLowerCase().latinize() }).then(foundWord => {

								if (!foundWord || foundWord.length <= 0) {

									resolve(null);

								} else {

									resolve(foundWord);

								}

							}).catch(err => {
								reject(err);
							});

						});

					});

					//now, lets resolve all promises from the array of promises
					Promise.all(promises).then(promiseFoundWords => {

						let notFoundedWords = [];
						let foundedWords = [];
						let foundedWordsDifferentAccents = [];

						//set an array with the not founded words
						//set an array with the founded words
						for (let index = 0; index < promiseFoundWords.length; index++) {
							let foundItem = promiseFoundWords[index];

							if (foundItem === null) {

								notFoundedWords.push(arrWords[index]);

							} else {

								let wordFound = false;

								for (let iWord in foundItem) {
									let objWord = foundItem[iWord];

									if (objWord.word.toLowerCase() == arrWords[index].toLowerCase()) {
										foundedWords.push(arrWords[index]);
										wordFound = true;
									}
								}

								if (!wordFound) {
									foundedWordsDifferentAccents.push(arrWords[index]);
									notFoundedWords.push(arrWords[index]);
								}

							}

						}

						let promises = foundedWords.map(word => {

							return new Promise((resolve, reject) => {
								
								this._db.findWords({ cleanWord: word.toLowerCase().latinize() }).then(foundWords => {

									let updatePromises = foundWords.map(word => {

										//associate with this itemId
										if (word.items.indexOf(itemObject.itemId) < 0){

											word.items.push(itemObject.itemId);

											//send it back to the database
											return new Promise((resolve, reject) => {  
												this._db.updateWordItems(word.cleanWord, word.items).then(() => {
													resolve(true);
												}).catch(err => {
													reject(err);
												});
											});
												
										}

									});

									Promise.all(updatePromises).then(() => {
										resolve(true);
									}).catch(err => {
										reject(err);
									});

								}).catch(err => {
									reject(err);
								});

							});

						});


						Promise.all(promises).then(() => {
							
							//create new words objects to insert into the dictionary
							let objWords = {};

							notFoundedWords.map(word => {
								let objWord = this._createWordObject(word);

								//add this new item into related items of this word
								objWord.items = [itemObject.itemId];

								//mount the array to bulk insert later 
								objWords[word] = objWord;
							});

							//create a database compatible JSON array from the above dictionary
							let wordsJson = [];
							for (let item in objWords) {
								wordsJson.push(objWords[item]);
							}

							//insert all the new words in a bulk insert
							if (wordsJson.length > 0) {

								this._db.insertWord(wordsJson).then(() => {

									//lets treat all similar words with different accents
									if (foundedWordsDifferentAccents.length > 0) {
				
										//associate the words with this new item
										let promises = foundedWordsDifferentAccents.map(word => {

											return new Promise((resolve, reject) => {

												this._db.findWords({ cleanWord: word.toLowerCase().latinize() }).then(existingWords => {
													
													let itemsId = [];
													let updatePromises = [];

													for (let index = 0; index < existingWords.length; index++) {

														existingWords[index].items.map(idItem => {
															if (itemsId.indexOf(idItem) < 0) {
																itemsId.push(idItem);
															}
														});
													}

													if (existingWords.length > 0) {

														itemsId.push(itemObject.itemId);

														//send it back to the database
														updatePromises.push(  
															new Promise((resolve, reject) => {  
																this._db.updateWordItems(word.toLowerCase().latinize(), itemsId).then(() => {
																	resolve(true);
																}).catch(err => {
																	reject(err);
																});
															})
														);

														Promise.all(updatePromises).then(() => {
															resolve(true);
														}).catch(err => {
															reject(err);
														});
														
													}else{
														resolve(true);
													}

												}).catch(err => {
													reject(err);
												});

											});

										});

										Promise.all(promises).then(() => {
											//return some information about this process
											resolve({ timeElapsed: this._clock(time) });
										}).catch(err => {
											reject(err);
										});

									}else{
										//return some information about this process
										resolve({ timeElapsed: this._clock(time)});
									}

								}).catch(err => {
									reject(err);
								});

							}else{
								//return some information about this process
								resolve({ timeElapsed: this._clock(time) });
							}

						});

					}).catch(err => {
						reject(err);
					});

				}).catch(err => {
					reject(err);
				});

			}).catch(() => {
				return reject(new Error("Could not insert this item!"));
			});

		});

	}

	/**
	 * Load the dictionary database from json file.
	 * @param {String} jSonFilePath - path to jSon file.
	 * @param {String} charset - Charset used in file.
	 * @param {String} [itemId="itemID"] - Name of the property that contains the ID.
	 * @param {String} [itemName="itemName"] - Name of the property that contains the Name.
	 * @param {String} [keywords="keywords"] - Name of the property that contains the Keywords.
	 * @returns {Promise(JSON)}
	 */
	loadJson (jSonFilePath, charset = "utf8", itemId = "itemId", itemName = "itemName", keywords = "keywords") {

		this._checkInitialized();

		return new Promise((resolve, reject) => {

			let time = this._clock();

			let itemsJson = null;

			//get the file from the path
			fs.readFile(jSonFilePath, charset, (err, data) => {
				if (err) return reject(err);

				try {
					itemsJson = JSON.parse(data);
				} catch (err) {
					return reject(err);	
				}

				//from the items, lets extract our dictionary 
				this._populateDatabase(itemsJson, itemId, itemName, keywords).then(information => {

					information.items = itemsJson.length;
					information.timeElapsed = this._clock(time);

					//return some information about this process
					resolve(information);

				}).catch(err => {
					reject(err);
				});

			});

		});

	}

	/**
	 * Load the dictionary database from json string.
	 * @param {String} jSonString - String with items.
	 * @param {String} [itemId="itemID"] - Name of the property that contains the ID.
	 * @param {String} [itemName="itemName"] - Name of the property that contains the Name.
	 * @param {String} [keywords="keywords"] - Name of the property that contains the Keywords.
	 * @returns {Promise(JSON)}
	 */
	loadJsonString (jSonString, itemId = "itemId", itemName = "itemName", keywords = "keywords") {

		this._checkInitialized();

		return new Promise((resolve, reject) => {

			let time = this._clock();
			
			let itemsJson = null;

			//get the json string from the parameter
			
			try {
				itemsJson = JSON.parse(jSonString);
			} catch (err) {
				return reject(err);	
			}

			//from the items, lets extract our dictionary 
			this._populateDatabase(itemsJson, itemId, itemName, keywords).then(information => {

				information.items = itemsJson.length;
				information.timeElapsed = this._clock(time);

				//return some information about this process
				resolve(information);

			}).catch(err => {
				reject(err);
			});

		});

	}

	/**
	 * Return itemsId array and words used in the query.
	 * @param {String} words - word(s) used in the search.
	 * @returns {Promise(JSON)}
	 */
	query (words) {

		this._checkInitialized();

		return new Promise((resolve, reject) => {

			let time = this._clock();

			let arrWords = this._splitWords(words);

			if (arrWords.length <= 0) {
				return reject(new Error("No word was given to search!"));
			}

			//create a promise for each word from query and create an array of promises
			let promises = arrWords.map(word => {

				return new Promise((resolve, reject) => {

					//first, lets try to find the exact word in our dictionary
					this._db.findWords({ cleanWord: word.toLowerCase().latinize() }).then(foundWords => {

						//no results :(, lets try with soundex and parts
						if (!foundWords || foundWords.length <= 0) {

							//this function will try to get words in our dictionary that is similar to the word from the query
							this._getWordsBySoundexAndParts(word).then(soudexFoundItems  => {
								if (soudexFoundItems !== null) {
									resolve({ word: word, results: soudexFoundItems });
								} else {
									resolve({ word: word, results: [] });
								}
							}).catch(() => {
								//instead of returning an error, lets return an empty result
								resolve({ word, results: [] });
							});

						} else {

							//sort to return top 10 most similar result 
							foundWords = foundWords.map(obj => {
								obj.similarity = this._similarity(obj.word, word);
								return obj;
							}).sort((x, y) => {
								return ((x.similarity > y.similarity) ? -1 : 1);
							}).slice(0, 10);

							resolve({ word, correct: true, results: foundWords });

						}

					}).catch(err => {
						reject(err);
					});

				});

			});

			//now, lets resolve all promises from the array of promises
			Promise.all(promises).then(items => {

				//items variable contains an array of words objects and results for each word from the query
				// {word: word, results: db.words[]} 
				//if there is any incorrect word, lets choose the best match between the results 
				let objFinal = this._matchWordsByItemsIds(items);
				let arrItemsIds = objFinal.itemsIds;
				let finalWords = objFinal.finalWords;
				let missingWords = objFinal.missingWords;

				//pos search - match quoted expressions, hyphenated words and separated by slashes
				let regExp = /"(.*?)"|'(.*?)'|((?:\w+-)+\w+)|((?:\w+\/|\\)+\w+)/g;
				let quotedStrings = words.match(regExp, "$1");

				let expressions = [];
				let missingExpressions = [];

				// todo: create a better way to check the expressions and repetitions
				// let match;// = regExp.exec(words);
				// console.log(finalWords)
				// console.log(quotedStrings)
				// while (match = regExp.exec(words))
				// 	console.log(match.index + " - " + match[0].length + " - " + match[0]);

				if (quotedStrings !== null && quotedStrings.length > 0){

					quotedStrings = quotedStrings.map(item => {
						return item.replace(/^"(.+(?="$))"$/, '$1').replace(/^'(.+(?='$))'$/, '$1'); //remove quotes
					});

					this._db.findItems({ itemId: { $in: arrItemsIds.slice(0, 100) } }).then(foundItems => {
						
						foundItems = foundItems.filter(item => {
							for (let quotedString in quotedStrings){
								if (item.itemName.search(new RegExp(quotedStrings[quotedString], "ig")) >= 0 ||
									(item.keywords !== null && item.keywords !== undefined && item.keywords.search(new RegExp(quotedStrings[quotedString], "ig")) >= 0)) {
									if (expressions.indexOf(quotedStrings[quotedString]) < 0){
										expressions.push(quotedStrings[quotedString]);
									}
									return item;
								}
							}
						});

						quotedStrings.map(quotedString => {
							if (expressions.indexOf(quotedString) < 0){
								missingExpressions.push(quotedString);
							}
						});

						if (foundItems.length > 0){
							//tranform filtered object items to array of itemsId
							arrItemsIds = [];
							for (let item in foundItems) {
								arrItemsIds.push(foundItems[item].itemId);
							}
						}

						resolve({ query: words, words: finalWords, missingWords, expressions, missingExpressions, itemsId: arrItemsIds, timeElapsed: this._clock(time) });
										
					}).catch(err => {
						reject(err);
					});

				}else{

					resolve({ query: words, words: finalWords, missingWords, expressions, missingExpressions, itemsId: arrItemsIds, timeElapsed: this._clock(time) });

				}

			}).catch(err => {
				reject(err);
			});

		});

	}

	/**
	 * Return words suggestions.
	 * @param {String} words - word(s) to search.
	 * @returns {Promise(JSON)}
	 */
	getSuggestedWords (words) {

		this._checkInitialized();

		return new Promise((resolve, reject) => {

			let time = this._clock();

			let arrWords = this._splitWords(words);

			if (words.lastIndexOf(" ") == words.length - 1) {
				arrWords.push("");
			}

			if (arrWords.length <= 0) {
				return reject(new Error("No word was given to search!"));
			}
			//only one word came from query and no space at the end
			if (arrWords.length == 1 && words.indexOf(" ") == -1) {

				//try to get more words like this one. Limit 5
				this._getWordsStartingWith(arrWords[0].latinize(), 5).then(queryResponse => {

					let arrResponse = [];

					if (queryResponse !== null) {

						for (let index = 0; index < queryResponse.length; index++) {
							arrResponse.push(queryResponse[index].word);
						}

					}

					arrResponse.sort((x, y) => {
						//sort by length and alphabetically
						if (x.length < y.length) {
							return -1;
						}
						else if (x.length > y.length) {
							return 1;
						}
						else {
							if (x > y) {
								return -1;
							}
							else if (x < y) {
								return 1;
							}
							return 0;
						}

					});

					resolve({ suggestions: arrResponse, timeElapsed: this._clock(time) });

				},
				err => {
					reject(err);
				});


			} else { //one word with space at the end or more words came from the query.

				//make a promise for each word from query, but last one, and create an array of promises
				let promises = arrWords.slice(0, arrWords.length - 1).map(word => {

					return new Promise((resolve, reject) => {

						//try to find the exact word in our dictionary
						this._db.findWords({ cleanWord: word.toLowerCase().latinize() }).then(foundWords => {

							if (!foundWords || foundWords.length <= 0) {

								//instead of returning an error, lets return a null
								resolve(null);

							} else {

								//sort to return the best match
								foundWords = foundWords.map((obj) => {
									obj.similarity = this._similarity(obj.word, word);
									return obj;
								}).sort((x, y) => {
									return ((x.similarity > y.similarity) ? -1 : 1);
								}).slice(0, 1);

								//returning the best match
								resolve({ word, results: foundWords });

							}

						}).catch(err => {
							reject(err);
						});

					});

				});


				//now, lets resolve all promises from the array of promises
				Promise.all(promises).then(foundItems => {

					let previousWords = "";

					//test if all words exists
					for (let index in foundItems) {
						if (foundItems[index] === null) {
							//some word is not correct, break the response
							return resolve({ suggestions: [], timeElapsed: this._clock(time) });
						}

						previousWords += foundItems[index].word + " ";
					}

					previousWords = previousWords.trim();

					let objFinal = this._matchWordsByItemsIds(foundItems);
					let arrItemsIds = objFinal.itemsIds;
					let missingWords = objFinal.missingWords;

					//after this query, one or more words could be missing because its items did not match
					//if that is true, break the response
					if (missingWords.length > 0) {
						//some word is not correct, break the response
						return resolve({ suggestions: [], timeElapsed: this._clock(time) });
					}

					let arrResponse = [];
					let objResponse = {};
					let lastWord = arrWords[arrWords.length - 1].toLowerCase().latinize();
				

					this._splitWords(previousWords).map(el => {
						objResponse[el.toLowerCase().latinize()] = 1;
					});

					this._db.findItems({ itemId: { $in: arrItemsIds.slice(0, 100) } }).then(othersItems => {

						//get all item's names from items returned from query and create a relatedWords dictionary
						let objRelatedWords = {};

						for (let countWords = 0, i = 0; i < othersItems.length && countWords < 50; i++){
							let item = othersItems[i];
							let arrItemWords = this._splitWords(item.itemName);

							//filter out the words from this item using words from the query
							for (let x = 0; x < arrWords.length - 1; x++) {
								for (let y = 0; y < arrItemWords.length - 1; y++) {
									if (arrWords[x].toLowerCase().latinize() === arrItemWords[y].toLowerCase().latinize()){
										arrItemWords.splice(y, 1);
										break;
									}
								}
							}

							//the rest of the words will be compared with the last words from the query
							for (let y = 0; y < arrItemWords.length; y++){
								let word = arrItemWords[y];

								if (lastWord === "" || word.toLowerCase().latinize().indexOf(lastWord) == 0){
									if (word in objRelatedWords) {
										objRelatedWords[word]++;
									} else {
										objRelatedWords[word] = 1;
										countWords++;
									}
								}
							}
						}

						// First create the array of keys/values with relatedWords so that we can sort it
						let relatedWords = [];
						for (let key in objRelatedWords) {
							relatedWords.push({ word: key, value: objRelatedWords[key] });
						}

						if (relatedWords.length > 0) {

							// And then, remove repetitions and sort it by popularity
							relatedWords = relatedWords.sort((x, y) => {

								//sort by popularity and alphabetically
								if (x.value > y.value) {
									return -1;
								}
								else if (x.value < y.value) {
									return 1;
								}
								else {
									if (x.word > y.word) {
										return -1;
									}
									else if (x.word < y.word) {
										return 1;
									}
									return 0;
								}

							});

							//todo: filter words that begins with numbers and stopwords if we have others results to show
							
							for (let index = 0; index < relatedWords.length && index < 5; index++) {
								arrResponse.push(previousWords + " " + relatedWords[index].word);
							}

						}

						resolve({ suggestions: arrResponse, timeElapsed: this._clock(time) });

					}).catch(err => {
						reject(err);
					});

				});
			}

		});

	}

	/**
	 * Return items suggestions.
	 * @param {String} words - word(s) to search.
	 * @returns {Promise(JSON)}
	 */
	getSuggestedItems (words) {

		this._checkInitialized();

		return new Promise((resolve, reject) => {

			let time = this._clock();

			let arrWords = this._splitWords(words);

			if (arrWords.length <= 0) {
				return reject(new Error("No word was given to search!"));
			}

			//only one word came from query
			if (arrWords.length == 1) {

				//try to get more words like this one. Limit 5
				this._getWordsStartingWith(arrWords[0].latinize(), 5).then(queryResponse => {

					let arrItemsIds = [];

					if (queryResponse !== null) {
						queryResponse.map(item => {
							arrItemsIds = arrItemsIds.concat(item.items);
						});
					}

					//remove duplications
					arrItemsIds = _.uniq(arrItemsIds);					

					this._db.findItems({ itemId: { $in: arrItemsIds.slice(0, 10) } }).then(foundItems => {

						let arrResponse = [];

						if (foundItems !== null) {

							foundItems.map(item => {

								arrResponse.push({itemId: item.itemId, itemName: item.itemName });
								
							});
		
						}

						resolve({ items: arrResponse, timeElapsed: this._clock(time) });

					}).catch(err => {
						reject(err);
					});

				},
				err => {
					reject(err);
				});

			} else { //two or more words came from the query.

				//make a promise for each word from query, but last one and create an array of promises
				let promises = arrWords.slice(0, arrWords.length - 1).map(word => {

					return new Promise((resolve, reject) => {

						//try to find the exact word in our dictionary
						this._db.findWords({ cleanWord: word.toLowerCase().latinize() }).then(foundWords => {

							if (!foundWords || foundWords.length <= 0) {

								//instead of returning an error, lets return null
								resolve(null);

							} else {

								//sort to return the best match
								foundWords = foundWords.map((obj) => {
									obj.similarity = this._similarity(obj.word, word);
									return obj;
								}).sort((x, y) => {
									return ((x.similarity > y.similarity) ? -1 : 1);
								}).slice(0, 1);

								//returning the best match
								resolve({ word, results: foundWords });

							}

						}).catch(err => {
							reject(err);
						});

					});

				});


				//now, lets resolve all promises from the array of promises
				Promise.all(promises).then(foundWords => {
					
					//test if all words exists
					for (let index in foundWords) {
						if (foundWords[index] === null) {
							//some word is not correct, break the response
							return resolve({ items: [], timeElapsed: this._clock(time) });
						}
					}


					let objFinal = this._matchWordsByItemsIds(foundWords);
					let arrItemsIds = objFinal.itemsIds;
					let missingWords = objFinal.missingWords;


					//after this query, one or more words could be missing because its items did not match
					//if that is true, break the response
					if (missingWords.length > 0) {
						//some word is not correct, break the response
						return resolve({ items: [], timeElapsed: this._clock(time) });
					}

					this._db.findItems({ itemId: { $in: arrItemsIds.slice(0, 100) } }).then(foundItems => {

						let arrResponse = [];
						let lastWord = arrWords[arrWords.length - 1].toLowerCase().latinize();

						if (foundItems !== null) {

							for (let i = 0; i < foundItems.length; i++){
								let item = foundItems[i];
								let arrItemWords = [];
								
								if (item.keywords !== null && item.keywords !== undefined){
									arrItemWords = this._splitWords(item.itemName.toLowerCase() + " " + item.keywords.toLowerCase());
								} else {
									arrItemWords = this._splitWords(item.itemName.toLowerCase());
								}

								//filter out the words from this item using words from the query
								for (let x = 0; x < arrWords.length - 1; x++) {
									for (let y = 0; y < arrItemWords.length - 1; y++) {
										if (arrWords[x].toLowerCase().latinize() === arrItemWords[y].latinize()){
											arrItemWords.splice(y, 1);
											break;
										}
									}
								}
								
								//the rest of the words will be compared with the last words from the query
								let foundLast = false;
								for (let y = 0; y < arrItemWords.length; y++){
									if (arrItemWords[y].indexOf(lastWord.toLowerCase().latinize()) == 0){
										foundLast = true;
										break;
									}
								}

								if (foundLast){
									arrResponse.push({itemId: item.itemId, itemName: item.itemName });
								}

								if (arrResponse.length > 9){
									break;
								}
							}
		
						}

						resolve({ items: arrResponse, timeElapsed: this._clock(time) });

					}).catch(err => {
						reject(err);
					});

				});

			}

		});

	}
};
	
util.inherits(NodeSuggestiveSearch, EventEmitter);

/**
 * Create an return an instance of NodeSuggestiveSearch with your options
 * @param {JSON} options - jSon object with options.
 * @returns {Object} - Return an instance of NodeSuggestiveSearch.
 */
module.exports.init = options => {
	return new NodeSuggestiveSearch(options);
};
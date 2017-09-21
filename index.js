
/* 
node-suggestive-search v1.7.1
https://github.com/ivanvaladares/node-suggestive-search/
by Ivan Valadares 
http://ivanvaladares.com 
*/


var fs = require('fs'),
	path = require('path');

var db;
var _thisModule = this;
var initialized = false;


exports.init = options => {

	if (!options) {
		throw new Error("Options are required!");
	}

	if (options.dataBase.toLowerCase() == "mongodb" || options.dataBase.toLowerCase() == "nedb") {
		db = require("./plugins/" + options.dataBase.toLowerCase() + ".js");
	} else {
		throw new Error("This module requires MongoDB or NeDB!");
	}

	//todo: validate options before passing them to databases

	db.init(options, (err) => {
		if (err) { throw err; }

		initialized = true;
	});

	return this;
};

checkInitialized = () => {
	if (!initialized) {
		throw new Error("Module not initialized!!");
	}
}


//http://semplicewebsites.com/removing-accents-javascript
latin_map = { "Á": "A", "Ă": "A", "Ắ": "A", "Ặ": "A", "Ằ": "A", "Ẳ": "A", "Ẵ": "A", "Ǎ": "A", "Â": "A", "Ấ": "A", "Ậ": "A", "Ầ": "A", "Ẩ": "A", "Ẫ": "A", "Ä": "A", "Ǟ": "A", "Ȧ": "A", "Ǡ": "A", "Ạ": "A", "Ȁ": "A", "À": "A", "Ả": "A", "Ȃ": "A", "Ā": "A", "Ą": "A", "Å": "A", "Ǻ": "A", "Ḁ": "A", "Ⱥ": "A", "Ã": "A", "Ꜳ": "AA", "Æ": "AE", "Ǽ": "AE", "Ǣ": "AE", "Ꜵ": "AO", "Ꜷ": "AU", "Ꜹ": "AV", "Ꜻ": "AV", "Ꜽ": "AY", "Ḃ": "B", "Ḅ": "B", "Ɓ": "B", "Ḇ": "B", "Ƀ": "B", "Ƃ": "B", "Ć": "C", "Č": "C", "Ç": "C", "Ḉ": "C", "Ĉ": "C", "Ċ": "C", "Ƈ": "C", "Ȼ": "C", "Ď": "D", "Ḑ": "D", "Ḓ": "D", "Ḋ": "D", "Ḍ": "D", "Ɗ": "D", "Ḏ": "D", "ǲ": "D", "ǅ": "D", "Đ": "D", "Ƌ": "D", "Ǳ": "DZ", "Ǆ": "DZ", "É": "E", "Ĕ": "E", "Ě": "E", "Ȩ": "E", "Ḝ": "E", "Ê": "E", "Ế": "E", "Ệ": "E", "Ề": "E", "Ể": "E", "Ễ": "E", "Ḙ": "E", "Ë": "E", "Ė": "E", "Ẹ": "E", "Ȅ": "E", "È": "E", "Ẻ": "E", "Ȇ": "E", "Ē": "E", "Ḗ": "E", "Ḕ": "E", "Ę": "E", "Ɇ": "E", "Ẽ": "E", "Ḛ": "E", "Ꝫ": "ET", "Ḟ": "F", "Ƒ": "F", "Ǵ": "G", "Ğ": "G", "Ǧ": "G", "Ģ": "G", "Ĝ": "G", "Ġ": "G", "Ɠ": "G", "Ḡ": "G", "Ǥ": "G", "Ḫ": "H", "Ȟ": "H", "Ḩ": "H", "Ĥ": "H", "Ⱨ": "H", "Ḧ": "H", "Ḣ": "H", "Ḥ": "H", "Ħ": "H", "Í": "I", "Ĭ": "I", "Ǐ": "I", "Î": "I", "Ï": "I", "Ḯ": "I", "İ": "I", "Ị": "I", "Ȉ": "I", "Ì": "I", "Ỉ": "I", "Ȋ": "I", "Ī": "I", "Į": "I", "Ɨ": "I", "Ĩ": "I", "Ḭ": "I", "Ꝺ": "D", "Ꝼ": "F", "Ᵹ": "G", "Ꞃ": "R", "Ꞅ": "S", "Ꞇ": "T", "Ꝭ": "IS", "Ĵ": "J", "Ɉ": "J", "Ḱ": "K", "Ǩ": "K", "Ķ": "K", "Ⱪ": "K", "Ꝃ": "K", "Ḳ": "K", "Ƙ": "K", "Ḵ": "K", "Ꝁ": "K", "Ꝅ": "K", "Ĺ": "L", "Ƚ": "L", "Ľ": "L", "Ļ": "L", "Ḽ": "L", "Ḷ": "L", "Ḹ": "L", "Ⱡ": "L", "Ꝉ": "L", "Ḻ": "L", "Ŀ": "L", "Ɫ": "L", "ǈ": "L", "Ł": "L", "Ǉ": "LJ", "Ḿ": "M", "Ṁ": "M", "Ṃ": "M", "Ɱ": "M", "Ń": "N", "Ň": "N", "Ņ": "N", "Ṋ": "N", "Ṅ": "N", "Ṇ": "N", "Ǹ": "N", "Ɲ": "N", "Ṉ": "N", "Ƞ": "N", "ǋ": "N", "Ñ": "N", "Ǌ": "NJ", "Ó": "O", "Ŏ": "O", "Ǒ": "O", "Ô": "O", "Ố": "O", "Ộ": "O", "Ồ": "O", "Ổ": "O", "Ỗ": "O", "Ö": "O", "Ȫ": "O", "Ȯ": "O", "Ȱ": "O", "Ọ": "O", "Ő": "O", "Ȍ": "O", "Ò": "O", "Ỏ": "O", "Ơ": "O", "Ớ": "O", "Ợ": "O", "Ờ": "O", "Ở": "O", "Ỡ": "O", "Ȏ": "O", "Ꝋ": "O", "Ꝍ": "O", "Ō": "O", "Ṓ": "O", "Ṑ": "O", "Ɵ": "O", "Ǫ": "O", "Ǭ": "O", "Ø": "O", "Ǿ": "O", "Õ": "O", "Ṍ": "O", "Ṏ": "O", "Ȭ": "O", "Ƣ": "OI", "Ꝏ": "OO", "Ɛ": "E", "Ɔ": "O", "Ȣ": "OU", "Ṕ": "P", "Ṗ": "P", "Ꝓ": "P", "Ƥ": "P", "Ꝕ": "P", "Ᵽ": "P", "Ꝑ": "P", "Ꝙ": "Q", "Ꝗ": "Q", "Ŕ": "R", "Ř": "R", "Ŗ": "R", "Ṙ": "R", "Ṛ": "R", "Ṝ": "R", "Ȑ": "R", "Ȓ": "R", "Ṟ": "R", "Ɍ": "R", "Ɽ": "R", "Ꜿ": "C", "Ǝ": "E", "Ś": "S", "Ṥ": "S", "Š": "S", "Ṧ": "S", "Ş": "S", "Ŝ": "S", "Ș": "S", "Ṡ": "S", "Ṣ": "S", "Ṩ": "S", "Ť": "T", "Ţ": "T", "Ṱ": "T", "Ț": "T", "Ⱦ": "T", "Ṫ": "T", "Ṭ": "T", "Ƭ": "T", "Ṯ": "T", "Ʈ": "T", "Ŧ": "T", "Ɐ": "A", "Ꞁ": "L", "Ɯ": "M", "Ʌ": "V", "Ꜩ": "TZ", "Ú": "U", "Ŭ": "U", "Ǔ": "U", "Û": "U", "Ṷ": "U", "Ü": "U", "Ǘ": "U", "Ǚ": "U", "Ǜ": "U", "Ǖ": "U", "Ṳ": "U", "Ụ": "U", "Ű": "U", "Ȕ": "U", "Ù": "U", "Ủ": "U", "Ư": "U", "Ứ": "U", "Ự": "U", "Ừ": "U", "Ử": "U", "Ữ": "U", "Ȗ": "U", "Ū": "U", "Ṻ": "U", "Ų": "U", "Ů": "U", "Ũ": "U", "Ṹ": "U", "Ṵ": "U", "Ꝟ": "V", "Ṿ": "V", "Ʋ": "V", "Ṽ": "V", "Ꝡ": "VY", "Ẃ": "W", "Ŵ": "W", "Ẅ": "W", "Ẇ": "W", "Ẉ": "W", "Ẁ": "W", "Ⱳ": "W", "Ẍ": "X", "Ẋ": "X", "Ý": "Y", "Ŷ": "Y", "Ÿ": "Y", "Ẏ": "Y", "Ỵ": "Y", "Ỳ": "Y", "Ƴ": "Y", "Ỷ": "Y", "Ỿ": "Y", "Ȳ": "Y", "Ɏ": "Y", "Ỹ": "Y", "Ź": "Z", "Ž": "Z", "Ẑ": "Z", "Ⱬ": "Z", "Ż": "Z", "Ẓ": "Z", "Ȥ": "Z", "Ẕ": "Z", "Ƶ": "Z", "Ĳ": "IJ", "Œ": "OE", "ᴀ": "A", "ᴁ": "AE", "ʙ": "B", "ᴃ": "B", "ᴄ": "C", "ᴅ": "D", "ᴇ": "E", "ꜰ": "F", "ɢ": "G", "ʛ": "G", "ʜ": "H", "ɪ": "I", "ʁ": "R", "ᴊ": "J", "ᴋ": "K", "ʟ": "L", "ᴌ": "L", "ᴍ": "M", "ɴ": "N", "ᴏ": "O", "ɶ": "OE", "ᴐ": "O", "ᴕ": "OU", "ᴘ": "P", "ʀ": "R", "ᴎ": "N", "ᴙ": "R", "ꜱ": "S", "ᴛ": "T", "ⱻ": "E", "ᴚ": "R", "ᴜ": "U", "ᴠ": "V", "ᴡ": "W", "ʏ": "Y", "ᴢ": "Z", "á": "a", "ă": "a", "ắ": "a", "ặ": "a", "ằ": "a", "ẳ": "a", "ẵ": "a", "ǎ": "a", "â": "a", "ấ": "a", "ậ": "a", "ầ": "a", "ẩ": "a", "ẫ": "a", "ä": "a", "ǟ": "a", "ȧ": "a", "ǡ": "a", "ạ": "a", "ȁ": "a", "à": "a", "ả": "a", "ȃ": "a", "ā": "a", "ą": "a", "ᶏ": "a", "ẚ": "a", "å": "a", "ǻ": "a", "ḁ": "a", "ⱥ": "a", "ã": "a", "ꜳ": "aa", "æ": "ae", "ǽ": "ae", "ǣ": "ae", "ꜵ": "ao", "ꜷ": "au", "ꜹ": "av", "ꜻ": "av", "ꜽ": "ay", "ḃ": "b", "ḅ": "b", "ɓ": "b", "ḇ": "b", "ᵬ": "b", "ᶀ": "b", "ƀ": "b", "ƃ": "b", "ɵ": "o", "ć": "c", "č": "c", "ç": "c", "ḉ": "c", "ĉ": "c", "ɕ": "c", "ċ": "c", "ƈ": "c", "ȼ": "c", "ď": "d", "ḑ": "d", "ḓ": "d", "ȡ": "d", "ḋ": "d", "ḍ": "d", "ɗ": "d", "ᶑ": "d", "ḏ": "d", "ᵭ": "d", "ᶁ": "d", "đ": "d", "ɖ": "d", "ƌ": "d", "ı": "i", "ȷ": "j", "ɟ": "j", "ʄ": "j", "ǳ": "dz", "ǆ": "dz", "é": "e", "ĕ": "e", "ě": "e", "ȩ": "e", "ḝ": "e", "ê": "e", "ế": "e", "ệ": "e", "ề": "e", "ể": "e", "ễ": "e", "ḙ": "e", "ë": "e", "ė": "e", "ẹ": "e", "ȅ": "e", "è": "e", "ẻ": "e", "ȇ": "e", "ē": "e", "ḗ": "e", "ḕ": "e", "ⱸ": "e", "ę": "e", "ᶒ": "e", "ɇ": "e", "ẽ": "e", "ḛ": "e", "ꝫ": "et", "ḟ": "f", "ƒ": "f", "ᵮ": "f", "ᶂ": "f", "ǵ": "g", "ğ": "g", "ǧ": "g", "ģ": "g", "ĝ": "g", "ġ": "g", "ɠ": "g", "ḡ": "g", "ᶃ": "g", "ǥ": "g", "ḫ": "h", "ȟ": "h", "ḩ": "h", "ĥ": "h", "ⱨ": "h", "ḧ": "h", "ḣ": "h", "ḥ": "h", "ɦ": "h", "ẖ": "h", "ħ": "h", "ƕ": "hv", "í": "i", "ĭ": "i", "ǐ": "i", "î": "i", "ï": "i", "ḯ": "i", "ị": "i", "ȉ": "i", "ì": "i", "ỉ": "i", "ȋ": "i", "ī": "i", "į": "i", "ᶖ": "i", "ɨ": "i", "ĩ": "i", "ḭ": "i", "ꝺ": "d", "ꝼ": "f", "ᵹ": "g", "ꞃ": "r", "ꞅ": "s", "ꞇ": "t", "ꝭ": "is", "ǰ": "j", "ĵ": "j", "ʝ": "j", "ɉ": "j", "ḱ": "k", "ǩ": "k", "ķ": "k", "ⱪ": "k", "ꝃ": "k", "ḳ": "k", "ƙ": "k", "ḵ": "k", "ᶄ": "k", "ꝁ": "k", "ꝅ": "k", "ĺ": "l", "ƚ": "l", "ɬ": "l", "ľ": "l", "ļ": "l", "ḽ": "l", "ȴ": "l", "ḷ": "l", "ḹ": "l", "ⱡ": "l", "ꝉ": "l", "ḻ": "l", "ŀ": "l", "ɫ": "l", "ᶅ": "l", "ɭ": "l", "ł": "l", "ǉ": "lj", "ſ": "s", "ẜ": "s", "ẛ": "s", "ẝ": "s", "ḿ": "m", "ṁ": "m", "ṃ": "m", "ɱ": "m", "ᵯ": "m", "ᶆ": "m", "ń": "n", "ň": "n", "ņ": "n", "ṋ": "n", "ȵ": "n", "ṅ": "n", "ṇ": "n", "ǹ": "n", "ɲ": "n", "ṉ": "n", "ƞ": "n", "ᵰ": "n", "ᶇ": "n", "ɳ": "n", "ñ": "n", "ǌ": "nj", "ó": "o", "ŏ": "o", "ǒ": "o", "ô": "o", "ố": "o", "ộ": "o", "ồ": "o", "ổ": "o", "ỗ": "o", "ö": "o", "ȫ": "o", "ȯ": "o", "ȱ": "o", "ọ": "o", "ő": "o", "ȍ": "o", "ò": "o", "ỏ": "o", "ơ": "o", "ớ": "o", "ợ": "o", "ờ": "o", "ở": "o", "ỡ": "o", "ȏ": "o", "ꝋ": "o", "ꝍ": "o", "ⱺ": "o", "ō": "o", "ṓ": "o", "ṑ": "o", "ǫ": "o", "ǭ": "o", "ø": "o", "ǿ": "o", "õ": "o", "ṍ": "o", "ṏ": "o", "ȭ": "o", "ƣ": "oi", "ꝏ": "oo", "ɛ": "e", "ᶓ": "e", "ɔ": "o", "ᶗ": "o", "ȣ": "ou", "ṕ": "p", "ṗ": "p", "ꝓ": "p", "ƥ": "p", "ᵱ": "p", "ᶈ": "p", "ꝕ": "p", "ᵽ": "p", "ꝑ": "p", "ꝙ": "q", "ʠ": "q", "ɋ": "q", "ꝗ": "q", "ŕ": "r", "ř": "r", "ŗ": "r", "ṙ": "r", "ṛ": "r", "ṝ": "r", "ȑ": "r", "ɾ": "r", "ᵳ": "r", "ȓ": "r", "ṟ": "r", "ɼ": "r", "ᵲ": "r", "ᶉ": "r", "ɍ": "r", "ɽ": "r", "ↄ": "c", "ꜿ": "c", "ɘ": "e", "ɿ": "r", "ś": "s", "ṥ": "s", "š": "s", "ṧ": "s", "ş": "s", "ŝ": "s", "ș": "s", "ṡ": "s", "ṣ": "s", "ṩ": "s", "ʂ": "s", "ᵴ": "s", "ᶊ": "s", "ȿ": "s", "ɡ": "g", "ᴑ": "o", "ᴓ": "o", "ᴝ": "u", "ť": "t", "ţ": "t", "ṱ": "t", "ț": "t", "ȶ": "t", "ẗ": "t", "ⱦ": "t", "ṫ": "t", "ṭ": "t", "ƭ": "t", "ṯ": "t", "ᵵ": "t", "ƫ": "t", "ʈ": "t", "ŧ": "t", "ᵺ": "th", "ɐ": "a", "ᴂ": "ae", "ǝ": "e", "ᵷ": "g", "ɥ": "h", "ʮ": "h", "ʯ": "h", "ᴉ": "i", "ʞ": "k", "ꞁ": "l", "ɯ": "m", "ɰ": "m", "ᴔ": "oe", "ɹ": "r", "ɻ": "r", "ɺ": "r", "ⱹ": "r", "ʇ": "t", "ʌ": "v", "ʍ": "w", "ʎ": "y", "ꜩ": "tz", "ú": "u", "ŭ": "u", "ǔ": "u", "û": "u", "ṷ": "u", "ü": "u", "ǘ": "u", "ǚ": "u", "ǜ": "u", "ǖ": "u", "ṳ": "u", "ụ": "u", "ű": "u", "ȕ": "u", "ù": "u", "ủ": "u", "ư": "u", "ứ": "u", "ự": "u", "ừ": "u", "ử": "u", "ữ": "u", "ȗ": "u", "ū": "u", "ṻ": "u", "ų": "u", "ᶙ": "u", "ů": "u", "ũ": "u", "ṹ": "u", "ṵ": "u", "ᵫ": "ue", "ꝸ": "um", "ⱴ": "v", "ꝟ": "v", "ṿ": "v", "ʋ": "v", "ᶌ": "v", "ⱱ": "v", "ṽ": "v", "ꝡ": "vy", "ẃ": "w", "ŵ": "w", "ẅ": "w", "ẇ": "w", "ẉ": "w", "ẁ": "w", "ⱳ": "w", "ẘ": "w", "ẍ": "x", "ẋ": "x", "ᶍ": "x", "ý": "y", "ŷ": "y", "ÿ": "y", "ẏ": "y", "ỵ": "y", "ỳ": "y", "ƴ": "y", "ỷ": "y", "ỿ": "y", "ȳ": "y", "ẙ": "y", "ɏ": "y", "ỹ": "y", "ź": "z", "ž": "z", "ẑ": "z", "ʑ": "z", "ⱬ": "z", "ż": "z", "ẓ": "z", "ȥ": "z", "ẕ": "z", "ᵶ": "z", "ᶎ": "z", "ʐ": "z", "ƶ": "z", "ɀ": "z", "ﬀ": "ff", "ﬃ": "ffi", "ﬄ": "ffl", "ﬁ": "fi", "ﬂ": "fl", "ĳ": "ij", "œ": "oe", "ﬆ": "st", "ₐ": "a", "ₑ": "e", "ᵢ": "i", "ⱼ": "j", "ₒ": "o", "ᵣ": "r", "ᵤ": "u", "ᵥ": "v", "ₓ": "x" };
String.prototype.latinize = function () { 
	return this.replace(/[^A-Za-z0-9\[\] ]/g, (a) => { return latin_map[a] || a }) 
};


//https://en.wikipedia.org/wiki/Levenshtein_distance
similarity = (s1, s2) => {
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
	return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

editDistance = (s1, s2) => {
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

//https://en.wikipedia.org/wiki/Soundex
soundex = (str) => {
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
};

cloneObjJson = (obj) => {
	if (obj == null || typeof (obj) != 'object') {
		return obj;
	}
	let temp = new obj.constructor();
	for (let key in obj) {
		temp[key] = cloneObjJson(obj[key]);
	}
	return temp;
}

/**
 * Split words from a string
 * @param {string} text to be broken into words
 * returns {Array}
 */
splitWords = (text) => {

	//separate words using this regexp pattern
	text = text.replace(/[.,\/#!$%\^&\*;:{}=+\-_`~()\?<>"”“]/gi, ' ');

	//split words from the text variable
	let arr = text.split(" ");

	let words = [];

	for (let i = 0; i < arr.length; i++) {
		let word = arr[i].trim(); // .replace(/[^0-9a-z#]/gi, ''); 

		if (word.length > 0) {
			words.push(word);
		}
	}

	return words;
}

/**
 * function used by LoadJson to store create word dictionary 
 * @param {JSON} json with items to be broken into words to construct our dictionary
 * returns {Promise(JSON)}
 */
populateWordsJson = (itemsJson) => {

	return new Promise((resolve, reject) => {

		//create a dictionary like object
		let objWords = {};
		let repeatedObjWords = {};

		db.remove(db.dbItems, {}, { multi: true }, (err, numRemoved) => {
			if (err) return reject(err);

			//insert all items in the database
			db.insert(db.dbItems, itemsJson, (err, itemsJsonInserted) => {
				if (err) return reject(err);

				db.createIndex(db.dbItems, "itemId", 1, (err) => {
					//lets not propagate for now
					if (err) console.log(err);
				});


				for (let x in itemsJson) {

					//get words from each item
					let arrWords = splitWords(itemsJson[x].itemName);

					//get keywords
					if (itemsJson[x].keywords){
						arrWords = arrWords.concat(splitWords(itemsJson[x].keywords));
					}

					//associate each word with items. ex: {word, [item1, item2, item3...]}
					for (let w = 0; w < arrWords.length; w++) {

						let strWord = arrWords[w].toLowerCase();

						if (strWord.length <= 1) {
							continue;
						}

						//if there is already this word in our dictionary, associate it with this item
						if (strWord in objWords) {

							objWords[strWord].items[itemsJson[x].itemId] = 1;

						} else {
							//keep the word without accent and lowercase
							let cleanWord = strWord.latinize();

							objWords[strWord] = { word: arrWords[w], cleanWord: cleanWord, soundex: soundex(arrWords[w]), items: {} };

							for (let i = 2; i <= cleanWord.length && i <= 4; i++) {
								objWords[strWord]["p" + i + "i"] = cleanWord.substr(0, i).toLowerCase();
								objWords[strWord]["p" + i + "e"] = cleanWord.substr(cleanWord.length - i, cleanWord.length).toLowerCase();
							}

							objWords[strWord].items[itemsJson[x].itemId] = 1;

							if (repeatedObjWords[cleanWord]) {
								repeatedObjWords[cleanWord].push(strWord);
							} else {
								repeatedObjWords[cleanWord] = [strWord];
							}

						}

					}

				}


				//lets make this module accent insensitive when searching for items
				//all the similar words will have the same itemsId
				for (let item in repeatedObjWords) {
					if (repeatedObjWords[item].length > 1) {

						let itemsId = {};

						for (let index = 0; index < repeatedObjWords[item].length; index++) {
							let objWord = objWords[repeatedObjWords[item][index]];

							for (let idResultItem in objWord.items) {
								if (!itemsId[idResultItem]) {
									itemsId[idResultItem] = objWord.items[idResultItem];
								}
							}

						}

						for (let index = 0; index < repeatedObjWords[item].length; index++) {
							let objWord = objWords[repeatedObjWords[item][index]];

							objWord.items = cloneObjJson(itemsId);
						}
					}
				}


				//create a nedb compatible JSON from the above dictionary
				let wordsJson = [];
				for (let item in objWords) {
					wordsJson.push(objWords[item]);
				}


				//clean the words database
				db.remove(db.dbWords, {}, { multi: true }, (err, numRemoved) => {
					if (err) return reject(err);

					//insert all words at once in database
					db.insert(db.dbWords, wordsJson, (err, wordsJsonInserted) => {
						if (err) return reject(err);

						//try to create an index for [word] 
						db.createIndex(db.dbWords, "word", 1, (err) => {
							//lets not propagate for now
							if (err) console.log(err);
						});

						//try to create an index for [cleanWord] 
						db.createIndex(db.dbWords, "cleanWord", 1, (err) => {
							//lets not propagate for now
							if (err) console.log(err);
						});

						//try to create an index for [soundex] 
						db.createIndex(db.dbWords, "soundex", 1, (err) => {
							//lets not propagate for now
							if (err) console.log(err);
						});

						//try to create an index for [pXi]
						for (let i = 2; i <= 4; i++) {
							db.createIndex(db.dbWords, ('p' + i + 'i'), 1, (err) => {
								//lets not propagate for now
								if (err) console.log(err);
							});
							db.createIndex(db.dbWords, ('p' + i + 'e'), 1, (err) => {
								//lets not propagate for now
								if (err) console.log(err);
							});
						}

						//return some information about this process
						resolve({ words: wordsJson.length });

					});

				});

			});

		});						

	});

}

/**
 * Find words using soundex function and nGram like method
 * @param {String} word used in the search
 * returns {Promise(JSON)} 
 */
getWordsBySoundexAndParts = (word) => {

	return new Promise((resolve, reject) => {

		//try to find an word is our dictionary using soundex and parts of the word
		//todo: research a better way to improve the performance of this query
		let queryCriteria = [{ soundex: soundex(word) }];

		let wordWithoutAccents = word.latinize();

		for (let i = 4; i >= 2; i--) {

			if (wordWithoutAccents.length >= i) {

				let objCriteriaIni = JSON.parse('{ "p' + i + 'i" : "" }');
				objCriteriaIni[Object.keys(objCriteriaIni)[0]] = wordWithoutAccents.substr(0, i).toLowerCase();
				queryCriteria.push(objCriteriaIni);

				let objCriteriaEnd = JSON.parse('{ "p' + i + 'e" : "" }');
				objCriteriaEnd[Object.keys(objCriteriaEnd)[0]] = wordWithoutAccents.substr(wordWithoutAccents.length - i, wordWithoutAccents.length).toLowerCase();
				queryCriteria.push(objCriteriaEnd);

			}

			//we already have too many search criterias for this word, lets stop to not slow down this query
			if (queryCriteria.length >= 5) {
				break;
			}
		}


		db.find(db.dbWords, { $or: queryCriteria }, (err, items) => {

			if (err) return reject(err);

			if (items.length > 0) {

				//before return the result, lets give a similarity rank for each result	
				//and filter top 10 most similar result 
				resolve(items.map((obj, i) => {
							obj.similarity = similarity(obj.word, word);
							return obj;
						}).sort((x, y) => {
							return ((x.similarity > y.similarity) ? -1 : 1)
						}).slice(0, 10)
				);

			} else {

				//nothing was found... should we try another method?
				//todo: research for another method
				resolve(null);

			}

		});

	});

}

/**
 * Return json words object similar to the word parameter 
 * @param {String} word to search
 * @param {Int} limit the result
 * returns {Promise(JSON)}
 */
getWordsStartingWith = (word, limit) => {

	return new Promise((resolve, reject) => {

		let queryCriteria;
		let hasCriteria = false;

		//create a search criteria from 4 to 2 letters to try to find words that starts like this one
		for (let i = 4; i >= 2; i--) {
			if (word.length >= i) {
				queryCriteria = JSON.parse('{ "p' + i + 'i" : "" }');
				queryCriteria[Object.keys(queryCriteria)[0]] = word.substr(0, i).toLowerCase();

				hasCriteria = true;
				//lets search with only one criteria
				break;
			}
		}

		if (!hasCriteria) {
			return resolve(null);
		}

		//execute the query
		db.find(db.dbWords, queryCriteria, (err, foundItems) => {
			if (err) return reject(err);

			if (foundItems.length > 0) {

				//return item that begins with same characters, from smallest to biggest and then alphabetically
				resolve(foundItems.filter(objWord => {
					return objWord.cleanWord.indexOf(word.toLowerCase()) == 0;
				}).sort((a, b) => {
					if (a.word.length > b.word.length) {
						return 1;
					} else if (a.word.length < b.word.length) {
						return -1;
					}
					return a.word > b.word;
				})
					.slice(0, ((limit > 0) ? limit : foundItems.length)));

			} else {

				resolve(null);

			}

		});

	});

}

/**
 * Insert a new item into the dictionary database from json object
 * @param {Json object} with item {itemId: 0 , itemName: "item name"}
 * returns {Promise(JSON)}
 */
module.exports.insertItem = (itemJson) => {

	checkInitialized();

	return new Promise((resolve, reject) => {

		let time = new Date();

		//validate json object
		if (itemJson.itemId === undefined || itemJson.itemName === undefined){
			return reject(new Error('Item must have itemId and itemName!'));
		}

		_thisModule.removeItem(itemJson.itemId).then(data => {

			//insert item into items dictionary
			db.insert(db.dbItems, itemJson, (err, itemJsonInserted) => {
				if (err) return reject(err);

				//get words from item
				let arrWords = splitWords(itemJson.itemName);


				//get each word from dictionary and associate with this new item
				//also check if is a repeating word with different accents
				//make a promise for each word and create an array of promises
				let promises = arrWords.map(word => {

					return new Promise((resolve, reject) => {

						//try to find the exact word in our dictionary
						db.find(db.dbWords, { cleanWord: word.toLowerCase().latinize() }, (err, foundItems) => {
							if (err) return reject(err);

							if (!foundItems || foundItems.length <= 0) {

								//instead of returning an error, lets return null
								resolve(null);

							} else {

								resolve(foundItems);

							}

						});

					});

				});

				//now, lets resolve all promises from the array of promises
				Promise.all(promises).then(foundItems => {

					let notFoundedWords = [];
					let foundedWords = [];
					let foundedWordsDifferentAccents = [];

					//set an array with the not founded words
					//set an array with the founded words
					for (let index = 0; index < foundItems.length; index++) {
						let foundItem = foundItems[index];

						if (foundItem == null) {

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


					//associate this words with this new item
					for (let index = 0; index < foundedWords.length; index++) {
						let word = foundedWords[index];

						db.find(db.dbWords, { cleanWord: word.toLowerCase().latinize() }, (err, existingWords) => {
							if (err) return reject(err);

							for (let index = 0; index < existingWords.length; index++) {

								//associate with this itemId
								existingWords[index].items[itemJson.itemId] = 1;

								//send it back to the database
								db.update(db.dbWords, { cleanWord: existingWords[index].cleanWord },
									{ $set: { "items": existingWords[index].items } },
									{ multi: true },
									(err, numReplaced) => { /*nothing for now*/ }
								);
							}

						});

					}


					//create new words objects to insert into the dictionary
					let objWords = {};

					for (let index = 0; index < notFoundedWords.length; index++) {
						let word = notFoundedWords[index];

						let cleanWord = word.toLowerCase().latinize();

						let objWord = { word: word, cleanWord: cleanWord, soundex: soundex(word), items: {} };

						for (let i = 2; i <= cleanWord.length && i <= 4; i++) {
							objWord["p" + i + "i"] = cleanWord.substr(0, i).toLowerCase();
							objWord["p" + i + "e"] = cleanWord.substr(cleanWord.length - i, cleanWord.length).toLowerCase();
						}

						//add this new item into related items of this word
						objWord.items[itemJson.itemId] = 1;

						//mount the array to bulk insert later 
						objWords[word] = objWord;
					}

					//create a nedb compatible JSON from the above dictionary
					let wordsJson = [];
					for (let item in objWords) {
						wordsJson.push(objWords[item]);
					}

					//insert all the new words in a bulk insert
					if (wordsJson.length > 0) {
						db.insert(db.dbWords, wordsJson, (err, wordJsonInserted) => {
							if (err) return reject(err);

							//lets treat all similar words with different accents
							if (foundedWordsDifferentAccents.length > 0) {

								//associate this words with this new item and its words
								for (let index = 0; index < foundedWordsDifferentAccents.length; index++) {
									let word = foundedWordsDifferentAccents[index];

									db.find(db.dbWords, { cleanWord: word.toLowerCase().latinize() }, (err, existingWords) => {
										if (err) return reject(err);

										let itemsId = {};

										for (let index = 0; index < existingWords.length; index++) {
											for (let idItem in existingWords[index].items) {
												if (!itemsId[idItem]) {
													itemsId[idItem] = existingWords[index].items[idItem];
												}
											}
										}

										if (existingWords.length > 0) {
											itemsId[itemJson.itemId] = 1;

											//send it back to the database
											db.update(db.dbWords, { cleanWord: word.toLowerCase().latinize() },
												{ $set: { "items": itemsId } },
												{ multi: true },
												(err, numReplaced) => { /* nothing for now */ }
											);
										}

									});

								}

								//return some information about this process
								resolve({ timeElapsed: (new Date() - time) });

							} else {
								//nothing to update

								//return some information about this process
								resolve({ timeElapsed: (new Date() - time) });
							}

						});

					} else {
						//nothing to insert

						//return some information about this process
						resolve({ timeElapsed: (new Date() - time) });

					}

				});

			});

		},
		err => {
			return reject({ message: "Could not insert this item!" });
		});

	});


}

/**
 * Removes an item and its words from the dictionary database
 * @param {string} itemId
 * returns {Promise(JSON)}
 */
module.exports.removeItem = itemId => {

	checkInitialized();

	return new Promise((resolve, reject) => {

		let time = new Date();

		db.find(db.dbItems, { itemId: itemId }, (err, existingItem) => {
			if (err) return reject(err);

			if (!existingItem || existingItem.length <= 0) {
				return resolve({ timeElapsed: (new Date() - time) });
			}

			let arrWords = splitWords(existingItem[0].itemName);

			//remove item from items dictionary
			db.remove(db.dbItems, { itemId: itemId }, { multi: false }, (err, numRemoved) => {
				if (err) return reject(err);

				//get each word from dictionary and associate with this new item
				//also check if is a repeating word with different accents
				//make a promise for each word and create an array of promises
				let promises = arrWords.map(word => {

					return new Promise((resolve, reject) => {

						//try to find the exact word in our dictionary
						db.find(db.dbWords, { cleanWord: word.toLowerCase().latinize() }, (err, foundItems) => {
							if (err) return reject(err);

							if (!foundItems || foundItems.length <= 0) {

								//instead of returning an error, lets return null
								resolve([]);

							} else {

								resolve(foundItems);

							}

						});

					});

				});

				Promise.all(promises).then(foundWords => {

					//get all words and remove itemsId 
					for (let index = 0; index < foundWords.length; index++) {
						let foundWord = foundWords[index];

						if (foundWord != null && foundWord.length > 0) {

							for (let iWord = 0; iWord < foundWord.length; iWord++) {
								let element = foundWord[iWord];

								//remove itemsId 
								if (element.items[itemId] == 1) {
									delete element.items[itemId];
								}
							}
						}
					}

					let innerPromises = [];

					//delete words with empty itemId 
					for (let index = 0; index < foundWords.length; index++) {
						let foundWord = foundWords[index];

						if (foundWord != null && foundWord.length > 0) {

							for (let iWord = 0; iWord < foundWord.length; iWord++) {
								let element = foundWord[iWord];

								if (Object.keys(element.items).length <= 0) {
									//remove this one 

									let p = new Promise((resolve, reject) => {

										db.remove(db.dbWords, { word: element.word }, { multi: false }, (err, numRemoved) => {
											if (err) return reject(err);

											resolve(numRemoved);
										});

									});

									innerPromises.push(p);

								} else {
									//update this one
									//send it back to the database
									let p = new Promise((resolve, reject)  => {

										db.update(db.dbWords, { word: element.word },
											{ $set: { "items": element.items } },
											{ multi: false },
											(err, numReplaced) => {
												resolve(numReplaced);
											});

									});

									innerPromises.push(p);
								}
							}
						}
					}

					Promise.all(innerPromises).then(operations => {

						for (let index = 0; index < operations.length; index++) {
							let element = operations[index];

							//todo: test if any operation had failed 
						}

						//return some information about this process
						resolve({ timeElapsed: (new Date() - time) });

					});

				});

			});

		});

	});

}

/**
 * Load the dictionary database from json file
 * @param {String} filename. jSon file with items
 * @param {String} charset, Charset used in file 
 * returns {Promise(JSON)}
 */
module.exports.loadJson = (jSonFilePath, charset) => {

	checkInitialized();

	return new Promise((resolve, reject) => {

		let time = new Date();

		let itemsJson = null;

		if (!charset) {
			charset = "utf8";
		}

		//get the file from the path
		fs.readFile(jSonFilePath, charset, (err, data) => {
			if (err) return reject(err);

			try {
				itemsJson = JSON.parse(data);
			} catch (err) {
				return reject(err);	
			}

			//from the items, lets extract our dictionary 
			populateWordsJson(itemsJson).then(information => {

				information.items = itemsJson.length;
				information.timeElapsed = (new Date() - time);

				//return some information about this process
				resolve(information);

			});

		});

	});

}

/**
 * Load the dictionary database from json string
 * @param {String} json string with items
 * returns {Promise(JSON)}
 */
module.exports.loadJsonString = jSonString => {

	checkInitialized();

	return new Promise((resolve, reject) => {

		let time = new Date();
		
		let itemsJson = null;

		//get the json string from the parameter
		
		try {
			itemsJson = JSON.parse(jSonString);
		} catch (err) {
			return reject(err);	
		}

		//from the items, lets extract our dictionary 
		populateWordsJson(itemsJson).then(information => {

			information.items = itemsJson.length;
			information.timeElapsed = (new Date() - time);

			//return some information about this process
			resolve(information);

		});

	});

}

/**
 * Return itemsId array and words used in the query
 * @param {String} word(s) used in the search
 * returns {Promise(JSON)}
 * depends: latinize, getWordsBySoundexAndParts, cloneObjJson, 
 */
module.exports.query = words => {

	checkInitialized();

	return new Promise((resolve, reject) => {

		let time = new Date().getTime();

		let arrWords = splitWords(words);

		if (arrWords.length <= 0) {
			return reject({ message: "No word was given to search!" });
		}

		//make a promise for each word from query and create an array of promises
		let promises = arrWords.map(word => {

			return new Promise((resolve, reject) => {

				//first, lets try to find the exact word in our dictionary
				db.find(db.dbWords, { cleanWord: word.toLowerCase().latinize() }, (err, foundItem) => {
					if (err) return reject(err);

					//no results :(, lets try with soundex and parts
					if (!foundItem || foundItem.length <= 0) {

						//this function will try to get words in our dictionary that is similar to the word from the query
						getWordsBySoundexAndParts(word).then(soudexFoundItems  => {
							if (soudexFoundItems != null) {
								resolve({ word: word, correct: false, results: soudexFoundItems });
							} else {
								resolve({ word: word, correct: false, results: [] })
							}
						},
						err => {
							//instead of returning an error, lets return an empty result
							resolve({ word: word, correct: false, results: [] });
						});

					} else {

						if (foundItem.length == 1) {

							foundItem = foundItem[0];

						} else if (foundItem.length > 1) {

							let tempFoundItem = foundItem.slice(0);

							//returning the best match
							foundItem = foundItem.map((obj, i) => {
								obj.similarity = similarity(obj.word, word);
								return obj;
							}).sort((x, y) => {
								return ((x.similarity > y.similarity) ? -1 : 1);
							}).slice(0, 1)[0];

						}

						//returning the exact match
						resolve({ word: word, correct: true, results: [foundItem] });

					}

				});

			});

		});


		//now, lets resolve all promises from the array of promises
		Promise.all(promises).then(items => {

			//items variable contains an array of words objects and results for each word from the query
			// {correct:bool, results: db.words[], word: string from query } 
			//if there is any incorrect word, lets choose the best match between the results 
			//to acomplish this, lets iterate over all words and their items to check how many items are similar between the words

			if (items.length > 1) {

				for (let i = 0; i < items.length; i++) {
					let objWord = items[i];

					for (let x = 0; x < items.length; x++) {
						let objOtherWord = items[x];

						if (objOtherWord.word.toLowerCase() != objWord.word.toLowerCase() && objOtherWord.results.length > 0 && objWord.results.length > 0) {

							for (let result in objWord.results) {
								let objResult = objWord.results[result];

								for (let otherWordResult in objOtherWord.results) {
									let objOtherWordResult = objOtherWord.results[otherWordResult];

									for (let idResultItem in objResult.items) {

										if (objOtherWordResult.items[idResultItem]) {
											// lets give a boost in similarity because this word contains items from other words
											objResult.similarity = (objResult.similarity || 0) + 1;
										}
									}
								}
							}
						}
					}
				}
			}

			//get the best match over similarity and transform results in only one result json object for each word from the query
			for (let word in items) {
				let objWord = items[word];

				if (objWord.results.length > 0) {

					objWord.results = objWord.results.reduce((x, y) => {
						return ((x.similarity > y.similarity) ? x : y);
					});
				}
			}


			//join all itemsId from all word's results and get the words
			let finalWords = [];
			let objsItemsId;

			for (let word in items) {
				let objWord = items[word];

				finalWords.push(objWord.results.word);

				//get from the first word its itemsId and continue to another word 
				if (!objsItemsId) {
					objsItemsId = objWord.results.items;
					continue;
				}

				if (objWord.results.length == 0) {
					//if this word was not found, lets remove from the results
					finalWords[word] = null;
				} else {

					let newarrItemsId = {};
					let itemExist = false;
					for (let itemId in objsItemsId) {
						if (objWord.results.items[itemId]) {
							itemExist = true;
							newarrItemsId[itemId] = null;
						}
					}

					//if this word have no itemId that matches with the previous word, lets remove from the results
					if (!itemExist) {
						finalWords[word] = null;
					} else {
						//acumulate itemsId to another round
						objsItemsId = cloneObjJson(newarrItemsId);
					}
				}

			}

			//tranform objsItemsId to array
			let arrItemsId = [];
			for (let item in objsItemsId) {
				arrItemsId.push(item);
			}

			let information = { query: words, words: finalWords, itemsId: arrItemsId, timeElapsed: (new Date() - time) };

			resolve(information);

		},
		err => {
			reject(err);
		});

	});

}

/**
 * Return words suggestions 
 * @param {String} word(s) to search
 * returns {Promise(JSON)}
 */
module.exports.getSuggestedWords = words => {

	checkInitialized();

	return new Promise((resolve, reject) => {

		let time = new Date();

		let arrWords = splitWords(words);

		if (words.lastIndexOf(" ") == words.length - 1) {
			arrWords.push("");
		}

		if (arrWords.length <= 0) {
			return reject({ message: "No word was given to search!" });
		}

		//only one word came from query and no space at the end
		if (arrWords.length == 1 && words.indexOf(" ") == -1) {

			//try to get more words like this one. Limit 5
			getWordsStartingWith(arrWords[0].latinize(), 5).then(queryResponse => {

				let arrResponse = [];

				if (queryResponse != null) {

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
						else if (x > y) {
							return 1;
						}
						return 0;
					}

				});

				resolve({ suggestions: arrResponse, timeElapsed: (new Date() - time) });

			},
			err => {
				reject(err);
			});

		} else { //two or more words came from the query.

			//make a promise for each word from query, but last one and create an array of promises
			let promises = arrWords.slice(0, arrWords.length - 1).map(word => {

				return new Promise((resolve, reject) => {

					//try to find the exact word in our dictionary
					db.find(db.dbWords, { cleanWord: word.toLowerCase().latinize() }, (err, foundItem) => {
						if (err) return reject(err);

						if (!foundItem || foundItem.length <= 0) {

							//instead of returning an error, lets return null
							resolve(null);

						} else {

							if (foundItem.length == 1) {

								foundItem = foundItem[0];

							} else if (foundItem.length > 1) {

								//returning the best match
								foundItem = foundItem.map((obj, i) => {
									obj.similarity = similarity(obj.word, word);
									return obj;
								}).sort((x, y) => {
									return ((x.similarity > y.similarity) ? -1 : 1);
								}).slice(0, 1)[0];

							}

							//returning the best match
							resolve({ word: foundItem.word });

						}

					});

				});

			});


			//now, lets resolve all promises from the array of promises
			Promise.all(promises).then(foundItems => {

				let previousWords = "";

				//test if all words exists
				for (let index in foundItems) {
					if (foundItems[index] == null) {
						//some word is not correct, break the response
						return resolve({ suggestions: [], timeElapsed: (new Date() - time) });
					}

					previousWords += foundItems[index].word + " ";
				}

				previousWords = previousWords.trim();

				//query for the previous words to check if there is items with this combination
				_thisModule.query(previousWords).then(queryResponse => {

					//after this query, one or more words could be missing because its items did not match
					//if that is true, break the response
					for (let index = 0; index < queryResponse.words.length; index++) {
						if (queryResponse.words[index] == null) {
							//some word is not correct, break the response
							return resolve({ suggestions: [], timeElapsed: (new Date() - time) });
						}
					}

					let arrResponse = [];

					let lastWord = arrWords[arrWords.length - 1].toLowerCase().latinize();

					let objResponse = {};
					splitWords(previousWords).map(el => {
						objResponse[el.toLowerCase().latinize()] = 1;
					});

					db.find(db.dbItems, { itemId: { $in: queryResponse.itemsId.slice(0, 1000) } }, (err, othersItems) => {

						//get all item's names from items returned from query and create a relatedWords dictionary
						let objRelatedWords = {};
						othersItems.map(item => {

							splitWords(item.itemName).map(word => {

								let wordLoweredLatinized = word.toLowerCase().latinize();

								if (objResponse[wordLoweredLatinized] != 1) {
									//only keep this word if is like to last word from query or there is no last words
									if (lastWord == "" || wordLoweredLatinized.indexOf(lastWord) == 0) {
										if (word in objRelatedWords) {
											objRelatedWords[word]++;
										} else {
											objRelatedWords[word] = 1;
										}
									}
								}
							});

						});

						// First create the array of keys/values with relatedWords so that we can sort it
						let relatedWords = [];
						for (let key in objRelatedWords) {
							relatedWords.push({ word: key, value: objRelatedWords[key] });
						}

						if (relatedWords.length > 0) {

							// And then, remove repetitions and sort it by popularity
							relatedWords = relatedWords.sort((x, y) => {
								return ((x.word.toLowerCase() < y.word.toLowerCase()) ? -1 : 1)
							}).filter((item, pos, arr) => {

								//remove repetitions
								if (pos == 0) {
									return true;
								}

								if (item.word.toLowerCase() == arr[pos - 1].word.toLowerCase()) {
									arr[pos - 1].value += item.value;
									return false;
								}
								return true;
								
							}).sort((x, y) => {

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
									else if (x.word > y.word) {
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

						resolve({ suggestions: arrResponse, timeElapsed: (new Date() - time) });

					});

				});

			});

		}

	});

}

/**
 * Return items suggestions 
 * @param {String} word(s) to search
 * returns {Promise(JSON)}
 */
module.exports.getSuggestedItems = words => {

	checkInitialized();

	return new Promise((resolve, reject) => {

		let time = new Date();

		let arrWords = splitWords(words);

		if (arrWords.length <= 0) {
			return reject({ message: "No word was given to search!" });
		}

		//only one word came from query
		if (arrWords.length == 1) {

			//try to get more words like this one. Limit 5
			getWordsStartingWith(arrWords[0].latinize(), 5).then(queryResponse => {

				let objItems = {};

				if (queryResponse != null) {

					queryResponse.map(item => {

						for (let itemId in item.items) {
							objItems[itemId] = (objItems[itemId] || 0) + 1;
						}

					});

				}

				// First create the array of keys/values with relatedWords so that we can sort it
				let arrItems = [];
				for (let key in objItems) {
					arrItems.push(key);
				}
				
				db.find(db.dbItems, { itemId: { $in: arrItems } }, (err, foundItems) => {

					let arrResponse = [];

					if (foundItems != null) {

						foundItems.map(item => {

							arrResponse.push({itemId: item.itemId, itemName: item.itemName });
							
						});
	
					}

					resolve({ items: arrResponse, timeElapsed: (new Date() - time) });

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
					db.find(db.dbWords, { cleanWord: word.toLowerCase().latinize() }, (err, foundItem) => {
						if (err) return reject(err);

						if (!foundItem || foundItem.length <= 0) {

							//instead of returning an error, lets return null
							resolve(null);

						} else {

							if (foundItem.length == 1) {

								foundItem = foundItem[0];

							} else if (foundItem.length > 1) {

								//returning the best match
								foundItem = foundItem.map((obj, i) => {
									obj.similarity = similarity(obj.word, word);
									return obj;
								}).sort((x, y) => {
									return ((x.similarity > y.similarity) ? -1 : 1);
								}).slice(0, 1)[0];

							}

							//returning the best match
							resolve({ word: foundItem.word });

						}

					});

				});

			});


			//now, lets resolve all promises from the array of promises
			Promise.all(promises).then(foundItems => {

				let previousWords = "";

				//test if all words exists
				for (let index in foundItems) {
					if (foundItems[index] == null) {
						//some word is not correct, break the response
						return resolve({ suggestions: [], timeElapsed: (new Date() - time) });
					}

					previousWords += foundItems[index].word + " ";
				}

				previousWords = previousWords.trim();

				//query for the previous words to check if there is items with this combination
				_thisModule.query(previousWords).then(queryResponse => {

					//after this query, one or more words could be missing because its items did not match
					//if that is true, break the response
					for (let index = 0; index < queryResponse.words.length; index++) {
						if (queryResponse.words[index] == null) {
							//some word is not correct, break the response
							return resolve({ suggestions: [], timeElapsed: (new Date() - time) });
						}
					}

					db.find(db.dbItems, { itemId: { $in: queryResponse.itemsId } }, (err, foundItems) => {

						let arrResponse = [];
						let lastWord = arrWords[arrWords.length - 1].toLowerCase().latinize();

						if (foundItems != null) {

							foundItems.map(item => {

								let includeThisItem = false;

								if (lastWord == ""){
									includeThisItem = true;
								}else{

									let arrItemWords = splitWords(item.itemName.toLowerCase().latinize());

									arrItemWords.map(itemWord => {

										let wordExist = false;

										for (let index = 0; index < arrWords.length; index++) {
											if (arrWords[index].toLowerCase().latinize() == itemWord){
												wordExist = true;
												break;
											}
										}

										if (!wordExist){
											
											if (itemWord.indexOf(lastWord) == 0){
												includeThisItem = true;
											}

										}

									});

								}

								if (includeThisItem){
									arrResponse.push({itemId: item.itemId, itemName: item.itemName });
								}

							});
		
						}

						resolve({ items: arrResponse, timeElapsed: (new Date() - time) });

					});


				});

			});

		}

	});

}

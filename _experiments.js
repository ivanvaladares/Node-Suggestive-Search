/* eslint-disable node/no-unsupported-features */
let nss = require('./index.js').init();   

nss.on("initialized", async () => {

    let resp = await nss.loadJson("./test/names.json");

    console.log(resp);

    let q = await nss.query("ivan consentino valadares");

    console.log(q);

});
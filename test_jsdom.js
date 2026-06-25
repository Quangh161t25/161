const { JSDOM } = require("jsdom");
const fs = require('fs');

const htmlContent = fs.readFileSync('index.html', 'utf8');

const dom = new JSDOM(htmlContent);

global.window = dom.window;
global.document = dom.window.document;
global.lucide = { createIcons: () => {} };
global.fetch = async () => ({ json: async () => ({}) });

try {
    require('./app.js');
    console.log("Loaded app.js successfully");
    
    // Trigger DOMContentLoaded
    const event = document.createEvent('Event');
    event.initEvent('DOMContentLoaded', true, true);
    document.dispatchEvent(event);
    
    console.log("DOMContentLoaded dispatched");
    console.log("loading display:", document.getElementById('loading').style.display);
    
    // Test switchTab 'GHI_CHU'
    dom.window.switchTab('GHI_CHU').catch(e => console.error("switchTab error:", e));
    
} catch (e) {
    console.error("ERROR loading app.js:", e);
}
// don't exit to allow promises to resolve
setTimeout(() => {
    console.log("Done");
    process.exit(0);
}, 2000);

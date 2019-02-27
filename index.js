const { mongodump, mongoexport } = require("./command");

( async () => { 

        const outputDir = `./backup/${new Date().toLocaleDateString().replace(/\//g,"-")}_${new Date().getTime()}`
        
        // Export By: mongodump
        const dumpOption = {
            gzip: true,
            hostName: "localhost",
            portName: "27017",
            databaseName: "appReview",
            output: outputDir,
        }

        // Export By: mongoexport
         const exportOption = {
            hostName: "localhost",
            portName: "27017",
            databaseName: "appReview",
            collectionName: "rate",
            output: `${outputDir}.json`
         }           
        
        try {
           //const res1 = await mongodump(dumpOption);
           //const res2 = await mongoexport(exportOption);
        } catch (error) {
            console.log(error)
        }

})();

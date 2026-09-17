## Utility status and prerequisites

This is an earlier wrapper around MongoDB Database Tools. Install compatible mongodump and mongoexport executables and verify that they are on PATH. Test a backup and restore against a disposable database before using the output; `npm test` checks argument handling and process errors with stubbed tools; it does not verify a live database backup or restore.

# mongo-backup
Node library for backup mongodb database or collections.

### mongodump
```javascript
const { mongodump } = require("./command");
const outputDir = `./backup/review_${new Date().getTime()}`;

(async () => {

    const options = {
        gzip: true,
        hostName: "localhost",
        port: "27017",
        databaseName: "appReview",
        output: outputDir,
    }

    try {
        const response = await mongodump(options);
    } catch (error) {
        console.log(error)
    }

})()

```


### mongoexport
```javascript
const { mongoexport } = require("./command");
const outputDir = `./backup/rate_${new Date().getTime()}`;

(async () => {
    const options = {
        hostName: "localhost",
        port: "27017",
        databaseName: "appReview",
        collectionName: "rate",
        output: `${outputDir}.json`
    } 

    try {
        const response = await mongoexport(options);
    } catch (error) {
        console.log(error)
    }

})()
```
### Note: (windows users)
Make sure `mongodump` and `mongoexport` are available in CMD before using this library. Add the Database Tools `bin` folder to PATH in the Environment Variables panel.

For more options and descriptions follow [this link.](./command.js)

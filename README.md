# mongo-backup
Node library for backup mongodb database or coolections.

### mongodump
```javascript
const { mongoexport } = require("./command");
const outputDir = `./backup/review_${new Date().getTime()}`;

(async () => {

    const options = {
        gzip: true,
        hostName: "localhost",
        portName: "27017",
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
const outputDir = `./backup/rate_${new Date().getTime()}`

(async () => {
    const options = {
        hostName: "localhost",
        portName: "27017",
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
Make sure `mongoexport` and `mongoexport` avilabe by `CMD` before using this library,
by adding mongo the `./bin` folder in `systems variablrs -> path` in Environment Variables panel.

For more options and descriptions follow [this link.](./command.js)
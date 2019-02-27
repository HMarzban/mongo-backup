const childProcess = require('child_process');


/**
 * Execute input command 
 * @private
 * 
 * @param {String} command 
 * @param {String} commandName 
 */
const ExecuteCommand = (command, commandName) => {
    return new Promise((resolve, reject) => {
        childProcess.exec(command, (err, stdout) => {
        console.log(stdout);
        if (err) reject(`[${commandName} err]: ${err.message}`);

        if (stdout.indexOf('Unknown') >= 1) reject(`[${commandName} err]: ${stdout}`);

        resolve('Operation Done');
        });
    }); // @Promis
}; // @Function: ExecuteCommand();





/**
 * Mongodump is a utility for creating a binary export of the contents of a database.
 * More: https://docs.mongodb.com/manual/reference/program/mongodump/
 * 
 * @public
 * 
 * @param {Object} options 
 * 
 * // => You cannot use the --archive option with the --out option.
 * @param {String} options.archive          test.20150715.gz
 * 
 * @param {Boolean} options.gzip            false
 * @param {String} options.hostName         localhost
 * @param {String} options.userName         admin
 * @param {String} options.password         12345
 * @param {String} options.port             27017
 * @param {String} options.databaseName     productsReview
 * @param {String} options.collectionName   rate
 * @param {String} options.output           ./output.json
 * 
 * 
 * @description command descriptions/example:
 * -h <hostname><:port> => optional
 * -u <username>        => optional
 * -p <password>        => optional
 * -d <database>
 * -c <collection>      => optional
 * --gzip               => optional
 * -o <path>            => optional
 * 
 * @example 
 *  // fully command:   mongodump -h <hostname><:port> -u <username> -p <password> -d <database> -c <collection> --gzip -o <path>
 *  // short command:   mongodump -d <database> 
 * 
 * @returns {Promise}
 */
const mongodump = (options) => {
    
    return new Promise( async (resolve, reject) => {

        let command = `mongodump`;

        if(options.archive)
            command += ` --archive=${options.archive} `;

        if(options.gzip)
            command += ` --gzip `;

        // Default: localhost:27017 base on document.
        if(options.hostName && options.port)
            command += `-h ${options.hostName}:${options.port}`;

        if(options.password && options.userName)
            command += ` -u ${options.password} -p ${options.userName} `;
        
        if(options.databaseName)
            command += ` -d ${options.databaseName} `;
        else
            throw new Error("databaseName option needed.");

        if(options.collectionName)
            command += ` -c ${options.collectionName} `;
        
        if(options.output)
            command += ` -o ${options.output} `;
        
        console.log(command)
        try {
            await ExecuteCommand(command, "mongodump");
            resolve("done");
        } catch (error) {
            reject(error.message);
        }

    }) // @Promis()
    
} // @Function: mongodump()


 
/**
 * Export mongodb collection by 'mongoexport' native command (JSON type).
 * More: https://docs.mongodb.com/manual/reference/program/mongoexport/
 * 
 * WARNING:
 * Avoid using mongoimport and mongoexport for full instance production backups. They do not reliably
 * preserve all rich BSON data types, because JSON can only represent a subset of the types supported by BSON.
 * Use mongodump and mongorestore as described in MongoDB Backup Methods for this kind of functionality.
 * 
 * @public
 * 
 * @param {Object} options 
 * @param {String} options.hostName         localhost
 * @param {String} options.userName         admin
 * @param {String} options.password         12345
 * @param {String} options.port             27017
 * @param {String} options.databaseName     productsReview
 * @param {String} options.collectionName   rate
 * @param {String} options.output           ./output.json
 * 
 * 
 * @description command descriptions/example:
 * -h <hostname><:port> => optional
 * -u <username>        => optional
 * -p <password>        => optional
 * -d <database>
 * -c <collection>
 * -o <file>
 * 
 * @example 
 *  // fully command:   mongoexport -h <hostname>:<:port> -u <username> -p <password> -d <database> -c <collection> -o <file.json>
 *  // short command:   mongoexport -d <database> -c <collection> -o <file.json>
 * 
 * @returns {Promise}
 */
const mongoexport = (options) => {

    return new Promise( async (resolve, reject) => {
        
        let command = `mongoexport `;

        // Default: localhost:27017 base on document.
        if(options.hostName && options.port)
            command += `-h ${options.hostName}:${options.port}`;

        if(options.password && options.userName)
            command += ` -u ${options.password} -p ${options.userName} `;
        
        if(options.databaseName)
            command += ` -d ${options.databaseName} `;
        else
            throw new Error("databaseName option needed.");

        if(options.collectionName)
            command += ` -c ${options.collectionName} `;
        else
            throw new Error("collectionName option needed.");

        if(options.output)
            command += `-o ${options.output}`;
        else
          throw new Error("output option needed.");
        
        try {
            await ExecuteCommand(command, "mongoexport");
            resolve("done");
        } catch (error) {
            reject(error.message);
        }

    }) // @Promis()
    
} // @Function: mongoexport()


module.exports = {
    mongodump,
    mongoexport
}
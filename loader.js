#!/usr/bin/env node

"use strict";

const bulkLoader = require('firestore-bulk-loader');
const program = require('commander');
const fileUtil = require('./file-util');

/**
 * Checks all the required options.
 * @param {*} options 
 */
const checkOptions = (options) => {
    if (options.file === undefined) {
        throw new Error('You must inform a file with the "-f" option!')
    }
    if (options.secret === undefined) {
        throw new Error('You must inform a service account with the "-s" option!');
    }
}

/**
 * Loads all data to the Cloud Firestore.
 * @param {*} data 
 * @param {*} collectionName 
 * @param {*} serviceAccount 
 * @param {*} documentKey 
 */
const loadData = (dataPath, collectionName, serviceAccountPath, documentKey) => {
    const options = {};
    if (documentKey !== undefined) {
        options.documentKeyProperty = documentKey;
    }
    
    options.csv = fileUtil.isCsv(dataPath);

    const data = fileUtil.readFile(dataPath);
    const serviceAccount = fileUtil.readFile(serviceAccountPath);
    const collection = collectionName || 'bulkloader_' + new Date().getTime();

    bulkLoader.load(data, collection, serviceAccount, options);
    console.log(`Collection "${collection}" created.`);
}

program
    .version('1.1.1')
    .description('A command-line tool to help you to load data to Google Cloud Firestore.')
    .option('-c, --collection <value>', 'the collection name')
    .option('-f, --file <value>', 'the file to be imported')
    .option('-i, --id <value>', 'attribute name to use as a document ID')
    .option('-s, --secret <value>', 'the service account file (JSON)')
    .action(() => {
        checkOptions(program);
        loadData(program.file, program.collection, program.secret, program.id);
    });

// must be before .parse() since
// node's emit() is immediate
program.on('--help', () => {
    console.log('')
    console.log('Examples:');
    console.log('  $firestorebl -f ./path/to/data.json -s ./path/to/service-account.json');
    console.log('  $firestorebl -f ./path/to/data.csv -s ./path/to/service-account.json');
    console.log('  $firestorebl --file ./path/to/data.json --secret ./path/to/service-account.json --id example_id');
});

program.parse(process.argv);
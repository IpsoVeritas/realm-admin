/*

This module is used to export poeditor.com translations to i18n json assets.
To use this custom exporter declare it as the exportType in your .poeditor-config file.

Example .poeditor-config:

{
  "targetDir": "src/assets/i18n",
  "apiToken": "[API token from poeditor.com]",
  "projectId": "[Project id from poeditor.com]",
  "projectLanguages": [
    "en",
    "sv",
    "fr"
  ],
  "defaultLanguage": "en",
  "exportType": "poeditor-exporter.js"
}

*/
var fs = require('fs');

function convertListToMap(list) {
    var termToTranslationMap = {};

    list = list.filter(function (t) {
      return t.definition.form ? true : false;
    })

    list.forEach(function (t) {

        var form = t.definition.form;
        var term = t.term;
        var context = t.context.replace(/^"(.*)"$/, '$1');

        if (context && !termToTranslationMap[context]) {
            termToTranslationMap[context] = {};
        }

        context
            ? termToTranslationMap[context][term] = form
            : termToTranslationMap[term] = form;
    });

    return termToTranslationMap;
}

module.exports = function (config, files, callback) {
    if (config.exportSingleFileTarget) {
        var out = fs.createWriteStream(config.targetDir + config.exportSingleFileTarget);
        out.write(JSON.stringify(files, null, 4));
        out.end();

        if (callback) callback();
    } else {

        files.forEach(function (f) {
            var fileName = config.targetDir + f.lang + '.json';
            var out = fs.createWriteStream(fileName);
            out.write(JSON.stringify(convertListToMap(f.terms), null, 4));
            out.end();
        });

        if (callback) callback();
    }
};

const chalk = require('chalk')

exports.errorMessageStyle = (msg, data = '') => console.log(chalk.red.underline.bold(`[ERROR] ${msg}`), data)
exports.infoMessageStyle = (msg, data = '') => console.log(chalk.green.bold(`[ERROR] ${msg}`), data)

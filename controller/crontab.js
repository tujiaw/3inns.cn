const { TextJoke } = require('../models/joke')
const { SearchKey } = require('../models/searchKey')
const { sendToSumscope } = require('../utils/sendmail')
const Util = require('../utils/util')
const axios = require('axios')
const log = require('log4js').getLogger()
const CronJob = require('cron').CronJob

function crontab() {
    let textJokeTotal = 0;

    const clearTodayHit = new CronJob('0 0 * * *', function() {
        log.info('clear today hit job start')
        SearchKey.clearTodayHit()
    })

    const textJokeJob = new CronJob('0 5 * * *', function() {
        log.info('update text joke job start')
        Util.internalHandle(2, 5, (index) => {
            axios.get(`https://www.ningto.com/showapi/textjoke?page=${index}`);
        })
    })

    const sendMailJobj = new CronJob('30 17 * * *', function() {
        log.info('send today hit mail job start')
        //sendToSumscope('today hit', `count:${hitToday}`);
    })

    clearTodayHit.start();
    textJokeJob.start();
    sendMailJobj.start();

    (async function() {
        textJokeTotal = await TextJoke.countDocuments();
        textJokeTotal = textJokeTotal || 10000;
        log.info(`initData, textJokeTotal:${textJokeTotal}`);
    })()

    return {
        textJokeTotal: () => {
            return textJokeTotal;
        }
    }
}

module.exports = crontab();
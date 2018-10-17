const { TextJoke } = require('../models/joke')
const JokeController = require('./joke')
const LaifuController = require('./laifu')
const { getTextJoke, getLaifuJoke } = require('../utils/showapi')
const { sendToSumscope } = require('../utils/sendmail')

function crontab() {
  let hitToday = 0;
  let textJokeTotal = 0;

  const initData = async () => {
    try {
      hitToday = 0;
      textJokeTotal = await TextJoke.countDocuments();
      textJokeTotal = textJokeTotal || 10000;
      console.log(`initData, hitToday:${hitToday}, textJokeTotal:${textJokeTotal}`);
    } catch (err) {
      console.log('initdata error', err);
    }
  }

  const fetchTextJoke = async () => {
    let result;
    try {
      for (let i = 1; i < 6; i++) {
        result = await getTextJoke(i);
        const { showapi_res_body } = result.data
        const { contentlist } = showapi_res_body
        if (Array.isArray(contentlist)) {
          for (const content of contentlist) {
            JokeController.saveTextJoke(content)
          }
        }
      }
    } catch (err) {
      console.log('fetchTextJoke error', err, result);
    }
  }

  const fetchLaifuJoke = async () => {
    let result;
    try {
      result = await getLaifuJoke();
      const { showapi_res_body } = result.data
      const { list } = showapi_res_body
      if (Array.isArray(list)) {
        for (const content of list) {
          LaifuController.saveLaifuJoke(content)
        }
      }
    } catch (err) {
      console.log('fetchLaifuJoke error', err, result);
    }
  }

  initData();
  setInterval(() => {
    const hours = new Date().getHours();
    if (hours === 0) {
      initData();
    }
    if (hours === 3) {
      fetchTextJoke();
      fetchLaifuJoke();
    }
    if (hours === 17) {
      sendToSumscope('today hit', `count:${hitToday}`);
    }
  }, 3600 * 1000);

  return {
    incHitToday: () => {
      return ++hitToday;
    },
    textJokeTotal: () => {
      return textJokeTotal;
    }
  }
}

module.exports = crontab();
const axios = require('axios');

exports.axiosHandler = async (baseURL, accesskey = '', accesstoken = '') => {

  return axios.create({
    baseURL: baseURL,
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "accesskey": accesskey,
      "accesstoken": accesstoken
    },
  });

}
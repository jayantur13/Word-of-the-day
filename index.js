//Author - Jayant Navrange | Source changed

const PORT = process.env.PORT || 8000
const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')
const app = express()

//Some host/os needs below lines to work
app.set('port', PORT);
app.use(express.static(__dirname + '/public'));

//Results
let dc = []
let mw = []
let cd = []
let pm = []
let ld = []
let frr = []

//Msg
var type = 'not available'
var info = '-> Attention sometimes you may get outdated data,lookout <-'

//Get word of the day from all sources
app.get('/word/today', (req, resp) => {
  const s1 = axios.get('https://www.dictionary.com/e/word-of-the-day/')
    .then(function (response) {
      const html = response.data
      const $ = cheerio.load(html)

      const source = '#1'
      const date = $('.otd-item-headword__date').children().first().text().replace(/(\r\n|\n|\r)/gm, "").trim()
      const word = $('.otd-item-headword__word').children().first().text().replace(/(\r\n|\n|\r)/gm, "").trim()
      const mean = $('.otd-item-headword__pos-blocks p:nth-child(2)').first().text().replace(/(\r\n|\n|\r)/gm, "").trim()
      dc = []
      dc.push({ source, date, word, type, mean })
    })
  const s2 = axios.get('https://www.merriam-webster.com/word-of-the-day')
    .then(function (response) {
      const html = response.data
      const $ = cheerio.load(html)

      const source = '#2'
      const date = $('.w-a-title').text().split(':')[1].trim()
      const word = $('.word-and-pronunciation h1').text().replace(/(\r\n|\n|\r)/gm, "").trim()
      const type = $('.word-attributes .main-attr').text().trim()
      const mean = $('.wod-definition-container p').text().replace(/\..*$/, '.').trim()
      mw = []
      mw.push({ source, date, word, type, mean })
    })
  const s3 = axios.get('https://www.shabdkosh.com/word-of-the-day/hindi-english')
    .then(function (response) {
      const html = response.data
      const $ = cheerio.load(html)

      const source = '#3'
      const mmean = $('.border .pt-3').remove().text()//remove pt-3 selector
      const mean = $('.border').children('p').first().text().replace(/(\r\n|\n|\r)/gm, "").trim()
      const date = $('p').children('time').first().text().replace(/(\r\n|\n|\r)/gm, "").trim()
      const word = $('.pt-3').children('a').first().text().replace(/(\r\n|\n|\r)/gm, "").trim()
      cd = []
      cd.push({ source, date, word, type, mean })
    })
  const s4 = axios.get('https://pendulumedu.com/english-vocabulary/word-of-the-day')
    .then((response) => {
      const html = response.data
      const $ = cheerio.load(html)

      const source = '#4'
      const date = $('.pronounce').text().replace(/(\r\n|\n|\r)/gm, "").trim()
      const word = $('.wotd-left h2').text().replace(/(\r\n|\n|\r)/gm, "").trim()
      const type = $('.wotd-right small').text().toLowerCase().trim()
      const mean = $('.wotd-right p').text().split('.')[0].trim()
      pm = []
      pm.push({ source, date, word, type, mean })
    })
  const s5 = axios.get('https://www.learnersdictionary.com/word-of-the-day')
    .then((response) => {
      const html = response.data
      const $ = cheerio.load(html)

      const source = '#5'
      const date = $('.for_date').text().replace(/(\r\n|\n|\r)/gm, "").trim()
      const word = $('.hw_m .hw_txt').text().replace(/(\r\n|\n|\r)/gm, "").trim()
      const type = $('.hw_d span:nth-child(4)').text().trim()
      const mean = $('.midbt p').text().trim()
      ld = []
      ld.push({ source, date, word, type, mean })
    })

  Promise.allSettled([s1, s2, s3, s4, s5]).then(values => {
    frr = []
    infomsg = []
    infomsg.push({ info })
    frr = [].concat(info, dc, mw, cd, pm, ld)
    resp.status(200).json(frr)

  }).catch(err => resp.json(err.message))
})

//Get all words from Dictionary.com
app.get('/word/dc/recent', (req, resp) => {
  axios.get('https://www.dictionary.com/e/word-of-the-day/')
    .then((response) => {
      const html = response.data
      const $ = cheerio.load(html)
      const finalres = []

      $('.otd-item-headword', html).each(function () {
        const date = $(this).find('.otd-item-headword__date').text().replace(/(\r\n|\n|\r)/gm, "").trim()
        const word = $(this).find('.otd-item-headword__word').text().replace(/(\r\n|\n|\r)/gm, "").trim()
        const mean = $(this).find('.otd-item-headword__pos p:nth-child(2)').first().text().replace(/(\r\n|\n|\r)/gm, "").trim()
        finalres.push({
          date,
          word,
          type,
          mean
        })
      })

      resp.json(finalres)
    }).catch(err => resp.json(err.message))

})


//Get wotd from Dictionary.com
app.get('/word/dc', (req, resp) => {
  axios.get('https://www.dictionary.com/e/word-of-the-day/')
    .then((response) => {
      const html = response.data
      const $ = cheerio.load(html)
      const arr = []

      const date = $('.otd-item-headword__date').children().first().text().replace(/(\r\n|\n|\r)/gm, "").trim()
      const word = $('.otd-item-headword__word').children().first().text().replace(/(\r\n|\n|\r)/gm, "").trim()
      const mean = $('.otd-item-headword__pos-blocks p:nth-child(2)').first().text().replace(/\r?\n?/g, '').trim()
      arr.push({
        info,
        date,
        word,
        type,
        mean
      })
      resp.json(arr)
    }).catch(err => resp.json(err.message))

})

//Get wotd from Merriam Webster
app.get('/word/mw', (req, resp) => {
  axios.get('https://www.merriam-webster.com/word-of-the-day')
    .then((response) => {
      const html = response.data
      const $ = cheerio.load(html)
      const arr = []

      const date = $('.w-a-title').text().split(':')[1].trim()
      const word = $('.word-and-pronunciation h1').text().replace(/(\r\n|\n|\r)/gm, "").trim()
      const mean = $('.wod-definition-container p').text().replace(/\..*$/, '.').trim()
      const type = $('.word-attributes .main-attr').text().trim()
      arr.push({
        info,
        date,
        word,
        type,
        mean
      })
      resp.json(arr)
    }).catch(err => resp.json(err.message))

})

//Get wotd from Shabdkosh Dictionary
app.get('/word/cd', (req, resp) => {
  axios.get('https://www.shabdkosh.com/word-of-the-day/hindi-english')
    .then((response) => {
      const html = response.data
      const $ = cheerio.load(html)
      const arr = []

      const mmean = $('.border .pt-3').remove().text()//remove pt-3 selector
      const mean = $('.border').children('p').first().text().replace(/(\r\n|\n|\r)/gm, "").trim()
      const date = $('p').children('time').first().text().replace(/(\r\n|\n|\r)/gm, "").trim()
      const word = $('.pt-3').children('a').first().text().replace(/(\r\n|\n|\r)/gm, "").trim()
      arr.push({
        info,
        date,
        word,
        type,
        mean
      })
      resp.json(arr)
    }).catch(err => resp.json(err.message))

})


//Get wotd from pendulumedu
app.get('/word/pm', (req, resp) => {
  axios.get('https://pendulumedu.com/english-vocabulary/word-of-the-day')
    .then((response) => {
      const html = response.data
      const $ = cheerio.load(html)
      const arr = []

      const date = $('.pronounce').text().replace(/(\r\n|\n|\r)/gm, "").trim()
      const word = $('.wotd-left h2').text().replace(/(\r\n|\n|\r)/gm, "").trim()
      const m1 = $('.wotd-right p').text().replace(/\"/g, '-')
      const mean = m1.split('-')[0]
      const type = $('.wotd-right small').text().toLowerCase().trim()
      arr.push({
        info,
        date,
        word,
        type,
        mean
      })
      resp.json(arr)
    }).catch(err => resp.json(err.message))

})

//Get wotd from Learners Dictionary
app.get('/word/ld', (req, resp) => {
  axios.get('https://www.learnersdictionary.com/word-of-the-day')
    .then((response) => {
      const html = response.data
      const $ = cheerio.load(html)
      const arr = []

      const date = $('.for_date').text().replace(/(\r\n|\n|\r)/gm, "").trim()
      const word = $('.hw_m .hw_txt').text().replace(/(\r\n|\n|\r)/gm, "").trim()
      const type = $('.hw_d span:nth-child(4)').text().trim()
      const mean = $('.midbt p').text().trim()

      arr.push({
        info,
        date,
        word,
        type,
        mean
      })
      resp.json(arr)
    }).catch(err => resp.json(err.message))

})

app.get('/', (req, res) => {
  res.json('Welcome,read the guide to use the api..')
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
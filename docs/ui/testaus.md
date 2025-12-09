# Testaus

## Automatisoitu selaintestaus

Selaintestaus tehdään [Nightwatch.js](http://nightwatchjs.org/)-työkalulla.

### Testien ajaminen

Tarvittavat riippuvuudet asennetaan kehitysympäristön pystytyksen mukana. 

- aja `npm install {-g} nightwatch` ja `npm run e2e-setup` juuressa

- kopioi `docs/ui/tiedostot/nightwatch.json` juureen ja muuta 
 `test_settings.default.launch_url`:n arvoksi Scala-projektin konfiguraatiotiedostoon
 määritelty palvelimen portti

- kopioi `docs/ui/tiedostot/environments.json` `ui/app/resources/test/nightwatch`-kansioon
ja muuta arvot oikeiksi

- `npm run e2e-smoketests` ajaa kaikki `../nightwatch/smoketests`-kansiossa olevat testit

- yksittäisiä testejä ajetaan komennolla
`nightwatch -t ui/app/resources/test/nightwatch/{componentTests|smoketests}/{testin nimi}.js` 

Raportit ja kuvakaappaukset epäonnistuneista testeistä luodaan 
`../nightwatch/reports`-kansioon. 

Käyttäjätunnuksen ja salasanan sisältävää `environments.json`ia ei saa commitoida Githubiin.

### Konfiguraatio

`commands.js` Testeissä yleisesti käytettyjä komentoja, esim. luokan työpöydälle
kirjautuminen (http://nightwatchjs.org/guide#extending).

`config.js` Testeissä käytetyt globaalit muuttujat.

`pageObjects.js` Selektorit testien käyttämille elementeille 
(http://nightwatchjs.org/guide#page-objects). 

Testattavat elementit merkataan komponenteissa `data-selenium-id="{nimi}"`-arvolla.

Testejä ajaessa paikallisen kannan on oltava tyhjä tiedotteista ja aikajanan tapahtumista.

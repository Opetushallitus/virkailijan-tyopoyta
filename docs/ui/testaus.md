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
`nightwatch -t {polku testikansioon}/{componentTests|smoketests}/{testin nimi}.js` 

### Konfigurointi

Testejä ajaessa paikallisen kannan on oltava tyhjä tiedotteista ja aikajanan tapahtumista.

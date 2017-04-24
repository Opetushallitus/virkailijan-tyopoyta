# Tilan hallinta

Sovelluksen tila koostetaan useasta [Bacon.js](https://baconjs.github.io/):n 
[Bus](https://baconjs.github.io/api.html#new-bacon-bus)-tyyppisestä 
event streamista. Niistä palautuu objekti, joka annetaan App-komponentille 
(`ui/app/components/App.jsx`) `props`eissa. 

Kun tila muuttuu, Reactin virtuaali-DOM hoitaa 
komponenttien päivittämisen. Komponenttien omaa `state`a käytetään harvoissa tapauksissa.

## appState, controller ja dispatcher

Jokainen käyttäjän tekemä toiminto on oma streaminsa, joka yhdistetään sovelluksen tilan 
streamiin (`ui/app/appState.js: appState`). Toiminnot määritellään controllerin 
(`ui/app/controller.js`) metodeina.

Dispatcher (`ui/app/dispatcher.js`) hoitaa streamien liittämisen ja arvojen 
välittämisen.

Malli on kuvattu tarkemmin allaolevissa artikkeleissa:

https://github.com/milankinen/react-bacon-todomvc
https://medium.com/milankinen/good-bye-flux-welcome-bacon-rx-23c71abfb1a7

## Sovelluksen alustus

1. alustetaan tila (`state/appState.js: initAppState`) ja 
renderöidään sovellus (`index.jsx`)

2. tehdään kirjautuminen AJAX-kutsulla `state/user.js: fetch`

3. jos kirjautuminen onnistuu:
- haetaan käännökset lokalisointipalvelusta 
tai lokaalista käännöstiedostosta (`data/translations.json`):
`state/translations.js: fetch`
- kun käännökset on haettu, haetaan kaikki muu tarvittava sisältö erillisillä kutsuilla
`state/appState.js: getStateData`

4. komponentteja päivitetään sitä mukaa kun kutsut onnistuvat

## Tilan muuttaminen

Tilaa muutetaan aina kloonamalla tilaobjekti ja asettamalla/ylikirjottamalla halutut
arvot. `ui/state/*.js`:n metodeissa tähän on käytetty 
[Ramda](https://github.com/ramda/ramda)-kirjaston 
[assoc](http://ramdajs.com/docs/#assoc)-, 
[assocPath](http://ramdajs.com/docs/#assocPath)- ja 
[compose](http://ramdajs.com/docs/#compose)-funktioita. 

**Esimerkki:**

```
function update (state, {muokattava arvo}) {
  return R.assoc('{muokattavan arvon avain}', {muokattava arvo}, state) 
}
```

Metodin on aina palautettava uusi tilaobjekti, jotta appState voi koostaa 
uuden tilan.

Asynkroniset muutokset tehdään määrittelemällä kutsun suorittava metodi, 
uusi Bus kutsun onnistumista sekä epäonnistumista varten, 
callback-metodit molemmille tapahtumille ja yhdistämällä ne `appState`ssa:

```
// user.js

const fetchBus = new Bacon.Bus()
const fetchFailedBus = new Bacon.Bus()

// Kutsu
function fetch () {
  http({
    ...
    onSuccess: user => fetchBus.push(user),
    onError: error => fetchFailedBus.push(error)
  })
}

// Callback kutsun onnistuessa
function onReceived (state, response) {
  // Tehdään tilan muutokset ja palautetaan uusi tilaobjekti
}

// Callback kutsun epäonnistuessa
function onFetchFailed (state) {
  // Tehdään virheenkäsittely ja palautetaan uusi tilaobjekti
}

// appState.js

export function appState () {
  return Bacon.update(
    ...
    [user.fetchBus], user.onReceived,
    [user.fetchFailedBus], user.onFetchFailed,
    ...
  )
}
```

Kun kutsu valmistuu, vastaus tai virhe annetaan Bus-streamille, jonka saadessa arvon
kutsutaan callback-metodia.

## Esimerkkidata

Tietokannan datasta on esimerkit `ui/app/resources/test/testData.json`:ssa.

Esimerkkejä voi käyttää tuomalla ne koodiin:

`import * as testData from './{polku kansioon}/testData.json`

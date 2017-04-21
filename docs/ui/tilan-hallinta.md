# Tilan hallinta

Sovelluksen tilaa hallitaan [Bacon.js](https://baconjs.github.io/):n event streamina.
Se palauttaa objektin, joka annetaan App-komponentille (`ui/app/components/App.jsx`) 
`props`eissa. 

Kun tila muuttuu, Reactin virtuaali-DOM hoitaa 
komponenttien päivittämisen. Komponenttien omaa `state`a käytetään harvoissa tapauksissa.

## appState, controller ja dispatcher



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

# Tilan hallinta

Sovelluksen tila on yhdessä objektissa, joka annetaan App-komponentille 
(`ui/app/components/App.jsx`) propseissa. Kun tila muuttuu, Reactin virtuaali-DOM hoitaa 
komponenttien muutokset.

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

4. sisältöä renderöidään sitä mukaa kun kutsut onnistuvat

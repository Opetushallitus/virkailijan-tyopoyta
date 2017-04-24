# Code style

## JavaScript & React/JSX

JavaScriptin kirjoittamisessa noudatetaan [Javascript Standard Styleä](https://standardjs.com/).

IntelliJ:lle ja WebStormille on valmiit asetukset projektin juuressa `standard.xml`:ssä. 

React-komponenttien ja JSX:n kirjoittamisessa noudatetaan 
[Airbnb React/JSX Style Guidea](https://github.com/airbnb/javascript/tree/master/react).
 
Propsit järjestään JSX:ssä tyypin mukaan:
1. `key/ref/index`
2. `id`
3. `className`
4. `data`-ominaisuudet
5. muut
 
Koodi validoidaan [ESLintillä](http://eslint.org/). Webpackilla kääntäessä validointivirheet
estävät kääntämisen.

Poikkeukset sääntöihin lisätään projektin juureen `.eslintrc`:hen.

## CSS

- sisennykset kahdella välilyönnillä
- `"` lainausmerkkinä
- käytetään relatiivisia yksikköjä absoluuttisten sijasta (`rem/em/%` > `px/pt`)

Ominaisuudet järjestetään tyypin mukaan:
1. typografiaan liittyvät (`font-size`, `font-family`...)
2. ulkoasuun liittyvät (`position`, `display`, `float`, `clear`...)
3. box modeliin liittyvät (`width`, `height`, `margin`, `padding`...)
4. ulkonäköön liittyvät (`color`, `background`, `border`...)
5. muut (`cursor`, `overflow`...)

Luokat nimetään komponentin, variantin ja tilan mukaan:

`{komponentti}-{variantti}-{tila}`, esim. 

`.notification`

`.notification-disruption`

`.notification-is-expanded`

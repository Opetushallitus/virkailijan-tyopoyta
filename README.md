# Virkailijan työpöytä

Virkailijan työpöytä on React/Scala-sovellus, jossa kentän virkailijat ja OPH:n työntekijät
voivat katsella ja julkaista tiedotteita sekä tapahtumia.

Dokumentaatio löytyy [docs](docs)-kansiosta.

## Paikallinen kehitysympäristö

### Vaatimukset

- [Node.js & npm](https://nodejs.org/en/)
- [Scala sbt](http://www.scala-sbt.org/)
- [Git](https://git-scm.com/)
- paikallinen konfiguraatiotiedosto, `common.properties` tai `application.conf`

Käyttöliittymän kehitystä varten asenna myös selaimellesi React Developer Tools -lisäosa
(esim. [Chromelle](https://github.com/facebook/react-devtools)).

### Konfiguraatiotiedosto

### Rakentaminen

Ensimmäisellä kerralla:
- kloonaa repositorysta `uusi-tyopoyta`-branch
- `npm install` ja `npm run build` juuressa

Jatkossa:
- `sbt run`
- toisessa terminaalissa/välilehdellä `npm run start-dev` 
- avaa selaimeen `localhost:{määritelty portti}/virkailijan-tyopoyta`

Käyttöliittymä rakennetaan `target/scala-2.11/classes/ui`-kansioon, jota Webpack
vahtii. Muutokset `ui`-kansion tiedostoihin käynnistävät käyttöliittymän rakentamisen.

### Internet Explorer

Sovellus vaatii IE:llä toimiakseen [fetch](https://github.com/github/fetch)- 
ja [Babel](https://babeljs.io/docs/usage/polyfill/)-polyfillit.

Luokalla, QA:lla ja tuotantoympäristöissä ne tulevat virkailijan raamien kautta, mutta
paikallisesti IE:llä testatessa ne täytyy tuoda App.jsx:ään:

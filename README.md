# Virkailijan työpöytä

Virkailijan työpöytä on React/Scala-sovellus, jossa kentän virkailijat ja OPH:n työntekijät
voivat katsella ja julkaista tiedotteita sekä tapahtumia.

Dokumentaatio löytyy [docs](docs)-kansiosta.

## Paikallinen kehitysympäristö

### Vaatimukset

- [Node.js & npm](https://nodejs.org/en/)
- [Scala sbt](http://www.scala-sbt.org/)
- paikallinen konfiguraatiotiedosto, `common.properties` tai `application.conf`

### Konfiguraatiotiedosto

### Rakentaminen

Ensimmäisellä kerralla:
- kloonaa repositorysta `virkailijan-tyopoyta`-branch
- `npm install` ja `npm run build` juuressa

Jatkossa:
- `sbt run`
- toisessa terminaalissa/välilehdellä `npm run start-dev` 
- avaa selaimeen `localhost:{määritelty portti}/virkailijan-tyopoyta`

Käyttöliittymä rakennetaan `target/scala-2.11/classes/ui`-kansioon, jota Webpack
vahtii. Muutokset `ui`-kansion tiedostoihin käynnistävät käyttöliittymän rakentamisen.

# Virkailijan työpöytä

Virkailijan työpöytä on React/Scala-sovellus, jossa kentän virkailijat ja OPH:n työntekijät
voivat katsella ja julkaista tiedotteita sekä tapahtumia.

Käyttöliittymän dokumentaatio löytyy [docs](docs/ui/index.md)-kansiosta.

## Paikallinen kehitysympäristö

### Vaatimukset

- [Node.js & npm](https://nodejs.org/en/)
- [Scala sbt](http://www.scala-sbt.org/)
- [Git](https://git-scm.com/)
- paikallinen konfiguraatiotiedosto `common.properties`

Asenna käyttöliittymän kehitystä varten selaimellesi React Developer Tools -lisäosa
(esim. [Chromelle](https://github.com/facebook/react-devtools)).

### Konfiguraatiotiedosto

### Rakentaminen

Ensimmäisellä kerralla:
- kloonaa repositorysta `uusi-tyopoyta`-branch
- `npm install` ja `npm run build` juuressa
- Kopioi `virkailijan-tyopoyta.properties.template` arvot `~/oph-properties/common.properties` tiedostoon

Jatkossa:
- `sbt run`
- toisessa terminaalissa/välilehdellä `npm run start-dev` 
- avaa selaimessa URL `localhost:{määritelty portti}/virkailijan-tyopoyta`

Käyttöliittymä rakennetaan `target/scala-2.11/classes/ui`-kansioon, jota Webpack
vahtii. Muutokset `ui`-kansion tiedostoihin käynnistävät käyttöliittymän rakentamisen.

Ajettavan jarrin tuottaminen `mvn clean install`
Frontin minifioitu versio `npm run dist'

Swagger-dokumentaatio osoitteessa http://localhost:8081/virkailijan-tyopoyta/swagger

### Internet Explorer

Sovellus vaatii IE:llä toimiakseen [fetch](https://github.com/github/fetch)- 
ja [Babel](https://babeljs.io/docs/usage/polyfill/)-polyfillit.

Luokalla, QA:lla ja tuotantoympäristöissä ne tulevat virkailijan raamien kautta, mutta
paikallisesti IE:llä testatessa ne täytyy tuoda index.jsx:ään:

```
import 'whatwg-fetch'
import 'babel-polyfill'
```

Kyseistä muutosta ei saa viedä version hallintaan konfliktien välttämiseksi.

### Sovelluksen komponentit

Authentication - Käyttäjän autentikointi ja käyttäjän perustietojen haku

Migration - Tietokantamigraatiot

Repository  - Tietokantahaut

Routes  - Reititys

Scheduler - Ajastetut tehtävät: Koostesähköpostien lähetys ja työpöytään liitettyjen käyttöoikeusryhmien päivitys

Server - Webbiserveri

Service - Palvelukerros: Käyttäjään, julkaisuihin ja sähköposteihin liittyvät operaatiot
   

### Integraatiot ulkoisiin järjestelmiin

CAS 
- Käyttäjän autentikointi ja autentikoidut kutsut muihin järjestelmiin

LDAP 
- Autentikoidun käyttäjän tietojen haku

Käyttöoikeuspalvelu 
- Työpöytään liitettyjen käyttöoikeusryhmien haku
- Käyttäjän käyttöoikeusryhmien haku
- Käyttöoikeusryhmien jäsenten haku sähköpostin lähetystä varten
  
Oppijanumerorekisteri 
- Käyttäjän kutsumanimen haku (tiedotteen laatijan nimikirjaimet)
- Käyttäjien yhteystietojen haku sähköposteihin

Ryhmäsähköpostipalvelu 
- Sähköpostien lähetys

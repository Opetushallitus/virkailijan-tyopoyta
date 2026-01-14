# Virkailijan työpöytä

Virkailijan työpöytä ("virkailijan sähköinen työpöytä", "VST") on React/Scala-sovellus,
jossa kentän virkailijat ja OPH:n työntekijät voivat katsella ja julkaista tiedotteita sekä tapahtumia.

Käyttöliittymän dokumentaatio löytyy [docs](docs/ui/index.md)-kansiosta.

## Paikallinen kehitysympäristö

### Vaatimukset

- [Node.js & pnpm](https://pnpm.io/)
- [Scala sbt](http://www.scala-sbt.org/)
- [Git](https://git-scm.com/)
- paikallinen konfiguraatiotiedosto `common.properties`

Asenna käyttöliittymän kehitystä varten selaimellesi React Developer Tools -lisäosa
(esim. [Chromelle](https://github.com/facebook/react-devtools)).

### Konfiguraatiotiedosto

### Rakentaminen

Ensimmäisellä kerralla:
- `pnpm install` ja `pnpm run build` juuressa
- Tee `common.properties.template` -tiedoston pohjalta jonnekin tiedosto `oph-properties/common.properties`
  ja syötä sinne sopivat arvot. Tai voit kopioida tiedoston pohjaksi palvelinympäristön palvelimelta.

Jatkossa:
- Käynnistä `fi.vm.sade.vst.Main` -luokka, ja laita JVM:n ajoparametriksi VST:n `oph-configuration` sisältämän
  hakemisto käyttäjän kotihakemistoksi, esim `-Duser.home=/home/thrantal/oph-confs/virkailijan-tyopoyta-hahtuva`
- toisessa terminaalissa/välilehdellä `pnpm run start-dev` 
- avaa selaimessa URL `localhost:{määritelty portti}/virkailijan-tyopoyta`

Käyttöliittymä rakennetaan `target/scala-2.11/classes/ui`-kansioon, jota Webpack
vahtii. Muutokset `ui`-kansion tiedostoihin käynnistävät käyttöliittymän rakentamisen.

Ajettavan jarrin tuottaminen `mvn clean install`
Frontin minifioitu versio `pnpm run dist`

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

Käyttöoikeuspalvelu 
- Autentikoidun käyttäjän tietojen haku
- Työpöytään liitettyjen käyttöoikeusryhmien haku
- Käyttäjän käyttöoikeusryhmien haku
- Käyttöoikeusryhmien jäsenten haku sähköpostin lähetystä varten
  
Oppijanumerorekisteri 
- Käyttäjän kutsumanimen haku (tiedotteen laatijan nimikirjaimet)
- Käyttäjien yhteystietojen haku sähköposteihin

Viestinvälityspalvelu 
- Sähköpostien lähetys

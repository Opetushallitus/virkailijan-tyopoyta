# Tiedotteen muokkaus

`/ui/app/components/editor/EditNotification.jsx`

Tiedotetta muokataan editorin tiedote-välilehdellä.

Välilehden valinnassa näytettävä validaatioteksti määräytyy sen mukaan, onko tiedote:
- tyhjä, yhtään pakollista kenttää ei ole täytetty
- keskeneräinen, yksi tai useampi pakollinen kenttä on täytetty
- valmis, kaikki pakolliset kentät on täytetty ja vähintään yksi avainsana on valittu

Julkaisu- ja poistumispäivämäärä voi olla aikaisintaan kuluva päivä.

## Toiminnallisuudet

Käyttäjä täyttää yhden pakollisen kentän:
- avainsanat näytetään kohdennus-välilehdellä

Käyttäjä tyhjentää kaikki pakolliset kentät:
- avainsanat piilotetaan kohdennus-välilehdeltä

Käyttäjä valitsee/poistaa häiriötiedote-ruksin:
- häiriötiedotetta käsitellään erikoisavainsanana
- käyttäjän ei tarvitse valita muita avainsanoja, 
jos tiedote on merkattu häiriötiedotteeksi

Käyttäjä valitsee julkaisupäivämäärän:
- jos poistumispäivämäärä on aikaisempi, se päivitetään uudeksi julkaisupäivämääräksi

Käyttäjä valitsee poistumispäivämäärän
- jos julkaisupäivämäärä on aikaisempi, se päivitetään uudeksi poistumispäivämääräksi

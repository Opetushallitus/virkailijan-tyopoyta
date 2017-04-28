# Kohdennus

`/ui/app/components/editor/targeting/Targeting.jsx`

Julkaisu kohdennetaan tiettyihin kategorioihin ja käyttöoikeusryhmiin sekä tiedotteelle
valitaan avainsanat editorin kohdennus-välilehdellä.

Käyttöoikeusryhmän valintakenttä on toteutettu 
[Dropdown](http://react.semantic-ui.com/modules/dropdown)-komponentilla.

Välilehden valinnassa näytettävä validaatioteksti määräytyy valintojen mukaan:
- ei kohdennettu, käyttöoikeusryhmää ei ole valittu & jos tiedote on keskeneräinen/
täytetty eikä avainsanaa ole valittu
- kohdennettu, kaikki valinnat on tehty

## Toiminnallisuudet

Käyttäjä valitsee/poistaa kategorian:
- käyttöoikeusryhmän valintakentän otsikko muuttuu
- kentän vaihtoehdot suodatetaan niihin käyttöoikeusryhmiin jotka liittyvät valittuihin 
kategorioihin
- jos tiedote on keskeneräinen/valmis, niiden avainsanaryhmien painikkeet 
poistetaan käytöstä jotka eivät liity valittuihin kategorioihin
- kyseisten painikkeiden valinnat poistetaan

Käyttäjä valitsee käyttöoikeusryhmän:
- vaihtoehto poistetaan pudotusvalikosta ja näytetään erillisenä painikkeena

Käyttäjä syöttää kohderyhmävalinnan nimen:
- jos nimi on jollain käytössä jollain kohderyhmävalinnalla, näytetään validaatioviesti ja
esikatsele/julkaise-painike poistetaan käytöstä
- kohderyhmävalinta tallennetaan jos julkaisu onnistuu

Vaihtoehto "Kohdenna kaikille käyttöoikeusryhmille" on erikoistapaus, joka tarkoittaa
kohdentamista kaikille suodatetuille ryhmille. Se näytetään riippumatta
kategoriavalinnoista.

Käyttäjä valitsee Lähetä sähköpostia -valinnan (näkyvissä jos tiedote on keskeneräinen
tai valmis)
- julkaisemisen onnistuessa tehdään AJAX-kutsu sähköpostin lähettämiseksi


## Tiedotteet

`/ui/app/components/notifications/Notifications.jsx`

Peruskäyttäjä voi katsella [tavallisia tiedotteita sekä häiriötiedotteita](tiedote.md) 
Ylläpitokäyttäjä voi avata muokattavaksi, poistaa tiedotteita sekä käyttää 
[tiedotevalikkoa](tiedotevalikko.md).

Tiedotelistaa voi rajata [avainsanojen](tiedotteiden-avainsanarajaus.md) ja 
[kategorioiden](tiedotteiden-kategoriarajaus.md) perusteella.

Häiriötiedotteet ja tavalliset tiedotteet haetaan backendistä erillisillä AJAX-kutsuilla. 
Hauissa palautuvat vain ne tiedotteet, joihin käyttäjällä on oikeudet 
käyttöoikeusryhmiensä perusteella.

Tavalliset tiedotteet on sivutettu.

## Tyhjä tila

Listassa näytetään teksti, jos haku ei ole palauttanut tiedotteita.
Teksti vaihtuu sen mukaan, onko käyttäjä rajannut hakua vai ei.

## Lataustila

Listalla näytetään latausanimaatio, jos tavallisten tai häiriötiedotteiden
haku kestää yli yhden sekunnin.

## Virhetila

Jos haku epäonnistuu, näkymässä näytetään virheilmoitus. 

## Ideaalitila

Tiedotteet on listattu julkaisupäivämäärän mukaan nousevasti. Mahdolliset häiriötiedotteet
ovat listan alussa riippumatta käyttäjän tekemistä rajauksista.

Jos käyttäjällä on tallennettuja kategoriarajauksia, listalla näytetään vain kyseisiin
kategorioihin kuuluvat tiedotteet.

Jos tavallisia tiedotteita on enemmän kuin yksi sivu, listan viimeisenä näytetään tyhjä, 
ns. placeholder-tiedote ja latausanimaatio.

## Toiminnallisuudet

Käyttäjä skrollaa sivua placeholder-tiedotteeseen asti:
- haetaan seuraava sivu
- uudet tiedotteet lisätään listan loppuun
- kun viimeinen sivu on ladattu, placeholder ja latausanimaatio piilotetaan näkyvistä

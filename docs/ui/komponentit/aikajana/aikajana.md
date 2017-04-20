# Aikajana

`/ui/app/components/timeline/Timeline.jsx`
`/ui/app/components/timeline/TimelineHeading.jsx`
`/ui/app/components/timeline/TimelineDay.jsx`

Peruskäyttäjä voi katsella tapahtumia aikajanalta. Ylläpitokäyttäjä voi avata 
muokattavaksi ja poistaa tapahtumia.

Tapahtumat haetaan backendistä AJAX-kutsuilla kuukausi kerrallaan. 
Hauissa palautuvat vain ne tapahtumat, joihin käyttäjällä on oikeudet 
käyttöoikeusryhmiensä perusteella.

Aikajana koostuu:
- jokaista kuukautta kohden näytettävästä otsikosta, jossa on kuukauden nimi ja vuosi
- tapahtumista

Aikajanalle haetaan automaattisesti uusia kuukausia niin kauan, kunnes tapahtumat tai 
otsikot täyttävät koko komponentin korkeuden.

Tiedotelistaan tehdyt rajaukset eivät vaikuta aikajanaan.
 
## Tyhjä tila

Näytetään aikajanan viiva.

## Lataustila

Aikajanan viiva ja latausanimaatio, jos tapahtumien haku kestää yli yhden sekunnin.

## Osittainen tila

Aikajanalla näkyy yhdestä useampaan tapahtumaa tai otsikkoa.

## Virhetila

Jos haku epäonnistuu, näkymässä näytetään virheilmoitus. Uusien tapahtumien
haku estetään siihen asti, kunnes käyttäjä päivittää sivun, julkaisee uuden 
tiedotteen/tapahtuman tai muokkaa tiedotetta/tapahtumaa (aikajana tyhjennetään ja
tapahtumat haetaan tällöin uudelleen).

## Ideaalitila

Tapahtumat ja otsikot täyttävät koko komponentin korkeuden. Aikajana on selattu kuluvan 
kuukauden kohdalle ja ensimmäisenä näkyy seuraava tuleva tapahtuma.
Aikajanan alussa ja lopussa näytetään latausanimaatiot.
 
## Toiminnallisuudet

Käyttäjä skrollaa aikajanan ensimmäisen kuukauden yli:
- haetaan edellisen kuukauden tapahtumat TAI kuluvan kuukauden edelliset tapahtumat
jos sellaisia on
- kuluvan kuukauden edellisille tapahtumille näytetään oma otsikko
- aikajana skrollataan automaattisesti haetun kuukauden otsikon kohdalle

Käyttäjä skrollaa aikajanan lopussa olevan latausanimaation kohdalle:
- haetaan seuraavan kuukauden tapahtumat

Käyttäjä skrollaa sivua:
- aikajana siirtyy skrollauksen mukana

Käyttäjä vie kursorin aikajanan päälle / pois aikajanan päältä:
- sivun vierityspalkki piilotetaan/näytetään (estää sivun skrollauksen samalla 
jos käyttäjä skrollaa aikajanan alkuun/loppuun)

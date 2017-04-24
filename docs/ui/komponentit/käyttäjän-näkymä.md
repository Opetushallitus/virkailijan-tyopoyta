# Käyttäjän näkymä

`/ui/app/components/App.jsx`

Käyttäjän näkymä koostuu useasta komponentista:
- ilmoitus epäonnistuneesta kirjautumisesta
- [editori](editori/editori.md)
- [julkaisemattomat tiedotteet](julkaisemattomat-tiedotteet.md)
- [tiedotteet](tiedotteet)
- [aikajana](aikajana/aikajana.md)
- ilmoitukset

Kirjautuminen tehdään AJAX-kutsulla, ennen kuin näkymässä näytetään mitään.

Pienillä näytöillä näkymä on jaettu kahteen välilehteen.

Näkymässä näytetään AJAX-kutsuihin liittyviä ilmoituksia, joita voi olla kerrallaan
näkyvissä rajallinen määrä. Käyttäjä voi sulkea ilmoituksia käsin.

Jos uudessa ilmoituksessa on sama otsikko kuin edellisessä, se korvaa edellisen.

Jos ilmoituksia on näkyvissä maksimimäärä, uusi korvaa viimeisimmän.

## Lataustila

Näytetään tyhjä ruutu ja latausanimaatio, jos kirjautuminen kestää 
yli yhden sekunnin.

## Osittainen tila

Kun käyttäjän tiedot on haettu onnistuneesti, jokainen komponentti näytetään erikseen
kun sen tarvitsemat tiedot on haettu. Komponenteilla on omat tilansa. 

## Virhetila

Jos kirjautuminen epäonnistuu, näkymässä näytetään virheilmoitus.

Jos sessio on vanhentunut, käyttäjä uudelleenohjataan kirjautumissivulle.

## Ideaalitila

Komponentit ovat näkyvissä ja niiden sisältö on haettu onnistuneesti.

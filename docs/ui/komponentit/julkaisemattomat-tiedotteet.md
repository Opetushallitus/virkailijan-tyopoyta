# Julkaisemattomat tiedotteet 

`/ui/app/components/notifications/UnpublishedNotifications.jsx`
`/ui/app/components/notifications/UnpublishedNotification.jsx`

Julkaisemattomat tiedotteet esitetään modaalisessa ikkunassa, joka avataan
tiedotevalikosta.

Tiedotteet haetaan backendistä AJAX-kutsulla kun ikkuna avataan. 
Hakua ei tehdä uudestaan, jos tiedotteita on jo palautunut.

## Tyhjä tila

Näytetään teksti, jos haku ei ole palauttanut tiedotteita.

## Lataustila

Näytetään latausanimaatio, jos haku kestää yli yhden sekunnin.

## Virhetila

Jos haku epäonnistuu, ikkunassa näytetään virheilmoitus.

## Ideaalitila

Listan otsikot ja julkaisemattomat tiedotteet näytetään ikkunassa.

Yksittäisestä tiedotteesta näytetään:
- käyttöliittymän kielen mukainen otsikko (suomenkielinen, jos kyseistä kieliversiota 
ei ole)
- luomispäivämäärä
- julkaisupäivämäärä
- tiedotteen luojan nimikirjaimet

## Toiminnallisuudet

Käyttäjä painaa tiedotteen otsikkoa:
- editori avataan tiedote-välilehteen ja tiedotteen julkaisu 
haetaan AJAX-kutsulla

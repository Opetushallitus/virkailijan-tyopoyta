# Aikajanan tapahtuma

`/ui/app/components/timeline/TimelineItem.jsx`

## Lataustila

Tapahtuman poiston ollessa kesken, painallukset estetään ja sen päällä 
näytetään latausanimaatio.

## Virhetila

Jos poisto epäonnistuu, näkymässä näytetään virheilmoitus.

## Ideaalitila

Tapahtumalla näkyy:
- päivämäärä, päivän nimi, kuukauden nimi ja vuosi, jos kyseessä on päivän
ensimmäinen tapahtuma
- käyttöliittymän kielen mukainen tapahtuman teksti (suomenkielinen, jos kyseistä 
kieliversiota ei ole)
- näytä tiedote -painike, jos tapahtuman julkaisulla on myös julkaistu tiedote

Ylläpitokäyttäjälle:
- muokkaa- ja poista-painikkeet

## Toiminnallisuudet

Käyttäjä painaa näytä tiedote -painiketta:
- jos tapahtumaan liittyvä tiedote on näkyvissä tiedotelistalla, sivu skrollataan
sen alkuun ja tiedotteen koko kuvaus näytetään
- jos tiedote ei ole listalla, haetaan kyseinen tiedote AJAX-kutsulla
- valitut avainsanat ja kategoriat poistetaan

Käyttäjä painaa muokkaa-painiketta:
- editori avataan aikajana-välilehteen ja tapahtuman julkaisu haetaan 
AJAX-kutsulla muokattavaksi

Käyttäjä painaa poista-painiketta:
- näytetään vahvista- ja peruuta-painikkeet sekä piilotetaan poista-painike
 
Käyttäjä painaa vahvista-painiketta:
- tehdään AJAX-kutsu tapahtuman poistamiseksi, jonka valmistuttua tapahtuma poistetaan
listalta

Käyttäjä painaa peruuta-painiketta:
- piilotetaan vahvista- ja peruuta-painikkeet sekä näytetään poista-painike

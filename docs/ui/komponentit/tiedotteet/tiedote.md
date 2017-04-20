# Tiedote

`/ui/app/components/notifications/Notification.jsx`

## Lataustila

Tiedotteen poiston ollessa kesken, painallukset estetään ja sen päällä 
näytetään latausanimaatio.

## Osittainen tila

Poistuva tiedote häivytetään pois listalta.

## Virhetila

Jos poisto epäonnistuu, näkymässä näytetään virheilmoitus.

## Ideaalitila

Tiedotteella näkyy:
- käyttöliittymän kielen mukainen otsikko (suomenkielinen, jos kyseistä kieliversiota
ei ole)
- käyttöliittymän kielen mukainen kuvaus (suomenkielinen, jos kyseistä kieliversiota
ei ole)
- luontipäivämäärä
- kategoriat
- avainsanat
- laajenna/lyhennä-painikkeet, jos kuvauksen pituus ylittää maksimimerkkimäärän TAI
sulje-painike, jos tiedote on haettu erikseen listalle aikajanan tapahtumaan liittyvänä

Ylläpitokäyttäjille:
- julkaisijan nimikirjaimet
- muokkaa- ja poista-painikkeet

## Toiminnallisuudet

Käyttäjä painaa tiedotetta tai laajenna/lyhennä-painiketta:
- koko kuvaus / katkelma näytetään

Käyttäjä painaa muokkaa-painiketta:
- editori avataan tiedote-välilehteen ja tiedotteen julkaisu 
haetaan AJAX-kutsulla muokattavaksi

Käyttäjä painaa poista-painiketta:
- tiedotteen viereen aukeaa poiston vahvistus -popup

Käyttäjä painaa popupin poista-painiketta:
- tehdään AJAX-kutsu tiedotteen poistamiseksi, jonka valmistuttua
tiedote poistetaan listalta

Käyttäjä painaa popupin peruuta-painiketta:
- popup sulkeutuu

Käyttäjä painaa sivua jostain muusta kohdasta sivua kuin popupin päältä:
- popup sulkeutuu

Käyttäjä painaa sulje-painiketta:
- tiedotelista tyhjennetään haetaan ensimmäinen sivu tavallisia tiedotteita

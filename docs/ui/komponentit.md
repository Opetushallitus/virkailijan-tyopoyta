# Käyttäjän näkymä

`/ui/app/components/App.jsx`

Käyttäjän näkymä koostuu eri komponenteista:
- tiedotteet: valikko, avainsanarajaus, kategoriarajaus, lista
- aikajana

Pienillä näytöillä näkymä on jaettu kahteen välilehteen Tab-komponenteilla.

## Tyhjä tila

Tyhjä ruutu, näytetään siihen asti kunnes sovellus alkaa suorittamaan kirjautumista.

## Lataustila

Tyhjä ruutu, jossa näytetään latausanimaatio, jos kirjautuminen kestää 
yli yhden sekunnin.

## Osittainen tila

Kun käyttäjän tiedot on haettu onnistuneesti, jokaisen osakomponentin sisältö haetaan 
erikseen. Komponenteilla on omat tilansa. 

## Virhetila

Jos kirjautuminen epäonnistuu, näytetään pelkästään virheilmoitus 
.

## Ideaalitila

Näkymän komponentit ovat näkyvissä ja niiden sisältö on haettu onnistuneesti.


# Tiedotevalikko

Tiedotevalikko näytetään pelkästään ylläpitokäyttäjille.

`/ui/app/components/notifications/NotificationsMenu.jsx`

Valikosta käyttäjä voi:
- luoda uuden julkaisun
- katsella julkaisemattomia tiedotteita
- jatkaa tallennetun luonnoksen luomista

## Osittainen tila

Linkki tallennettuun luonnokseen on pois käytöstä, kunnes luonnos on haettu.

## Ideaalitila

Linkit toiminnallisuuksiin ovat näkyvissä. Jos käyttäjällä ei ole tallennettua luonnosta,
linkki on pysyy pois käytöstä.


# Tiedotteiden avainsanarajaus

`/ui/app/components/notifications/NotificationTagSelect.jsx`

Suodatettava pudotusvalikko, jolla käyttäjä voi suodattaa tiedotelistaa avainsanojen
mukaan. Toteutettu kolmannen osapuolen 
[Dropdown-komponentilla](http://react.semantic-ui.com/modules/dropdown).

Avainsanaryhmät haetaan backendistä. Haussa palautuvat vain ne ryhmät, joihin käyttäjällä 
on oikeudet käyttöoikeusryhmiensä perusteella.

## Lataustila

Kentässä on keskeneräistä hakua osoittava teksti ja pudotusvalikko on tyhjä kun 
avainsanoja haetaan.

## Virhetila

Jos avainsanojen haku epäonnistuu, kentässä näytetään siihen liittyvä teksti ja 
pudotusvalikko pysyy tyhjänä. Käyttäjän näkymässä näytetään virheilmoitus.

## Ideaalitila

Avainsanat ja niiden avainsanaryhmät on listattu aakkosjärjestyksessä pudotusvalikossa.
Valittujen avainsanojen nimet on lyhennetty, jos nimi ylittää maksimimerkkimäärän.

## Toiminnallisuudet

Käyttäjä kirjoittaa hakusanan kenttään:
- pudotusvalikkoa suodatetaan jokaisen painalluksen jälkeen

Käyttäjä valitsee hakusanan pudotusvalikosta:
- tiedotelista tyhjennetään ja sovellus hakee tiedotteita, joilla on kyseinen avainsana
- valittujen avainsanojen määrää ei ole rajoitettu

Käyttäjä poistaa hakusanan kentästä:
- valittuja avainsanoja voi poistaa Backspacella tai painamalla avainsanaa
- tiedotelista tyhjennetään ja sovellus hakee tiedotteita, joilla on jokin jäljellä
olevista valituista avainsanoista

Käyttäjä suodattaa tiedotteita kategorian mukaan:
- pudotusvalikossa näytetään vain niihin avainsanaryhmiin kuuluvat sanat, jotka liittyvät 
valittuihin kategorioihin 
- kyseisiin kategorioihin liittymättömien ryhmien valitut avainsanat poistetaan kentästä
- sovellus tekee uuden haun jos valittuja avainsanoja poistuu


# Tiedotteiden kategoriarajaus

`/ui/app/components/notifications/NotificationCategoryCheckboxes.jsx`

Avattava/suljettava lista valintalaatikoista, joilla käyttäjä voi suodattaa tiedotelistaa
kategorioiden mukaan. Toteutettu Collapse-komponentilla.

Kategoriat haetaan backendistä. Haussa palautuvat vain ne kategoriat, joihin käyttäjällä 
on oikeudet käyttöoikeusryhmiensä perusteella.

## Lataustila

Avaa/sulje-painikkeessa on hakua osoittava teksti ja komponentin sisällä näytetään
näytetään latausanimaatio, jos kategorioiden haku kestää yli yhden sekunnin.

## Virhetila

Jos haku epäonnistuu, komponentin sisällä näytetään virheteksti.

## Ideaalitila

Valintalaatikot ovat komponentin sisällä. Jos käyttäjä on kirjautunut ensimmäistä kertaa,
komponentti näytetään avattuna. Jos käyttäjällä on tallennettuja valittuja kategorioita, 
kyseiset valintalaatikot ovat valittuina.

## Toiminnallisuudet

Käyttäjä valitsee kategorian:
- tiedotelista tyhjennetään ja sovellus hakee tiedotteita, jotka kuuluvat kyseiseen
kategoriaan
- valinnat tallennetaan käyttäjän tietoihin
- jos tallennus epäonnistuu, näkymässä näytetään virheilmoitus 
- avainsanarajaukseen valitut, kyseiseen kategoriaan liittymättömät sanat poistetaan
- valittujen kategorioiden määrää ei ole rajattu

Käyttäjä poistaa kategoriavalinnan:
- valinnat tallennetaan
- tiedotelista tyhjennetään ja sovellus hakee tiedotteita


## Tiedotelista

`/ui/app/components/notifications/Notifications.jsx`

Peruskäyttäjä voi katsella tavallisia tiedotteita sekä häiriötiedotteita. 
Ylläpitokäyttäjä voi avata muokattavaksi ja poistaa tiedotteita.

Häiriötiedotteet ja tavalliset tiedotteet haetaan backendistä erillisillä hauilla. 
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

*? Uusien sivujen haku estetään*

## Ideaalitila

Tiedotteet on listattu julkaisupäivämäärän mukaan nousevasti. Mahdolliset häiriötiedotteet
ovat listan alussa riippumatta käyttäjän tekemistä rajauksista.

Jos käyttäjällä on tallennettuja kategoriarajauksia, listalla näytetään vain kyseisiin
kategorioihin kuuluvat tiedotteet.

Jos tavallisia tiedotteita on enemmän kuin yksi sivu, listan viimeisenä näytetään tyhjä, 
ns. placeholder-tiedote ja latausanimaatio.

## Toiminnallisuudet

Käyttäjä selaa sivua placeholder-tiedotteeseen asti:
- sovellus hakee seuraavan sivun
- uudet tiedotteet lisätään listan loppuun
- kun viimeinen sivu on ladattu, placeholder ja latausanimaatio piilotetaan näkyvistä

# Tiedote

`/ui/app/components/notifications/Notification.jsx`

## Lataustila

Kun käyttäjä vahvistaa tiedotteen poiston, painallukset estetään ja sen päällä näytetään 
latausanimaatio poiston ajan.

## Osittainen tila

Poistuva tiedote häivytetään pois listalta.

## Virhetila

Jos poisto epäonnistuu, näkymässä näytetään virheilmoitus.

## Ideaalitila

Yksittäisestä tiedotteesta näytetään:
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
- muokkaa/poista-painikkeet

## Toiminnallisuudet

Käyttäjä painaa tiedotetta tai laajenna/lyhennä-painiketta:
- koko kuvaus / katkelma näytetään

Käyttäjä painaa muokkaa-painiketta:
- tiedotteen julkaisu avataan editorissa

Käyttäjä painaa poista-painiketta:
- tiedotteen viereen aukeaa poiston vahvistus -popup

Käyttäjä painaa popupin poista-painiketta:
- sovellus tekee backendin kutsun tiedotteen poistamiseksi, jonka valmistuttua
tiedote poistetaan listalta

Käyttäjä painaa popupin peruuta-painiketta:
- popup sulkeutuu

Käyttäjä painaa sulje-painiketta:
- tiedotelista tyhjennetään ja sovellus hakee ensimmäisen sivun tavallisia tiedotteita

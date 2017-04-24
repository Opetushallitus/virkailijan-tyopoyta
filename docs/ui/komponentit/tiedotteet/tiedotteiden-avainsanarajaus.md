# Tiedotteiden avainsanarajaus

`/ui/app/components/notifications/NotificationTagSelect.jsx`

Suodatettava pudotusvalikko, jolla käyttäjä voi suodattaa tiedotelistaa avainsanojen
mukaan. Toteutettu 
[Dropdown](http://react.semantic-ui.com/modules/dropdown)-komponentilla.

Avainsanaryhmät haetaan backendistä AJAX-kutsulla. Haussa palautuvat vain ne ryhmät, 
joihin käyttäjällä on oikeudet käyttöoikeusryhmiensä perusteella.

## Lataustila

Kentässä on keskeneräistä hakua osoittava teksti ja pudotusvalikko on tyhjä kun 
avainsanoja haetaan.

## Virhetila

Jos avainsanojen haku epäonnistuu, kentässä näytetään siihen liittyvä teksti ja 
pudotusvalikko pysyy tyhjänä. Käyttäjän näkymässä näytetään virheilmoitus.

## Ideaalitila

Avainsanat ja niiden avainsanaryhmät ovat aakkosjärjestyksessä vaihtoehtoina.

## Toiminnallisuudet

Käyttäjä kirjoittaa hakusanan kenttään:
- pudotusvalikkoa suodatetaan jokaisen painalluksen jälkeen

Käyttäjä valitsee hakusanan pudotusvalikosta:
- tiedotelista tyhjennetään ja haetaan tiedotteet, joilla on kyseinen avainsana
- avainsanan nimi lyhennetään, jos nimi ylittää maksimimerkkimäärän
- valintojen määrää ei ole rajoitettu

Käyttäjä poistaa hakusanan kentästä:
- tiedotelista tyhjennetään ja haetaan tiedotteet, joilla on jokin jäljellä
olevista valinnoista
- valintoja voi poistaa Backspacella tai painamalla avainsanaa

Käyttäjä suodattaa tiedotteita kategorian mukaan:
- pudotusvalikossa näytetään vain niihin avainsanaryhmiin kuuluvat sanat, jotka liittyvät 
valittuihin kategorioihin 
- kyseisiin kategorioihin liittymättömien ryhmien valitut avainsanat poistetaan kentästä
- tehdään uusi haku jos valittuja avainsanoja poistuu

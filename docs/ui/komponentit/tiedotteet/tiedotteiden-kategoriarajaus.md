# Tiedotteiden kategoriarajaus

`/ui/app/components/notifications/NotificationCategoryCheckboxes.jsx`

Avattava/suljettava lista valintalaatikoista, joilla käyttäjä voi suodattaa tiedotelistaa
kategorioiden mukaan.

Kategoriat haetaan backendistä AJAX-kutsulla. Haussa palautuvat vain ne kategoriat, 
joihin käyttäjällä on oikeudet käyttöoikeusryhmiensä perusteella.

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
- tiedotelista tyhjennetään ja haetaan tiedotteet, jotka kuuluvat kyseiseen
kategoriaan
- valinnat tallennetaan käyttäjän tietoihin
- jos tallennus epäonnistuu, näkymässä näytetään virheilmoitus 
- avainsanarajaukseen valitut, kyseiseen kategoriaan liittymättömät sanat poistetaan
- valittujen kategorioiden määrää ei ole rajattu

Käyttäjä poistaa kategoriavalinnan:
- valinnat tallennetaan
- tiedotelista tyhjennetään ja haetaan tiedotteet, jotka kuuluvat jäljellä oleviin 
kategorioihin

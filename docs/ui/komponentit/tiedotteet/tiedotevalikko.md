# Tiedotevalikko

Tiedotevalikosta ylläpitokäyttäjä voi tehdä sisältöön liittyviä toimintoja. 
Valikko näytetään pelkästään ylläpitokäyttäjille.

`/ui/app/components/notifications/NotificationsMenu.jsx`

## Osittainen tila

Jatka luonnosta -painike on pois käytöstä, kunnes tallennettu luonnos on haettu
selaimen muistista tai tietokannasta AJAX-kutsulla.

## Ideaalitila

Painikkeet ovat näkyvissä. Jos käyttäjällä ei ole tallennettua luonnosta,
Jatka luonnosta -painike pysyy pois käytöstä.

## Toiminnallisuudet

Käyttäjä painaa Luo uusi sisältö -painiketta:
- editori avataan

Käyttäjä painaa Julkaisemattomat tiedotteet -painiketta:
- julkaisemattomien tiedotteiden ikkuna avataan
- haetaan julkaisemattomat tiedotteet AJAX-kutsulla, jos niitä ei ole jo haettu
onnistuneesti

Käyttäjä painaa Jatka luonnosta -painiketta
- editori avataan

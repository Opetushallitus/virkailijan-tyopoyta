# Validaatioviestit, esikatselu ja julkaiseminen

`/ui/app/components/editor/PreviewAndReleaseButton.jsx`
`/ui/app/components/editor/preview/ValidationMessages.jsx`
`/ui/app/components/editor/preview/Preview.jsx`

Käyttäjälle kerrotaan julkaisun tilasta validaatioviesteillä. 

Viestejä näytetään jos:
- julkaisua ei ole kohdennettu 
- tiedote on keskeneräinen tai valmis mutta avainsana puuttuu
- kohderyhmävalinnan nimi ei ole uniikki
- tiedote on tyhjä eikä valmiita aikajanan tapahtumia ole
- tiedote on keskeneräinen
- aikajanalla on keskeneräisiä tapahtumia

Esikatsele/julkaise-painike on poistettu käytöstä, jos jokin edellä mainituista ehdoista
on täytetty. Se on myös pois käytöstä julkaisun haun sekä tallennuksen ajan.

Esikatselussa näytetään käyttäjän syöttämät tiedotteen, aikajanan tapahtumien sekä 
kohdennuksen tiedot.

## Toiminnallisuudet

Käyttäjä painaa esikatsele/julkaise-painiketta:
- näytetään esikatselu

Käyttäjä painaa uudelleen esikatsele/julkaise-painiketta:
- painike poistetaan käytöstä
- tehdään AJAX-kutsu julkaisun tallentamiseksi
- näytetään painikkeen latausanimaatio, jos tallennus kestää yli yhden sekunnin
- jos tallennus epäonnistuu, näytetään virheilmoitus popup-komponentissa
- tallennuksen onnistuessa editori suljetaan, julkaisemattomat tiedotteet poistetaan,
tiedotelista sekä aikajana tyhjennetään ja haetaan uudelleen
- näkymässä näytetään ilmoitus onnistuneesta tallennuksesta

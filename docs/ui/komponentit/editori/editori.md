# Editori

`/ui/app/components/editor/Editor.jsx`

Modaalinen ikkuna, jossa ylläpitokäyttäjä voi luoda ja muokata julkaisuja.

Editori koostuu useasta komponentista:
- ilmoitukset
- välilehden valinta
- tiedotteen tila
- tiedote-välilehti
- aikajana-välilehti
- kohdennus-välilehti
- esikatselu
- validaatioviestit
- esikatsele/julkaise-painike

Välilehtien valinnassa esitetään otsikon lisäksi kyseisen välilehden
validaatioon liittyvä teksti.

Tiedotteen tila määräytyy sen mukaan, onko julkaisun tiedote luonnos, julkaisematon 
vai julkaistu.

Kuvaus- ja aikajanan teksti -kenttien tekstieditori on toteutettu
[Draft](https://draftjs.org/)-komponentilla:
`/ui/app/components/editor/texteditor/TextEditor.jsx`

Päivämääräkenttien valitsimet on toteutettu 
[Datepicker](https://hacker0x01.github.io/react-datepicker/)-komponentilla:
`/ui/app/components/common/form/DateField.jsx`

Päivämäärävalitsimet esitetään sivun ylälaidassa pienillä näytöillä.

## Tyhjä tila

Välilehden valinta on näkyvissä, mutta validaatiotekstiä ei näytetä. 
Tiedotteen tilaa eikä välilehtiä näytetä. Esikatsele/julkaise-painike on 
pois käytöstä.

Aktiivinen välilehti määritetään sen mukaan, onko käyttäjä avannut editorin 
tiedotevalikosta (tiedote-välilehti) vai painamalla tiedotteen (tiedote-välilehti) 
tai aikajanan tapahtuman (aikajana-välilehti) muokkaus-painiketta.

## Lataustila

Välilehdillä näytetään latausanimaatio, jos seuraavien haku on kesken ja haku on 
kestänyt yli yhden sekunnin:
- julkaisun,
- kategorioiden,
- käyttöoikeusyhmien tai
- avainsanaryhmien

## Virhetila

Jos jonkin edellä mainitun haku epäonnistuu, näytetään virheilmoitus editorissa. 
Julkaisun haun epäonnistuessa välilehdet näytetään, mutta kentät ovat tyhjiä.

Muussa tapauksessa sisältöä ei näytetä ja sivu on päivitettävä.

## Ideaalitila

Välilehden valinnassa näkyvät oikeat validaatiotilat.

Aktiivinen välilehti on näkyvissä. Jos käyttäjä muokkaa julkaisua, kentissä
on julkaisun tiedot.
 
Oikeat validaatioviestit ovat näkyvissä.

Esikatsele-/julkaise-painike on pois käytöstä/käytössä riippuen julkaisun tiedoista.

## Toiminnallisuudet

Käyttäjä tekee jonkin muutoksen julkaisun tietoihin tai sulkee editorin ennen
julkaisemista:
- julkaisu tallennetaan selaimeen ja AJAX-kutsulla tietokantaan
- tiedotevalikon Jatka luonnosta -painike aktivoidaan ja teksti muutetaan 

Tallennus tehdään myös automaattisesti viiden minuutin välein. 

Mitään ylläolevista ei tehdä, jos käyttäjä muokkaa kantaan tallennettua julkaisua.

# React-komponentit

## Sisällysluettelo

- [Käyttäjän näkymä](käyttäjän-näkymä.md)
- [Editori](editori/editori.md)
- [Tiedotteet](tiedotteet/tiedotteet.md)
- [Julkaisemattomat tiedotteet](julkaisemattomat-tiedotteet.md)
- [Aikajana](aikajana/aikajana.md)

Komponentit ovat `ui/app/components`-kansion juuressa tai omissa alakansioissaan. Jokaisessa
alakansiossa on ns. pääkomponentti, joka on nimetty kansion mukaan:

`ui/app/components/notifications` -> `Notifications.jsx`.

Komponenttien dokumentaatiossa on kuvattu 5 tilaa: tyhjä, lataus-, osittainen, virhe- ja 
ideaalitila.

- tyhjä tila: komponentilla ei ole näytettävää dataa (esim. kannassa ei ole yhtään tiedotetta)
- lataustila: komponenttiin liittyvä AJAX-kutsu on kesken
- osittainen tila: osa komponentin datasta on haettu
- virhetila: komponenttiin liittyvä AJAX-kutsu on epäonnistunut
- ideaalitila: data on haettu onnistuneesti

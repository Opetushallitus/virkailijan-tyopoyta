# Käyttäjäryhmät

## Endpoint

`GET /virkailijan-tyopoyta/api/usergroups?locale={locale}`

## Parametrit

Locale: *Valinnainen.* Määrittää, millä kielellä käyttäjäryhmien nimet palautetaan.
Puuttuvalla arvolla palautetaan suomenkieliset.

## Vastauksen muoto

Palauttaa pyynnön onnistuessa HTTP-statuskoodin 200 OK. Vastauksena on
taulukko, joka sisältää kaikki käyttäjäryhmät JSON-muodossa järjestettynä nousevasti id:n mukaan.

Yksittäisen käyttäjän *name*-ominaisuuden arvo on lokalisoitu käyttäjän kielen mukaan.

Epäonnistuessa palauttaa HTTP-statuskoodina virhekoodin.

## Esimerkki

`GET /virkailijan-tyopoyta/api/usergroups?locale=fi`

```
[
    {
        "id": 1,
        "name": "Opinto-ohjaaja",
        "categories": [1, 2, 3]
    },
    ...
]
```

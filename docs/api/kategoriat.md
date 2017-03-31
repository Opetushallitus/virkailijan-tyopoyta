# Kategoriat

## Endpoint

`GET /virkailijan-tyopoyta/api/categories`

## Ei parametrejä

## Vastauksen muoto

Palauttaa pyynnön onnistuessa HTTP-statuskoodin 200 OK. Vastauksena on
taulukko, joka sisältää kaikki kategoriat JSON-muodossa järjestettynä nousevasti id:n mukaan.

Yksittäisen kategorian *name*-ominaisuuden arvo on lokalisoitu käyttäjän kielen mukaan. 

Epäonnistuessa palauttaa HTTP-statuskoodina virhekoodin.

## Esimerkki

```
[
    {
        "id": 1,
        "name": "Perusopetus"
    },
    ...
]
```

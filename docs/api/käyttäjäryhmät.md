#Käyttäjäryhmät

##Endpoint

`GET /virkailijan-tyopoyta/api/usergroups`

##Ei parametrejä

##Vastauksen muoto

Palauttaa pyynnön onnistuessa HTTP-statuskoodin 200 OK. Vastauksena on
taulukko, joka sisältää kaikki käyttäjäryhmät JSON-muodossa järjestettynä nousevasti id:n mukaan.

Yksittäisen käyttäjän *name*-ominaisuuden arvo on lokalisoitu käyttäjän kielen mukaan.

Epäonnistuessa palauttaa HTTP-statuskoodina virhekoodin.

##Esimerkki

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

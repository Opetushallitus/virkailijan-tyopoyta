#Kategoriat

##Endpoint

`GET /virkailijan-tyopoyta/api/categories`

##Ei parametrejä

##Vastauksen muoto

Palauttaa pyynnön onnistuessa HTTP-statuskoodin 200 OK. Vastauksena on
taulukko, joka sisältää kaikki kategoriat JSON-muodossa, järjestettynä nousevasti id:n mukaan.

Epäonnistuessa palauttaa HTTP-statuskoodina virhekoodin.

##Esimerkki

```
[
    {
        "id": 1,
        "name_fi": "Perusopetus",
        "name_sv": "Grundläggande utbildning"
    },
    ...
]
```

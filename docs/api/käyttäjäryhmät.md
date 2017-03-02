#Käyttäjäryhmät

##Endpoint

`GET /virkailijan-tyopoyta/api/usergroups`

##Ei parametrejä

##Vastauksen muoto

Palauttaa pyynnön onnistuessa HTTP-statuskoodin 200 OK. Vastauksena on
taulukko, joka sisältää kaikki käyttäjäryhmät JSON-muodossa. Ryhmät on
järjestetty nousevasti id:n mukaan.

Epäonnistuessa palauttaa HTTP-statuskoodina virhekoodin.

##Esimerkki

```
[
    {
        "id": 1,
        "name_fi": "Opinto-ohjaaja",
        "name_sv": "Huvudanvändare",
        "categories": [1, 2, 3]
    },
    ...
]
```

#Tagit

##Endpoint

`GET /virkailijan-tyopoyta/api/tags?categories={categories}`

##Parametrit

categories: *Valinnainen.* Pilkuilla erotettu lista kategorioiden id:eistä.
Määrittää, mihin kategorioihin liittyvät tagiryhmät palautetaan.    

##Vastauksen muoto

Palauttaa pyynnön onnistuessa HTTP-statuskoodin 200 OK. Vastauksena on
taulukko, joka sisältää tagiryhmät JSON-muodossa järjestettynä id:n mukaan nousevasti.

Erikoistagit (esim. "Häiriötiedote") palautetaan omassa tagiryhmässään.

Tagiryhmän sekä yksittäisen tagin *name*-ominaisuuden arvo on lokalisoitu käyttäjän kielen mukaan.

Epäonnistuessa palauttaa HTTP-statuskoodina virhekoodin.

##Esimerkki

`/virkailijan-tyopoyta/api/tags?categories=1,4`

```
[
    {
        "id": 1,
        "name": "Perusopetus ja toinen aste",
        "categories": [1, 2],
        "items": [
            {
                "id": 1,
                "name": "Aikataulut"
            },
          ...
        ]    
    },
    {
        "id": 4,
        "name": "SPECIAL",
        "categories": [],
        "items": [
            {
                "id": 10,
                "name": "Häiriötiedote",
                "type": "DISRUPTION"
            }
        ]
    }
]
```

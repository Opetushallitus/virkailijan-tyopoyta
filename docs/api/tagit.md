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

Epäonnistuessa palauttaa HTTP-statuskoodina virhekoodin.

##Esimerkki

`/virkailijan-tyopoyta/api/tags?categories=1,4`

```
[
    {
        "id": 1,
        "name_fi": "Perusopetus ja toinen aste",
        "name_sv": "Grundläggande utbildning och andra grad",
        "categories": [1, 2],
        "items": [
            {
                "id": 1,
                "name_fi": "Aikataulut",
                "name_sv": "Tidtabeller"
            },
          ...
        ]    
    },
    {
        "id": 4,
        "name_fi": "SPECIAL",
        "categories": [],
        "items": [
            {
                "id": 10,
                "name_fi": "Häiriötiedote",
                "name_sv": "Störningsmeddelandet",
                "type": "DISRUPTION"
            }
        ]
    }
]
```

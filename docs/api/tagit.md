#Tagit

##Endpoint

`GET /virkailijan-tyopoyta/api/tags?categories={categories}`

##Parametrit

categories: *Valinnainen.* Pilkuilla erotettu lista kategorioiden id:eistä.
Määrittää, mihin kategorioihin liittyvät tagiryhmät palautetaan.    

##Vastauksen muoto

Palauttaa pyynnön onnistuessa HTTP-statuskoodin 200 OK. Vastauksena on
taulukko, joka sisältää tagiryhmät JSON-muodossa järjestettynä id:n mukaan nousevasti.

Epäonnistuessa palauttaa HTTP-statuskoodina virhekoodin.

##Esimerkki

`/virkailijan-tyopoyta/api/tags?categories=1,2`

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
  ...
]
```

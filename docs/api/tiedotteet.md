#Tiedotteet

##Endpoint

`GET /virkailijan-tyopoyta/api/notifications[/{id} tai ?page={page}&tags={tags}&categories={categories}]

##Parametrit

id: *Valinnainen*. Tiedotteen tunniste. Määrittää, mikä yksittäinen tiedote haetaan.

page: *Valinnainen*. Sivunumero. Määrittää, monesko sivu tiedotteita palautetaan.
Sivun pituus on 20 tiedotetta. Oletusarvo on 1.

tags: *Valinnainen.* Pilkuilla erotettu lista tagien id:eistä. Määrittää,
mitä tageja sisältävät tiedotteet palautetaan.

categories: *Valinnainen.* Pilkuilla erotettu lista kategorioiden id:eistä.
Määrittää, mihin kategorioihin liittyvät tiedotteet palautetaan.   

##Vastauksen muoto

Palauttaa pyynnön onnistuessa HTTP-statuskoodin 200 OK. Vastauksena on
JSON-objekti, jossa on löydettyjen tiedotteiden kokonaismäärä sekä
taulukko, joka sisältää tiedotteet JSON-muodossa. Tiedotteet on järjestetty
laskevasti julkaisupäivämäärän mukaan. 

Häiriötiedotteet palautetaan aina items-taulukon ensimmäisinä, 
riippumatta tags- ja categories-parametreistä.

Jos kutsussa on id, vastauksen items-ominaisuudessa on pelkästään id:tä vastaava 
tiedote JSON-muotoisena objektina.

Epäonnistuessa palauttaa HTTP-statuskoodina virhekoodin.

##Esimerkki 

`/virkailijan-tyopoyta/api/notifications?page=1&tags=1,2&categories=3,4`

```
{
    "count": 22,
    "items": [
        {
            "id": 1,
            "releaseId": 1,
            "content": {
                "fi": {
                    "language": "fi",
                    "notificationId": 6,
                    "title": "Versiopäivitys 13.3. klo 8:00-8.15"
                    "text": "<p>Opintopolussa versiopäivitys 13.3. klo 8:00-8.30</p>"
                },
                "sv": { [sisältö ruotsiksi] }
            },
            "initialStartDate": "1.3.2017",
            "startDate": "1.3.2017",
            "endDate": "13.3.2017",
            "tags": [1, 2],
            "categories": [3],
            "createdAt": "28.2.2017",
            "creator": "NN"
        },
        ...
    ]
}
```

`/virkailijan-tyopoyta/api/notifications/1`

```
{
    "count": 1,
    "items": { [tiedote JSON-muodossa] }
}
```

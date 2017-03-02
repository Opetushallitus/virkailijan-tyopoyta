#Testijulkaisun luonti

##Endpoint

`GET /virkailijan-tyopoyta/api/generate?amount={amount}&month={month}&year={year}`

##Parametrit

amount: *Valinnainen.*  Määrittää, kuinka monta tiedotetta ja tapahtumaa luodaan. 
Oletusarvo on 1.

month: *Valinnainen*. Määrittää, minkä kuu annetaan tapahtumapäivämääriin ja 
tiedotteiden julkaisupäivämääriin. Oletusarvo on kuluva kuukausi.

month: *Valinnainen*. Määrittää, minkä vuosi annetaan tapahtumapäivämääriin 
ja tiedotteiden julkaisupäivämääriin. Oletusarvo on kuluva vuosi.

##Vastauksen muoto

Palauttaa pyynnön onnistuessa HTTP-statuskoodin 200 OK. Vastauksena on taulukko, joka sisältää
julkaisut JSON-muodossa.

Epäonnistuessa palauttaa HTTP-statuskoodina virhekoodin.

##Esimerkki

`GET /virkailijan-tyopoyta/api/generate?amount=1&month=4&year=2017`

```
[
    {
        "id": 1,
        "categories": [1, 2],
        "tags": [1],
        "sendEmail": true,
        "notification": {
            "id": 1,
            "releaseId": 1,
            "content": {
                "fi": {
                    "language": "fi",
                    "notificationId": 6,
                    "title": "Lorem ipsum dolorom"
                    "text": "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>"
                },
                "sv": { [sisältö ruotsiksi] }
            },
            "initialStartDate": "1.4.2017",
            "startDate": "1.4.2017",
            "endDate": null,
            "tags": [1, 2],
            "categories": [3],
            "createdAt": "30.3.2017"
        },
        timeline: [
            {
                "id": 1,
                "releaseId": 1,
                "notificationId": 1,
                "date": "1.4.2017"
                "content": {
                    "fi": {
                        "timelineId": 1,
                        "language": "fi",
                        "text": "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>"
                    },
                    "sv": { [sisältö ruotsiksi] }
                }
            }
        ]
    }
]
```

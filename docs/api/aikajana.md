#Aikajana

##Endpoint

`GET /virkailijan-tyopoyta/api/timeline?month={month}&year={year}`

##Parametrit

month: *Valinnainen.* Määrittää, minkä kuukauden tapahtumat palautetaan.
Oletusarvo on kuluva kuukausi.

year: *Valinnainen.* Määrittää, minkä vuoden tapahtumat palautetaan.
Oletusarvo on kuluva vuosi.

##Vastauksen muoto

Palauttaa pyynnön onnistuessa HTTP-statuskoodin 200 OK. Vastauksena on
JSON-objekti, joka sisältää haetun kuukauden, vuoden sekä tapahtumia sisältävät
päivät JSON-objektina. Tapahtumat on järjestetty tapahtumapäivämäärän mukaan nousevasti.

*NotificationId* on *null*, jos tiedotetta ei ole ollenkaan tai se on julkaisematon. 

Epäonnistuessa palauttaa HTTP-statuskoodina virhekoodin.

##Esimerkki

`/virkailijan-tyopoyta/api/timeline?month=3&year=2017`

```
{
    "month": 3,
    "year": 2017,
    "days": {
        1: [
            {
                "id": 1,
                "releaseId": 1,
                "notificationId": 1,
                "date": "1.3.2017"
                "content": {
                    "fi": {
                        "timelineId": 1,
                        "language": "fi",
                        "text": "<p>Koetulokset</p>"
                    },
                    "sv": { [sisältö ruotsiksi] }
                }
            },
            ...
        ]
    }
}
```

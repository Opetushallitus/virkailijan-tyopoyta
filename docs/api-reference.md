#Kategoriat

##Endpoint

`GET /virkailijan-tyopoyta/api/categories`

##Ei parametrejä

##Vastauksen muoto

Palauttaa pyynnön onnistuessa HTTP-statuskoodin 200 OK. Vastauksena on
taulukko, joka sisältää kaikki tagit JSON-muodossa. Tagit on järjestetty nousevasti id:n mukaan.

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

---

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

---

#Tagit

##Endpoint

`GET /virkailijan-tyopoyta/api/tags?categories={categories}`

##Parametrit

categories: *Valinnainen.* Pilkuilla erotettu lista kategorioiden id:eistä.
Määrittää, mihin kategorioihin liittyvät tagiryhmät palautetaan.    

##Vastauksen muoto

Palauttaa pyynnön onnistuessa HTTP-statuskoodin 200 OK. Vastauksena on
taulukko, joka sisältää tagiryhmät JSON-muodossa. Ryhmät on järjestetty
id:n mukaan nousevasti.

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

---

#Tiedotteet

##Endpoint

`GET /virkailijan-tyopoyta/api/notifications?page={page}&tags={tags}&categories={categories}`

##Parametrit

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
laskevasti julkaisupäivämäärän mukaan. Häiriötiedotteet palautetaan aina
items-taulukon ensimmäisinä, riippumatta tags- ja categories-parametreistä.

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

---

#Julkaisemattomat tiedotteet

##Endpoint

`GET /virkailijan-tyopoyta/api/notifications/unpublished`

##Ei parametrejä

##Vastauksen muoto

Palauttaa pyynnön onnistuessa HTTP-statuskoodin 200 OK. Vastauksena on
taulukko, joka sisältää julkaisemattomat tiedotteet JSON-muodossa. Tiedotteet on järjestetty laskevasti julkaisupäivämäärän mukaan.

Epäonnistuessa palauttaa HTTP-statuskoodina virhekoodin.

##Esimerkki

```
[
  {
    "id": 2,
    "releaseId": 2,
    "content": {
      "fi": {
        "language": "fi",
        "notificationId": 2,
        "title": "Häiriötiedote"
        "text": "<p>Opintopolussa käyttökatko 1.4. klo 9:00-9.15</p>"
      },
      "sv": { [sisältö ruotsiksi] }
    },
    "initialStartDate": "15.3.2017",
    "startDate": "15.3.2017",
    "endDate": "1.4.2017",
    "tags": [3],
    "categories": [4],
    "createdAt": "10.3.2017",
    "creator": "NN"
  },
  ...
]
```

---

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

---

#Julkaisun haku

##Endpoint

`GET /virkailijan-tyopoyta/api/release?id={id}`

##Parametrit

id: *Pakollinen.*  Määrittää, mikä julkaisu palautetaan.

##Vastauksen muoto

Palauttaa pyynnön onnistuessa HTTP-statuskoodin 200 OK. Vastauksena on
julkaisu JSON-objektina.

Epäonnistuessa palauttaa HTTP-statuskoodina virhekoodin.

##Esimerkki

`GET /virkailijan-tyopoyta/api/release?id=1`

```
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
    "createdAt": "28.2.2017"
  },
  timeline: [
    {
      "id": 1,
      "releaseId": 1,
      "notificationId": 1,
      "date": "1.3.2017"
      "content": {
        "fi": {
          "timelineId": 1,
          "language": "fi",
          "text": "<p>Versiopäivitys</p>"
        },
        "sv": { [sisältö ruotsiksi] }
      }
    },
    ...
  ]
}
```

---

#Julkaisun tallennus

##Endpointit

Uuden julkaisun tallennus: `POST /virkailijan-tyopoyta/api/release`

Päivittäminen ja poisto: `PUT /virkailijan-tyopoyta/api/release`

Luonnoksen tallennus: `POST /virkailijan-tyopoyta/api/release/draft`

##Ei parametrejä

##Pyynnön muoto

Pyynnössä lähetetään julkaisu JSON-muotoisena merkkijonona.

##Esimerkki, uuden tallennus

```
{
  "id": -1,
  "categories": [1, 2],
  "tags": [1],
  "userGroups": [3, 4]
  "sendEmail": true,
  "notification": {
    "id": -1,
    "releaseId": -1,
    "content": {
      "fi": {
        "language": "fi",
        "notificationId": 6,
        "title": "Otsikko"
        "text": "<p>Teksti/p>"
      },
      "sv": { [sisältö ruotsiksi] }
    },
    "startDate": "1.4.2017",
    "endDate": "1.5.2017",
    "tags": [1, 2],
    "categories": [3],
    "created": "5.3.2017",
    "creator": "NN"
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
          "text": "<p>Tapahtuman teksti</p>"
        },
        "sv": { [sisältö ruotsiksi] }
      }
    },
    ...
  ]
}
```

##Vastauksen muoto

Palauttaa pyynnön onnistuessa HTTP-statuskoodin 200 OK. Vastaus on tyhjä.

---

#Luonnoksen haku

##Endpoint

`GET /virkailijan-tyopoyta/api/release/draft`

##Ei parametrejä

##Vastauksen muoto

Palauttaa pyynnön onnistuessa HTTP-statuskoodin 200 OK. Vastauksena on
luonnos JSON-objektina.

Epäonnistuessa palauttaa HTTP-statuskoodina virhekoodin.

##Esimerkki

```
{
  "id": -1,
  "categories": [1, 2],
  "tags": [1],
  "userGroups": [3, 4]
  "sendEmail": true,
  "notification": {
    "id": -1,
    "releaseId": -1,
    "content": {
      "fi": {
        "language": "fi",
        "notificationId": 6,
        "title": "Otsikko"
        "text": "<p>Teksti/p>"
      },
      "sv": { [sisältö ruotsiksi] }
    },
    "initialStartDate": "5.4.2017",
    "startDate": "5.4.2017",
    "endDate": "7.4.2017",
    "tags": [1, 2],
    "categories": [3],
    "created": "10.3.2017",
    "creator": "NN"
  },
  timeline: [
    {
      "id": 1,
      "releaseId": 1,
      "notificationId": 1,
      "date": "6.4.2017"
      "content": {
        "fi": {
          "timelineId": 1,
          "language": "fi",
          "text": "<p>Tapahtuman teksti</p>"
        },
        "sv": { [sisältö ruotsiksi] }
      }
    },
    ...
  ]
}
```
